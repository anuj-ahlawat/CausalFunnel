const {
  computeNormalizedCoords,
  resolveCanvasDimensions,
  resolveClickCoordinates,
  isValidDimension,
  debugLog,
} = require('./coordinates');

module.exports = {
  computeNormalizedCoords,
  resolveRenderedDimensions: resolveCanvasDimensions,
  resolveClickCoordinates,
  isValidDimension,
  debugLog,
};
