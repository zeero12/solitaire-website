export const sources = [
  // ── Economic Times ─────────────────────────────────────────
  {
    name: 'Economic Times Markets',
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms',
    category: 'Markets',
    priority: 10,
    enabled: true
  },
  {
    name: 'Economic Times Mutual Funds',
    url: 'https://economictimes.indiatimes.com/mf/rssfeeds/2146842.cms',
    category: 'Mutual Funds',
    priority: 8,
    enabled: true
  },

  // ── Mint ───────────────────────────────────────────────────
  {
    name: 'Mint',
    url: 'https://www.livemint.com/rss/markets',
    category: 'Markets',
    priority: 9,
    enabled: true
  },

  // ── New reliable sources ───────────────────────────────────
  {
    name: 'Hindu BusinessLine',
    url: 'https://www.thehindubusinessline.com/feeder/default.rss',
    category: 'Business',
    priority: 8,
    enabled: true
  },
  {
    name: 'Hindu BusinessLine Markets',
    url: 'https://www.thehindubusinessline.com/markets/feeder/default.rss',
    category: 'Markets',
    priority: 9,
    enabled: true
  },
  {
    name: 'NDTV Profit',
    url: 'https://feeds.feedburner.com/ndtvprofit-latest',
    category: 'Finance',
    priority: 8,
    enabled: true
  },
  {
    name: 'Zee Business',
    url: 'https://www.zeebiz.com/rss/rss.xml',
    category: 'Business',
    priority: 7,
    enabled: true
  },

  // ── Disabled — consistently failing ───────────────────────
  {
    name: 'Moneycontrol',
    url: 'https://www.moneycontrol.com/rss/marketreports.xml',
    category: 'Markets',
    priority: 8,
    enabled: false   // 403 — blocked
  },
  {
    name: 'SEBI Latest Orders',
    url: 'https://www.sebi.gov.in/sebirss.jsp?key=smdrpneworder',
    category: 'Regulatory',
    priority: 10,
    enabled: false   // 404 — dead URL
  },
  {
    name: 'SEBI Circulars',
    url: 'https://www.sebi.gov.in/sebirss.jsp?key=smdrpnewcir',
    category: 'Regulatory',
    priority: 10,
    enabled: false   // 404 — dead URL
  },
  {
    name: 'PIB Finance Ministry',
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
    category: 'Policy',
    priority: 9,
    enabled: false   // 403 — blocked
  },
  {
    name: 'ET Personal Finance',
    url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/2146842.cms',
    category: 'Personal Finance',
    priority: 8,
    enabled: false   // Heavy overlap with ET Markets — disabled to reduce duplication
  }
];