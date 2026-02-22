<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md animate-fade-in">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-display font-bold bg-gradient-to-r from-primary-400 via-pink-400 to-baby-pink bg-clip-text text-transparent mb-2">
          👶 BabyNames
        </h1>
        <p class="text-gray-400">Elige el nombre perfecto para tu bebé</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-center mb-6">Iniciar sesión</h2>

        <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center animate-scale-in">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Usuario</label>
            <input
              v-model="identifier"
              type="text"
              class="input-field"
              placeholder="Tu nombre de usuario"
              required
              autofocus
            />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Contraseña</label>
            <input
              v-model="password"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Entrando...
            </span>
            <span v-else>Entrar</span>
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-600 mt-6">
        ¿No tienes cuenta? Pide a un administrador que te cree una.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const identifier = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(identifier.value, password.value)
    router.push('/groups')
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
