const express = require('express');
const eventController = require('../controllers/eventController');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

router.post('/events', asyncHandler(eventController.createEvent));
router.get('/sessions', asyncHandler(eventController.getSessions));
router.get('/sessions/:sessionId', asyncHandler(eventController.getSessionEvents));
router.get('/heatmap', asyncHandler(eventController.getHeatmapData));
router.get('/pages', asyncHandler(eventController.getPages));

module.exports = router;
