# User Analytics Application

A production-style full-stack user analytics platform inspired by mini Hotjar / CausalFunnel experiences. It captures page views and clicks from any website via an embeddable tracker script, stores events in MongoDB, and visualizes sessions and click heatmaps in a React dashboard.

## Project Overview

This project demonstrates end-to-end product analytics:

- **Tracker script** — lightweight JavaScript snippet embedded on any page
- **Event ingestion API** — Express backend with MongoDB persistence
- **Analytics dashboard** — React UI for sessions, timelines, and heatmaps
- **Demo site** — sample storefront to generate realistic tracking data

## Architecture

```text
┌──────────────┐     POST /api/events      ┌──────────────┐
│  tracker.js  │ ─────────────────────────▶│   Express    │
│ (any webpage)│                           │   Backend    │
└──────────────┘                           └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │   MongoDB    │
                                           └──────┬───────┘
                                                  │
┌──────────────┐     GET /api/*            ┌──────▼───────┐
│ React Dashboard│ ◀───────────────────────│  REST APIs   │
└──────────────┘                           └──────────────┘
```

### Backend (MVC + Service Layer)

- **Routes** — HTTP routing only
- **Controllers** — request/response handling
- **Services** — business logic and database queries
- **Models** — Mongoose schemas
- **Middleware** — centralized error handling

### Frontend

- React Router for page navigation
- Axios API client with interceptors
- Reusable layout, table, timeline, and heatmap components
- Loading and error states on all data views

## Folder Structure

```text
user-analytics-app/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── tracker/
│   └── tracker.js
├── demo-site/
│   └── index.html
└── README.md
```

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, Vite, React Router, Axios    |
| Styling  | Tailwind CSS                        |
| Backend  | Node.js, Express                    |
| Database | MongoDB, Mongoose                   |
| Language | JavaScript                          |

## Installation

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Backend runs at `http://localhost:5001`.

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Dashboard runs at `http://localhost:5173`.

### 3. Generate demo events

Serve the **project root** (not just `demo-site/`) so the tracker script is available:

```bash
npx serve .
```

Open `http://localhost:3000/demo-site/` and click around. The page loads `/tracker/tracker.js`, which sends `page_view` and `click` events to the backend.

Refresh the dashboard to inspect sessions and heatmaps.

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Description                          | Example                                  |
| ------------- | ------------------------------------ | ---------------------------------------- |
| `PORT`        | API server port                      | `5001`                                   |
| `MONGODB_URI` | MongoDB connection string            | `mongodb://127.0.0.1:27017/user-analytics` |

### Frontend (`frontend/.env` — optional)

| Variable       | Description              | Default                          |
| -------------- | ------------------------ | -------------------------------- |
| `VITE_API_URL` | Backend API base URL     | `http://localhost:5001/api`      |

## API Documentation

### `POST /api/events`

Store a tracking event.

**Request body**

```json
{
  "sessionId": "uuid",
  "eventType": "page_view",
  "pageUrl": "http://localhost/demo",
  "timestamp": "2026-06-18T10:00:00.000Z"
}
```

For click events, include document-relative `clickX`/`clickY` (from `pageX`/`pageY`), normalized `normalizedX`/`normalizedY`, `scrollX`/`scrollY`, and page/viewport dimensions.

```json
{
  "sessionId": "uuid",
  "eventType": "click",
  "pageUrl": "http://localhost:3000/demo-site/",
  "pageUrlNormalized": "http://localhost:3000/demo-site/",
  "clickX": 420,
  "clickY": 1580,
  "normalizedX": 0.29,
  "normalizedY": 0.49,
  "scrollX": 0,
  "scrollY": 1200,
  "viewportWidth": 1440,
  "viewportHeight": 900,
  "pageWidth": 1440,
  "pageHeight": 3200,
  "timestamp": "2026-06-18T10:00:00.000Z"
}
```

**Response**

```json
{ "success": true }
```

---

### `GET /api/sessions`

Return grouped sessions with event counts, sorted by most recent activity.

**Response**

```json
[
  { "sessionId": "abc-123", "eventCount": 12, "lastActivity": "2026-06-18T10:05:00.000Z" }
]
```

---

### `GET /api/sessions/:sessionId`

Return all events for a session, ordered by timestamp ascending.

**Response**

```json
[
  {
    "sessionId": "abc-123",
    "eventType": "page_view",
    "pageUrl": "http://localhost/demo",
    "timestamp": "2026-06-18T10:00:00.000Z"
  }
]
```

---

### `GET /api/heatmap?url=<page_url>`

Return click coordinates and canvas metadata for a page. URL hash fragments are ignored.

**Response**

```json
{
  "renderedWidth": 1440,
  "renderedHeight": 3200,
  "previewUrl": "http://127.0.0.1:5500/demo-site/",
  "clicks": [
    {
      "clickX": 420,
      "clickY": 1580,
      "normalizedX": 0.29,
      "normalizedY": 0.49,
      "scrollX": 0,
      "scrollY": 1200,
      "viewportWidth": 1440,
      "viewportHeight": 900,
      "pageWidth": 1440,
      "pageHeight": 3200
    }
  ]
}
```

---

### `GET /api/pages`

Return distinct tracked page URLs (hash fragments stripped).

**Response**

```json
[
  "http://localhost:3000/"
]
```

## Assumptions and Tradeoffs

1. **Local development first** — tracker posts to `http://localhost:5001/api/events`; production would use environment-based endpoints. Port `5001` avoids conflicts with macOS AirPlay on port `5000`.
2. **No authentication** — APIs are open for simplicity; a real product would add API keys and dashboard auth.
3. **Heatmap visualization** — `normalizedX`/`normalizedY` are the source of truth. Markers render at `displayX = normalizedX × pageWidth` and `displayY = normalizedY × pageHeight` using the most common stored document dimensions, with CSS scale applied only for on-screen fit.
4. **Fire-and-forget tracking** — tracker swallows network errors so host pages are never disrupted.
5. **Session identity** — `sessionId` is stored in `localStorage` and persists across page reloads in the same browser.
6. **URL grouping** — hash fragments (`#section`) are stripped from `pageUrlNormalized` so anchor navigation does not split heatmap data.
7. **Click coordinates** — `pageX`/`pageY` document positions normalized against `scrollWidth`/`scrollHeight` (not viewport size). Raw `clickX`/`clickY` kept for debugging.
8. **Service layer separation** — controllers stay thin; aggregation and validation live in services for testability and reuse.

## Scripts

| Location  | Command        | Purpose                |
| --------- | -------------- | ---------------------- |
| `backend` | `npm run dev`  | Start API with nodemon |
| `backend` | `npm start`    | Start API in production |
| `frontend`| `npm run dev`  | Start Vite dev server  |
| `frontend`| `npm run build`| Build dashboard        |

## License

MIT
