const Event = require('../models/Event');
const { ApiError } = require('../utils/ApiResponse');
const {
  computeNormalizedCoords,
  resolveCanvasDimensions,
  resolveClickCoordinates,
  isValidDimension,
  debugLog,
} = require('../utils/coordinates');
const { normalizePageUrl, buildPageUrlRegex } = require('../utils/pageUrl');

const toNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const createEvent = async (eventData) => {
  debugLog('api:received', eventData);

  const {
    sessionId,
    eventType,
    pageUrl,
    pageUrlNormalized,
    timestamp,
    pageX,
    pageY,
    clickX,
    clickY,
    viewportWidth,
    viewportHeight,
    pageWidth,
    pageHeight,
    scrollX,
    scrollY,
  } = eventData;

  if (!sessionId || !eventType || !pageUrl || !timestamp) {
    throw new ApiError(400, 'sessionId, eventType, pageUrl, and timestamp are required');
  }

  if (!['page_view', 'click'].includes(eventType)) {
    throw new ApiError(400, 'eventType must be page_view or click');
  }

  const resolvedPageX = toNumber(pageX ?? clickX);
  const resolvedPageY = toNumber(pageY ?? clickY);

  if (eventType === 'click' && (resolvedPageX === undefined || resolvedPageY === undefined)) {
    throw new ApiError(400, 'pageX/pageY are required for click events');
  }

  const normalizedUrl = pageUrlNormalized || normalizePageUrl(pageUrl);
  const metrics = {
    viewportWidth: toNumber(viewportWidth),
    viewportHeight: toNumber(viewportHeight),
    pageWidth: toNumber(pageWidth),
    pageHeight: toNumber(pageHeight),
  };

  let normalizedX;
  let normalizedY;

  if (
    eventType === 'click' &&
    isValidDimension(metrics.pageWidth) &&
    isValidDimension(metrics.pageHeight)
  ) {
    const computed = computeNormalizedCoords(
      resolvedPageX,
      resolvedPageY,
      metrics.pageWidth,
      metrics.pageHeight
    );
    normalizedX = computed.normalizedX;
    normalizedY = computed.normalizedY;
  }

  const doc = {
    sessionId,
    eventType,
    pageUrl,
    pageUrlNormalized: normalizedUrl,
    timestamp: new Date(timestamp),
    viewportWidth: metrics.viewportWidth,
    viewportHeight: metrics.viewportHeight,
    pageWidth: metrics.pageWidth,
    pageHeight: metrics.pageHeight,
  };

  if (eventType === 'click') {
    Object.assign(doc, {
      pageX: resolvedPageX,
      pageY: resolvedPageY,
      clickX: resolvedPageX,
      clickY: resolvedPageY,
      normalizedX,
      normalizedY,
      scrollX: toNumber(scrollX),
      scrollY: toNumber(scrollY),
    });
  }

  const event = await Event.create(doc);

  debugLog('mongodb:saved', {
    id: event._id,
    eventType: event.eventType,
    pageX: event.pageX,
    pageY: event.pageY,
    normalizedX: event.normalizedX,
    normalizedY: event.normalizedY,
    pageWidth: event.pageWidth,
    pageHeight: event.pageHeight,
    viewportWidth: event.viewportWidth,
    viewportHeight: event.viewportHeight,
  });

  return event;
};

const formatClickEvent = (event, canvas) => {
  if (event.eventType !== 'click') return event;
  return { ...event, ...resolveClickCoordinates(event, canvas) };
};

const getSessions = async () =>
  Event.aggregate([
    { $group: { _id: '$sessionId', eventCount: { $sum: 1 }, lastActivity: { $max: '$timestamp' } } },
    { $project: { _id: 0, sessionId: '$_id', eventCount: 1, lastActivity: 1 } },
    { $sort: { lastActivity: -1 } },
  ]);

const getSessionEvents = async (sessionId) => {
  if (!sessionId) throw new ApiError(400, 'sessionId is required');

  const events = await Event.find({ sessionId }).sort({ timestamp: 1 }).lean();
  const clicks = events.filter((e) => e.eventType === 'click');
  const canvas = resolveCanvasDimensions(clicks);

  return events.map((event) => formatClickEvent(event, canvas));
};

const buildNormalizedUrlFilter = (pageUrl) => {
  const normalizedUrl = normalizePageUrl(pageUrl);
  if (!normalizedUrl) throw new ApiError(400, 'url query parameter is required');

  const pageUrlRegex = buildPageUrlRegex(normalizedUrl);

  return {
    $or: [
      { pageUrlNormalized: normalizedUrl },
      { pageUrlNormalized: `${normalizedUrl}/` },
      { pageUrl: normalizedUrl },
      { pageUrl: `${normalizedUrl}/` },
      { pageUrl: pageUrlRegex },
    ],
  };
};

const getHeatmapData = async (pageUrl) => {
  const clicks = await Event.find({
    ...buildNormalizedUrlFilter(pageUrl),
    eventType: 'click',
  }).lean();

  const canvas = resolveCanvasDimensions(clicks);
  const repairedClicks = clicks.map((click) => resolveClickCoordinates(click, canvas));

  const response = {
    pageWidth: canvas.pageWidth,
    pageHeight: canvas.pageHeight,
    viewportWidth: canvas.viewportWidth,
    viewportHeight: canvas.viewportHeight,
    previewUrl: normalizePageUrl(pageUrl),
    clicks: repairedClicks,
  };

  debugLog('api:heatmap', response);
  return response;
};

const getDistinctPages = async () => {
  const pages = await Event.aggregate([
    {
      $project: {
        pageUrlNormalized: {
          $ifNull: [
            '$pageUrlNormalized',
            {
              $let: {
                vars: { parts: { $split: ['$pageUrl', '#'] } },
                in: { $arrayElemAt: ['$$parts', 0] },
              },
            },
          ],
        },
      },
    },
    { $group: { _id: '$pageUrlNormalized' } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, pageUrl: '$_id' } },
  ]);

  return pages.map((entry) => entry.pageUrl);
};

module.exports = {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapData,
  getDistinctPages,
};
