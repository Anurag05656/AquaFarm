# Deployment Guide

## Backend Deployment (Vercel)

### 1. Prerequisites
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- OpenWeatherMap API key

### 2. Deploy Backend

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Deploy via Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select `backend` folder as root directory
   - Add environment variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/water
     JWT_SECRET=your_jwt_secret_key_here
     WEATHER_API_KEY=your_openweathermap_api_key
     SESSION_SECRET=your_session_secret
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     GOOGLE_CLIENT_ID=your_google_client_id (optional)
     GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
     ```
   - Click "Deploy"

4. **Or Deploy via CLI**
   ```bash
   cd backend
   vercel
   ```
   Follow prompts and add environment variables when asked.

5. **Copy Backend URL**
   - Example: `https://your-backend.vercel.app`

---

## Frontend Deployment (Vercel)

### 1. Update Environment Variables

Create `frontend/.env.production`:
```
VITE_API_BASE_URL=https://your-backend.vercel.app
```

### 2. Deploy Frontend

1. **Via Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select `frontend` folder as root directory
   - Add environment variable:
     ```
     VITE_API_BASE_URL=https://your-backend.vercel.app
     ```
   - Click "Deploy"

2. **Or Deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```

---

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Choose cloud provider and region

2. **Configure Access**
   - Database Access → Add user (username/password)
   - Network Access → Add IP (0.0.0.0/0 for Vercel)

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Use this as `MONGODB_URI`

---

## Update Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to Credentials
4. Edit OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   ```
   https://your-backend.vercel.app/api/auth/google/callback
   ```
6. Add authorized JavaScript origins:
   ```
   https://your-frontend.vercel.app
   ```

---

## Post-Deployment

### 1. Update Backend CORS
Backend automatically uses `FRONTEND_URL` from environment variables.

### 2. Test Deployment
- Visit your frontend URL
- Test registration/login
- Test all features
- Check browser console for errors

### 3. Monitor Logs
- Vercel Dashboard → Your Project → Deployments → View Logs

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your frontend URL exactly
- Check browser console for specific CORS error

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure password doesn't contain special characters (or URL encode them)

### API Calls Failing
- Verify `VITE_API_BASE_URL` in frontend matches backend URL
- Check backend logs in Vercel dashboard
- Ensure all environment variables are set

### Build Errors
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs in Vercel dashboard

---

## Alternative: Deploy Backend to Railway/Render

### Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Deploy

### Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Create Web Service
