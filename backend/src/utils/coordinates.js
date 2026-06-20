const MIN_VALID_DIMENSION = 100;

function isValidDimension(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_VALID_DIMENSION;
}

function chooseMode(values) {
  const filtered = values.filter(isValidDimension);
  if (!filtered.length) return null;

  const counts = new Map();
  filtered.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));

  let bestValue = filtered[0];
  let bestCount = 0;
  counts.forEach((count, value) => {
    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
    }
  });
  return bestValue;
}

function computeNormalizedCoords(pageX, pageY, pageWidth, pageHeight) {
  const width = Math.max(pageWidth, 1);
  const height = Math.max(pageHeight, 1);
  return {
    normalizedX: pageX / width,
    normalizedY: pageY / height,
  };
}

function resolveCanvasDimensions(clicks) {
  if (!clicks.length) {
    return {
      pageWidth: 1280,
      pageHeight: 900,
      viewportWidth: 1280,
      viewportHeight: 900,
    };
  }

  const maxX = Math.max(...clicks.map((c) => c.pageX ?? c.clickX ?? 0), 0);
  const maxY = Math.max(...clicks.map((c) => c.pageY ?? c.clickY ?? 0), 0);

  const pageWidth =
    chooseMode(clicks.map((c) => c.pageWidth)) ||
    chooseMode(clicks.map((c) => c.viewportWidth)) ||
    Math.max(Math.ceil(maxX * 1.05), 320);

  const pageHeight =
    chooseMode(clicks.map((c) => c.pageHeight)) ||
    Math.max(Math.ceil(maxY * 1.05), 320);

  const viewportWidth =
    chooseMode(clicks.map((c) => c.viewportWidth)) || pageWidth;

  const viewportHeight =
    chooseMode(clicks.map((c) => c.viewportHeight)) || Math.min(pageHeight, 900);

  return { pageWidth, pageHeight, viewportWidth, viewportHeight };
}

function resolveClickCoordinates(click, canvas) {
  const pageX = click.pageX ?? click.clickX ?? 0;
  const pageY = click.pageY ?? click.clickY ?? 0;

  const captureWidth = isValidDimension(click.pageWidth) ? click.pageWidth : canvas.pageWidth;
  const captureHeight = isValidDimension(click.pageHeight) ? click.pageHeight : canvas.pageHeight;

  const { normalizedX, normalizedY } = computeNormalizedCoords(
    pageX,
    pageY,
    captureWidth,
    captureHeight
  );

  return {
    pageX,
    pageY,
    normalizedX,
    normalizedY,
    displayX: normalizedX * canvas.pageWidth,
    displayY: normalizedY * canvas.pageHeight,
    pageWidth: captureWidth,
    pageHeight: captureHeight,
    scrollX: click.scrollX ?? 0,
    scrollY: click.scrollY ?? 0,
    viewportWidth: click.viewportWidth ?? canvas.viewportWidth,
    viewportHeight: click.viewportHeight ?? canvas.viewportHeight,
  };
}

function debugLog(stage, payload) {
  if (process.env.ANALYTICS_DEBUG === 'true' || process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics:${stage}]`, JSON.stringify(payload, null, 2));
  }
}

module.exports = {
  MIN_VALID_DIMENSION,
  isValidDimension,
  computeNormalizedCoords,
  resolveCanvasDimensions,
  resolveClickCoordinates,
  debugLog,
};
