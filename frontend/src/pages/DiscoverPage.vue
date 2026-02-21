<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-display font-bold text-white mb-2">🔮 Descubrir</h1>
    <p class="text-gray-400 mb-8">Vota nombres que aún no has valorado, uno a uno</p>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- All done -->
    <div v-else-if="!currentName" class="text-center py-20 animate-scale-in">
      <p class="text-7xl mb-4">🎉</p>
      <h2 class="text-2xl font-display font-bold text-white mb-2">¡Todo votado!</h2>
      <p class="text-gray-400 mb-6">Has valorado todos los nombres disponibles</p>
      <router-link :to="`/groups/${gid}`" class="btn-primary">Ver ranking</router-link>
    </div>

    <!-- Name card -->
    <div v-else class="max-w-md mx-auto">
      <div class="text-center text-sm text-gray-500 mb-4">
        {{ currentIndex + 1 }} de {{ totalUnrated }}
      </div>

      <div
        :key="currentName.id"
        class="card text-center py-10 animate-scale-in relative overflow-hidden"
      >
        <!-- Decorative gradient -->
        <div class="absolute inset-0 bg-gradient-to-br opacity-5"
          :class="currentName.gender === 'boy' ? 'from-blue-500 to-blue-700' : currentName.gender === 'girl' ? 'from-pink-500 to-pink-700' : 'from-emerald-500 to-emerald-700'"
        />

        <div class="relative z-10">
          <span :class="genderBadgeClass(currentName.gender)" class="mb-4 inline-block">
            {{ genderLabel(currentName.gender) }}
          </span>
          <h2 class="text-4xl font-display font-bold text-white mb-2">{{ currentName.name }}</h2>
          <div class="flex flex-col items-center gap-1">
            <p class="text-[10px] text-gray-500 uppercase tracking-tighter font-bold bg-white/5 px-2 py-0.5 rounded backdrop-blur">
              👤 Propuesto por {{ currentName.proposerName || '...' }}
            </p>
            <p class="text-gray-500 text-sm">
              {{ currentName.totalRatings }} votos ·
              {{ currentName.averageScore > 0 ? `${currentName.averageScore.toFixed(1)} ⭐` : 'Sin votos' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Score selector -->
      <div class="mt-6">
        <p class="text-center text-sm text-gray-400 mb-3">Tu puntuación</p>
        <div class="flex justify-center gap-2 flex-wrap">
          <button
            v-for="n in 10"
            :key="n"
            @click="score = n"
            class="w-11 h-11 rounded-full font-bold text-sm transition-all duration-200"
            :class="score === n
              ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/40'
              : score > 0 && n <= score
                ? 'bg-primary-500/30 text-primary-300'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <!-- Comment -->
      <textarea
        v-model="comment"
        class="input-field mt-4"
        rows="2"
        placeholder="Comentario opcional..."
      />

      <!-- Actions -->
      <div class="flex gap-3 mt-4">
        <button @click="skip" class="btn-secondary flex-1">Saltar</button>
        <button @click="submitVote" class="btn-primary flex-1" :disabled="!score || submitting">
          {{ submitting ? 'Enviando...' : `Votar ${score || ''}` }}
        </button>
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

const loading = ref(true)
const currentIndex = ref(0)
const score = ref(0)
const comment = ref('')
const submitting = ref(false)
const totalUnrated = ref(0)

const currentName = computed(() => {
  if (currentIndex.value < nameStore.unratedNames.length) {
    return nameStore.unratedNames[currentIndex.value]
  }
  return null
})

onMounted(async () => {
  await nameStore.fetchUnratedNames(gid.value)
  totalUnrated.value = nameStore.unratedNames.length
  loading.value = false
})

async function submitVote() {
  if (!score.value || !currentName.value) return
  submitting.value = true
  try {
    await nameStore.rateName(currentName.value.id, score.value, comment.value)
    nextName()
  } finally {
    submitting.value = false
  }
}

function skip() {
  currentIndex.value++
  score.value = 0
  comment.value = ''
}

function nextName() {
  currentIndex.value++
  score.value = 0
  comment.value = ''
}

function genderBadgeClass(gender: string) {
  return gender === 'boy' ? 'gender-badge-boy' : gender === 'girl' ? 'gender-badge-girl' : 'gender-badge-unisex'
}

function genderLabel(gender: string) {
  return gender === 'boy' ? '♂ Niño' : gender === 'girl' ? '♀ Niña' : '⚥ Unisex'
}
</script>
