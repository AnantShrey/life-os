// src/lib/logger.ts
export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(...args);
    } else {
      // In production, we might want to still log errors or send them to an APM/logging service
      console.error(...args);
    }
  }
};
