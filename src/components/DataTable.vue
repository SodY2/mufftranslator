<script setup lang="ts">
import type { SortField } from '@/composables/useTestTable'
import type { TestTableRow } from '@/types/database'
import { formatDate } from '@/utils/dateFormatter'

defineProps<{
  items: Array<TestTableRow>
  isLoading: boolean
  sortField: SortField
  sortDirection: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  toggleSort: [field: SortField]
  deleteItem: [id: number]
}>()

function getSortIcon(field: SortField, currentSortField: SortField, direction: 'asc' | 'desc') {
  if (currentSortField !== field) {
    return '↕'
  }
  return direction === 'asc' ? '↑' : '↓'
}
</script>

<template>
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
                @click="emit('toggleSort', field as SortField)"
              >
                {{ field }} {{ getSortIcon(field as SortField, sortField, sortDirection) }}
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
                  @click="emit('deleteItem', item.id)"
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
</template>
