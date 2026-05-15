const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.DEBUG === 'true';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },

  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },
};