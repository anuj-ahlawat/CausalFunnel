const Event = require('../models/Event');
const { ApiError } = require('../utils/ApiResponse');

const createEvent = async (eventData) => {
  const {
    sessionId,
    eventType,
    pageUrl,
    timestamp,
    clickX,
    clickY,
    viewportWidth,
    viewportHeight,
    pageWidth,
    pageHeight,
  } = eventData;

  if (!sessionId || !eventType || !pageUrl || !timestamp) {
    throw new ApiError(400, 'sessionId, eventType, pageUrl, and timestamp are required');
  }

  if (!['page_view', 'click'].includes(eventType)) {
    throw new ApiError(400, 'eventType must be page_view or click');
  }

  if (eventType === 'click' && (clickX === undefined || clickY === undefined)) {
    throw new ApiError(400, 'clickX and clickY are required for click events');
  }

  const event = await Event.create({
    sessionId,
    eventType,
    pageUrl,
    timestamp: new Date(timestamp),
    viewportWidth: typeof viewportWidth === 'number' ? viewportWidth : undefined,
    viewportHeight: typeof viewportHeight === 'number' ? viewportHeight : undefined,
    pageWidth: typeof pageWidth === 'number' ? pageWidth : undefined,
    pageHeight: typeof pageHeight === 'number' ? pageHeight : undefined,
    ...(eventType === 'click' ? { clickX, clickY } : {}),
  });

  return event;
};

const getSessions = async () => {
  return Event.aggregate([
    {
      $group: {
        _id: '$sessionId',
        eventCount: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
      },
    },
    {
      $project: {
        _id: 0,
        sessionId: '$_id',
        eventCount: 1,
        lastActivity: 1,
      },
    },
    { $sort: { lastActivity: -1 } },
  ]);
};

const getSessionEvents = async (sessionId) => {
  if (!sessionId) {
    throw new ApiError(400, 'sessionId is required');
  }

  return Event.find({ sessionId }).sort({ timestamp: 1 }).lean();
};

const getHeatmapData = async (pageUrl) => {
  if (!pageUrl) {
    throw new ApiError(400, 'url query parameter is required');
  }

  const clicks = await Event.find({
    pageUrl,
    eventType: 'click',
  })
    .select('clickX clickY viewportWidth viewportHeight pageWidth pageHeight -_id')
    .lean();

  return clicks.map((click) => ({
    clickX: click.clickX,
    clickY: click.clickY,
    viewportWidth: click.viewportWidth,
    viewportHeight: click.viewportHeight,
    pageWidth: click.pageWidth,
    pageHeight: click.pageHeight,
  }));
};

const getDistinctPages = async () => {
  return Event.distinct('pageUrl');
};

module.exports = {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapData,
  getDistinctPages,
};
