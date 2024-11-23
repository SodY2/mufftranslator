import type { TestTableRow } from '@/types/database'
import { testTableRepository } from '@/repositories/testTableRepository'
import { ref } from 'vue'

export function useTestTable() {
  const isInitialized = ref(false)
  const items = ref<TestTableRow[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function initialize() {
    try {
      isInitialized.value = await testTableRepository.initialize()
      if (isInitialized.value)
        await loadItems()
      else
        error.value = 'SQLite initialization returned false'
    }
    catch (e) {
      error.value = `Failed to initialize database: ${(e as Error).message}`
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

  async function addItem(name: string) {
    if (!name.trim())
      return

    try {
      await testTableRepository.create(name)
      await loadItems()
    }
    catch (e) {
      error.value = `Failed to add item: ${(e as Error).message}`
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    isInitialized,
    items,
    error,
    isLoading,
    initialize,
    loadItems,
    addItem,
    clearError,
  }
}
