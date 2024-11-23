import { databaseConfig } from '@/config/database'
import { DatabaseError, InitializationError, QueryError } from '@/utils/errors'
// @ts-expect-error this import is correct
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'

type SQLitePromiser = any
type QueryResult<T> = T

let promiser: SQLitePromiser | null = null
let dbId: string | null = null

async function initialize() {
  try {
    promiser = await new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => resolve(_promiser),
      })
    })

    await promiser('config-get', {})

    const openResponse = await promiser('open', {
      filename: databaseConfig.filename,
    })
    dbId = openResponse.dbId

    // Create a test table
    await promiser('exec', {
      dbId,
      sql: databaseConfig.tables.test.schema,
    })

    return true
  }
  catch (err) {
    throw new InitializationError('Failed to initialize SQLite database', err)
  }
}

async function executeQuery<T>(
  sql: string,
  params: any[] = [],
  returnRows = false,
): Promise<QueryResult<T>> {
  if (!dbId)
    throw new DatabaseError('Database not initialized')

  try {
    const result = await promiser!('exec', {
      dbId,
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

async function execute(sql: string, params: any[] = []): Promise<any> {
  return await executeQuery(sql, params)
}

async function executeWithRows<T>(sql: string, params: any[] = []): Promise<T> {
  return await executeQuery<T>(sql, params, true)
}

export const sqliteService = {
  initialize,
  execute,
  executeWithRows,
}
