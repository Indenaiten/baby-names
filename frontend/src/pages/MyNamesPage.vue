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
          class="card flex items-center gap-4"
        >
          <div class="flex-1">
            <p class="text-sm text-gray-500">Tu voto</p>
            <p v-if="rating.comment" class="text-sm text-gray-400 mt-1 italic">"{{ rating.comment }}"</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary-600/20 text-primary-300 flex items-center justify-center font-bold">
            {{ rating.score }}
          </div>
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

onMounted(() => {
  nameStore.fetchMyNames(gid.value)
  nameStore.fetchMyRatings(gid.value)
})

function genderBadgeClass(gender: string) {
  return gender === 'boy' ? 'gender-badge-boy' : gender === 'girl' ? 'gender-badge-girl' : 'gender-badge-unisex'
}

function genderLabel(gender: string) {
  return gender === 'boy' ? '♂ Niño' : gender === 'girl' ? '♀ Niña' : '⚥ Unisex'
}
</script>
