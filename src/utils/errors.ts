export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class InitializationError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, cause)
    this.name = 'InitializationError'
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, public readonly query?: string, cause?: unknown) {
    super(message, cause)
    this.name = 'QueryError'
  }
}
