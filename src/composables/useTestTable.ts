import type { TestTableRow } from '@/types/database'
import { testTableRepository } from '@/repositories/testTableRepository'
import { computed, ref } from 'vue'

export type SortDirection = 'asc' | 'desc'
export type SortField = 'id' | 'name' | 'created_at'

export const EXAMPLE_QUERIES = {
  selectAll: 'SELECT * FROM test_table',
  countAll: 'SELECT COUNT(*) as total FROM test_table',
  recentRecords: 'SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5',
  nameGroups: 'SELECT name, COUNT(*) as count FROM test_table GROUP BY name',
  dateStats: 'SELECT strftime(\'%Y-%m-%d\', created_at) as date, COUNT(*) as count FROM test_table GROUP BY date',
  insertRecord: 'INSERT INTO test_table (name) VALUES (\'New Item\')',
  updateRecord: 'UPDATE test_table SET name = \'Updated Name\' WHERE id = 1',
  deleteRecord: 'DELETE FROM test_table WHERE id = 1',
  searchByName: 'SELECT * FROM test_table WHERE name LIKE \'%test%\'',
  multipleConditions: 'SELECT * FROM test_table WHERE id > 5 AND name LIKE \'A%\'',
} as const

export function useTestTable() {
  const isInitialized = ref(false)
  const items = ref<TestTableRow[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const searchQuery = ref('')
  const sortField = ref<SortField>('id')
  const sortDirection = ref<SortDirection>('asc')
  const rawQuery = ref('')
  const queryResult = ref<any>(null)
  const queryError = ref<string | null>(null)

  const filteredAndSortedItems = computed(() => {
    let result = [...items.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query)
        || item.id.toString().includes(query),
      )
    }

    return testTableRepository.sortItems(result, sortField.value, sortDirection.value)
  })

  async function initialize() {
    try {
      isLoading.value = true
      isInitialized.value = await testTableRepository.initialize()
      if (isInitialized.value)
        await loadItems()
      else
        error.value = 'SQLite initialization returned false'
    }
    catch (e) {
      error.value = `Failed to initialize database: ${(e as Error).message}`
    }
    finally {
      isLoading.value = false
    }
  }

  async function loadItems() {
    try {
      isLoading.value = true
      items.value = await testTableRepository.getAll()
    }
    catch (e) {
      error.value = `Failed to load data: ${(e as Error).message}`
    }
    finally {
      isLoading.value = false
    }
  }

  async function executeRawQuery() {
    try {
      queryError.value = null
      isLoading.value = true

      const result = await testTableRepository.executeRawQuery(rawQuery.value)
      queryResult.value = result

      if (testTableRepository.isModificationQuery(rawQuery.value))
        await loadItems()
    }
    catch (err: unknown) {
      queryError.value = (err as Error).message
      queryResult.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  function toggleSort(field: SortField) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  function setExampleQuery(query: string) {
    rawQuery.value = query
  }

  return {
    isInitialized,
    items: filteredAndSortedItems,
    error,
    isLoading,
    searchQuery,
    sortField,
    sortDirection,
    rawQuery,
    queryResult,
    queryError,
    initialize,
    loadItems,
    addItem: testTableRepository.create,
    deleteItem: testTableRepository.delete,
    toggleSort,
    executeRawQuery,
    setExampleQuery,
    EXAMPLE_QUERIES,
  }
}
