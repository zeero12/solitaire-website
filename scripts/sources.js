export const sources = [
  // ── WORKING — Keep these exactly as they are ──
  {
    name: "Economic Times Markets",
    url: "https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms",
    category: "Markets",
    priority: 10,
    enabled: true
  },
  {
    name: "Mint",
    url: "https://www.livemint.com/rss/markets",
    category: "Markets",
    priority: 9,
    enabled: true
  },
  {
    name: "Moneycontrol",
    url: "https://www.moneycontrol.com/rss/marketreports.xml",
    category: "Markets",
    priority: 8,
    enabled: true
  },

  // ── FIXED URLs ──
  {
    name: "SEBI Latest Orders",
    url: "https://www.sebi.gov.in/sebirss.jsp?key=smdrpneworder",
    category: "Regulatory",
    priority: 10,
    enabled: true
  },
  {
    name: "SEBI Circulars",
    url: "https://www.sebi.gov.in/sebirss.jsp?key=smdrpnewcir",
    category: "Regulatory",
    priority: 10,
    enabled: true
  },
  {
    name: "PIB Finance Ministry",
    url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    category: "Policy",
    priority: 9,
    enabled: true
  },
  {
    name: "ET Mutual Funds",
    url: "https://economictimes.indiatimes.com/mf/rssfeeds/2146842.cms",
    category: "Mutual Funds",
    priority: 9,
    enabled: true
  },
  {
    name: "ET Personal Finance",
    url: "https://economictimes.indiatimes.com/wealth/rssfeeds/2146842.cms",
    category: "Personal Finance",
    priority: 8,
    enabled: true
  },

  // ── DISABLED — Blocking cloud IPs ──
  {
    name: "Business Standard Markets",
    url: "https://www.business-standard.com/rss/markets-106.rss",
    category: "Markets",
    priority: 7,
    enabled: false
  },
  {
    name: "Business Standard Finance",
    url: "https://www.business-standard.com/rss/finance-103.rss",
    category: "Finance",
    priority: 7,
    enabled: false
  },
  {
    name: "Financial Express Markets",
    url: "https://www.financialexpress.com/market/feed/",
    category: "Markets",
    priority: 7,
    enabled: false
  },
  {
    name: "NSE News",
    url: "https://www.nseindia.com/api/rss?type=news",
    category: "Markets",
    priority: 6,
    enabled: false
  }
];