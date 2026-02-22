<template>
  <div class="space-y-6">
    <!-- Proposer Info -->
    <div class="flex items-center gap-3 bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
      <div class="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400">
        👤
      </div>
      <div>
        <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Propuesto por</p>
        <p class="text-white font-medium">{{ name.proposerName || 'Usuario desconocido' }}</p>
      </div>
    </div>

    <!-- Ratings Summary -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-800/30 p-4 rounded-2xl text-center border border-gray-700/50">
        <p class="text-3xl mb-1">⭐</p>
        <p class="text-2xl font-bold text-white">{{ name.averageScore > 0 ? name.averageScore.toFixed(1) : '—' }}</p>
        <p class="text-xs text-gray-500">Promedio</p>
      </div>
      <div class="bg-gray-800/30 p-4 rounded-2xl text-center border border-gray-700/50">
        <p class="text-3xl mb-1">🗳️</p>
        <p class="text-2xl font-bold text-white">{{ name.totalRatings }}</p>
        <p class="text-xs text-gray-500">Votos totales</p>
      </div>
    </div>

    <!-- Voter List -->
    <div>
      <h4 class="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        <span>👥</span> Votos detallados
      </h4>
      <div v-if="loadingRatings" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
      </div>
      <div v-else-if="ratings.length === 0" class="text-center py-4 bg-gray-800/20 rounded-xl text-gray-500 text-sm">
        Nadie ha votado todavía
      </div>
      <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        <div v-for="rating in ratings" :key="rating.id" class="flex items-center justify-between p-2.5 bg-gray-800/40 rounded-xl border border-gray-700/30">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary-500"></span>
            <span class="text-sm text-gray-200 font-medium">{{ rating.userName || 'Anónimo' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-lg">{{ rating.score }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Integrated Comments -->
    <div>
      <h4 class="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        <span>💬</span> Comentarios
      </h4>
      <div v-if="loadingComments" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
      </div>
      <div v-else class="space-y-4">
        <div v-if="rootComments.length === 0" class="text-center py-6 bg-gray-800/20 rounded-xl text-gray-500 text-sm italic">
          Sé el primero en comentar algo sobre este nombre
        </div>
        
        <div v-for="c in rootComments" :key="c.id" class="space-y-2">
          <div class="bg-gray-800/60 rounded-2xl p-4 border border-gray-700/50 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-primary-300">{{ c.userName || 'Usuario' }}</span>
              <span class="text-[10px] text-gray-600">{{ formatDate(c.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-200 leading-relaxed">{{ c.text }}</p>
            <div class="mt-3 flex justify-end">
              <button @click="$emit('reply', c)" class="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-primary-400 transition-colors">
                Responder
              </button>
            </div>
          </div>
          
          <!-- Replies -->
          <div v-for="r in getReplies(c.id)" :key="r.id" class="ml-8 bg-gray-800/30 rounded-2xl p-3 border border-gray-700/30">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] font-bold text-primary-400/80">{{ r.userName || 'Usuario' }}</span>
              <span class="text-[9px] text-gray-600">{{ formatDate(r.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-300">{{ r.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: any
  ratings: any[]
  comments: any[]
  loadingRatings?: boolean
  loadingComments?: boolean
}>()

defineEmits(['reply'])

const rootComments = computed(() => props.comments.filter((c) => !c.parentId))

function getReplies(parentId: string) {
  return props.comments.filter((c) => c.parentId === parentId)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
