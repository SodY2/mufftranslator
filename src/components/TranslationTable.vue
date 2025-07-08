<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Übersetzungen</h1>

    <table class="min-w-full border border-gray-300 rounded shadow-sm">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-2 border-b">Name</th>
          <th class="p-2 border-b">Zielname</th>
          <th class="p-2 border-b w-10">Aktion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in props.dict" class="hover:bg-gray-50">
          <td class="p-2 border-b">{{ entry["name"] }}</td>
          <td class="p-2 border-b">{{ entry["t_name"] }}</td>
          <td class="p-2 border-b text-center"></td>
        </tr>
        <tr v-if="props.dict.length === 0">
          <td colspan="3" class="p-4 text-center text-gray-500">Keine Einträge vorhanden</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">

import { defineProps} from 'vue'
const props = defineProps<{ dict: { name: string; t_name: string }[] }>()
const { dict } = props

</script>
