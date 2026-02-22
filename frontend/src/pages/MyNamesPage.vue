<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-display font-bold text-white mb-2">📝 Mis nombres</h1>
    <p class="text-gray-400 mb-6">Nombres que has propuesto y votado</p>

    <!-- Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
      <button v-for="t in visibleTabs" :key="t" @click="activeTab = t"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap" :class="activeTab === t
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'">
        {{ t === 'proposed' ? '✨ Propuestos' : t === 'voted' ? '⭐ Votados' : t === 'match' ? '🏆 Match' : t === 'liked' ? '👍 Likes' : t === 'disliked' ? '👎 Dislikes' : '⏳ No votados' }}
        <span class="ml-1 text-xs font-normal opacity-80">
          ({{ t === 'proposed' ? nameStore.myNames.length :
             t === 'voted' ? nameStore.myRatings.length :
             t === 'match' ? namesMatch.length :
             t === 'liked' ? namesLiked.length :
             t === 'disliked' ? namesDisliked.length :
             namesUnvoted.length }})
        </span>
      </button>
    </div>

    <!-- Names list (unified for all tabs) -->
    <div v-if="currentTabNames.length === 0" class="text-center py-16">
      <p class="text-5xl mb-4">{{ activeTab === 'proposed' ? '✨' : activeTab === 'voted' ? '⭐' : activeTab === 'match' ? '🏆' : activeTab === 'liked' ? '👍' : activeTab === 'disliked' ? '👎' : '⏳' }}</p>
      <p class="text-gray-400">
        {{ activeTab === 'proposed' ? 'No has propuesto nombres todavía' :
           activeTab === 'voted' ? 'No has votado nombres todavía' :
           activeTab === 'match' ? 'No hay nombres que hagan match con todos los involucrados todavía.' :
           activeTab === 'liked' ? 'No has dado "me gusta" a ningún nombre todavía.' :
           activeTab === 'disliked' ? 'No has dado "no me gusta" a ningún nombre todavía.' :
           'No tienes nombres pendientes de votar.' }}
      </p>
      <router-link :to="`/groups/${gid}/${activeTab === 'proposed' ? 'add' : 'discover'}`" class="btn-primary inline-block mt-4">
        {{ activeTab === 'proposed' ? 'Proponer uno' : 'Descubrir nombres' }}
      </router-link>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="(name, index) in currentTabNames"
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
              <p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Posteado por <span class="text-gray-300">{{ name.proposerName || '...' }}</span></p>
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
                @click.stop="toggleDecision(name, 'like')"
                class="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center text-base border shadow-sm"
                :class="getMyDecision(name) === 'like' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-green-400 hover:border-green-500/30'"
                title="Me gusta"
              >
                👍
              </button>
              <button
                @click.stop="toggleDecision(name, 'dislike')"
                class="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center text-base border shadow-sm"
                :class="getMyDecision(name) === 'dislike' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/30'"
                title="No me gusta"
              >
                👎
              </button>
              <button
                v-if="isInvolvedUser"
                @click.stop="toggleWinner(name)"
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
                  @click.stop="openDetails(name.id)"
                  class="px-2.5 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400 hover:bg-primary-500/20 transition-all uppercase tracking-tight"
                  v-if="!groupStore.currentGroup?.closed"
                >
                  Cambiar
                </button>
                <button
                  @click.stop="handleDeleteRating(name.id)"
                  class="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all uppercase tracking-tight"
                  v-if="!groupStore.currentGroup?.closed"
                >
                  Borrar
                </button>
                <span v-else class="px-2 py-1 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/5 rounded-lg border border-green-500/20">Votado</span>
              </div>
              <button
                @click.stop="openDetails(name.id)"
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
                @click.stop="handleDeleteName(name)"
                class="w-9 h-9 rounded-xl bg-gray-800/80 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center border border-gray-700/50 shrink-0"
                title="Eliminar nombre"
              >
                <span class="text-base leading-none">🗑️</span>
              </button>

              <!-- Detail toggle -->
              <button
                @click.stop="openDetails(name.id)"
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

    <!-- Details Modal (Reusable) -->
    <div v-if="selectedNameId" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" @click.self="selectedNameId = null">
      <div class="card w-full sm:max-w-lg max-h-[85vh] flex flex-col animate-slide-up rounded-b-none sm:rounded-b-2xl p-0 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 class="font-bold text-xl text-white">
            {{ getNameFromRating(selectedNameId)?.name }}
            <span v-if="getGroupSurnames" class="text-gray-400 font-normal ml-1">{{ getGroupSurnames }}</span>
          </h3>
          <button @click="selectedNameId = null" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 modal-scroll-area custom-scrollbar">
          <NameDetails
            :name="getNameFromRating(selectedNameId)"
            :ratings="nameStore.ratings"
            :loadingRatings="loadingRatings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNameStore } from '@/stores/name'
