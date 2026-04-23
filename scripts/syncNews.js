import admin from 'firebase-admin';
import Parser from 'rss-parser';
import { sources } from './sources.js';
import { isFinanceRelevant } from './filter.js';
import { normalizeItem } from './normalize.js';

// ── Environment Variable Check ─────────────────────────────────
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
const POOL_MAX = 30;      // maximum items kept in Firestore at any time
const FETCH_MAX = 20;     // maximum new items fetched per sync run

// ── Pool Update Function ───────────────────────────────────────
async function updateFirestorePool(newItems) {
  const heroNewsRef = db.collection('heroNews');

  // Fetch existing pool from Firestore
  const existingSnapshot = await heroNewsRef.get();
  const existingItems = existingSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));

  // Find genuinely new items not already in pool
  const existingIds = new Set(existingItems.map(item => item.id));
  const brandNewItems = newItems.filter(item => !existingIds.has(item.id));

  if (brandNewItems.length === 0) {
    console.log('No new items to add — pool unchanged.');

    // Still update metadata timestamp
    await db.collection('systemMeta').doc('heroNews').set({
      lastSync: new Date().toISOString(),
      itemCount: existingItems.length,
      newItemsAdded: 0,
      oldItemsRemoved: 0,
      status: 'success'
    });
    return;
  }

  // Calculate how many old items to remove to stay within POOL_MAX
  const totalAfterAdd = existingItems.length + brandNewItems.length;
  const removeCount = Math.max(0, totalAfterAdd - POOL_MAX);

  // Sort existing by createdAt ascending — oldest first for removal
  const sortedExisting = [...existingItems].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const docsToRemove = sortedExisting.slice(0, removeCount);

  // Build and commit batch
  const batch = db.batch();

  // Delete only the oldest overflow items
  docsToRemove.forEach(item => {
    batch.delete(heroNewsRef.doc(item.docId));
  });

  // Add only genuinely new items
  brandNewItems.forEach(item => {
    batch.set(heroNewsRef.doc(item.id), item);
  });

  // Update metadata
  const finalPoolSize = Math.min(totalAfterAdd, POOL_MAX);
  const metaRef = db.collection('systemMeta').doc('heroNews');
  batch.set(metaRef, {
    lastSync: new Date().toISOString(),
    itemCount: finalPoolSize,
    newItemsAdded: brandNewItems.length,
    oldItemsRemoved: removeCount,
    status: 'success'
  });

  await batch.commit();
  console.log(
    `Pool updated — added ${brandNewItems.length} new, removed ${removeCount} old, pool size: ${finalPoolSize}`
  );
}

// ── Main Sync Function ─────────────────────────────────────────
async function syncNews() {
  let allItems = [];

  // Fetch and process all enabled sources
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
      // Do not exit — continue processing remaining sources
    }
  }

  // Deduplicate by normalized title (first 60 chars, lowercased)
  const uniqueItemsMap = new Map();
  for (const item of allItems) {
    const key = item.title.substring(0, 60).toLowerCase();
    if (!uniqueItemsMap.has(key)) {
      uniqueItemsMap.set(key, item);
    } else {
      // Keep higher priority item, or newer if same priority
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

  // Sort by priority descending, then publishedAt descending
  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Take top items from this sync run
  const topItems = uniqueItems.slice(0, FETCH_MAX);

  if (topItems.length === 0) {
    console.log('No relevant items found in this sync run — pool unchanged.');
    return;
  }

  // Update the rolling pool in Firestore
  try {
    await updateFirestorePool(topItems);
  } catch (error) {
    console.error('Error updating Firestore pool:', error);
    process.exit(1);
  }
}

syncNews();