type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  level: LogLevel
  enabled: boolean
}

class Logger {
  private config: LoggerConfig = {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enabled: true,
  }

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      this.config.enabled &&
      this.levelPriority[level] >= this.levelPriority[this.config.level]
    )
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug'))
      console.debug(`[DEBUG] ${message}`, ...args)
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info'))
      console.info(`[INFO] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn'))
      console.warn(`[WARN] ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error'))
      console.error(`[ERROR] ${message}`, ...args)
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

export const logger = new Logger() 