import { useGroupStore } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'
import type { BabyName } from '@/types/name'
import NameDetails from '@/components/NameDetails.vue'

const route = useRoute()
const nameStore = useNameStore()
const groupStore = useGroupStore()
const authStore = useAuthStore() // Initialize authStore
const gid = computed(() => route.params.gid as string)
const activeTab = ref('proposed')

const currentGroup = computed(() => groupStore.currentGroup)

// Track rated names locally
const ratedNameIds = ref<Set<string>>(new Set())

// Tabs visibility: only show "match" tab if user is involved AND there are 2+ involved users
const visibleTabs = computed(() => {
  const tabs = ['proposed', 'voted', 'liked', 'disliked', 'unvoted']

  const involvedCount = currentGroup.value?.members.filter(m => m.isInvolved).length || 0

  // Only show "match" tab if user is involved AND there are 2+ involved users
  if (isInvolvedUser.value && involvedCount >= 2) {
    tabs.splice(2, 0, 'match') // Insert "match" after "voted"
  }

  return tabs
})

// Current tab names with sorting
const currentTabNames = computed(() => {
  let names: BabyName[] = []

  if (activeTab.value === 'proposed') {
    names = [...nameStore.myNames]
  } else if (activeTab.value === 'voted') {
    names = nameStore.myRatings
      .map(r => getNameFromRating(r.nameId))
      .filter(Boolean) as BabyName[]
  } else if (activeTab.value === 'match') {
    names = [...namesMatch.value]
  } else if (activeTab.value === 'liked') {
    names = [...namesLiked.value]
  } else if (activeTab.value === 'disliked') {
    names = [...namesDisliked.value]
  } else if (activeTab.value === 'unvoted') {
    names = [...namesUnvoted.value]
  }

  // Sort by average score (descending), then by likes
  return names.sort((a, b) => {
    // 1. Winner first
    if (a.isWinner && !b.isWinner) return -1
    if (!a.isWinner && b.isWinner) return 1

    // 2. Matches second
    const aMatch = isMatch(a)
    const bMatch = isMatch(b)
    if (aMatch && !bMatch) return -1
    if (bMatch && !aMatch) return 1

    // 3. Then by average score
    return (b.averageScore || 0) - (a.averageScore || 0)
  })
})

const namesMatch = computed(() => {
  const involvedIds = currentGroup.value?.members
    .filter(m => m.isInvolved)
    .map(m => m.userId) || []
  
  if (involvedIds.length === 0) return []

  return nameStore.names.filter(n => {
    if (!n.decisions) return false
    const likeIds = n.decisions
      .filter(d => d.type === 'like')
      .map(d => d.userId)
    return involvedIds.every(id => likeIds.includes(id))
  })
})

const namesLiked = computed(() => {
  return nameStore.names.filter(n => 
    n.decisions?.some(d => d.userId === authStore.user?.id && d.type === 'like')
  )
})

