/**
 * Strip URL hash fragments and normalize trailing slashes for consistent grouping.
 */
function normalizePageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);
    parsed.hash = '';

    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    let base = url;
    const hashIndex = base.indexOf('#');
    if (hashIndex !== -1) {
      base = base.slice(0, hashIndex);
    }
    if (base.length > 1 && base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    return base;
  }
}

function buildPageUrlRegex(normalizedUrl) {
  const escaped = normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}/?(#|$)`);
}

module.exports = { normalizePageUrl, buildPageUrlRegex };
