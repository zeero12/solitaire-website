import crypto from 'crypto';

export function normalizeItem(item, source) {
  if (!item.title || !item.link) return null;

  // Generate a proper unique id from the full URL
  // MD5 hash of the full URL — short, unique, consistent
  const id = crypto
    .createHash('md5')
    .update(item.link.trim())
    .digest('hex')
    .substring(0, 24);

  const title = item.title.trim().substring(0, 120);
  const summary = item.contentSnippet
    ? item.contentSnippet.trim().substring(0, 200)
    : null;
  const imageUrl = item.enclosure?.url || null;
  const publishedAt = item.isoDate || new Date().toISOString();
  const createdAt = new Date().toISOString();

  return {
    id,
    title,
    source: source.name,
    category: source.category,
    articleUrl: item.link.trim(),
    imageUrl,
    summary,
    publishedAt,
    priority: source.priority,
    createdAt
  };
}