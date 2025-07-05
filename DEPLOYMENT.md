# 🚀 FitQuest - Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)
1. **Make sure you have Vercel CLI installed**
   ```bash
   npm install -g vercel
   ```

2. **Run our deployment script**
   ```bash
   ./deploy-vercel.sh
   ```

3. **Follow the prompts** and your app will be live!

### Option 2: Manual Deployment
1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts** to configure your project

### Option 3: GitHub Integration
1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy!

## Environment Variables

If you need to set environment variables (for production database, etc.):

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings"
   - Go to "Environment Variables"
   - Add your variables

2. **Or via CLI**:
   ```bash
   vercel env add NODE_ENV production
   vercel env add JWT_SECRET your-secret-key
   ```

## Post-Deployment

1. **Update CORS settings** in `server.js` with your actual domain
2. **Test all features** to ensure everything works
3. **Monitor performance** in Vercel dashboard

## Troubleshooting

### Common Issues:
- **Database not found**: Make sure SQLite files are included in deployment
- **CORS errors**: Update the CORS origins in `server.js`
- **Build fails**: Check Node.js version compatibility

### Need Help?
- Check the Vercel documentation
- Open an issue on GitHub
- Contact the maintainer

---

**Your FitQuest app should now be live on Vercel! 🎉**

Share your deployment URL and let people start their fitness journey!
