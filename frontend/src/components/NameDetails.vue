<template>
  <div class="space-y-4">
    <!-- Proposer Info -->
    <div class="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400">
          👤
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Propuesto por</p>
          <p class="text-white font-medium">{{ name.proposerName || 'Usuario desconocido' }}</p>
        </div>
      </div>

      <!-- Description below proposer -->
      <div v-if="name.description || isProposer" class="mt-3 pt-3 border-t border-gray-700/50">
        <div v-if="!editingDescription">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
                <span>📝</span> Descripción
              </p>
              <p v-if="name.description" class="text-gray-300 text-sm italic leading-relaxed">
                "{{ name.description }}"
              </p>
              <p v-else class="text-gray-500 text-sm italic">
                Sin descripción
              </p>
            </div>
            <button
              v-if="isProposer"
              @click="startEditingDescription"
              class="text-xs text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded hover:bg-primary-400/10"
            >
              {{ name.description ? 'Editar' : 'Añadir' }}
            </button>
          </div>
        </div>
        <div v-else class="space-y-2">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-2">
            <span>📝</span> Descripción
          </p>
          <textarea
            v-model="descriptionText"
            class="w-full bg-gray-900/40 border border-gray-700 rounded-lg p-2 text-sm text-gray-300 focus:outline-none focus:border-primary-500 resize-none"
            rows="3"
            placeholder="Escribe una descripción para este nombre..."
          ></textarea>
          <div class="flex gap-2 justify-end">
            <button
              @click="cancelEditingDescription"
              class="px-3 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors rounded hover:bg-gray-700/50"
            >
              Cancelar
            </button>
            <button
              @click="saveDescription"
              :disabled="savingDescription"
              class="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors disabled:opacity-50"
            >
              {{ savingDescription ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
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
              {{ p.firstName }} {{ p.lastName1 }}{{ p.lastName2 ? ' ' + p.lastName2 : '' }}
            </span>
          </div>
          <div v-if="groupStore.currentGroup.siblings.length" class="p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 flex flex-wrap gap-2">
            <span class="text-[10px] text-gray-500 w-full mb-1">HERMANOS:</span>
            <span v-for="(s, i) in groupStore.currentGroup.siblings" :key="i" class="text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-lg">
              {{ s.firstName }} {{ s.lastName1 }}{{ s.lastName2 ? ' ' + s.lastName2 : '' }}
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
          <div class="animate-fade-in">
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{{ currentScenario.title }}</p>
            <div class="bg-gray-900/40 p-3 rounded-xl border border-gray-800 italic text-sm text-gray-300 leading-relaxed relative overflow-hidden group">
               <span class="absolute left-0 top-0 bottom-0 w-1 bg-primary-500/30 opacity-0 group-hover:opacity-100 transition-opacity"></span>
               "{{ currentScenario.text }}"
            </div>
          </div>
        </div>
        <p class="text-[10px] text-gray-500 mt-4 text-center italic">Basado en los datos de tu grupo familiar</p>
      </div>
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
import api from '@/services/api'
import { generateAllPhrases, type FamilyContext } from '@/utils/phrases'

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

const emit = defineEmits<{
  'description-updated': []
}>()

const refreshScenarios = () => {
  refreshKey.value++
}

// Description editing
const editingDescription = ref(false)
const descriptionText = ref('')
const savingDescription = ref(false)

const isProposer = computed(() => {
  return authStore.user?.id === props.name.proposedBy
})

const startEditingDescription = () => {
  descriptionText.value = props.name.description || ''
  editingDescription.value = true
}

const cancelEditingDescription = () => {
  editingDescription.value = false
  descriptionText.value = ''
}

const saveDescription = async () => {
  if (savingDescription.value) return

  try {
    savingDescription.value = true
    await api.patch(`/names/${props.name.id}/description`, {
      description: descriptionText.value
    })

    // Update the local name object
    props.name.description = descriptionText.value
    editingDescription.value = false
    emit('description-updated')
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al actualizar la descripción')
  } finally {
    savingDescription.value = false
  }
}

// Helper function to get family context data
const getFamilyContext = (): FamilyContext => {
  const g = groupStore.currentGroup
  const name = props.name.name
  const s1 = g?.preferredSurnames?.lastName1 || ''
  const s2 = g?.preferredSurnames?.lastName2 || ''
  const fullName = `${name} ${s1} ${s2}`.trim()

  const parent1 = g?.parents?.[0]?.firstName || 'papá'
  const parent2 = g?.parents?.[1]?.firstName || 'mamá'
  const sibling = g?.siblings?.[0]?.firstName || 'tu hermano'
  const allFamily = [
    ...(g?.parents?.map(p => p.firstName) || []),
    ...(g?.siblings?.map(s => s.firstName) || []),
    name
  ].join(', ')

  return { name, fullName, parent1, parent2, sibling, allFamily, lastName1: s1, lastName2: s2 }
}

// Computed property for current scenario
const currentScenario = computed(() => {
  const _ = refreshKey.value
  const g = groupStore.currentGroup
  if (!g) return { title: '', text: '' }

  const ctx = getFamilyContext()
  const allPhrases = generateAllPhrases(ctx)

  // Pick a random phrase
  const randomIndex = Math.floor(Math.random() * allPhrases.length)
  return allPhrases[randomIndex]
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
