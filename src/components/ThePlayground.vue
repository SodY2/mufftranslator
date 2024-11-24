<script setup lang="ts">
import { useTestTable } from '@/composables/useTestTable'
import { formatDate } from '@/utils/dateFormatter'
import { onMounted, onUnmounted, ref } from 'vue'
import DataTable from './DataTable.vue'
import QueryEditor from './QueryEditor.vue'

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

const queryHistory = ref<{ sql: string, timestamp: Date }[]>([])

onMounted(() => {
  initialize()
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

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
</script>

<template>
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

    <div class="flex gap-6">
      <!-- Left Column - Query Editor (30%) -->
      <div class="w-[30%] space-y-6">
        <QueryEditor
          v-model="rawQuery"
          :is-loading="isLoading"
          :example-queries="selectExamples"
          :modify-examples="modifyExamples"
          @execute="executeAndSaveQuery"
          @set-example="setExampleQuery"
        />

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

      <!-- Right Column - Results (70%) -->
      <div class="flex-1 space-y-6">
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

        <DataTable
          :items="items"
          :is-loading="isLoading"
          :sort-field="sortField"
          :sort-direction="sortDirection"
          @toggle-sort="toggleSort"
          @delete-item="deleteItem"
        />
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
