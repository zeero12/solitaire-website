import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// ── Constants ──────────────────────────────────────────────────
const TARGET_DISPLAY_COUNT = 5;   // cards shown in the slider
const POOL_FETCH_COUNT = 30;      // max items pulled from Firestore

// ── Fallback Cards ─────────────────────────────────────────────
// Used when Firestore has fewer items than TARGET_DISPLAY_COUNT
// or when Firestore is unreachable entirely
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
    summary: 'Understanding when each approach creates more value for your specific financial goals.',
    articleUrl: '/services/mutual-funds',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-3',
    category: 'Explainer',
    title: 'What is SLBM and How Can Long-Term Investors Earn From It?',
    summary: 'Your idle demat holdings can generate additional income without selling a single share.',
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
    summary: 'The difference lies in having a structured financial plan — not just scattered investments.',
    articleUrl: '/services/financial-planning',
    source: 'Solitaire Financial Solutions',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  }
];

// ── Main Fetch Function ────────────────────────────────────────
export async function getHeroNews() {
  try {
    const snapshot = await getDocs(collection(db, 'heroNews'));

    const news = [];
    snapshot.forEach(doc => {
      news.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory — priority desc, then publishedAt desc
    news.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const topNews = news.slice(0, POOL_FETCH_COUNT);

    // Pad with fallback cards if live news is insufficient
    if (topNews.length < TARGET_DISPLAY_COUNT) {
      const needed = TARGET_DISPLAY_COUNT - topNews.length;

      // Only use fallback cards not already covered by live news
      const padding = FALLBACK_CARDS.slice(0, needed);
      console.log(`Padded ${needed} fallback card(s) to reach target display count.`);
      return [...topNews, ...padding];
    }

    return topNews.slice(0, TARGET_DISPLAY_COUNT);

  } catch (error) {
    // Firestore unreachable — return full fallback set
    console.error('Error fetching hero news — using fallback cards:', error);
    return FALLBACK_CARDS.slice(0, TARGET_DISPLAY_COUNT);
  }
}