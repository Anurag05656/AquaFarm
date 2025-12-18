# Water Usage Optimization Dashboard (AquaFarm)

A comprehensive web application for farmers to monitor and optimize water usage across their fields with real-time weather integration and intelligent irrigation recommendations.

## Project Structure

```
ProjectV2/
├── backend/          # Node.js/Express API
├── frontend/         # React/Vite application
└── DEPLOYMENT.md     # Deployment guide
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenWeatherMap API key

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials

5. Start server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Features

- User Authentication (JWT + Google OAuth)
- Field Management
- Water Usage Tracking
- Real-time Weather Integration
- Smart Irrigation Recommendations
- Notifications System
- Analytics Dashboard

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Passport  
**Frontend:** React, Vite, Tailwind CSS, Recharts

## License

ISC
