const eventService = require('../services/eventService');

const createEvent = async (req, res) => {
  try {
    await eventService.createEvent(req.body);
    res.status(201).json({ success: true });
  } catch (error) {
    throw error;
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await eventService.getSessions();
    res.json(sessions);
  } catch (error) {
    throw error;
  }
};

const getSessionEvents = async (req, res) => {
  try {
    const events = await eventService.getSessionEvents(req.params.sessionId);
    res.json(events);
  } catch (error) {
    throw error;
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const clicks = await eventService.getHeatmapData(req.query.url);
    res.json(clicks);
  } catch (error) {
    throw error;
  }
};

const getPages = async (req, res) => {
  try {
    const pages = await eventService.getDistinctPages();
    res.json(pages);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createEvent,
  getSessions,
  getSessionEvents,
  getHeatmapData,
  getPages,
};
