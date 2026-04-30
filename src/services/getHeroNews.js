import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const TARGET_DISPLAY_COUNT = 5;

const FALLBACK_CARDS = [
  {
    id: 'static-1',
    category: 'Guide',
    title: 'How Section 54EC Bonds Can Eliminate Your Capital Gains Tax',
    summary: 'Sold a property? You have a 6-month window to legally save your entire LTCG tax liability.',
    articleUrl: '/services/tax-saving-bonds',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-2',
    category: 'Insights',
    title: 'SIP vs Lump Sum — Which Works Better for Long-Term Wealth?',
    summary: 'Understanding when each approach creates more value for your financial goals.',
    articleUrl: '/services/mutual-funds',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-3',
    category: 'Explainer',
    title: 'What is SLBM and How Long-Term Investors Can Earn From It',
    summary: 'Your idle holdings can generate additional income without selling a single share.',
    articleUrl: '/services/equity-derivatives-slbm',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-4',
    category: 'Guide',
    title: 'PMS vs Mutual Funds — When Does PMS Make Sense?',
    summary: 'For investors with ₹50L+, knowing when to move beyond standard mutual fund portfolios.',
    articleUrl: '/services/pms-aif-sif',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-5',
    category: 'Planning',
    title: 'Why Most Indians Invest But Few Actually Build Wealth',
    summary: 'The difference lies in a structured financial plan — not just scattered investments.',
    articleUrl: '/services/financial-planning',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  }
];

export async function getHeroNews() {
  try {
    console.log('getHeroNews: fetching from Firestore...');

    const snapshot = await getDocs(collection(db, 'heroNews'));
    console.log(`getHeroNews: raw documents fetched from Firestore: ${snapshot.size}`);

    if (snapshot.size === 0) {
      console.warn('getHeroNews: heroNews collection is empty — using fallback cards');
      return FALLBACK_CARDS.slice(0, TARGET_DISPLAY_COUNT);
    }

    function decodeHtmlEntities(str) {
      if (typeof str !== 'string') return str;
      if (!str.includes('&')) return str;
      const doc = new DOMParser().parseFromString(str, 'text/html');
      return doc.documentElement.textContent || str;
    }

    const news = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Decode HTML entities for text fields
      if (data.title) data.title = decodeHtmlEntities(data.title);
      if (data.summary) data.summary = decodeHtmlEntities(data.summary);
      if (data.source) data.source = decodeHtmlEntities(data.source);
      if (data.category) data.category = decodeHtmlEntities(data.category);
      if (data.badge) data.badge = decodeHtmlEntities(data.badge);

      news.push({ id: doc.id, ...data });
    });

    news.sort((a, b) => {
      if ((b.priority || 0) !== (a.priority || 0))
        return (b.priority || 0) - (a.priority || 0);
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Group sorted items by source
    const groupedBySource = {};
    news.forEach(item => {
      if (!groupedBySource[item.source]) {
        groupedBySource[item.source] = [];
      }
      groupedBySource[item.source].push(item);
    });

    function interleaveBySource(grouped, targetCount) {
      const sourceQueues = Object.values(grouped);
      const result = [];
      let queueIndex = 0;

      while (result.length < targetCount) {
        // Find next non-empty queue
        let attempts = 0;
        while (attempts < sourceQueues.length) {
          const queue = sourceQueues[queueIndex % sourceQueues.length];
          if (queue.length > 0) {
            result.push(queue.shift());
            queueIndex++;
            break;
          }
          queueIndex++;
          attempts++;
        }

        // All queues exhausted before reaching targetCount
        if (attempts === sourceQueues.length) break;
      }

      return result;
    }

    const diverseNews = interleaveBySource(groupedBySource, TARGET_DISPLAY_COUNT);

    console.log(`getHeroNews: returning ${Math.min(diverseNews.length, TARGET_DISPLAY_COUNT)} cards`);

    if (diverseNews.length < TARGET_DISPLAY_COUNT) {
      const needed = TARGET_DISPLAY_COUNT - diverseNews.length;
      const usedIds = new Set(diverseNews.map(i => i.id));
      const padding = FALLBACK_CARDS
        .filter(c => !usedIds.has(c.id))
        .slice(0, needed);
      console.log(`getHeroNews: padding with ${padding.length} fallback cards`);
      return [...diverseNews, ...padding];
    }

    return diverseNews.slice(0, TARGET_DISPLAY_COUNT);

  } catch (error) {
    console.error('getHeroNews: Firestore fetch failed — using fallback cards:', error);
    return FALLBACK_CARDS.slice(0, TARGET_DISPLAY_COUNT);
  }
}