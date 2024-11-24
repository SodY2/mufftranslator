<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  isLoading: boolean
  exampleQueries: Record<string, string>
  modifyExamples: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'execute': []
  'setExample': [query: string]
}>()

const activeTab = ref<'select' | 'modify'>('select')

function setActiveTab(tab: 'select' | 'modify') {
  activeTab.value = tab
}
</script>

<template>
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
          v-for="tab in ['select', 'modify']"
          :key="tab"
          class="px-4 py-2 text-sm font-medium"
          :class="[
            activeTab === tab
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="setActiveTab(tab as 'select' | 'modify')"
        >
          {{ tab === 'select' ? 'Select Examples' : 'Modify Data' }}
        </button>
      </div>

      <!-- Example queries -->
      <div v-if="activeTab === 'select'" class="flex flex-wrap gap-2">
        <button
          v-for="(query, key) in exampleQueries"
          :key="key"
          class="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          @click="emit('setExample', query)"
        >
          {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
        </button>
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="(query, key) in modifyExamples"
          :key="key"
          class="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-md text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
          @click="emit('setExample', query)"
        >
          {{ key.replace(/([A-Z])/g, ' $1').toLowerCase() }}
        </button>
      </div>

      <!-- Query textarea -->
      <div class="space-y-3">
        <textarea
          :value="modelValue"
          placeholder="Enter SQL query..."
          class="font-mono border p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full text-sm"
          rows="8"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        />

        <div class="flex justify-between items-center">
          <button
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2"
            :disabled="isLoading"
            @click="emit('execute')"
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
</template>
