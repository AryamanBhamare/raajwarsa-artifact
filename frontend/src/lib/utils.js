export const PLACEHOLDER_POOL = [
  '/placeholders/bronze-vessel.svg',
  '/placeholders/maratha-sword.svg',
  '/placeholders/stone-carv.svg',
  '/placeholders/urn-plate.svg',
  '/placeholders/idol.svg',
  '/placeholders/fort-arch.svg',
  '/placeholders/textile.svg',
  '/placeholders/manuscript.svg',
  '/placeholders/lamp.svg',
  '/placeholders/shield.svg',
  '/placeholders/astronomical.svg',
  '/placeholders/coins.svg'
];

export function pickPlaceholder(seed = '') {
  const hash = [...String(seed)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PLACEHOLDER_POOL[hash % PLACEHOLDER_POOL.length];
}

export function firstImage(artifact, fallback = pickPlaceholder(artifact?.slug || '')) {
  if (artifact?.images && artifact.images.length > 0) {
    return artifact.images[0].url;
  }
  return fallback;
}

export function imagesOf(artifact) {
  if (artifact?.images && artifact.images.length > 0) {
    return artifact.images.map((i) => i.url);
  }
  return [pickPlaceholder(artifact?.slug || '')];
}

export function formatDate(input) {
  if (!input) return '';
  const d = new Date(input);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function readingTime(html) {
  if (!html) return '2 min read';
  const text = String(html).replace(/<[^>]*>/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function statusLabel(status) {
  const map = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    FOLLOW_UP: 'Follow up',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
  };
  return map[status] || status;
}

export function availabilityLabel(avail) {
  const map = {
    AVAILABLE: 'Available',
    ON_REQUEST: 'On request',
    LIMITED: 'Limited availability',
    UNAVAILABLE: 'Currently unavailable',
    IN_COLLECTION: 'In the family collection'
  };
  return map[avail] || avail || 'On request';
}