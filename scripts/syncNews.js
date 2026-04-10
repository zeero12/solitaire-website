import admin from 'firebase-admin';
import Parser from 'rss-parser';
import { sources } from './sources.js';
import { isFinanceRelevant } from './filter.js';
import { normalizeItem } from './normalize.js';

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountBase64) {
  console.error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const parser = new Parser();

async function syncNews() {
  let allItems = [];
  let status = 'success';

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
      console.error(`Error processing source ${source.name}:`, error);
      status = 'error';
    }
  }

  // Deduplicate by normalized title (first 60 chars, lowercased)
  const uniqueItemsMap = new Map();
  for (const item of allItems) {
    const key = item.title.substring(0, 60).toLowerCase();
    if (!uniqueItemsMap.has(key)) {
      uniqueItemsMap.set(key, item);
    } else {
      // Keep the one with higher priority or newer publishedAt
      const existing = uniqueItemsMap.get(key);
      if (item.priority > existing.priority || (item.priority === existing.priority && new Date(item.publishedAt) > new Date(existing.publishedAt))) {
        uniqueItemsMap.set(key, item);
      }
    }
  }

  let uniqueItems = Array.from(uniqueItemsMap.values());

  // Sort by priority descending, then publishedAt descending
  uniqueItems.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Keep top 15 items only
  const topItems = uniqueItems.slice(0, 15);

  try {
    const batch = db.batch();
    const heroNewsRef = db.collection('heroNews');

    // Delete existing docs first
    const existingDocs = await heroNewsRef.get();
    existingDocs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Write new ones
    for (const item of topItems) {
      const docRef = heroNewsRef.doc(item.id);
      batch.set(docRef, item);
    }

    // Write metadata
    const metaRef = db.collection('systemMeta').doc('heroNews');
    batch.set(metaRef, {
      lastSync: new Date().toISOString(),
      itemCount: topItems.length,
      status
    });

    await batch.commit();
    console.log(`Successfully synced ${topItems.length} news items to Firestore.`);
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    process.exit(1);
  }
}

syncNews();
