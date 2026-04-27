import crypto from 'crypto';

function extractImageUrl(item) {
  // 1. Standard enclosure tag — used by Economic Times, Moneycontrol
  if (item.enclosure?.url) return item.enclosure.url;

  // 2. media:content — Mint uses this with $ attribute wrapper
  // Handle all possible structures rss-parser may produce
  const mediaContent = item['media:content'] || item['mediaContent'];
  if (mediaContent) {
    if (mediaContent.$?.url) return mediaContent.$.url;
    if (mediaContent.url) return mediaContent.url;
    if (Array.isArray(mediaContent) && mediaContent[0]?.$?.url)
      return mediaContent[0].$.url;
    if (Array.isArray(mediaContent) && mediaContent[0]?.url)
      return mediaContent[0].url;
  }

  // 3. media:thumbnail — alternative media tag
  const mediaThumbnail = item['media:thumbnail'] || item['mediaThumbnail'];
  if (mediaThumbnail) {
    if (mediaThumbnail.$?.url) return mediaThumbnail.$.url;
    if (mediaThumbnail.url) return mediaThumbnail.url;
  }

  // 4. itunes:image — used by some financial podcast/blog feeds
  if (item['itunes:image']?.href) return item['itunes:image'].href;

  // 5. Extract first image from content or content:encoded HTML
  const htmlContent = item['content:encoded'] || item.content || '';
  if (htmlContent) {
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) return imgMatch[1];
  }

  // 6. Direct image field
  if (item.image?.url) return item.image.url;
  if (typeof item.image === 'string') return item.image;

  return null;
}

export function normalizeItem(item, source) {
  if (!item.title || !item.link) return null;

  const id = crypto
    .createHash('md5')
    .update(item.link.trim())
    .digest('hex')
    .substring(0, 24);

  const title = item.title.trim().substring(0, 120);
  const summary = item.contentSnippet
    ? item.contentSnippet.trim().substring(0, 200)
    : null;
  const imageUrl = extractImageUrl(item);
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