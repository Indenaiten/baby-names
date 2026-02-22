<template>
  <div class="animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-white">🏆 Ranking</h1>
        <p class="text-gray-400 mt-1">Los nombres mejor valorados</p>
      </div>
      <button
        v-if="canExport"
        @click="handleExport"
        class="btn-secondary flex items-center gap-2 py-2.5 px-5 h-fit shadow-lg shadow-gray-900/10 border-gray-700/50"
      >
        <span class="text-lg">📥</span>
        <span>Exportar JSON</span>
      </button>
    </div>

    <!-- Gender filter tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="selectedGender = tab.value"
        class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
        :class="selectedGender === tab.value
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="nameStore.loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="nameStore.names.length === 0" class="text-center py-20">
      <p class="text-6xl mb-4">🤷</p>
      <p class="text-xl text-gray-400">No hay nombres todavía</p>
      <router-link :to="`/groups/${gid}/add`" class="btn-primary inline-block mt-4">Proponer el primero</router-link>
    </div>

    <!-- Names list -->
    <div v-else class="space-y-3">
      <div
        v-for="(name, index) in sortedNames"
        :key="name.id"
        class="card flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-up hover:border-gray-700 transition-all duration-200 p-4"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <!-- Top Half: Rank and Name Info -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <!-- Rank -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner"
            :class="index === 0 ? 'bg-amber-500/20 text-amber-300' : index === 1 ? 'bg-gray-400/20 text-gray-300' : index === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-gray-800 text-gray-500'">
            {{ index + 1 }}
          </div>

          <!-- Name info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-lg text-white leading-tight">
                {{ name.name }}
                <span v-if="getGroupSurnames" class="text-gray-400 font-normal ml-1">{{ getGroupSurnames }}</span>
              </h3>
              <span :class="genderBadgeClass(name.gender)">{{ genderLabel(name.gender) }}</span>
              <span v-if="name.isWinner" class="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-xs shadow-lg shadow-yellow-400/10" title="Ganador">🏆</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Propuesto por <span class="text-gray-300">{{ name.proposerName || '...' }}</span></p>
              <p v-if="isMatch(name)" class="text-[9px] bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Match!</span>
                <span>🏆</span>
              </p>
              <p class="text-[11px] font-medium text-gray-500">{{ name.totalRatings }} votos</p>
            </div>
            <p v-if="name.description" class="text-xs text-gray-400 mt-2 line-clamp-1 italic border-l-2 border-gray-700 pl-2">
              "{{ name.description }}"
            </p>
          </div>
        </div>

        <!-- Bottom Half (Mobile) / Right Side (Desktop): Score and Actions -->
        <div class="flex flex-wrap items-center justify-between sm:justify-end gap-x-4 gap-y-3 border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0 w-full sm:w-auto">
          <!-- Main Metrics: Score and Quick Decisions -->
          <div class="flex items-center gap-4">
            <div class="score-pill shrink-0 shadow-lg shadow-amber-500/5">
               ⭐ {{ name.averageScore > 0 ? name.averageScore.toFixed(1) : '—' }}
            </div>

            <!-- Quick Decisions (Everyone can Like/Dislike) -->
            <div class="flex items-center gap-1.5 border-l border-gray-700/50 pl-4">
              <button 
                @click.stop="toggleQuickDecision(name, 'like')"
                class="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center text-base border shadow-sm"
                :class="getMyDecision(name) === 'like' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-green-400 hover:border-green-500/30'"
                title="Me gusta"
              >
                👍
              </button>
              <button 
                @click.stop="toggleQuickDecision(name, 'dislike')"
                class="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center text-base border shadow-sm"
                :class="getMyDecision(name) === 'dislike' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/30'"
                title="No me gusta"
              >
                👎
              </button>
              <button 
                v-if="isInvolvedUser"
                @click.stop="toggleQuickWinner(name)"
                class="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center text-base border shadow-sm"
                :class="name.isWinner ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-yellow-400 hover:border-yellow-500/30'"
                title="Marcar como Ganador"
              >
                🏆
              </button>
            </div>
          </div>

          <!-- Secondary Group: Rating Management and List Actions -->
          <div class="flex items-center gap-3 ml-auto sm:ml-0">
            <!-- Rating Management (Votar/Cambiar/Borrar) -->
            <div class="flex items-center bg-gray-800/50 rounded-xl p-1 border border-gray-700/30 sm:border-0 sm:bg-transparent sm:p-0">
              <div v-if="hasRated(name.id)" class="flex items-center gap-1">
                <button
                  @click="openRating(name)"
                  class="px-2.5 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400 hover:bg-primary-500/20 transition-all uppercase tracking-tight"
                  v-if="!groupStore.currentGroup?.closed"
                >
                  Cambiar
                </button>
                <button
                  @click="handleDeleteRating(name.id)"
                  class="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all uppercase tracking-tight"
                  v-if="!groupStore.currentGroup?.closed"
                >
                  Borrar
                </button>
                <span v-else class="px-2 py-1 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/5 rounded-lg border border-green-500/20">Votado</span>
              </div>
              <button
                @click="openRating(name)"
                class="px-3 py-1.5 rounded-lg bg-primary-600/20 border border-primary-500/30 text-[10px] font-bold text-primary-300 hover:bg-primary-600/40 transition-all uppercase tracking-wide"
                v-else-if="!groupStore.currentGroup?.closed"
              >
                Votar
              </button>
            </div>

            <!-- List Actions: Delete & View -->
            <div class="flex items-center gap-1.5 border-l border-gray-700/50 pl-3">
              <!-- Delete button -->
              <button
                v-if="canDelete(name)"
                @click="handleDeleteName(name)"
                class="w-9 h-9 rounded-xl bg-gray-800/80 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center border border-gray-700/50 shrink-0"
                title="Eliminar nombre"
              >
                <span class="text-base leading-none">🗑️</span>
              </button>

              <!-- Detail toggle -->
              <button 
                @click="toggleComments(name.id)" 
                class="w-9 h-9 rounded-xl bg-gray-800/80 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-300 flex items-center justify-center border border-gray-700/50 shrink-0 shadow-sm"
                title="Ver detalles"
              >
                <span class="text-base leading-none">👁️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating modal -->
    <div v-if="ratingModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="ratingModal = null">
      <div class="card w-full max-w-md animate-scale-in">
        <h2 class="text-xl font-semibold mb-1">Valorar "{{ ratingModal.name }} {{ getGroupSurnames }}"</h2>
        <p class="text-gray-400 text-sm mb-6">Puntuación del 1 al 10</p>

        <div class="flex justify-center gap-2 mb-6 flex-wrap">
          <button
            v-for="n in 10"
            :key="n"
            @click="ratingScore = n"
            class="w-10 h-10 rounded-full font-bold text-sm transition-all duration-200"
            :class="ratingScore === n
              ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/40'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
          >
            {{ n }}
          </button>
        </div>


        <div class="flex gap-3">
          <button @click="ratingModal = null" class="btn-secondary flex-1">Cancelar</button>
          <button @click="submitRating" class="btn-primary flex-1" :disabled="!ratingScore || submitting">
            {{ submitting ? 'Enviando...' : 'Votar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Details/Comments section -->
    <div v-if="showCommentsFor" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" @click.self="showCommentsFor = null">
      <div class="card w-full sm:max-w-lg max-h-[85vh] flex flex-col animate-slide-up rounded-b-none sm:rounded-b-2xl p-0 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 class="font-bold text-xl text-white">
            {{ nameStore.names.find(n => n.id === showCommentsFor)?.name }}
            <span v-if="getGroupSurnames" class="text-gray-400 font-normal ml-1">{{ getGroupSurnames }}</span>
          </h3>
          <button @click="showCommentsFor = null" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 modal-scroll-area custom-scrollbar">
          <NameDetails
            :name="nameStore.names.find(n => n.id === showCommentsFor)"
            :ratings="nameStore.ratings"
            :loadingRatings="loadingRatings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNameStore } from '@/stores/name'
import { useGroupStore } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'
import type { BabyName } from '@/types/name' // Assuming BabyName type exists

const route = useRoute()
const nameStore = useNameStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const gid = computed(() => route.params.gid as string)

const getGroupSurnames = computed(() => {
  const surnames = groupStore.currentGroup?.preferredSurnames
  if (!surnames || (!surnames.lastName1 && !surnames.lastName2)) return ''
  return `${surnames.lastName1} ${surnames.lastName2}`.trim()
})

const tabs = [
  { value: '', label: 'Todos', icon: '🌟' },
  { value: 'girl', label: 'Niña', icon: '👧' },
  { value: 'boy', label: 'Niño', icon: '👦' },
  { value: 'unisex', label: 'Unisex', icon: '🌈' },
]
const selectedGender = ref('')

const ratingModal = ref<any>(null)
const ratingScore = ref(0)
const submitting = ref(false)

const showCommentsFor = ref<string | null>(null)

// Track rated names locally
const ratedNameIds = ref<Set<string>>(new Set())

const filteredNames = computed(() => {
  let result = nameStore.names
  if (selectedGender.value !== '') { // Changed from genderFilter to selectedGender
    result = result.filter(n => n.gender === selectedGender.value)
  }
  return result
})

const sortedNames = computed(() => {
  return [...filteredNames.value].sort((a, b) => {
    // 1. Winner first
    if (a.isWinner && !b.isWinner) return -1
    if (!a.isWinner && b.isWinner) return 1

    // 2. Matches second
    const aMatch = isMatch(a)
    const bMatch = isMatch(b)
    if (aMatch && !bMatch) return -1
    if (bMatch && !aMatch) return 1

    // 3. Then by average score
    return b.averageScore - a.averageScore
  })
})

const isMatch = (name: BabyName) => {
  const involvedIds = groupStore.currentGroup?.members
    .filter(m => m.isInvolved)
    .map(m => m.userId) || []
  
  if (involvedIds.length === 0) return false

  const likeIds = name.decisions
    .filter(d => d.type === 'like')
    .map(d => d.userId)
  
  return involvedIds.every(id => likeIds.includes(id))
}

const isInvolvedUser = computed(() => {
  if (authStore.isRoot) return true
  const member = groupStore.currentGroup?.members.find(m => m.userId === authStore.user?.id)
  return !!member && !!member.isInvolved
})

const toggleQuickWinner = async (name: BabyName) => {
  await nameStore.setWinner(name.id, !name.isWinner)
}

const toggleQuickDecision = async (name: BabyName, type: 'like' | 'dislike') => {
  const current = name.decisions.find(d => String(d.userId) === String(authStore.user?.id))
  const newType = current?.type === type ? null : type
  await nameStore.castDecision(name.id, newType)
}

const getMyDecision = (name: BabyName) => {
  const d = name.decisions?.find(d => String(d.userId) === String(authStore.user?.id))
  return d?.type || null
}

function hasRated(nameId: string) {
  return ratedNameIds.value.has(nameId)
}

function canDelete(name: any) {
  if (!authStore.user) return false
  if (authStore.isRoot) return true
  // Only owner or involved users can delete
  const isOwner = groupStore.currentGroup?.ownerId === authStore.user.id
  return isOwner || isInvolvedUser.value
}

const canExport = computed(() => {
  if (!authStore.user || !groupStore.currentGroup) return false
  return authStore.isRoot || groupStore.currentGroup.ownerId === authStore.user.id
})

onMounted(async () => {
  if (!groupStore.currentGroup || groupStore.currentGroup.id !== gid.value) {
    await groupStore.fetchGroup(gid.value)
  }
  nameStore.fetchNames(gid.value)
  // Load user's existing ratings for this group
  try {
    await nameStore.fetchMyRatings(gid.value)
    nameStore.myRatings.forEach((r) => ratedNameIds.value.add(r.nameId))
  } catch {}
})

watch(selectedGender, () => {
  nameStore.fetchNames(gid.value, selectedGender.value || undefined)
})

function genderBadgeClass(gender: string) {
  return gender === 'boy' ? 'gender-badge-boy' : gender === 'girl' ? 'gender-badge-girl' : 'gender-badge-unisex'
}

function genderLabel(gender: string) {
  return gender === 'boy' ? '♂ Niño' : gender === 'girl' ? '♀ Niña' : '⚥ Unisex'
}

function openRating(name: any) {
  ratingModal.value = name
  const existingRating = nameStore.myRatings.find(r => r.nameId === name.id)
  ratingScore.value = existingRating ? existingRating.score : 0
}

async function submitRating() {
  if (!ratingScore.value || !ratingModal.value) return
  submitting.value = true
  try {
    await nameStore.rateName(ratingModal.value.id, ratingScore.value)
    ratedNameIds.value.add(ratingModal.value.id)
    ratingModal.value = null
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al enviar el voto')
  } finally {
    submitting.value = false
  }
}

async function handleDeleteRating(nameId: string) {
  if (!confirm('¿Estás seguro de que quieres eliminar tu voto?')) return
  try {
    await nameStore.deleteRating(nameId)
    ratedNameIds.value.delete(nameId)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al eliminar el voto')
  }
}

// Details toggle
const loadingRatings = ref(false)

async function toggleComments(nameId: string) {
  showCommentsFor.value = nameId

  loadingRatings.value = true

  try {
    await nameStore.fetchRatings(nameId)
  } finally {
    loadingRatings.value = false
  }
}

async function handleDeleteName(name: any) {
  if (!confirm(`¿Estás seguro de que quieres eliminar "${name.name}"? Esta acción no se puede deshacer.`)) return
  
  try {
    await nameStore.deleteName(name.id)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al eliminar el nombre')
  }
}

async function handleExport() {
  try {
    const data = await nameStore.exportNames(gid.value)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ranking-${groupStore.currentGroup?.name || 'baby-names'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al exportar los nombres')
  }
}
</script>

<script lang="ts">
import NameDetails from '@/components/NameDetails.vue'
export default {
  components: { NameDetails }
}
</script>
