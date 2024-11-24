<script setup lang="ts">
import type { SortField } from '@/composables/useTestTable'
import { useTestTable } from '@/composables/useTestTable'
import { formatDate } from '@/utils/dateFormatter'
import { onMounted, onUnmounted, ref } from 'vue'

const {
  isInitialized,
  items,
  error,
  isLoading,
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

// Add new ref for showing query history
const queryHistory = ref<{ sql: string, timestamp: Date }[]>([])

// Add state for active tab
const activeTab = ref('select') // 'select' or 'modify'

onMounted(() => {
  initialize()
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
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

// Add function to save queries to history
function executeAndSaveQuery() {
  executeRawQuery()
  if (rawQuery.value.trim()) {
    queryHistory.value.unshift({
      sql: rawQuery.value,
      timestamp: new Date(),
    })
  }
}

function handleKeyPress(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    executeAndSaveQuery()
  }
}

function setActiveTab(tab: 'select' | 'modify') {
  activeTab.value = tab
}
</script>

<template>
  <!-- Error banner -->
  <div v-if="error" class="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
    {{ error }}
  </div>

  <div v-if="isInitialized" class="max-w-[1600px] mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        SQLite Playground
      </h1>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Database: test.db
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Query Editor Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              Query Editor
            </h2>
          </div>

          <div class="p-4 space-y-4">
            <!-- Example queries tabs -->
            <div class="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
              <button
                class="px-4 py-2 text-sm font-medium"
                :class="[
                  activeTab === 'select'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                ]"
                @click="setActiveTab('select')"
              >
                Select Examples
              </button>
              <button
                class="px-4 py-2 text-sm font-medium"
                :class="[
                  activeTab === 'modify'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                ]"
                @click="setActiveTab('modify')"
              >
                Modify Data
              </button>
            </div>

            <!-- Example queries -->
            <div v-if="activeTab === 'select'" class="flex flex-wrap gap-2">
              <button
                v-for="(query, key) in selectExamples"
                :key="key"
                class="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                @click="setExampleQuery(query)"
              >
                {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
              </button>
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="(query, key) in modifyExamples"
                :key="key"
                class="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-md text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                @click="setExampleQuery(query)"
              >
                {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
              </button>
            </div>

            <!-- Query textarea -->
            <div class="space-y-3">
              <textarea
                v-model="rawQuery"
                placeholder="Enter SQL query..."
                class="font-mono border p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full text-sm"
                rows="8"
              />

              <div class="flex justify-between items-center">
                <button
                  class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2"
                  :disabled="isLoading"
                  @click="executeAndSaveQuery"
                >
                  <span v-if="isLoading">Running...</span>
                  <span v-else>Run Query</span>
                </button>

                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Press Ctrl + Enter to run
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Query History -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              Query History
            </h2>
          </div>

          <div class="p-4">
            <div v-if="queryHistory.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
              No queries executed yet
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(item, index) in queryHistory"
                :key="index"
                class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer text-sm"
                @click="rawQuery = item.sql"
              >
                <div class="font-mono text-gray-700 dark:text-gray-300">
                  {{ item.sql }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(item.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Query Results -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-between">
              Query Results
              <span v-if="queryResult" class="text-sm text-gray-500">
                {{ Array.isArray(queryResult) ? `${queryResult.length} rows` : '1 result' }}
              </span>
            </h2>
          </div>

          <div class="p-4">
            <div v-if="queryError" class="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-sm">
              {{ queryError }}
            </div>

            <div v-else-if="queryResult" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[500px]">
              <pre class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ JSON.stringify(queryResult, null, 2) }}</pre>
            </div>

            <div v-else class="text-gray-500 dark:text-gray-400 text-sm">
              Run a query to see results
            </div>
          </div>
        </div>

        <!-- Table View with improved styling -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 dark:border-gray-700 p-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-between">
              Table View
              <span v-if="items.length > 0" class="text-sm text-gray-500">
                {{ items.length }} items
              </span>
            </h2>
          </div>

          <div class="p-4">
            <div v-if="items.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
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
  </div>

  <div v-else class="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto" />
      <div class="text-gray-600 dark:text-gray-400">
        Initializing SQLite database...
      </div>
    </div>
  </div>
</template>
