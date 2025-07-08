<script setup lang="ts">
import { ref, computed, onMounted, defineProps  } from 'vue'

const inputText  = ref<string>('')

const props = defineProps<{ dict: { name: string; t_name: string }[] }>()
const { dict } = props

const transformedText = computed(() => {
  if (!inputText.value) return ''
  let result = inputText.value

  // Jedes Wort in der mappings-Liste prüfen und ersetzen#
  props.dict.forEach(element => {
    var name = element["name"]
    var t_name = element["t_name"]

    const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi')
    result = result.replace(pattern, t_name)
    
  });
 
  return result
})

// Hilfsfunktion für Regex-Escaping
function escapeRegExp(string:string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Muff'scher Translator
    </h2>
    <div class="flex gap-4 p-4">
      <textarea 
        v-model="inputText "
        rows="4"
        placeholder="Watt will uns der Muff sagen..."
        class="w-1/2 h-64 p-2 resize-none rounded-lg font-mono text-sm bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100
                transition-colors duration-200"></textarea>
      <textarea
        rows="4"
        :value="transformedText"
        readonly
        class="w-1/2 h-64 p-2 resize-none rounded-lg font-mono text-sm bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100
                transition-colors duration-200"></textarea>
    </div>
   

</div>
</template>
