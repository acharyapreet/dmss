@echo off
echo 🚀 Preparing for Production Deployment...
echo.

echo 1. Clearing database and creating fresh admin user...
cd backend-mongodb
call npm run reset-production
cd ..

echo.
echo 2. Building frontend for production...
call npm run build

echo.
echo ✅ Production preparation complete!
echo.
echo 📋 Next Steps:
echo 1. Deploy backend-mongodb folder to your server (Railway, Heroku, etc.)
echo 2. Deploy frontend to Vercel/Netlify
echo 3. Set environment variables on both platforms
echo 4. Test the deployed system
echo.
echo 📋 Admin Account:
echo 👤 Email: admin@villarrica.gov
echo 🔑 Password: admin123
echo ⚠️  Change password after first login!
echo.
echo 📖 See PRODUCTION_DEPLOYMENT.md for detailed instructions
echo.
pause