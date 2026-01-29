const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  // Token expired
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  res.status(status).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;