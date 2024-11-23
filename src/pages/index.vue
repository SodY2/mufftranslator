<script setup lang="ts">
import type { SortField } from '@/composables/useTestTable'
import { useTestTable } from '@/composables/useTestTable'
import { formatDate } from '@/utils/dateFormatter'
import { onMounted, ref } from 'vue'

const newName = ref('')
const {
  isInitialized,
  items,
  error,
  isLoading,
  searchQuery,
  sortField,
  sortDirection,
  initialize,
  addItem,
  deleteItem,
  toggleSort,
} = useTestTable()

onMounted(() => {
  initialize()
})

async function handleAddItem() {
  await addItem(newName.value)
  newName.value = ''
}

function getSortIcon(field: SortField) {
  if (sortField.value !== field) {
    return '↕'
  }
  return sortDirection.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <main class="p-4 dark:bg-gray-900">
    <h1 class="text-2xl mb-4 dark:text-white">
      SQLite Demo
    </h1>

    <div v-if="error" class="text-red-500 mb-4">
      {{ error }}
    </div>

    <div v-if="isInitialized" class="space-y-4">
      <div class="flex gap-2">
        <input
          v-model="newName"
          type="text"
          placeholder="Enter a name"
          class="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full"
          @keyup.enter="handleAddItem"
        >
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          :disabled="isLoading"
          @click="handleAddItem"
        >
          {{ isLoading ? 'Loading...' : 'Add' }}
        </button>
      </div>

      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items..."
          class="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full"
        >
      </div>

      <div v-if="items.length === 0" class="text-gray-500 dark:text-gray-400">
        No items found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                v-for="field in ['id', 'name', 'created_at']"
                :key="field"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                @click="toggleSort(field as SortField)"
              >
                {{ field }} {{ getSortIcon(field as SortField) }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                  :disabled="isLoading"
                  @click="deleteItem(item.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-red-500 dark:text-red-400">
      Failed to initialize SQLite database
    </div>
  </main>
</template>
