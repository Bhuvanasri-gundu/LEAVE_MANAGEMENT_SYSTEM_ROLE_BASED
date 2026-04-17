/**
 * Global Error Handler Middleware
 * 
 * Catches any error thrown in routes/controllers and
 * sends a consistent JSON error response.
 * 
 * In development mode, it includes the error stack trace
 * for easier debugging.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code was set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
