import admin from 'firebase-admin';
import Parser from 'rss-parser';
import { sources } from './sources.js';
import { isFinanceRelevant } from './filter.js';
import { normalizeItem } from './normalize.js';

// ── Environment Check ──────────────────────────────────────────
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountRaw);

// ── Firebase Init ──────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const parser = new Parser();

// ── Constants ──────────────────────────────────────────────────
const POOL_MAX = 25;
const FETCH_MAX = 20;

// ── Write to Firestore ─────────────────────────────────────────
async function updateFirestorePool(newItems) {
  const heroNewsRef = db.collection('heroNews');

  // Fetch existing pool
  const existingSnapshot = await heroNewsRef.get();
  const existingItems = existingSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));

  console.log(`Current Firestore pool size: ${existingItems.length}`);

  // Find items not already in pool by id
  const existingIds = new Set(existingItems.map(item => item.id));
  const brandNewItems = newItems.filter(item => !existingIds.has(item.id));

  console.log(`Brand new items to add: ${brandNewItems.length}`);

  if (brandNewItems.length === 0) {
    console.log('No new items found in this sync run — pool unchanged.');
    await db.collection('systemMeta').doc('heroNews').set({
      lastSync: new Date().toISOString(),
      itemCount: existingItems.length,
      newItemsAdded: 0,
      oldItemsRemoved: 0,
      status: 'success'
    });
    return;
  }

  // Remove oldest items if pool would exceed POOL_MAX
  const projectedSize = existingItems.length + brandNewItems.length;
  const removeCount = Math.max(0, projectedSize - POOL_MAX);

  const docsToRemove = [...existingItems]
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    .slice(0, removeCount);

  // Commit batch
  const batch = db.batch();

  docsToRemove.forEach(item => {
    batch.delete(heroNewsRef.doc(item.docId));
  });

  brandNewItems.forEach(item => {
    batch.set(heroNewsRef.doc(item.id), item);
  });

  const finalSize = existingItems.length
    - docsToRemove.length
    + brandNewItems.length;

  batch.set(db.collection('systemMeta').doc('heroNews'), {
    lastSync: new Date().toISOString(),
    itemCount: finalSize,
    newItemsAdded: brandNewItems.length,
    oldItemsRemoved: docsToRemove.length,
    status: 'success'
  });

  await batch.commit();
  console.log(
    `Pool updated — added ${brandNewItems.length}, removed ${docsToRemove.length}, final size: ${finalSize}`
  );
}

// ── Main Sync ──────────────────────────────────────────────────
async function syncNews() {
  let allItems = [];

  for (const source of sources) {
    if (!source.enabled) continue;

    try {
      const feed = await parser.parseURL(source.url);
      let count = 0;

      for (const item of feed.items) {
        const normalized = normalizeItem(item, source);
        if (!normalized) continue;

        if (isFinanceRelevant(normalized.title, normalized.summary)) {
          allItems.push(normalized);
          count++;
        }
      }
      console.log(`Successfully processed ${count} items from ${source.name}`);
    } catch (error) {
      console.error(`Error processing source ${source.name}:`, error.message);
    }
  }

  console.log(`Total items after filter: ${allItems.length}`);

  // Deduplicate by title (first 60 chars)
  const uniqueItemsMap = new Map();
  for (const item of allItems) {
    const key = item.title.substring(0, 60).toLowerCase();
    if (!uniqueItemsMap.has(key)) {
      uniqueItemsMap.set(key, item);
    } else {
      const existing = uniqueItemsMap.get(key);
      const isHigherPriority = item.priority > existing.priority;
      const isSamePriorityNewer =
        item.priority === existing.priority &&
        new Date(item.publishedAt) > new Date(existing.publishedAt);
      if (isHigherPriority || isSamePriorityNewer) {
        uniqueItemsMap.set(key, item);
      }
    }
  }

  const uniqueItems = Array.from(uniqueItemsMap.values());
  console.log(`Total after deduplication: ${uniqueItems.length}`);

  // Sort and take top items
  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const topItems = uniqueItems.slice(0, FETCH_MAX);
  console.log(`Items being passed to pool update: ${topItems.length}`);

  if (topItems.length === 0) {
    console.log('No relevant items found — pool unchanged.');
    return;
  }

  try {
    await updateFirestorePool(topItems);
  } catch (error) {
    console.error('Error updating Firestore pool:', error);
    process.exit(1);
  }
}

syncNews();