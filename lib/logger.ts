const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
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