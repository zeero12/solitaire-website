const includeKeywords = [
  'market', 'economy', 'tax', 'mutual fund', 'sip', 'inflation', 'rbi', 'sebi',
  'investing', 'stocks', 'bonds', 'fd', 'retirement', 'sensex', 'nifty', 'budget',
  'interest rate', 'equity', 'debt', 'portfolio'
];

const excludeKeywords = [
  'sports', 'celebrity', 'movie', 'entertainment', 'crime', 'astrology', 'cricket', 'bollywood'
];

export function isFinanceRelevant(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  
  const hasExclude = excludeKeywords.some(keyword => text.includes(keyword));
  if (hasExclude) return false;

  const hasInclude = includeKeywords.some(keyword => text.includes(keyword));
  return hasInclude;
}
