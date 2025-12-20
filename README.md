# AquaFarm — Water Usage Optimization Dashboard

>A lightweight dashboard for tracking field water usage, receiving weather-based irrigation recommendations, and managing farm notifications.

## Key Features
- Field management: add and organize fields with area and crop type
- Water tracking: record and visualize water usage per field
- Weather integration: current weather, forecasts, and irrigation recommendations (OpenWeather)
- Notifications: system and weather-related alerts for farm actions
- Authentication: JWT-based user accounts and secure API endpoints

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React + Vite, Tailwind CSS
- External APIs: OpenWeather (for weather data)

## Repository Structure

- `backend/` — Express API and controllers
  - `server.js` — app entry and middleware
  - `config/db.js` — MongoDB connection and heartbeat
  - `controllers/` — route handlers (auth, field, water, weather, notifications)
  - `models/` — Mongoose schemas
  - `routes/` — API routes
- `frontend/` — React app (Vite)
  - `src/` — components, pages, context providers
  - `public/` — static assets
- `DEPLOYMENT.md` — deployment notes

## Quick Start

Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or Atlas)
- OpenWeather API key (for weather endpoints)

Backend

1. Copy the example env and set values:

```
cd backend
cp .env.example .env
```

2. Populate `.env` (see template below), install and start:

```
npm install
npm run dev
```

The backend runs on `PORT` (default `5000`) and exposes API under `/api/*`.

Frontend

1. Install and run the frontend:

```
cd frontend
npm install
npm run dev
```

2. Open the app in your browser (Vite default): `http://localhost:5173`.

## Environment Variables (.env template)

Create a `.env` in `backend/` with these keys:

```
# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/aquafarm?retryWrites=true&w=majority

# Express port
PORT=5000

# JWT secret for signing tokens
JWT_SECRET=your_jwt_secret_here

# OpenWeather API key (required for weather endpoints)
WEATHER_API_KEY=your_openweather_api_key

# URL of frontend when in production (used by CORS)
FRONTEND_URL=https://yourfrontend.example.com

# Node environment (development|production)
NODE_ENV=development
```

Notes:
- `MONGODB_URI` is used by `backend/config/db.js`.
- `JWT_SECRET` is used to sign authentication tokens.
- `WEATHER_API_KEY` is required by the weather controllers for fetching external data.

## API Overview

- Auth
  - `POST /api/auth/register` — register a user
  - `POST /api/auth/login` — login and receive JWT
  - `GET /api/auth/profile` — get current user profile (protected)
- Fields
  - `GET/POST/PUT/DELETE /api/fields` — manage fields
- Water Usage
  - `GET/POST /api/water` — record and view water usage
- Weather
  - `GET /api/weather/current` — current weather (requires `WEATHER_API_KEY`)
  - `GET /api/weather/forecast` — forecast data
  - `GET /api/weather/recommendations` — irrigation recommendations
- Notifications
  - `GET /api/notifications` — user notifications

There is also a simple health check: `GET /api/health`.

## Development Notes
- The backend uses a heartbeat collection to track activity and periodically reset counters (`backend/config/db.js`).
- CORS origins are controlled by `NODE_ENV` and `FRONTEND_URL` in `server.js`.

## Deploying
- Use a managed MongoDB (Atlas) for production.
- Set `NODE_ENV=production` and `FRONTEND_URL` to your deployed frontend origin.
- Build the frontend with `npm run build` (in `frontend/`) and serve the `dist/` directory.

## Contributing
- Open an issue for feature requests or bugs.
- Submit pull requests against `main` with clear descriptions and tests where appropriate.

## License
This project is provided under the ISC license (see `package.json`).

## Contact
For questions or help, open an issue in this repository.
