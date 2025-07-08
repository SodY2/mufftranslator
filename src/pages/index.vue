<script setup lang="ts">

import { ref, computed, onMounted  } from 'vue'
import MuffTranslator from '@/components/MuffTranslator.vue'
import TranslationTable from '@/components/TranslationTable.vue'
import sourceData from './../assets/translator.json'

const queryResult = ref<any[]>([])

onMounted(async () => {
  loadData();
})

async function loadData() {
  console.log("json data loaded",sourceData)
  queryResult.value = []
  queryResult.value = sourceData;

}

</script>

<template>
  <main class="p-4 dark:bg-gray-900 min-h-screen">
    <MuffTranslator :dict="queryResult"/>
    <TranslationTable :dict="queryResult" />
  </main>
</template>
