# 🚀 Production Deployment Guide

## 1. Clear Database and Reset for Production

### Clear All Existing Data
```bash
cd backend-mongodb
npm run clear-db
```

### Create Fresh Admin Account
```bash
npm run production-seed
```

This creates only one admin user:
- **Email**: admin@villarrica.gov
- **Password**: admin123 (⚠️ Change after first login!)

## 2. Backend Deployment

### Option A: Railway (Recommended)
1. Create account at railway.app
2. Connect your GitHub repository
3. Deploy backend-mongodb folder
4. Set environment variables in Railway dashboard

### Option B: Heroku
1. Install Heroku CLI
2. Create new app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### Environment Variables for Production
```
NODE_ENV=production
PORT=5004
JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
MONGODB_URI=your-mongodb-atlas-connection-string
FRONTEND_URL=https://your-frontend-domain.com
```

## 3. Frontend Deployment

### Option A: Vercel (Recommended)
1. Connect GitHub to Vercel
2. Deploy with one click
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`

### Option B: Netlify
1. Connect GitHub to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables in Netlify dashboard

## 4. Database Setup

### MongoDB Atlas (Recommended)
1. Create free cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string
5. Update MONGODB_URI in backend environment

## 5. Post-Deployment Steps

1. **Test the system**: Visit your frontend URL
2. **Login as admin**: admin@villarrica.gov / admin123
3. **Change admin password**: Go to profile settings
4. **Create additional users**: Use the registration form
5. **Test all features**: Documents, workflows, case files, audit logs

## 6. Security Checklist

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configured CORS for your domain only
- [ ] Enabled HTTPS on both frontend and backend
- [ ] Set NODE_ENV=production
- [ ] Configured MongoDB IP whitelist properly

## 7. Monitoring

- Check backend health: `https://your-backend-url.com/api/health`
- Monitor MongoDB Atlas dashboard
- Set up error logging (optional)

Your system is now ready for production use! 🎉