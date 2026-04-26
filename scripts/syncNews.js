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
const POOL_MAX = 30;
const FETCH_MAX = 20;
const STALE_HOURS = 12; // items older than this are replaced even if id matches

// ── Pool Update ────────────────────────────────────────────────
async function updateFirestorePool(newItems) {
  const heroNewsRef = db.collection('heroNews');

  const existingSnapshot = await heroNewsRef.get();
  const existingItems = existingSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));

  console.log(`Current pool size in Firestore: ${existingItems.length}`);

  // Mark items as stale if older than STALE_HOURS
  const staleThreshold = new Date();
  staleThreshold.setHours(staleThreshold.getHours() - STALE_HOURS);

  const staleIds = new Set(
    existingItems
      .filter(item => new Date(item.createdAt) < staleThreshold)
      .map(item => item.id)
  );

  // Treat new items as "new" if their id is not in pool OR if they replace a stale item
  const existingIds = new Set(existingItems.map(item => item.id));
  const itemsToAdd = newItems.filter(
    item => !existingIds.has(item.id) || staleIds.has(item.id)
  );

  console.log(`New unique items to add: ${itemsToAdd.length}`);
  console.log(`Stale items eligible for replacement: ${staleIds.size}`);

  if (itemsToAdd.length === 0) {
    console.log('No new or updated items — pool unchanged.');
    await db.collection('systemMeta').doc('heroNews').set({
      lastSync: new Date().toISOString(),
      itemCount: existingItems.length,
      newItemsAdded: 0,
      oldItemsRemoved: 0,
      status: 'success'
    });
    return;
  }

  // Remove stale items that are being replaced
  const staleDocIds = existingItems
    .filter(item => staleIds.has(item.id))
    .map(item => item.docId);

  // Also remove oldest items if pool would exceed POOL_MAX
  const nonStaleExisting = existingItems.filter(
    item => !staleIds.has(item.id)
  );
  const totalAfterAdd = nonStaleExisting.length + itemsToAdd.length;
  const overflowCount = Math.max(0, totalAfterAdd - POOL_MAX);

  const oldestNonStale = [...nonStaleExisting]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, overflowCount)
    .map(item => item.docId);

  const allDocIdsToRemove = [...new Set([...staleDocIds, ...oldestNonStale])];

  const batch = db.batch();

  allDocIdsToRemove.forEach(docId => {
    batch.delete(heroNewsRef.doc(docId));
  });

  itemsToAdd.forEach(item => {
    batch.set(heroNewsRef.doc(item.id), {
      ...item,
      createdAt: new Date().toISOString() // refresh createdAt on re-add
    });
  });

  const finalSize = Math.min(
    existingItems.length - allDocIdsToRemove.length + itemsToAdd.length,
    POOL_MAX
  );

  const metaRef = db.collection('systemMeta').doc('heroNews');
  batch.set(metaRef, {
    lastSync: new Date().toISOString(),
    itemCount: finalSize,
    newItemsAdded: itemsToAdd.length,
    oldItemsRemoved: allDocIdsToRemove.length,
    status: 'success'
  });

  await batch.commit();
  console.log(
    `Pool updated — added ${itemsToAdd.length}, removed ${allDocIdsToRemove.length}, final size: ${finalSize}`
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

  // Deduplicate
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
  console.log(`Total items after deduplication: ${uniqueItems.length}`);

  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const topItems = uniqueItems.slice(0, FETCH_MAX);
  console.log(`Top items being sent to Firestore pool: ${topItems.length}`);

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