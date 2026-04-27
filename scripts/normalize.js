import crypto from 'crypto';

function extractImageUrl(item) {
  // 1. Standard enclosure tag — used by Economic Times, Moneycontrol
  if (item.enclosure?.url) return item.enclosure.url;

  // 2. media:content — used by Mint and many Indian news RSS feeds
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:content']?.url) return item['media:content'].url;

  // 3. media:thumbnail — alternative media tag
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;

  // 4. itunes:image — used by some financial podcast/blog feeds
  if (item['itunes:image']?.href) return item['itunes:image'].href;

  // 5. Extract first image from content or content:encoded HTML
  const htmlContent = item['content:encoded'] || item.content || '';
  if (htmlContent) {
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) return imgMatch[1];
  }

  // 6. og:image or image field if feed includes it
  if (item.image?.url) return item.image.url;
  if (item.image) return item.image;

  return null;
}

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