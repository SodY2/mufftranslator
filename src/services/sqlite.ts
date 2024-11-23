import type { SQLiteResponse, SQLiteResultRow } from '../types/database'
// @ts-expect-error this import is correct
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'
import { logger } from '@/utils/logger'
import { DatabaseError, InitializationError, QueryError } from '@/utils/errors'
import { databaseConfig } from '@/config/database'

class SQLiteService {
  private promiser: any = null
  private dbId: string | null = null

  async initialize() {
    try {
      logger.info('Loading and initializing SQLite3 module...')

      this.promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        })
      })

      const configResponse = await this.promiser('config-get', {})
      logger.info('Running SQLite3 version', configResponse.result.version.libVersion)

      const openResponse = await this.promiser('open', {
        filename: databaseConfig.filename,
      })
      this.dbId = openResponse.dbId

      // Create a test table
      await this.promiser('exec', {
        dbId: this.dbId,
        sql: databaseConfig.tables.test.schema,
      })

      logger.info('Database initialized successfully')
      return true
    }
    catch (err) {
      logger.error('SQLite initialization error:', err)
      throw new InitializationError('Failed to initialize SQLite database', err)
    }
  }

  private async executeQuery<T>(
    sql: string,
    params: any[] = [],
    returnRows = false,
  ): Promise<T> {
    if (!this.dbId)
      throw new DatabaseError('Database not initialized')

    try {
      const result = await this.promiser('exec', {
        dbId: this.dbId,
        sql,
        bind: params,
        ...(returnRows && { returnValue: 'resultRows' }),
      })
      return returnRows ? result.result.resultRows : result
    }
    catch (err) {
      throw new QueryError('Query execution failed', sql, err)
    }
  }

  async insertData(name: string): Promise<boolean> {
    await this.executeQuery(
      'INSERT INTO test_table (name) VALUES (?)',
      [name],
    )
    return true
  }

  async getData(): Promise<SQLiteResultRow[]> {
    return await this.executeQuery<SQLiteResultRow[]>(
      'SELECT * FROM test_table',
      [],
      true,
    )
  }

  async deleteData(id: number): Promise<void> {
    await this.executeQuery(
      'DELETE FROM test_table WHERE id = ?',
      [id],
    )
  }
}

export const sqliteService = new SQLiteService()
