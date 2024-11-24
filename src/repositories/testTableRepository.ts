import type { SortDirection, SortField } from '@/composables/useTestTable'
import type { TestTableRow } from '@/types/database'
import { useSQLite } from '@/composables/useSQLite'
import { DatabaseError } from '@/utils/errors'
import { ref } from 'vue'

export function createTestTableRepository() {
  const sqlite = useSQLite()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function initialize(): Promise<boolean> {
    error.value = null
    isLoading.value = true
    try {
      return await sqlite.initialize()
    }
    catch (err) {
      error.value = err as Error
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function getAll(): Promise<TestTableRow[]> {
    error.value = null
    isLoading.value = true
    try {
      const result = await sqlite.executeSelect<any[]>(
        'SELECT * FROM test_table',
      )
      return result?.map((row: any) => ({
        id: row[0],
        name: row[1],
        created_at: row[2],
      }))
    }
    catch (err) {
      error.value = err as Error
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function create(name: string): Promise<void> {
    if (!name.trim())
      throw new Error('Name cannot be empty')
    await sqlite.executeMutation(
      'INSERT INTO test_table (name) VALUES (?)',
      [name],
    )
  }

  async function delete_(id: number): Promise<void> {
    await sqlite.executeMutation(
      'DELETE FROM test_table WHERE id = ?',
      [id],
    )
  }

  async function executeRawQuery(query: string): Promise<any> {
    try {
      return await sqlite.executeSelect(query)
    }
    catch (err: unknown) {
      const error = err as Error
      throw new DatabaseError(`Failed to execute raw query: ${error.message}`)
    }
  }

  function sortItems(items: TestTableRow[], field: SortField, direction: SortDirection): TestTableRow[] {
    return [...items].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return direction === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })
  }

  function isModificationQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase().trim()
    return (
      lowerQuery.startsWith('insert')
      || lowerQuery.startsWith('update')
      || lowerQuery.startsWith('delete')
    )
  }

  return {
    isLoading,
    error,
    initialize,
    getAll,
    create,
    delete: delete_,
    executeRawQuery,
    sortItems,
    isModificationQuery,
  }
}

export const testTableRepository = createTestTableRepository()
