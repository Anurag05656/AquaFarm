# Google OAuth Setup

## 1. Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Go to Credentials → Create OAuth Client ID
5. Configure consent screen
6. Application type: Web application
7. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
8. Copy Client ID and Client Secret

## 2. Backend Setup

Add to `backend/.env`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=random_secret_string
```

## 3. Frontend Setup

Add to `frontend/.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## 4. Start Servers

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Click "Continue with Google" button to test.