const namesDisliked = computed(() => {
  return nameStore.names.filter(n => 
    n.decisions?.some(d => d.userId === authStore.user?.id && d.type === 'dislike')
  )
})

const namesUnvoted = computed(() => {
  const votedIds = new Set(nameStore.myRatings.map(r => r.nameId))
  return nameStore.names.filter(n => !votedIds.has(n.id))
})

const isMatch = (name: BabyName) => {
  if (!name || !name.decisions) return false
  const involvedIds = currentGroup.value?.members
    .filter(m => m.isInvolved)
    .map(m => m.userId) || []

  if (involvedIds.length === 0) return false

  const likeIds = name.decisions
    .filter(d => d.type === 'like')
    .map(d => d.userId)

  return involvedIds.every(id => likeIds.includes(id))
}

function hasRated(nameId: string) {
  return ratedNameIds.value.has(nameId)
}

const toggleDecision = async (name: BabyName, type: 'like' | 'dislike') => {
  const current = name.decisions?.find(d => String(d.userId) === String(authStore.user?.id))
  const newType = current?.type === type ? null : type
  await nameStore.castDecision(name.id, newType)
}

const toggleWinner = async (name: BabyName) => {
  await nameStore.setWinner(name.id, !name.isWinner)
}

const getMyDecision = (name?: BabyName) => {
  if (!name) return null
  const d = name.decisions?.find(d => String(d.userId) === String(authStore.user?.id))
  return d?.type || null
}

const isInvolvedUser = computed(() => {
  if (authStore.isRoot) return true
  const member = currentGroup.value?.members.find(m => m.userId === authStore.user?.id)
  return !!member && !!member.isInvolved
})

const getGroupSurnames = computed(() => {
  const surnames = groupStore.currentGroup?.preferredSurnames
  if (!surnames || (!surnames.lastName1 && !surnames.lastName2)) return ''
  return `${surnames.lastName1} ${surnames.lastName2}`.trim()
})

const selectedNameId = ref<string | null>(null)
const loadingRatings = ref(false)

onMounted(async () => {
  if (!groupStore.currentGroup || groupStore.currentGroup.id !== gid.value) {
    await groupStore.fetchGroup(gid.value)
  }
  await Promise.all([
    nameStore.fetchMyNames(gid.value),
    nameStore.fetchMyRatings(gid.value),
    nameStore.fetchNames(gid.value) // Fetch all names for complete context
  ])

  // Populate rated names set
  nameStore.myRatings.forEach((r) => ratedNameIds.value.add(r.nameId))
})

function getNameFromRating(nameId: string) {
  return nameStore.names.find(n => n.id === nameId) || 
         nameStore.myNames.find(n => n.id === nameId) ||
         nameStore.unratedNames.find(n => n.id === nameId)
}

async function openDetails(nameId: string) {
  selectedNameId.value = nameId

  loadingRatings.value = true

  try {
    await nameStore.fetchRatings(nameId)
  } finally {
    loadingRatings.value = false
  }
}

async function handleDeleteName(name: any) {
  if (!canDelete(name)) return
  if (!confirm(`¿Estás seguro de que quieres eliminar "${name.name}"? Esta acción no se puede deshacer.`)) return

  try {
    await nameStore.deleteName(name.id)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al eliminar el nombre')
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

function canDelete(name: any) {
  if (!authStore.user) return false
  if (authStore.isRoot) return true
  const isOwner = groupStore.currentGroup?.ownerId === authStore.user.id
  return isOwner || isInvolvedUser.value
}

function genderBadgeClass(gender: string) {
  return gender === 'boy' ? 'gender-badge-boy' : gender === 'girl' ? 'gender-badge-girl' : 'gender-badge-unisex'
}

function genderLabel(gender: string) {
  return gender === 'boy' ? '♂ Niño' : gender === 'girl' ? '♀ Niña' : '⚥ Unisex'
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
