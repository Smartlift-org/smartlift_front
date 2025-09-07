const isDev = (typeof __DEV__ !== "undefined" ? __DEV__ : true) === true;

const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

export default logger;
