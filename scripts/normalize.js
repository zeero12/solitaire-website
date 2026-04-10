export function normalizeItem(item, source) {
  if (!item.title || !item.link) return null;

  const id = Buffer.from(item.link).toString('base64').substring(0, 20);
  const title = item.title.trim().substring(0, 120);
  const summary = item.contentSnippet ? item.contentSnippet.trim().substring(0, 200) : null;
  const imageUrl = item.enclosure?.url || null;
  const publishedAt = item.isoDate || new Date().toISOString();
  const createdAt = new Date().toISOString();

  return {
    id,
    title,
    source: source.name,
    category: source.category,
    articleUrl: item.link,
    imageUrl,
    summary,
    publishedAt,
    priority: source.priority,
    createdAt
  };
}
