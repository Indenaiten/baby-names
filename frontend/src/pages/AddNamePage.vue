<template>
  <div class="animate-fade-in max-w-lg mx-auto">
    <h1 class="text-3xl font-display font-bold text-white mb-2">✨ Proponer nombre</h1>
    <p class="text-gray-400 mb-8">Sugiere un nombre para el bebé</p>

    <div v-if="success" class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center animate-scale-in">
      ¡Nombre "{{ success }}" añadido con éxito! 🎉
    </div>

    <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center animate-scale-in">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="card space-y-6">
      <!-- Name input -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Nombre</label>
        <input
          v-model="name"
          class="input-field text-lg"
          placeholder="Escribe un nombre..."
          required
          autofocus
        />
      </div>

      <!-- Description input -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Descripción (opcional)</label>
        <textarea
          v-model="description"
          class="input-field min-h-[100px] py-3"
          placeholder="¿Por qué este nombre? ¿Qué significa?"
        ></textarea>
      </div>

      <!-- Gender selection -->
      <div>
        <label class="block text-sm text-gray-400 mb-3">Género</label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="g in genders"
            :key="g.value"
            type="button"
            @click="gender = g.value"
            class="py-4 rounded-xl border-2 transition-all duration-200 text-center"
            :class="gender === g.value
              ? g.activeClass
              : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'"
          >
            <span class="text-2xl block mb-1">{{ g.icon }}</span>
            <span class="text-sm font-medium">{{ g.label }}</span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="btn-primary w-full text-lg py-3"
        :disabled="!name || !gender || submitting"
      >
        {{ submitting ? 'Añadiendo...' : 'Proponer nombre' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNameStore } from '@/stores/name'

const route = useRoute()
const nameStore = useNameStore()

const gid = computed(() => route.params.gid as string)
const name = ref('')
const description = ref('')
const gender = ref('')
const submitting = ref(false)
const success = ref('')
const error = ref('')

const genders = [
  { value: 'girl', label: 'Niña', icon: '👧', activeClass: 'border-pink-500 bg-pink-500/10 text-pink-300' },
  { value: 'boy', label: 'Niño', icon: '👦', activeClass: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { value: 'unisex', label: 'Unisex', icon: '🌈', activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
]

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    await nameStore.proposeName(gid.value, name.value, gender.value, description.value)
    success.value = name.value
    name.value = ''
    description.value = ''
    gender.value = ''
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al añadir el nombre'
  } finally {
    submitting.value = false
  }
}
</script>
