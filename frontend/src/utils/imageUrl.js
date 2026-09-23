/**
 * Resolves product image URLs cleanly across development and production environments.
 * If the URL is relative (/static/products/...) and a remote backend VITE_API_URL is configured,
 * it prepends the backend host. Otherwise returns the URL as-is (with fallback to default sample).
 */
export function getProductImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '/vitamix-sample.jpg';
  }

  // Already absolute or data URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Backend static upload path
  if (url.startsWith('/static')) {
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    if (rawApiUrl) {
      const cleanHost = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
      return `${cleanHost}${url}`;
    }
    return url;
  }

  // Local public assets (e.g. /vitamix-sample.jpg)
  return url;
}
