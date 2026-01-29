# Villarrica DMS - MongoDB Backend

This is the MongoDB version of the Villarrica Document Management System backend API.

## Features

- **MongoDB Database**: Using Mongoose ODM for data modeling
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Manager, and User roles
- **Audit Logging**: Complete activity tracking
- **RESTful API**: Clean and consistent API endpoints
- **Data Validation**: Input validation using Mongoose schemas
- **Error Handling**: Comprehensive error handling middleware

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn package manager

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string in `.env`

3. **Seed Database**
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Environment Variables

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities
- `GET /api/dashboard/document-stats` - Get document statistics
- `GET /api/dashboard/workflow-stats` - Get workflow statistics

## Database Models

### User
- Authentication and profile information
- Role-based permissions (admin, manager, user)
- Department and position tracking

### Document
- Document metadata and file information
- Status tracking (draft, review, approved, archived)
- Owner relationship with users

### Workflow
- Multi-step approval processes
- Step assignments and status tracking
- Document associations

### CaseFile
- Case management with unique case numbers
- Priority and category classification
- Status tracking and closure dates

### AuditLog
- Complete activity logging
- User action tracking
- IP address and user agent logging

## Demo Users

After running the seed script, you can login with:

- **Admin**: admin@villarrica.gov / admin123
- **Manager**: manager@villarrica.gov / manager123
- **User**: user@villarrica.gov / user123
- **Clerk**: clerk@villarrica.gov / clerk123

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run seed` - Seed database with demo data

### Database Connection
The application uses MongoDB Atlas by default. For local development:

1. Install MongoDB locally
2. Update `MONGODB_URI` to `mongodb://localhost:27017/villarrica_dms`
3. Start your local MongoDB service

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas with proper security
4. Set up proper CORS origins
5. Enable MongoDB Atlas IP whitelist
6. Use environment variables for all sensitive data

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Helmet security headers
- Input validation
- Role-based access control
- Audit logging

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Monitoring

- Request logging with Morgan
- Audit trail in database
- Error logging to console
- Health check endpoint at `/api/health`