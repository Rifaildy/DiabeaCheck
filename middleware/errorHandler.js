const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Default error response
  let error = {
    message: "Internal server error",
    status: 500,
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error = {
      message: "Validation failed",
      status: 400,
      details: err.details,
    };
  } else if (err.name === "UnauthorizedError") {
    error = {
      message: "Unauthorized access",
      status: 401,
    };
  } else if (err.name === "CastError") {
    error = {
      message: "Invalid data format",
      status: 400,
    };
  } else if (err.code === 11000) {
    error = {
      message: "Duplicate entry",
      status: 409,
    };
  }

  // Don't expose error details in production
  if (process.env.NODE_ENV === "production") {
    delete error.stack;
  } else {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    error: error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
