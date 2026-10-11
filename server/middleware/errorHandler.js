// Centralized API Error Handling Middleware

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  console.error(`💥 Uncaught Exception [${req.method} ${req.originalUrl}]:`, err.message || err);

  const isProduction = process.env.NODE_ENV === 'production';
  const response = {
    success: false,
    error: isProduction && statusCode === 500 
      ? 'An unexpected error occurred. Please try again later.' 
      : (err.message || 'Internal Server Error')
  };

  res.status(statusCode).json(response);
}
