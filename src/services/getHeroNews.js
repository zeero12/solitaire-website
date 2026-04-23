import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// ── Constants ──────────────────────────────────────────────────
const TARGET_DISPLAY_COUNT = 5;
const FRESH_NEWS_HOURS = 6;       // news younger than this = Priority 1
const FEATURED_BLOG_HOURS = 24;   // blogs within this window = Priority 2

// ── Static Fallback Cards (Priority 5 — last resort only) ─────
const STATIC_FALLBACK = [
  {
    id: 'static-1',
    category: 'Guide',
    title: 'How Section 54EC Bonds Can Eliminate Your Capital Gains Tax',
    summary: 'Sold a property? You have a 6-month window to legally save your entire LTCG tax liability.',
    articleUrl: '/services/tax-saving-bonds',
    source: 'Solitaire Financial Solutions',
    badge: 'Solitaire Insights',
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
    badge: 'Solitaire Insights',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'static-3',
    category: 'Explainer',
    title: 'What is SLBM and How Long-Term Investors Can Earn From It',
    summary: 'Your idle demat holdings can generate additional income without selling a single share.',
    articleUrl: '/services/equity-derivatives-slbm',
    source: 'Solitaire Financial Solutions',
    badge: 'Solitaire Insights',
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
    badge: 'Solitaire Insights',
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
    badge: 'Solitaire Insights',
    imageUrl: null,
    publishedAt: new Date().toISOString()
  }
];

// ── Helpers ────────────────────────────────────────────────────
const hoursAgo = (hours) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
};

const normalizeBlogToCard = (blog) => ({
  id: `blog-${blog.id}`,
  category: 'Solitaire Insights',
  title: blog.title,
  summary: blog.excerpt,
  articleUrl: `/blog/${blog.id}`,
  source: 'Solitaire Financial Solutions',
  badge: 'Our View',
  imageUrl: blog.imageUrl || null,
  publishedAt: blog.date,
  isBlog: true
});

// ── Main Fetch Function ────────────────────────────────────────
export async function getHeroNews() {
  try {
    // Fetch both collections in parallel
    const [newsSnapshot, blogsSnapshot] = await Promise.all([
      getDocs(collection(db, 'heroNews')),
      getDocs(collection(db, 'blogs'))
    ]);

    const now = new Date();
    const freshCutoff = hoursAgo(FRESH_NEWS_HOURS);
    const featuredCutoff = hoursAgo(FEATURED_BLOG_HOURS);

    // ── Process external news ──
    const allNews = newsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const freshNews = allNews.filter(
      item => new Date(item.publishedAt) >= freshCutoff
    );
    const olderNews = allNews.filter(
      item => new Date(item.publishedAt) < freshCutoff
    );

    // Sort each tier by priority desc, then date desc
    const sortByPriorityDate = (a, b) => {
      if ((b.priority || 0) !== (a.priority || 0))
        return (b.priority || 0) - (a.priority || 0);
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    };

    freshNews.sort(sortByPriorityDate);
    olderNews.sort(sortByPriorityDate);

    // ── Process blogs ──
    const allBlogs = blogsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(blog => blog.isActive !== false);

    const featuredBlogs = allBlogs
      .filter(blog => {
        const featuredUntil = blog.featuredUntil
          ? new Date(blog.featuredUntil)
          : null;
        return featuredUntil && featuredUntil > now;
      })
      .map(normalizeBlogToCard);

    const evergreemBlogs = allBlogs
      .filter(blog => {
        const featuredUntil = blog.featuredUntil
          ? new Date(blog.featuredUntil)
          : null;
        return !featuredUntil || featuredUntil <= now;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(normalizeBlogToCard);

    // ── Build final card list by priority ─────────────────────
    // Priority 1: Fresh external news (< 6 hours old)
    // Priority 2: Featured blogs (published within last 24 hours)
    // Priority 3: Older external news
    // Priority 4: Evergreen blogs
    // Priority 5: Static fallback

    const orderedPool = [
      ...freshNews,        // P1
      ...featuredBlogs,    // P2
      ...olderNews,        // P3
      ...evergreemBlogs,   // P4
    ];

    // Deduplicate by id
    const seen = new Set();
    const deduped = orderedPool.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // Pad with static fallback if needed
    if (deduped.length < TARGET_DISPLAY_COUNT) {
      const needed = TARGET_DISPLAY_COUNT - deduped.length;
      const usedIds = new Set(deduped.map(i => i.id));
      const padding = STATIC_FALLBACK
        .filter(card => !usedIds.has(card.id))
        .slice(0, needed);
      return [...deduped, ...padding];
    }

    return deduped.slice(0, TARGET_DISPLAY_COUNT);

  } catch (error) {
    console.error('Error fetching hero news — using static fallback:', error);
    return STATIC_FALLBACK.slice(0, TARGET_DISPLAY_COUNT);
  }
}