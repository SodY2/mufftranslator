<script setup lang="ts">
import { useTestTable } from '@/composables/useTestTable'
import { formatDate } from '@/utils/dateFormatter'
import { onMounted, ref } from 'vue'

const newName = ref('')
const {
  isInitialized,
  items,
  error,
  isLoading,
  initialize,
  addItem,
} = useTestTable()

onMounted(() => {
  initialize()
})

async function handleAddItem() {
  await addItem(newName.value)
  newName.value = ''
}
</script>

<template>
  <main class="p-4">
    <h1 class="text-2xl mb-4">
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
          class="border p-2 rounded"
          @keyup.enter="handleAddItem"
        >
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          :disabled="isLoading"
          @click="handleAddItem"
        >
          {{ isLoading ? 'Loading...' : 'Add' }}
        </button>
      </div>

      <div v-if="items.length === 0" class="text-gray-500">
        No items yet. Add your first item above.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-red-500">
      Failed to initialize SQLite database
    </div>
  </main>
</template>
