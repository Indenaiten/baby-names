<template>
  <div class="space-y-4">
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

    <!-- Statistics Summary -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-gray-800/30 p-3 rounded-xl text-center border border-gray-700/50">
        <p class="text-2xl mb-1">⭐</p>
        <p class="text-xl font-bold text-white">{{ name.averageScore > 0 ? name.averageScore.toFixed(1) : '—' }}</p>
        <p class="text-xs text-gray-500">Promedio</p>
      </div>
      <div class="bg-gray-800/30 p-3 rounded-xl text-center border border-gray-700/50">
        <p class="text-2xl mb-1">🗳️</p>
        <p class="text-xl font-bold text-white">{{ name.totalRatings }}</p>
        <p class="text-xs text-gray-500">Votos totales</p>
      </div>
      <div class="bg-gray-800/30 p-3 rounded-xl text-center border border-gray-700/50">
        <p class="text-2xl mb-1">👍</p>
        <p class="text-xl font-bold text-green-400">{{ name.likes || 0 }}</p>
        <p class="text-xs text-gray-500">Likes totales</p>
      </div>
      <div class="bg-gray-800/30 p-3 rounded-xl text-center border border-gray-700/50">
        <p class="text-2xl mb-1">👎</p>
        <p class="text-xl font-bold text-red-400">{{ name.dislikes || 0 }}</p>
        <p class="text-xs text-gray-500">Dislikes totales</p>
      </div>
    </div>

    <!-- Family Context (Expandable) -->
    <div v-if="groupStore.currentGroup && (groupStore.currentGroup.parents.length > 0 || groupStore.currentGroup.siblings.length > 0)" class="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/20">
      <button
        @click="expandedSections.familyContext = !expandedSections.familyContext"
        class="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
      >
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <span>👪</span> Contexto familiar
        </h4>
        <span class="text-gray-500 transition-transform duration-200" :class="{ 'rotate-180': expandedSections.familyContext }">
          ▼
        </span>
      </button>
      <div v-if="expandedSections.familyContext" class="px-4 pb-4 border-t border-gray-700/30">
        <div class="grid grid-cols-1 gap-2 mt-3">
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
    </div>

    <!-- Imagine Tool (Expandable) -->
    <div v-if="groupStore.currentGroup" class="border border-primary-500/30 rounded-xl overflow-hidden bg-gradient-to-br from-primary-600/10 to-transparent">
      <button
        @click="expandedSections.scenarios = !expandedSections.scenarios"
        class="w-full flex items-center justify-between p-4 hover:bg-primary-600/5 transition-colors"
      >
        <h4 class="text-sm font-semibold text-primary-300 flex items-center gap-2">
          <span>🔮</span> ¿Cómo suena en el mundo real?
        </h4>
        <span class="text-primary-500 transition-transform duration-200" :class="{ 'rotate-180': expandedSections.scenarios }">
          ▼
        </span>
      </button>
      <div v-if="expandedSections.scenarios" class="px-4 pb-4 border-t border-primary-500/20">
        <div class="flex justify-end mt-3 mb-2">
          <button @click="refreshScenarios" class="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-tighter">
            Refrescar ✨
          </button>
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


    <!-- Expandable Sections -->
    <!-- Voter List (Expandable) -->
    <div class="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/20">
      <button
        @click="expandedSections.ratings = !expandedSections.ratings"
        class="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
      >
        <h4 class="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <span>👥</span> Votos detallados
          <span class="text-xs text-gray-500 font-normal">({{ ratings.length }})</span>
        </h4>
        <span class="text-gray-500 transition-transform duration-200" :class="{ 'rotate-180': expandedSections.ratings }">
          ▼
        </span>
      </button>
      <div v-if="expandedSections.ratings" class="px-4 pb-4 border-t border-gray-700/30">
        <div v-if="loadingRatings" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        </div>
        <div v-else-if="ratings.length === 0" class="text-center py-4 text-gray-500 text-sm">
          Nadie ha votado todavía
        </div>
        <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar mt-3">
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
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useNameStore } from '@/stores/name'
import { useAuthStore } from '@/stores/auth'

const nameStore = useNameStore()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const refreshKey = ref(0)

// Control expandable sections - all collapsed by default
const expandedSections = reactive({
  familyContext: false,
  scenarios: false,
  ratings: false
})

const props = defineProps<{
  name: any
  ratings: any[]
  loadingRatings?: boolean
}>()

const refreshScenarios = () => {
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
