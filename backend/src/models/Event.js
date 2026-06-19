const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['page_view', 'click'],
      required: true,
    },
    pageUrl: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    clickX: {
      type: Number,
      required: function requiredClickX() {
        return this.eventType === 'click';
      },
    },
    clickY: {
      type: Number,
      required: function requiredClickY() {
        return this.eventType === 'click';
      },
    },
    viewportWidth: {
      type: Number,
    },
    viewportHeight: {
      type: Number,
    },
    pageWidth: {
      type: Number,
    },
    pageHeight: {
      type: Number,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Event', eventSchema);
