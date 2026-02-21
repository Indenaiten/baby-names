<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-display font-bold text-white mb-2">📝 Mis nombres</h1>
    <p class="text-gray-400 mb-6">Nombres que has propuesto y votado</p>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'proposed'"
        class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        :class="activeTab === 'proposed' ? 'bg-primary-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'"
      >
        ✨ Propuestos ({{ nameStore.myNames.length }})
      </button>
      <button
        @click="activeTab = 'voted'"
        class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        :class="activeTab === 'voted' ? 'bg-primary-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'"
      >
        ⭐ Votados ({{ nameStore.myRatings.length }})
      </button>
    </div>

    <!-- Proposed names -->
    <div v-if="activeTab === 'proposed'">
      <div v-if="nameStore.myNames.length === 0" class="text-center py-16">
        <p class="text-5xl mb-4">✨</p>
        <p class="text-gray-400">No has propuesto nombres todavía</p>
        <router-link :to="`/groups/${gid}/add`" class="btn-primary inline-block mt-4">Proponer uno</router-link>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="name in nameStore.myNames"
          :key="name.id"
          class="card flex items-center gap-4"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-white">{{ name.name }}</h3>
              <span :class="genderBadgeClass(name.gender)">{{ genderLabel(name.gender) }}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ name.totalRatings }} votos · Promedio: {{ name.averageScore > 0 ? name.averageScore.toFixed(1) : '—' }}</p>
          </div>
          <div class="score-pill" v-if="name.averageScore > 0">
            ⭐ {{ name.averageScore.toFixed(1) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Voted names -->
    <div v-if="activeTab === 'voted'">
      <div v-if="nameStore.myRatings.length === 0" class="text-center py-16">
        <p class="text-5xl mb-4">⭐</p>
        <p class="text-gray-400">No has votado nombres todavía</p>
        <router-link :to="`/groups/${gid}/discover`" class="btn-primary inline-block mt-4">Descubrir nombres</router-link>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="rating in nameStore.myRatings"
          :key="rating.id"
          class="card flex items-center gap-4 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all duration-300 cursor-pointer group"
          @click="openDetails(rating.nameId)"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-white">{{ getNameFromRating(rating.nameId)?.name || 'Cargando...' }}</h3>
              <span v-if="getNameFromRating(rating.nameId)" :class="genderBadgeClass(getNameFromRating(rating.nameId).gender)">
                {{ genderLabel(getNameFromRating(rating.nameId).gender) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <p class="text-[10px] text-gray-500 uppercase tracking-tighter font-bold bg-gray-800 px-1.5 py-0.5 rounded">
                👤 {{ getNameFromRating(rating.nameId)?.proposerName || '...' }}
              </p>
              <p class="text-xs text-gray-500 italic">Tu voto: "{{ rating.comment || rating.score }}"</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-600/20 text-primary-300 flex items-center justify-center font-bold shadow-inner">
              {{ rating.score }}
            </div>
            <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-all shadow-sm">
              👁️
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
          </h3>
          <button @click="selectedNameId = null" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 modal-scroll-area custom-scrollbar">
          <NameDetails 
            :name="getNameFromRating(selectedNameId)" 
            :ratings="nameStore.ratings"
            :comments="nameStore.comments"
            :loadingRatings="loadingRatings"
            :loadingComments="loadingComments"
            @reply="handleReply"
          />
        </div>

        <div class="p-4 bg-gray-900/50 border-t border-gray-800">
          <form @submit.prevent="submitComment" class="flex gap-2">
            <input v-model="commentText" class="input-field flex-1" :placeholder="replyTo ? 'Responder...' : 'Escribe un comentario...'" />
            <button type="submit" class="btn-primary px-4">→</button>
          </form>
          <p v-if="replyTo" class="text-[10px] text-gray-500 mt-2 flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-primary-500"></span>
            Respondiendo a comentario <button @click="replyTo = null" class="text-primary-400 font-bold ml-1">Cancelar</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNameStore } from '@/stores/name'

const route = useRoute()
const nameStore = useNameStore()
const gid = computed(() => route.params.gid as string)
const activeTab = ref('proposed')

const selectedNameId = ref<string | null>(null)
const loadingRatings = ref(false)
const loadingComments = ref(false)
const commentText = ref('')
const replyTo = ref<string | null>(null)

onMounted(async () => {
  await nameStore.fetchMyNames(gid.value)
  await nameStore.fetchMyRatings(gid.value)
  // Also fetch all names to have context for ratings (proposer names, etc)
  if (nameStore.names.length === 0) {
    nameStore.fetchNames(gid.value)
  }
})

function getNameFromRating(nameId: string) {
  return nameStore.names.find(n => n.id === nameId) || nameStore.myNames.find(n => n.id === nameId)
}

async function openDetails(nameId: string) {
  selectedNameId.value = nameId
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
}

async function submitComment() {
  if (!commentText.value.trim() || !selectedNameId.value) return
  await nameStore.addComment(selectedNameId.value, commentText.value, replyTo.value || undefined)
  commentText.value = ''
  replyTo.value = null
}

function genderBadgeClass(gender: string) {
  return gender === 'boy' ? 'gender-badge-boy' : gender === 'girl' ? 'gender-badge-girl' : 'gender-badge-unisex'
}

function genderLabel(gender: string) {
  return gender === 'boy' ? '♂ Niño' : gender === 'girl' ? '♀ Niña' : '⚥ Unisex'
}
</script>

<script lang="ts">
import NameDetails from '@/components/NameDetails.vue'
export default {
  components: { NameDetails }
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
