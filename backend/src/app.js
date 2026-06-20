const express = require('express');
const cors = require('cors');
const path = require('path');

const eventRoutes = require('./routes/eventRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Serve tracker.js from backend/public
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
const express = require('express');
const cors = require('cors');
const path = require('path');

const eventRoutes = require('./routes/eventRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Explicitly serve tracker.js
app.get('/tracker.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/tracker.js'));
});

// Serve all files inside public folder
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', eventRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
app.use('/api', eventRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;