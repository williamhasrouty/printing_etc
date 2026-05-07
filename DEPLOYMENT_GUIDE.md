# Complete Deployment Guide - Printing Etc

This guide will help you deploy both the frontend (GitHub Pages) and backend (Render) for your Printing Etc application.

## Overview

- **Frontend**: GitHub Pages (Static hosting)
- **Backend**: Render (Free tier Node.js hosting)
- **Database**: MongoDB Atlas (Free tier)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend Repository

If not already on GitHub, push your backend:

```bash
cd /Users/williamhasrouty/projects/printing_etc-backend

# Initialize git if needed
git init
git add .
git commit -m "Prepare for Render deployment"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/williamhasrouty/printing_etc-backend.git
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/printingetc
   ```
6. Replace `<username>` and `<password>` with your actual credentials

### Step 3: Deploy on Render

1. Go to https://render.com and sign up/login with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select `printing_etc-backend` repository
4. Render will auto-detect the `render.yaml` configuration
5. Click **"Create Web Service"**
6. Before deployment starts, add these **Environment Variables**:

   **Required:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string from Step 2
   - `CLOUDINARY_CLOUD_NAME`: From https://cloudinary.com/console
   - `CLOUDINARY_API_KEY`: From Cloudinary
   - `CLOUDINARY_API_SECRET`: From Cloudinary
   - `STRIPE_SECRET_KEY`: From https://dashboard.stripe.com/apikeys

   **Optional (but recommended):**
   - `STRIPE_WEBHOOK_SECRET`: From Stripe webhook settings
   - `RESEND_API_KEY`: From https://resend.com/api-keys (for order emails)

7. Click **"Create Web Service"** again
8. Wait for deployment (~5-10 minutes)
9. **Copy your backend URL** (e.g., `https://printing-etc-backend.onrender.com`)

---

## Part 2: Update Frontend to Use Live Backend

### Step 1: Update Production Environment

Edit `/Users/williamhasrouty/projects/printing_etc-frontend/.env.production`:

```env
# Replace with your actual Render backend URL (from Part 1, Step 3.9)
VITE_API_URL=https://printing-etc-backend.onrender.com
```

### Step 2: Rebuild and Redeploy Frontend

```bash
cd /Users/williamhasrouty/projects/printing_etc-frontend

# Build with production environment
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## Part 3: Configure Backend CORS

Your backend needs to allow requests from your GitHub Pages domain.

### Option A: Update in Render Dashboard

In Render dashboard → Environment → Add:

```
FRONTEND_URL=https://williamhasrouty.github.io/printing_etc
```

Then redeploy the backend.

### Option B: Update Backend Code

Check `app.js` CORS configuration includes your GitHub Pages URL.

---

## Part 4: Test Your Deployment

1. Wait 2-3 minutes for GitHub Pages to update
2. Visit: https://williamhasrouty.github.io/printing_etc
3. Check if products load (they should come from your Render backend)
4. Try adding a product to cart
5. Check browser console for any errors

---

## Troubleshooting

### Products Not Loading

1. **Check Backend Status**: Visit your Render URL directly (e.g., `https://your-app.onrender.com/products`)
2. **CORS Error**: Make sure `FRONTEND_URL` is set correctly in Render
3. **Backend Sleeping**: Free tier spins down after 15 min. First request takes ~30 seconds to wake up

### Check Backend Logs

1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors

### Frontend Not Updated

1. Clear browser cache (Cmd+Shift+R on Mac)
2. Check if `.env.production` has correct backend URL
3. Rebuild: `npm run build && npm run deploy`

---

## Important Notes

### Free Tier Limitations

- **Render Free Tier**:
  - Spins down after 15 minutes of inactivity
  - First request after spin-down takes ~30 seconds
  - 750 hours/month free (enough for one service)

- **MongoDB Atlas Free Tier**:
  - 512 MB storage
  - Shared cluster
  - Good for development/small projects

### Security Checklist

- ✅ `.env` files are in `.gitignore`
- ✅ Never commit API keys or secrets
- ✅ Use environment variables in Render dashboard
- ✅ Use strong JWT secret (auto-generated in render.yaml)

---

## Next Steps

After successful deployment:

1. **Set up Stripe Webhooks**:
   - Point to `https://your-backend.onrender.com/payment/webhook`
   - Add webhook secret to Render environment

2. **Configure Email**:
   - Set up Resend API key for order confirmations

3. **Add Admin User**:

   ```bash
   # SSH into your Render shell (from dashboard)
   npm run createAdmin
   ```

4. **Monitor**: Check Render logs regularly for errors

---

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- GitHub Pages: https://docs.github.com/pages

---

## Quick Command Reference

```bash
# Frontend
cd /Users/williamhasrouty/projects/printing_etc-frontend
npm run build          # Build for production
npm run deploy         # Deploy to GitHub Pages

# Backend
cd /Users/williamhasrouty/projects/printing_etc-backend
git add .
git commit -m "Update"
git push              # Push to GitHub (triggers Render deploy)
```
