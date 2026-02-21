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

    <!-- Group Settings Modal -->
    <div v-if="settingsGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="settingsGroup = null">
      <div class="card w-full max-w-lg animate-scale-in max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">⚙️ Administrar grupo</h2>
          <button @click="settingsGroup = null" class="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        <!-- Rename -->
        <div class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Nombre del grupo</label>
          <div class="flex gap-2">
            <input v-model="editName" class="input-field flex-1" />
            <button @click="handleRename" class="btn-primary px-4" :disabled="!editName || editName === settingsGroup.name">
              Guardar
            </button>
          </div>
        </div>

        <!-- Close/Reopen toggle -->
        <div class="mb-6 p-4 rounded-xl border" :class="settingsGroup.closed ? 'bg-amber-500/5 border-amber-500/30' : 'bg-gray-800/30 border-gray-700'">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-white">{{ settingsGroup.closed ? '🔒 Grupo cerrado' : '🔓 Grupo abierto' }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ settingsGroup.closed
                  ? 'No se permiten nuevos nombres, votos ni comentarios'
                  : 'Los miembros pueden proponer nombres, votar y comentar' }}
              </p>
            </div>
            <button @click="handleToggleClose" class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="settingsGroup.closed
                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'">
              {{ settingsGroup.closed ? 'Reabrir' : 'Cerrar' }}
            </button>
          </div>
        </div>

        <!-- Members list -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm text-gray-400">Miembros ({{ activeMembers.length }})</label>
            <button @click="showInvite = !showInvite" class="text-xs text-primary-400 hover:text-primary-300 font-medium">
              + Invitar
            </button>
          </div>

          <!-- Invite input -->
          <div v-if="showInvite" class="mb-3 flex gap-2">
            <input v-model="inviteUserId" class="input-field flex-1 text-sm" placeholder="ID del usuario a invitar" />
            <button @click="handleInvite" class="btn-primary text-sm px-3" :disabled="!inviteUserId">Invitar</button>
          </div>

          <!-- Pending members -->
          <div v-for="m in pendingMembers" :key="m.userId" class="flex items-center justify-between py-2 px-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs text-amber-400">⏳</span>
              <span class="text-sm text-gray-300">{{ m.userId.slice(-8) }}</span>
              <span class="text-xs text-amber-400">{{ m.status }}</span>
            </div>
            <div class="flex gap-1">
              <button v-if="m.status === 'pending'" @click="handleAcceptMember(m.userId)" class="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded hover:bg-green-600/30">Aceptar</button>
              <button @click="handleRemoveMember(m.userId)" class="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded hover:bg-red-600/30">Eliminar</button>
            </div>
          </div>

          <!-- Active members -->
          <div v-for="m in activeMembers" :key="m.userId" class="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg mb-1">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-300">{{ m.userId.slice(-8) }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded-full"
                :class="m.role === 'admin' ? 'bg-primary-500/20 text-primary-300' : 'bg-gray-700 text-gray-400'">
                {{ m.role }}
              </span>
              <span v-if="m.userId === settingsGroup.ownerId" class="text-xs text-amber-400">👑 propietario</span>
            </div>
            <button
              v-if="m.userId !== settingsGroup.ownerId"
              @click="handleRemoveMember(m.userId)"
              class="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Expulsar
            </button>
          </div>
        </div>

        <!-- Delete group -->
        <div class="border-t border-gray-800 pt-4">
          <button
            @click="handleDelete"
            class="btn-danger w-full text-sm"
          >
            🗑️ Eliminar grupo permanentemente
          </button>
        </div>
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

    <div v-else>
      <!-- Owned groups section -->
      <div v-if="groupStore.ownedGroups.length > 0" class="mb-10">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">👑</span> Mis grupos (propietario)
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in groupStore.ownedGroups"
            :key="group.id"
            class="card cursor-pointer hover:border-primary-500/50 hover:shadow-primary-500/10 transition-all duration-300"
            :class="{ 'opacity-60 border-amber-500/20': group.closed }"
          >
            <!-- Header: name + settings -->
            <div class="flex items-center gap-2 mb-2">
              <h3 @click="selectGroup(group)" class="font-semibold text-lg text-white flex-1 min-w-0 truncate">
                {{ group.name }}
              </h3>
              <button
                @click.stop="openSettings(group)"
                class="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-sm shrink-0"
                title="Administrar grupo"
              >
                ⚙️
              </button>
            </div>
            <!-- Badges -->
            <div @click="selectGroup(group)" class="flex flex-wrap gap-1.5 mb-3">
              <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">👑 Propietario</span>
              <span v-if="group.closed" class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">🔒 Cerrado</span>
            </div>
            <!-- Info -->
            <div @click="selectGroup(group)">
              <div class="flex items-center gap-4 text-sm text-gray-400">
                <span>👥 {{ getActiveCount(group) }} miembros</span>
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
      </div>

      <!-- Invited groups section -->
      <div v-if="groupStore.invitedGroups.length > 0">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">🤝</span> Grupos donde participo
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in groupStore.invitedGroups"
            :key="group.id"
            @click="selectGroup(group)"
            class="card cursor-pointer hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all duration-300"
            :class="{ 'opacity-60': group.closed }"
          >
            <div class="flex items-start justify-between">
              <h3 class="font-semibold text-lg text-white">
                {{ group.name }}
              </h3>
              <div class="flex items-center gap-1.5">
                <span v-if="group.closed" class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">🔒 Cerrado</span>
                <span class="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded-full">🤝 Invitado</span>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-4 text-sm text-gray-400">
              <span>👥 {{ getActiveCount(group) }} miembros</span>
              <span>📅 {{ new Date(group.createdAt).toLocaleDateString('es') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'

const groupStore = useGroupStore()
const authStore = useAuthStore()
const router = useRouter()

const showCreate = ref(false)
const newGroupName = ref('')
const creating = ref(false)

// Settings modal state
const settingsGroup = ref<any>(null)
const editName = ref('')
const showInvite = ref(false)
const inviteUserId = ref('')

const activeMembers = computed(() =>
  settingsGroup.value?.members.filter((m: any) => m.status === 'active') || []
)
const pendingMembers = computed(() =>
  settingsGroup.value?.members.filter((m: any) => m.status === 'pending' || m.status === 'invited') || []
)

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

function openSettings(group: any) {
  settingsGroup.value = { ...group }
  editName.value = group.name
  showInvite.value = false
  inviteUserId.value = ''
}

async function handleRename() {
  if (!editName.value || !settingsGroup.value) return
  try {
    const updated = await groupStore.renameGroup(settingsGroup.value.id, editName.value)
    settingsGroup.value = { ...updated }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al renombrar')
  }
}

async function handleToggleClose() {
  if (!settingsGroup.value) return
  try {
    const updated = await groupStore.closeGroup(settingsGroup.value.id, !settingsGroup.value.closed)
    settingsGroup.value = { ...updated }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al cambiar estado')
  }
}

async function handleInvite() {
  if (!inviteUserId.value || !settingsGroup.value) return
  try {
    const updated = await groupStore.inviteUser(settingsGroup.value.id, inviteUserId.value)
    settingsGroup.value = { ...updated }
    inviteUserId.value = ''
    showInvite.value = false
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al invitar')
  }
}

async function handleAcceptMember(userId: string) {
  if (!settingsGroup.value) return
  try {
    const updated = await groupStore.acceptMember(settingsGroup.value.id, userId)
    settingsGroup.value = { ...updated }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error')
  }
}

async function handleRemoveMember(userId: string) {
  if (!settingsGroup.value) return
  if (!confirm('¿Expulsar a este miembro del grupo?')) return
  try {
    const updated = await groupStore.removeMember(settingsGroup.value.id, userId)
    settingsGroup.value = { ...updated }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error')
  }
}

async function handleDelete() {
  if (!settingsGroup.value) return
  if (!confirm(`¿Eliminar el grupo "${settingsGroup.value.name}" permanentemente? Esta acción no se puede deshacer.`)) return
  try {
    await groupStore.deleteGroup(settingsGroup.value.id)
    settingsGroup.value = null
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al eliminar')
  }
}

function getActiveCount(group: any) {
  return group.members.filter((m: any) => m.status === 'active').length
}

function getPendingCount(group: any) {
  return group.members.filter((m: any) => m.status === 'pending' || m.status === 'invited').length
}
</script>
