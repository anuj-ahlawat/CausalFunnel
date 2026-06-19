const MIN_VALID = 100;

export function debugLog(stage, payload) {
  if (import.meta.env.DEV) {
    console.log(`[Analytics:${stage}]`, payload);
  }
}

export function stripUrlHash(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    let base = url;
    const i = url.indexOf('#');
    if (i !== -1) base = url.slice(0, i);
    if (base.length > 1 && base.endsWith('/')) base = base.slice(0, -1);
    return base;
  }
}

function isValidDimension(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_VALID;
}

function repairClicks(clicks) {
  const maxX = Math.max(...clicks.map((c) => c.pageX ?? c.clickX ?? 0), 0);
  const maxY = Math.max(...clicks.map((c) => c.pageY ?? c.clickY ?? 0), 0);

  const pageWidth =
    clicks.map((c) => c.pageWidth).find(isValidDimension) ||
    clicks.map((c) => c.viewportWidth).find(isValidDimension) ||
    Math.max(Math.ceil(maxX * 1.05), 320);

  const pageHeight =
    clicks.map((c) => c.pageHeight).find(isValidDimension) ||
    Math.max(Math.ceil(maxY * 1.05), 320);

  const viewportWidth =
    clicks.map((c) => c.viewportWidth).find(isValidDimension) || pageWidth;

  const repaired = clicks.map((click) => {
    const pageX = click.pageX ?? click.clickX ?? 0;
    const pageY = click.pageY ?? click.clickY ?? 0;
    const captureWidth = isValidDimension(click.pageWidth) ? click.pageWidth : pageWidth;
    const captureHeight = isValidDimension(click.pageHeight) ? click.pageHeight : pageHeight;

    const normalizedX =
      typeof click.normalizedX === 'number' ? click.normalizedX : pageX / captureWidth;
    const normalizedY =
      typeof click.normalizedY === 'number' ? click.normalizedY : pageY / captureHeight;

    return {
      ...click,
      pageX,
      pageY,
      clickX: pageX,
      clickY: pageY,
      normalizedX,
      normalizedY,
      displayX: normalizedX * pageWidth,
      displayY: normalizedY * pageHeight,
    };
  });

  return { pageWidth, pageHeight, viewportWidth, viewportHeight: 900, clicks: repaired };
}

export function normalizeHeatmapResponse(data, pageUrl) {
  const previewUrl = stripUrlHash(data?.previewUrl ?? pageUrl);

  if (data?.clicks && isValidDimension(data.pageWidth) && isValidDimension(data.pageHeight)) {
    return { ...data, previewUrl };
  }

  const rawClicks = Array.isArray(data) ? data : data?.clicks ?? [];
  debugLog('frontend:heatmap-repair', rawClicks);

  return { previewUrl, ...repairClicks(rawClicks) };
}

export function canEmbedPreview(pageUrl) {
  return (
    typeof pageUrl === 'string' &&
    (pageUrl.startsWith('http://') || pageUrl.startsWith('https://'))
  );
}
