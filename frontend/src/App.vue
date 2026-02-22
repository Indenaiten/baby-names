<template>
  <div class="min-h-screen bg-gray-950">
    <router-view v-if="$route.meta.guest" />
    <div v-else class="flex flex-col lg:flex-row min-h-screen">
      <!-- Sidebar (desktop) -->
      <aside class="hidden lg:flex lg:flex-col w-64 bg-gray-900/50 border-r border-gray-800/50 p-4 fixed h-full">
        <div class="mb-8">
          <h1 class="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-pink-400 bg-clip-text text-transparent">
            👶 BabyNames
          </h1>
          <p class="text-xs text-gray-500 mt-1">Elige el nombre perfecto</p>
        </div>

        <!-- Group selector -->
        <div v-if="groupStore.currentGroup" class="mb-6">
          <label class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Grupo actual</label>
          <router-link to="/groups" class="mt-1 flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
            <span class="text-sm font-medium text-primary-300">{{ groupStore.currentGroup.name }}</span>
            <span class="ml-auto text-xs text-gray-500">⇄</span>
          </router-link>
        </div>

        <nav class="flex-1 space-y-1" v-if="groupStore.currentGroup">
          <router-link :to="`/groups/${groupStore.currentGroup.id}`" class="nav-link" active-class="active">
            <span>🏆</span> Ranking
          </router-link>
          <router-link v-if="!groupStore.currentGroup.closed" :to="`/groups/${groupStore.currentGroup.id}/add`" class="nav-link" active-class="active">
            <span>✨</span> Proponer nombre
          </router-link>
          <router-link :to="`/groups/${groupStore.currentGroup.id}/my-names`" class="nav-link" active-class="active">
            <span>📝</span> Mis nombres
          </router-link>
          <router-link v-if="!groupStore.currentGroup.closed" :to="`/groups/${groupStore.currentGroup.id}/discover`" class="nav-link" active-class="active">
            <span>🔮</span> Descubrir
          </router-link>
        </nav>

        <nav class="flex-1 space-y-1" v-else>
          <router-link to="/groups" class="nav-link" active-class="active">
            <span>👥</span> Mis grupos
          </router-link>
        </nav>

        <div class="border-t border-gray-800/50 pt-4 space-y-1">
          <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link" active-class="active">
            <span>⚙️</span> Admin
          </router-link>
          <button @click="handleLogout" class="nav-link w-full text-left text-red-400 hover:text-red-300">
            <span>🚪</span> Salir
          </button>
        </div>

        <div class="mt-4 px-3 py-2 bg-gray-800/30 rounded-lg">
          <p class="text-xs text-gray-500">Conectado como</p>
          <p class="text-sm font-medium text-gray-300">{{ authStore.user?.username }}</p>
          <p class="text-xs text-gray-500">{{ authStore.user?.role }}</p>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800/50 sticky top-0 z-40 backdrop-blur-md">
        <h1 class="text-lg font-display font-bold bg-gradient-to-r from-primary-400 to-pink-400 bg-clip-text text-transparent">
          👶 BabyNames
        </h1>
        <div class="flex items-center gap-2">
          <router-link v-if="authStore.isAdmin" to="/admin" class="p-2 text-gray-400 hover:text-white transition-colors" title="Administración">
            <span class="text-lg">⚙️</span>
          </router-link>
          <button @click="handleLogout" class="p-2 text-red-400 hover:text-red-300 transition-colors" title="Cerrar sesión">
            <span class="text-lg">🚪</span>
          </button>
        </div>
      </header>

      <!-- Mobile bottom nav -->
      <nav v-if="groupStore.currentGroup" class="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/50 z-50 px-2 py-1 flex justify-around">
        <router-link :to="`/groups/${groupStore.currentGroup.id}`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">🏆</span>
          <span>Ranking</span>
        </router-link>
        <router-link v-if="!groupStore.currentGroup.closed" :to="`/groups/${groupStore.currentGroup.id}/add`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">✨</span>
          <span>Añadir</span>
        </router-link>
        <router-link :to="`/groups/${groupStore.currentGroup.id}/my-names`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">📝</span>
          <span>Mis nombres</span>
        </router-link>
        <router-link v-if="!groupStore.currentGroup.closed" :to="`/groups/${groupStore.currentGroup.id}/discover`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">🔮</span>
          <span>Descubrir</span>
        </router-link>
        <router-link to="/groups" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">👥</span>
          <span>Grupos</span>
        </router-link>
      </nav>

      <!-- Main content -->
      <main class="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div class="max-w-5xl mx-auto px-4 py-6">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Mandatory Change Password Modal -->
    <div v-if="authStore.user?.mustChangePassword" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="card w-full max-w-md animate-scale-in">
        <div class="text-center mb-6">
          <span class="text-4xl mb-3 block">🔐</span>
          <h2 class="text-2xl font-bold text-white">Cambio de contraseña</h2>
          <p class="text-gray-400 mt-1">Por seguridad, debes cambiar tu contraseña para continuar</p>
        </div>

        <div v-if="changeError" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {{ changeError }}
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Nueva contraseña</label>
            <input v-model="changeForm.newPassword" type="password" class="input-field" placeholder="Mínimo 8 caracteres" required minlength="8" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Confirmar nueva contraseña</label>
            <input v-model="changeForm.confirmPassword" type="password" class="input-field" placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn-primary w-full mt-2" :disabled="changing">
            {{ changing ? 'Cambiando...' : 'Cambiar y continuar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useGroupStore } from '@/stores/group'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const groupStore = useGroupStore()
const router = useRouter()

// Change password state
import { reactive, ref } from 'vue'
import api from '@/services/api'

const changing = ref(false)
const changeError = ref('')
const changeForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

async function handleChangePassword() {
  if (changeForm.newPassword !== changeForm.confirmPassword) {
    changeError.value = 'Las contraseñas no coinciden'
    return
  }

  changing.value = true
  changeError.value = ''
  try {
    await api.post('/users/me/change-password', {
      newPassword: changeForm.newPassword
    })
    
    // Update local user state
    if (authStore.user) {
      authStore.user.mustChangePassword = false
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (e: any) {
    changeError.value = e.response?.data?.error || 'Error al cambiar contraseña'
  } finally {
    changing.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
