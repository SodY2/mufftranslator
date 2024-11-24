import type { DbId } from '@sqlite.org/sqlite-wasm'
import { databaseConfig } from '@/config/database'
import { DatabaseError, InitializationError, QueryError } from '@/utils/errors'
import { sqlite3Worker1Promiser } from '@sqlite.org/sqlite-wasm'
import { ref } from 'vue'

export function useSQLite() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const isInitialized = ref(false)

  let promiser: ReturnType<typeof sqlite3Worker1Promiser> | null = null
  let dbId: string | null = null

  function log(...args: unknown[]) {
    /* eslint-disable-next-line no-console */
    console.log(...args)
  }

  async function initialize() {
    if (isInitialized.value)
      return true

    isLoading.value = true
    error.value = null

    try {
      log('Initializing SQLite database...')
      promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        })
      })

      if (!promiser) {
        throw new Error('Failed to initialize promiser')
      }

      log('Promiser initialized, getting config...')
      await promiser('config-get', {})

      const openResponse = await promiser('open', {
        filename: databaseConfig.filename,
      })

      if (openResponse.type === 'error') {
        throw new Error(openResponse.result.message)
      }

      dbId = openResponse.result.dbId as string
      log('Database opened successfully with ID:', dbId)

      log('Creating test table...')
      await promiser('exec', {
        dbId,
        sql: databaseConfig.tables.test.schema,
      })

      isInitialized.value = true
      return true
    }
    catch (err) {
      error.value = new InitializationError('Failed to initialize SQLite database', err)
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function executeQuery<T>(
    sql: string,
    params: unknown[] = [],
    returnRows = false,
  ) {
    if (!dbId || !promiser) {
      error.value = new DatabaseError('Database not initialized')
      throw error.value
    }

    isLoading.value = true
    error.value = null

    try {
      log('Executing query:', sql, 'with params:', params)

      const result = await promiser('exec', {
        dbId: dbId as DbId,
        sql,
        bind: params,
        ...(returnRows && { returnValue: 'resultRows' }),
      })

      if (result.type === 'error')
        throw new Error(result.result.message)

      return returnRows && result.result.resultRows
        ? result.result.resultRows as T
        : result as unknown as T
    }
    catch (err) {
      error.value = new QueryError('Query execution failed', sql, err)
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function executeMutation(sql: string, params: unknown[] = []) {
    return await executeQuery(sql, params)
  }

  async function executeSelect<T>(sql: string, params: unknown[] = []): Promise<T> {
    const result = await executeQuery<T>(sql, params, true)
    if (!result) {
      error.value = new QueryError('No results returned from query', sql)
      throw error.value
    }
    return result as T
  }

  return {
    isLoading,
    error,
    isInitialized,
    initialize,
    executeMutation,
    executeSelect,
  }
}
