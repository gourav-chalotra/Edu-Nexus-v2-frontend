# Vercel Deployment & Debugging Guide

This guide will help you successfully deploy your Edu-Nexus-v2 frontend to Vercel and connect it to your Render backend.

## 1. Environment Variable Setup

Before deploying to Vercel, ensure your environment variables are configured.

1. Go to your Vercel Dashboard and select your project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://edu-nexus-v2-backend-1.onrender.com`
4. Click **Save** and trigger a new deployment for changes to take effect.

> [!WARNING]
> Since you are using Vite, you must use `VITE_` prefix for variables exposed to the frontend. Do not use `NEXT_PUBLIC_` unless you migrate to Next.js.

## 2. Testing Instructions

1. Start your backend locally: `npm run dev` in the backend folder.
2. Start your frontend locally: `npm run dev` in the frontend folder.
3. Open `http://localhost:5173/api-example` in your browser.
4. If you see the user cards displayed, the API is correctly connected!
5. After deploying, visit your Vercel URL (e.g. `https://your-frontend.vercel.app/api-example`) to verify the production connection.

## 3. Common Issues & Debugging Fixes

### Issue 1: CORS Blocked
**Symptom:** You see an error in the browser console: "Access to fetch at ... from origin ... has been blocked by CORS policy".
**Fix:**
- Ensure your Vercel URL is added to the `allowedOrigins` array in your backend's `index.js`.
- Make sure there is NO trailing slash in the URL (e.g., `https://your-app.vercel.app` NOT `https://your-app.vercel.app/`).
- Make sure `credentials: true` is set in the CORS config.

### Issue 2: Failed Fetch
**Symptom:** Browser console says "Failed to fetch" immediately.
**Fix:**
- This means the backend is completely unreachable. 
- Ensure your `VITE_API_URL` does not have a typo.
- Verify the Render backend is actually running and not crashed.

### Issue 3: 404 API Issue
**Symptom:** Network tab shows a 404 error when calling an endpoint.
**Fix:**
- Ensure the route actually exists on the backend. For example, we added `/api/users`. If you call `/api/profile` and it doesn't exist, it will 404.
- Check if `VITE_API_URL` has a trailing slash that is causing double slashes (e.g., `https://backend.onrender.com//api/users`). 

### Issue 4: Environment Variables Not Loading
**Symptom:** Frontend tries to fetch from `http://localhost:5000` even in production.
**Fix:**
- Did you use `import.meta.env.VITE_API_URL` instead of `process.env`? (Yes, the updated `api.js` does this).
- Did you add the variable in the Vercel dashboard *before* the current deployment? If not, redeploy.

### Issue 5: Render Backend Sleeping
**Symptom:** The first API request takes 30-50 seconds to complete, but subsequent requests are fast.
**Fix:**
- Render's free tier spins down the backend after 15 minutes of inactivity.
- **Solution:** You can use a free pinging service (like cron-job.org) to ping `https://edu-nexus-v2-backend-1.onrender.com/api/health` every 10 minutes to keep it awake.
- We added a `/api/health` endpoint in your backend exactly for this purpose!

## Folder Structure Implemented

- `backend/index.js` -> Contains CORS configuration and mock routes.
- `frontend/.env.local` -> Local testing variables.
- `frontend/src/utils/api.js` -> Centralized fetch utility handling errors, parsing, and base URLs.
- `frontend/src/pages/UsersExample.jsx` -> The example UI page with modern loading/error states.
- `frontend/src/App.jsx` -> Added route for `/api-example`.
