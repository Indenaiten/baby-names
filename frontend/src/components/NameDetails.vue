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

    <!-- Family Context -->
    <div v-if="groupStore.currentGroup" class="space-y-3">
      <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <span>👪</span> Contexto familiar
      </h4>
      <div class="grid grid-cols-1 gap-2">
        <div v-if="groupStore.currentGroup.parents.length" class="p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 flex flex-wrap gap-2">
          <span class="text-[10px] text-gray-500 w-full mb-1">PADRES:</span>
          <span v-for="(p, i) in groupStore.currentGroup.parents" :key="i" class="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">
            {{ p.firstName }} {{ p.lastName1 }}
          </span>
        </div>
        <div v-if="groupStore.currentGroup.siblings.length" class="p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 flex flex-wrap gap-2">
          <span class="text-[10px] text-gray-500 w-full mb-1">HERMANOS:</span>
          <span v-for="(s, i) in groupStore.currentGroup.siblings" :key="i" class="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">
            {{ s.firstName }} {{ s.lastName1 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Imagine Tool -->
    <div v-if="groupStore.currentGroup" class="bg-gradient-to-br from-primary-600/10 to-transparent p-5 rounded-2xl border border-primary-500/20 shadow-lg shadow-primary-500/5">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-bold text-primary-300 flex items-center gap-2">
          <span>🔮</span> ¿Cómo suena en el mundo real?
        </h4>
        <button @click="refreshScenarios" class="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-tighter">Refrescar ✨</button>
      </div>
      
      <div class="space-y-4">
        <div v-for="(scene, i) in scenarios" :key="i" class="animate-fade-in" :style="{ animationDelay: `${i * 100}ms` }">
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{{ scene.title }}</p>
          <div class="bg-gray-900/40 p-3 rounded-xl border border-gray-800 italic text-sm text-gray-300 leading-relaxed relative overflow-hidden group">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-primary-500/30 opacity-0 group-hover:opacity-100 transition-opacity"></span>
             "{{ scene.text }}"
          </div>
        </div>
      </div>
      
      <p class="text-[10px] text-gray-500 mt-4 text-center italic">Basado en los datos de tu grupo familiar</p>
    </div>

    <!-- Description -->
    <div v-if="name.description" class="bg-gray-800/20 p-4 rounded-xl border border-dashed border-gray-700/50">
      <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
        <span>📝</span> Descripción
      </p>
      <p class="text-gray-300 text-sm italic leading-relaxed">
        "{{ name.description }}"
      </p>
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
import { computed, ref } from 'vue'
import { useGroupStore } from '@/stores/group'

const groupStore = useGroupStore()
const refreshKey = ref(0)

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

function refreshScenarios() {
  refreshKey.value++
}

const scenarios = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = refreshKey.value
  const g = groupStore.currentGroup
  if (!g) return []
  
  const name = props.name.name
  const s1 = g.preferredSurnames?.lastName1 || ''
  const s2 = g.preferredSurnames?.lastName2 || ''
  const fullName = `${name} ${s1} ${s2}`.trim()
  
  const res = []
  
  // Cotidiano
  res.push({
    title: '🏠 Cotidiano',
    text: `¡${name}, a cenar! Que se enfría la sopa.`
  })
  
  if (g.siblings.length > 0) {
    const bro = g.siblings[0].firstName
    res.push({
      title: '🧒 Con hermanos',
      text: `¡${name}, deja de molestar a ${bro}! Portaos bien.`
    })
  } else {
    res.push({
      title: '🏫 Colegio',
      text: `¿Has hecho ya los deberes, ${name}?`
    })
  }
  
  // Solemne
  res.push({
    title: '🎓 Solemne',
    text: `Concedemos el título de Doctor Honoris Causa a Don/Doña ${fullName}.`
  })
  
  // Pase de lista
  if (g.parents.length > 0) {
    const familyList = [...g.parents.map(p => p.firstName), ...g.siblings.map(s => s.firstName), name]
    res.push({
      title: '📢 Pase de lista',
      text: `${familyList.join(', ')}... ¡Estamos todos! Vámonos.`
    })
  }

  // Megafonía
  res.push({
    title: '📣 Megafonía',
    text: `Se ruega al tutor de ${name} que acuda a la zona de información.`
  })

  return res
})

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
