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
          <router-link :to="`/groups/${groupStore.currentGroup.id}/add`" class="nav-link" active-class="active">
            <span>✨</span> Proponer nombre
          </router-link>
          <router-link :to="`/groups/${groupStore.currentGroup.id}/my-names`" class="nav-link" active-class="active">
            <span>📝</span> Mis nombres
          </router-link>
          <router-link :to="`/groups/${groupStore.currentGroup.id}/discover`" class="nav-link" active-class="active">
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

      <!-- Mobile bottom nav -->
      <nav v-if="groupStore.currentGroup" class="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/50 z-50 px-2 py-1 flex justify-around">
        <router-link :to="`/groups/${groupStore.currentGroup.id}`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">🏆</span>
          <span>Ranking</span>
        </router-link>
        <router-link :to="`/groups/${groupStore.currentGroup.id}/add`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">✨</span>
          <span>Añadir</span>
        </router-link>
        <router-link :to="`/groups/${groupStore.currentGroup.id}/my-names`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
          <span class="text-lg">📝</span>
          <span>Mis nombres</span>
        </router-link>
        <router-link :to="`/groups/${groupStore.currentGroup.id}/discover`" class="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-white text-xs" active-class="!text-primary-400">
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useGroupStore } from '@/stores/group'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const groupStore = useGroupStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
