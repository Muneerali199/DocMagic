type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';
const isDebugEnabled = process.env.DEBUG === 'true';

function formatLog(level: LogLevel, args: unknown[], context?: LogContext) {
  const timestamp = new Date().toISOString();
  
  if (isProduction) {
    // Structured JSON logging for production
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message: args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '),
      ...context,
    });
  }

  // Pretty logging for development
  const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
  return `[${timestamp}] ${level.toUpperCase()}:${contextStr} ${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ')}`;
}

export const logger = {
  debug: (context: LogContext | null, ...args: unknown[]) => {
    if (!isProduction || isDebugEnabled) {
      console.log(formatLog('debug', args, context || undefined));
    }
  },

  info: (context: LogContext | null, ...args: unknown[]) => {
    console.info(formatLog('info', args, context || undefined));
  },

  warn: (context: LogContext | null, ...args: unknown[]) => {
    console.warn(formatLog('warn', args, context || undefined));
  },

  error: (context: LogContext | null, ...args: unknown[]) => {
    console.error(formatLog('error', args, context || undefined));
  },

  // Helper to create a request-scoped logger
  withContext: (context: LogContext) => ({
    debug: (...args: unknown[]) => logger.debug(context, ...args),
    info: (...args: unknown[]) => logger.info(context, ...args),
    warn: (...args: unknown[]) => logger.warn(context, ...args),
    error: (...args: unknown[]) => logger.error(context, ...args),
  }),
};