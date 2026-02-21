<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-display font-bold text-white">Mis Grupos</h1>
        <p class="text-gray-400 mt-1">Gestiona tus grupos para elegir nombres</p>
      </div>
      <button @click="showCreate = true" class="btn-primary">+ Nuevo grupo</button>
    </div>

    <!-- Create group modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreate = false">
      <div class="card w-full max-w-md animate-scale-in">
        <h2 class="text-xl font-semibold mb-4">Crear grupo</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <input v-model="newGroupName" class="input-field" placeholder="Nombre del grupo (ej: Familia García)" required autofocus />
          <div class="flex gap-3">
            <button type="button" @click="showCreate = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="creating">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="groupStore.loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="groupStore.groups.length === 0" class="text-center py-20">
      <p class="text-6xl mb-4">👥</p>
      <p class="text-xl text-gray-400 mb-2">No tienes grupos todavía</p>
      <p class="text-sm text-gray-500 mb-6">Crea un grupo para empezar a proponer nombres</p>
      <button @click="showCreate = true" class="btn-primary">Crear mi primer grupo</button>
    </div>

    <!-- Groups list -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="group in groupStore.groups"
        :key="group.id"
        @click="selectGroup(group)"
        class="card cursor-pointer hover:border-primary-500/50 hover:shadow-primary-500/10 transition-all duration-300 group"
      >
        <div class="flex items-start justify-between">
          <h3 class="font-semibold text-lg text-white group-hover:text-primary-300 transition-colors">
            {{ group.name }}
          </h3>
          <span class="text-xs bg-primary-600/20 text-primary-300 px-2 py-1 rounded-full">
            {{ getMyRole(group) }}
          </span>
        </div>
        <div class="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span>👥 {{ group.members.filter((m: any) => m.status === 'active').length }} miembros</span>
          <span>📅 {{ new Date(group.createdAt).toLocaleDateString('es') }}</span>
        </div>
        <div v-if="getPendingCount(group) > 0" class="mt-2">
          <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
            ⏳ {{ getPendingCount(group) }} solicitudes pendientes
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'

const groupStore = useGroupStore()
const authStore = useAuthStore()
const router = useRouter()

const showCreate = ref(false)
const newGroupName = ref('')
const creating = ref(false)

onMounted(() => {
  groupStore.fetchGroups()
})

async function handleCreate() {
  creating.value = true
  try {
    const group = await groupStore.createGroup(newGroupName.value)
    newGroupName.value = ''
    showCreate.value = false
    selectGroup(group)
  } finally {
    creating.value = false
  }
}

function selectGroup(group: any) {
  groupStore.currentGroup = group
  router.push(`/groups/${group.id}`)
}

function getMyRole(group: any) {
  const member = group.members.find((m: any) => m.userId === authStore.user?.id)
  return member?.role === 'admin' ? 'Admin' : 'Miembro'
}

function getPendingCount(group: any) {
  return group.members.filter((m: any) => m.status === 'pending' || m.status === 'invited').length
}
</script>
