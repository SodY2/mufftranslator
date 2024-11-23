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
  deleteItem,
  toggleSort,
  rawQuery,
  queryResult,
  queryError,
  executeRawQuery,
  setExampleQuery,
  EXAMPLE_QUERIES,
} = useTestTable()

onMounted(() => {
  initialize()
})

function getSortIcon(field: SortField) {
  if (sortField.value !== field) {
    return '↕'
  }
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const selectExamples = {
  selectAll: EXAMPLE_QUERIES.selectAll,
  recentRecords: EXAMPLE_QUERIES.recentRecords,
  countAll: EXAMPLE_QUERIES.countAll,
  nameGroups: EXAMPLE_QUERIES.nameGroups,
  dateStats: EXAMPLE_QUERIES.dateStats,
  searchByName: EXAMPLE_QUERIES.searchByName,
  multipleConditions: EXAMPLE_QUERIES.multipleConditions,
}

const modifyExamples = {
  insertRecord: EXAMPLE_QUERIES.insertRecord,
  updateRecord: EXAMPLE_QUERIES.updateRecord,
  deleteRecord: EXAMPLE_QUERIES.deleteRecord,
}
</script>

<template>
  <main class="p-4 dark:bg-gray-900 min-h-screen">
    <h1 class="text-2xl mb-4 dark:text-white">
      SQLite Playground
    </h1>

    <div v-if="error" class="text-red-500 mb-4">
      {{ error }}
    </div>

    <div v-if="isInitialized" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 class="text-xl dark:text-white mb-4">
              SQL Query Editor
            </h2>

            <div class="space-y-4">
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Select Examples:
                </h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(query, key) in selectExamples"
                    :key="key"
                    class="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-300"
                    @click="setExampleQuery(query)"
                  >
                    {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Modify Data:
                </h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(query, key) in modifyExamples"
                    :key="key"
                    class="px-3 py-1 text-sm bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full text-green-700 dark:text-green-300"
                    @click="setExampleQuery(query)"
                  >
                    {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <textarea
                  v-model="rawQuery"
                  placeholder="Enter SQL query..."
                  class="font-mono border p-2 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full"
                  rows="6"
                />
                <button
                  class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                  :disabled="isLoading"
                  @click="executeRawQuery"
                >
                  Execute Query
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter results..."
              class="border p-2 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full"
            >
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 class="text-xl dark:text-white mb-4">
              Query Results
            </h2>

            <div v-if="queryError" class="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded">
              {{ queryError }}
            </div>

            <div v-if="queryResult" class="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto max-h-[500px]">
              <pre class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ JSON.stringify(queryResult, null, 2) }}</pre>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 class="text-xl dark:text-white mb-4">
              Table View
            </h2>

            <div v-if="items.length === 0" class="text-gray-500 dark:text-gray-400">
              No items found.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full border border-gray-200 dark:border-gray-700">
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
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
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
        </div>
      </div>
    </div>
    <div v-else class="text-red-500 dark:text-red-400">
      Failed to initialize SQLite database
    </div>
  </main>
</template>
