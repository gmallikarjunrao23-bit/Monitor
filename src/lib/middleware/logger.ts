interface LogContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: any;
  context?: Record<string, any>;
}

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: string, message: string, ctx?: LogContext): string {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      ...ctx,
    });
  }

  info(message: string, ctx?: LogContext) {
    console.log(this.formatLog('INFO', message, ctx));
  }

  warn(message: string, ctx?: LogContext) {
    console.warn(this.formatLog('WARN', message, ctx));
  }

  error(message: string, ctx?: LogContext) {
    console.error(this.formatLog('ERROR', message, ctx));
  }

  debug(message: string, ctx?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('DEBUG', message, ctx));
    }
  }
}

export const logger = new Logger();
