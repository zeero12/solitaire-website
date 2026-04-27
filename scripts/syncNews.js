import admin from 'firebase-admin';
import Parser from 'rss-parser';
import { sources } from './sources.js';
import { isFinanceRelevant } from './filter.js';
import { normalizeItem } from './normalize.js';

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SolitaireBot/1.0)'
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
      ['itunes:image', 'itunes:image']
    ]
  }
});

const POOL_MAX = 25;
const FETCH_MAX = 20;
const SOURCE_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Source timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    parser.parseURL(url)
      .then(result => { clearTimeout(timer); resolve(result); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

async function updateFirestorePool(newItems) {
  const heroNewsRef = db.collection('heroNews');

  const existingSnapshot = await heroNewsRef.get();
  const existingItems = existingSnapshot.docs.map(doc => ({
    docId: doc.id,
    ...doc.data()
  }));

  console.log(`Current Firestore pool size: ${existingItems.length}`);

  const existingIds = new Set(existingItems.map(item => item.id));
  const brandNewItems = newItems.filter(item => !existingIds.has(item.id));

  console.log(`Brand new items to add: ${brandNewItems.length}`);

  if (brandNewItems.length === 0) {
    console.log('No new items — pool unchanged.');
    await db.collection('systemMeta').doc('heroNews').set({
      lastSync: new Date().toISOString(),
      itemCount: existingItems.length,
      newItemsAdded: 0,
      oldItemsRemoved: 0,
      status: 'success'
    });
    return;
  }

  const projectedSize = existingItems.length + brandNewItems.length;
  const removeCount = Math.max(0, projectedSize - POOL_MAX);

  const docsToRemove = [...existingItems]
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    .slice(0, removeCount);

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

async function syncNews() {
  let allItems = [];

  for (const source of sources) {
    if (!source.enabled) continue;

    console.log(`Fetching: ${source.name}...`);

    try {
      const feed = await fetchWithTimeout(source.url, SOURCE_TIMEOUT_MS);

      let count = 0;
      for (const item of feed.items) {
        const normalized = normalizeItem(item, source);
        if (!normalized) continue;
        if (isFinanceRelevant(normalized.title, normalized.summary)) {
          allItems.push(normalized);
          count++;
        }
      }
      console.log(`✓ ${source.name}: ${count} items`);

    } catch (error) {
      console.log(`✗ ${source.name}: ${error.message}`);
    }
  }

  console.log(`Total after filter: ${allItems.length}`);

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

  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const topItems = uniqueItems.slice(0, FETCH_MAX);
  console.log(`Sending to pool: ${topItems.length} items`);

  if (topItems.length === 0) {
    console.log('No relevant items — pool unchanged.');
    return;
  }

  try {
    await updateFirestorePool(topItems);
  } catch (error) {
    console.error('Firestore update failed:', error);
    process.exit(1);
  }
}

syncNews();