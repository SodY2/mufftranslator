import type { SQLiteResponse, SQLiteResultRow } from '../types/database'
// @ts-expect-error this import is correct
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'

class SQLiteService {
  private promiser: any = null
  private dbId: string | null = null

  async initialize() {
    try {
      console.log('Loading and initializing SQLite3 module...')

      this.promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        })
      })

      const configResponse = await this.promiser('config-get', {})
      console.log('Running SQLite3 version', configResponse.result.version.libVersion)

      const openResponse = await this.promiser('open', {
        filename: 'file:mydb.sqlite3?vfs=opfs',
      })
      this.dbId = openResponse.dbId

      // Create a test table
      await this.promiser('exec', {
        dbId: this.dbId,
        sql: `
          CREATE TABLE IF NOT EXISTS test_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      })

      console.log('Database initialized successfully')
      return true
    }
    catch (err) {
      console.error('SQLite initialization error:', err)
      return false
    }
  }

  async insertData(name: string) {
    try {
      await this.promiser('exec', {
        dbId: this.dbId,
        sql: 'INSERT INTO test_table (name) VALUES (?)',
        bind: [name],
      })
      return true
    }
    catch (err) {
      console.error('Error inserting data:', err)
      return false
    }
  }

  async getData(): Promise<SQLiteResultRow[]> {
    try {
      const result = await this.promiser('exec', {
        dbId: this.dbId,
        sql: 'SELECT * FROM test_table',
        returnValue: 'resultRows',
      }) as SQLiteResponse

      return result.result.resultRows
    }
    catch (err) {
      console.error('Error getting data:', err)
      return []
    }
  }

  async deleteData(id: number): Promise<void> {
    try {
      await this.promiser('exec', {
        dbId: this.dbId,
        sql: 'DELETE FROM test_table WHERE id = ?',
        bind: [id],
      })
    }
    catch (err) {
      console.error('Error deleting data:', err)
      throw new Error(`Failed to delete: ${err}`)
    }
  }
}

export const sqliteService = new SQLiteService()
