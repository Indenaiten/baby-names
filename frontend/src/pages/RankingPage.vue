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
        v-for="(name, index) in nameStore.names"
        :key="name.id"
        class="card flex items-center gap-4 animate-slide-up hover:border-gray-700 transition-all duration-200"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <!-- Rank -->
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          :class="index === 0 ? 'bg-amber-500/20 text-amber-300' : index === 1 ? 'bg-gray-400/20 text-gray-300' : index === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-gray-800 text-gray-500'">
          {{ index + 1 }}
        </div>

        <!-- Name info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-semibold text-lg text-white">{{ name.name }}</h3>
            <span :class="genderBadgeClass(name.gender)">
              {{ genderLabel(name.gender) }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <p class="text-[10px] text-gray-500 uppercase tracking-tighter font-bold bg-gray-800 px-1.5 py-0.5 rounded">
              👤 {{ name.proposerName || '...' }}
            </p>
            <p class="text-xs text-gray-500">{{ name.totalRatings }} votos</p>
          </div>
        </div>

        <!-- Score -->
        <div class="text-right shrink-0">
          <div class="score-pill">
            ⭐ {{ name.averageScore > 0 ? name.averageScore.toFixed(1) : '—' }}
          </div>
        </div>

        <!-- Rate button -->
        <button
          @click="openRating(name)"
          class="btn-secondary text-sm py-2 px-4 shrink-0"
          v-if="!hasRated(name.id)"
        >
          Votar
        </button>
        <span v-else class="text-xs text-green-400 shrink-0">✓ Votado</span>

        <!-- Delete button (for proposer, group owner or root) -->
        <button
          v-if="canDelete(name)"
          @click="handleDeleteName(name)"
          class="w-10 h-10 rounded-xl bg-gray-800/50 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center border border-gray-700/30 shrink-0"
          title="Eliminar nombre"
        >
          <span class="text-lg leading-none">🗑️</span>
        </button>

        <!-- Detail toggle -->
        <button 
          @click="toggleComments(name.id)" 
          class="w-10 h-10 rounded-xl bg-gray-800/50 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-300 flex items-center justify-center border border-gray-700/30 shrink-0"
          title="Ver detalles y comentarios"
        >
          <span class="text-lg leading-none">👁️</span>
        </button>
      </div>
    </div>

    <!-- Rating modal -->
    <div v-if="ratingModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="ratingModal = null">
      <div class="card w-full max-w-md animate-scale-in">
        <h2 class="text-xl font-semibold mb-1">Valorar "{{ ratingModal.name }}"</h2>
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
          </h3>
          <button @click="showCommentsFor = null" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 modal-scroll-area custom-scrollbar">
          <NameDetails 
            :name="nameStore.names.find(n => n.id === showCommentsFor)" 
            :ratings="nameStore.ratings"
            :comments="nameStore.comments"
            :loadingRatings="loadingRatings"
            :loadingComments="loadingComments"
            @reply="handleReply"
          />
        </div>

        <!-- Footer -->
        <div class="p-4 bg-gray-900/50 border-t border-gray-800">
          <form @submit.prevent="submitComment" class="flex gap-2">
            <input v-model="commentText" class="input-field flex-1" :placeholder="replyTo ? 'Responder...' : 'Escribe un comentario...'" />
            <button type="submit" class="btn-primary px-4 shadow-lg shadow-primary-500/20">→</button>
          </form>
          <p v-if="replyTo" class="text-[10px] text-gray-500 mt-2 flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-primary-500"></span>
            Respondiendo a comentario
            <button @click="replyTo = null" class="text-primary-400 font-bold hover:underline">Cancelar</button>
          </p>
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

const route = useRoute()
const nameStore = useNameStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const gid = computed(() => route.params.gid as string)

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
const commentText = ref('')
const replyTo = ref<string | null>(null)

// Track rated names locally
const ratedNameIds = ref<Set<string>>(new Set())

const rootComments = computed(() => nameStore.comments.filter((c) => !c.parentId))

function getReplies(parentId: string) {
  return nameStore.comments.filter((c) => c.parentId === parentId)
}

function hasRated(nameId: string) {
  return ratedNameIds.value.has(nameId)
}

function canDelete(name: any) {
  if (!authStore.user) return false
  if (authStore.isRoot) return true
  if (name.proposedBy === authStore.user.id) return true
  return groupStore.currentGroup?.ownerId === authStore.user.id
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
  ratingScore.value = 0
}

async function submitRating() {
  if (!ratingScore.value || !ratingModal.value) return
  submitting.value = true
  try {
    await nameStore.rateName(ratingModal.value.id, ratingScore.value)
    ratedNameIds.value.add(ratingModal.value.id)
    ratingModal.value = null
  } finally {
    submitting.value = false
  }
}

// Comment toggle
const loadingRatings = ref(false)
const loadingComments = ref(false)

async function toggleComments(nameId: string) {
  showCommentsFor.value = nameId
  replyTo.value = null
  commentText.value = ''
  
  loadingRatings.value = true
  loadingComments.value = true
  
  try {
    await Promise.all([
      nameStore.fetchRatings(nameId),
      nameStore.fetchComments(nameId)
    ])
  } finally {
    loadingRatings.value = false
    loadingComments.value = false
  }
}

function handleReply(comment: any) {
  replyTo.value = comment.id
  // Scroll to bottom of modal to focus input
  const modalBody = document.querySelector('.modal-scroll-area')
  if (modalBody) modalBody.scrollTop = modalBody.scrollHeight
}

async function submitComment() {
  if (!commentText.value.trim() || !showCommentsFor.value) return
  await nameStore.addComment(showCommentsFor.value, commentText.value, replyTo.value || undefined)
  commentText.value = ''
  replyTo.value = null
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
