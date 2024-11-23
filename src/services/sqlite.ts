import type { SQLiteResultRow } from '../types/database'
import { databaseConfig } from '@/config/database'
import { DatabaseError, InitializationError, QueryError } from '@/utils/errors'
// @ts-expect-error this import is correct
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'

class SQLiteService {
  private promiser: any = null
  private dbId: string | null = null

  async initialize() {
    try {
      this.promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        })
      })

      await this.promiser('config-get', {})

      const openResponse = await this.promiser('open', {
        filename: databaseConfig.filename,
      })
      this.dbId = openResponse.dbId

      // Create a test table
      await this.promiser('exec', {
        dbId: this.dbId,
        sql: databaseConfig.tables.test.schema,
      })

      return true
    }
    catch (err) {
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

  async executeRawQuery(query: string): Promise<any> {
    if (!this.dbId) {
      throw new DatabaseError('Database not initialized')
    }

    try {
      const result = await this.promiser('exec', {
        dbId: this.dbId,
        sql: query,
        returnValue: 'resultRows',
      })
      return result.result.resultRows
    }
    catch (err: unknown) {
      const error = err as Error
      throw new DatabaseError(`Failed to execute raw query: ${error.message}`)
    }
  }
}

export const sqliteService = new SQLiteService()
