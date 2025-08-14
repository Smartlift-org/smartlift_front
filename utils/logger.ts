// Simple logger that suppresses debug/info in production
// In Expo/React Native, __DEV__ is true in development
const isDev = (typeof __DEV__ !== "undefined" ? __DEV__ : true) === true;

const logger = {
  // Debug: verbose messages (only in dev)
  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  // Info: general operational messages (only in dev)
  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  // Warn: potential issues that should be visible in production
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  // Error: errors that should always be visible
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};

export default logger;
