<template>
  <div class="animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-white">🏆 Ranking</h1>
        <p class="text-gray-400 mt-1">Los nombres mejor valorados</p>
      </div>
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
          <p class="text-sm text-gray-500">{{ name.totalRatings }} votos</p>
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

        <!-- Comment toggle -->
        <button @click="toggleComments(name.id)" class="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
          💬
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

        <textarea
          v-model="ratingComment"
          class="input-field mb-4"
          rows="3"
          placeholder="Comentario opcional..."
        />

        <div class="flex gap-3">
          <button @click="ratingModal = null" class="btn-secondary flex-1">Cancelar</button>
          <button @click="submitRating" class="btn-primary flex-1" :disabled="!ratingScore || submitting">
            {{ submitting ? 'Enviando...' : 'Votar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Comments section -->
    <div v-if="showCommentsFor" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" @click.self="showCommentsFor = null">
      <div class="card w-full sm:max-w-lg max-h-[80vh] flex flex-col animate-slide-up rounded-b-none sm:rounded-b-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg">Comentarios</h3>
          <button @click="showCommentsFor = null" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 mb-4">
          <div v-if="nameStore.comments.length === 0" class="text-center py-8 text-gray-500">
            No hay comentarios todavía
          </div>
          <div
            v-for="c in rootComments"
            :key="c.id"
            class="space-y-2"
          >
            <div class="bg-gray-800/50 rounded-xl p-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-primary-300">{{ c.userId.slice(-6) }}</span>
                <span class="text-xs text-gray-600">{{ new Date(c.createdAt).toLocaleDateString('es') }}</span>
              </div>
              <p class="text-sm text-gray-200">{{ c.text }}</p>
              <button @click="replyTo = c.id" class="text-xs text-gray-500 hover:text-primary-400 mt-1">Responder</button>
            </div>
            <!-- Replies -->
            <div v-for="r in getReplies(c.id)" :key="r.id" class="ml-6 bg-gray-800/30 rounded-xl p-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-primary-300">{{ r.userId.slice(-6) }}</span>
                <span class="text-xs text-gray-600">{{ new Date(r.createdAt).toLocaleDateString('es') }}</span>
              </div>
              <p class="text-sm text-gray-300">{{ r.text }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitComment" class="flex gap-2">
          <input v-model="commentText" class="input-field flex-1" :placeholder="replyTo ? 'Responder...' : 'Escribe un comentario...'" />
          <button type="submit" class="btn-primary px-4">→</button>
        </form>
        <p v-if="replyTo" class="text-xs text-gray-500 mt-1">
          Respondiendo a comentario
          <button @click="replyTo = null" class="text-primary-400 ml-1">Cancelar</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNameStore } from '@/stores/name'
import { useGroupStore } from '@/stores/group'

const route = useRoute()
const nameStore = useNameStore()
const groupStore = useGroupStore()

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
const ratingComment = ref('')
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
  ratingComment.value = ''
}

async function submitRating() {
  if (!ratingScore.value || !ratingModal.value) return
  submitting.value = true
  try {
    await nameStore.rateName(ratingModal.value.id, ratingScore.value, ratingComment.value)
    ratedNameIds.value.add(ratingModal.value.id)
    ratingModal.value = null
  } finally {
    submitting.value = false
  }
}

function toggleComments(nameId: string) {
  showCommentsFor.value = nameId
  replyTo.value = null
  commentText.value = ''
  nameStore.fetchComments(nameId)
}

async function submitComment() {
  if (!commentText.value.trim() || !showCommentsFor.value) return
  await nameStore.addComment(showCommentsFor.value, commentText.value, replyTo.value || undefined)
  commentText.value = ''
  replyTo.value = null
}
</script>
