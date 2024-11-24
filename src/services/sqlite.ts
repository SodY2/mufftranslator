import type { DbId } from '@sqlite.org/sqlite-wasm'
import { databaseConfig } from '@/config/database'
import { DatabaseError, InitializationError, QueryError } from '@/utils/errors'
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'

type QueryResult<T> = T | unknown

function log(...args: unknown[]) {
  /* eslint-disable-next-line no-console */
  console.log(...args)
}

let promiser: ReturnType<typeof sqlite3Worker1Promiser> | null = null
let dbId: string | null = null

async function initialize() {
  try {
    log('Initializing SQLite database...')
    promiser = await new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => resolve(_promiser),
      })
    })

    if (!promiser) {
      log('Failed to initialize promiser')
      throw new Error('Failed to initialize promiser')
    }

    log('Promiser initialized, getting config...')
    await promiser('config-get', {})

    const openResponse = await promiser('open', {
      filename: databaseConfig.filename,
    })

    if (openResponse.type === 'error') {
      log('Failed to open database:', openResponse.result.message)
      throw new Error(openResponse.result.message)
    }

    dbId = openResponse.result.dbId as string
    log('Database opened successfully with ID:', dbId)

    log('Creating test table...')
    await promiser('exec', {
      dbId,
      sql: databaseConfig.tables.test.schema,
    })

    log(
      'OPFS is available, created persisted database at',
      openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'),
    )

    return true
  }
  catch (err) {
    log('Database initialization failed:', err)
    throw new InitializationError('Failed to initialize SQLite database', err)
  }
}

async function executeQuery<T>(
  sql: string,
  params: unknown[] = [],
  returnRows = false,
): Promise<QueryResult<T>> {
  if (!dbId || !promiser) {
    log('Database not initialized')
    throw new DatabaseError('Database not initialized')
  }

  try {
    log('Executing query:', sql, 'with params:', params)

    const result = await promiser('exec', {
      dbId: dbId as DbId,
      sql,
      bind: params,
      ...(returnRows && { returnValue: 'resultRows' }),
    })

    if (result.type === 'error') {
      log('Query execution failed:', result.result.message)
      throw new Error(result.result.message)
    }

    log('Query executed successfully:', result)

    return returnRows && result.result.resultRows
      ? result.result.resultRows as T
      : result as unknown as T
  }
  catch (err) {
    log('Query execution failed:', err)
    throw new QueryError('Query execution failed', sql, err)
  }
}

async function execute(sql: string, params: unknown[] = []): Promise<unknown> {
  return await executeQuery(sql, params)
}

async function executeWithRows<T>(sql: string, params: unknown[] = []): Promise<T> {
  const result = await executeQuery<T>(sql, params, true)
  if (!result) {
    throw new QueryError('No results returned from query', sql)
  }
  return result as T
}

export const sqliteService = {
  initialize,
  execute,
  executeWithRows,
}
