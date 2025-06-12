// Simplified logger for serverless environment
const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta)
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, meta)
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta)
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, meta)
    }
  },
}

module.exports = logger
