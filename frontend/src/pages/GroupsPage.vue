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
      <div class="card w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Crear grupo familiar</h2>
        <form @submit.prevent="handleCreate" class="space-y-6">
          <!-- Group Name -->
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre del grupo</label>
            <input v-model="newGroupName" class="input-field" placeholder="ej: Familia García" required autofocus />
          </div>

          <!-- Parents -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-400">Padres (mín. 1)</label>
              <button type="button" @click="addParent" class="text-xs text-primary-400 hover:text-primary-300">+ Añadir padre/madre</button>
            </div>
            <div v-for="(p, i) in parents" :key="i" class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 relative group">
              <input v-model="p.firstName" class="input-field text-sm" placeholder="Nombre" required />
              <input v-model="p.lastName1" class="input-field text-sm" placeholder="1º Apellido" required />
              <input v-model="p.lastName2" class="input-field text-sm" placeholder="2º Apellido" required />
              <button v-if="parents.length > 1" type="button" @click="removeParent(i)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
            </div>
          </div>

          <!-- Siblings -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-400">Hermanos (opcional)</label>
              <button type="button" @click="addSibling" class="text-xs text-primary-400 hover:text-primary-300">+ Añadir hermano/a</button>
            </div>
            <div v-for="(s, i) in siblings" :key="i" class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-800/10 rounded-xl border border-dashed border-gray-700/50 relative group">
              <input v-model="s.firstName" class="input-field text-sm" placeholder="Nombre" required />
              <input v-model="s.lastName1" class="input-field text-sm" placeholder="1º Apellido" required />
              <input v-model="s.lastName2" class="input-field text-sm" placeholder="2º Apellido" required />
              <button type="button" @click="removeSibling(i)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
            </div>
          </div>

          <!-- Preferred Surnames -->
          <div class="bg-primary-500/5 border border-primary-500/20 p-4 rounded-xl">
            <label class="block text-sm font-medium text-primary-300 mb-2">Apellidos preferentes para el bebé</label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <span class="text-[10px] text-gray-500 uppercase font-bold mb-1 block pl-1">Primer Apellido</span>
                <input v-model="preferredSurnames.lastName1" class="input-field text-sm" placeholder="Apellido 1" required />
              </div>
              <div>
                <span class="text-[10px] text-gray-500 uppercase font-bold mb-1 block pl-1">Segundo Apellido</span>
                <input v-model="preferredSurnames.lastName2" class="input-field text-sm" placeholder="Apellido 2" required />
              </div>
            </div>
            <p class="text-[11px] text-gray-500 mt-2 italic">Se usarán por defecto para visualizar cómo queda cada nombre propuesto.</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreate = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="creating">Crear grupo</button>
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

        <!-- Family Context Editing -->
        <div class="mb-6 space-y-4 pt-4 border-t border-gray-800">
          <h3 class="text-sm font-bold text-primary-400 flex items-center gap-2 uppercase tracking-wider">
            <span>👪</span> Contexto familiar (Padres/Hermanos)
          </h3>
          
          <!-- Parents in Settings -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-medium text-gray-500 uppercase">Padres</label>
              <button type="button" @click="addParent" class="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-tighter transition-colors">+ Añadir</button>
            </div>
            <div v-for="(p, i) in parents" :key="i" class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 relative group">
              <input v-model="p.firstName" class="input-field text-xs" placeholder="Nombre" required />
              <input v-model="p.lastName1" class="input-field text-xs" placeholder="1º Apellido" required />
              <input v-model="p.lastName2" class="input-field text-xs" placeholder="2º Apellido" required />
              <button v-if="parents.length > 1" type="button" @click="removeParent(i)" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
            </div>
          </div>

          <!-- Siblings in Settings -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-medium text-gray-500 uppercase">Hermanos</label>
              <button type="button" @click="addSibling" class="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-tighter transition-colors">+ Añadir</button>
            </div>
            <div v-for="(s, i) in siblings" :key="i" class="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-800/10 rounded-xl border border-dashed border-gray-700/50 relative group">
              <input v-model="s.firstName" class="input-field text-xs" placeholder="Nombre" required />
              <input v-model="s.lastName1" class="input-field text-xs" placeholder="1º Apellido" required />
              <input v-model="s.lastName2" class="input-field text-xs" placeholder="2º Apellido" required />
              <button type="button" @click="removeSibling(i)" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
            </div>
          </div>

          <!-- Preferred Surnames in Settings -->
          <div class="bg-primary-500/5 border border-primary-500/10 p-4 rounded-xl">
            <label class="block text-xs font-bold text-primary-300 mb-3 uppercase tracking-tighter">Apellidos preferentes para el bebé</label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <span class="text-[9px] text-gray-500 uppercase font-bold mb-1 block pl-1">Apellido 1</span>
                <input v-model="preferredSurnames.lastName1" class="input-field text-xs" required />
              </div>
              <div>
                <span class="text-[9px] text-gray-500 uppercase font-bold mb-1 block pl-1">Apellido 2</span>
                <input v-model="preferredSurnames.lastName2" class="input-field text-xs" required />
              </div>
            </div>
          </div>

          <button @click="handleUpdateFamily" class="btn-primary w-full text-xs py-2.5" :disabled="updatingFamily">
            {{ updatingFamily ? 'Guardando...' : '💾 Actualizar contexto familiar' }}
          </button>
        </div>

        <!-- Members list -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm text-gray-400">Miembros ({{ activeMembers.length }})</label>
            <button @click="showInvite = !showInvite" class="text-xs text-primary-400 hover:text-primary-300 font-medium">
              + Invitar
            </button>
          </div>

          <!-- Invite search autocomplete -->
          <div v-if="showInvite" class="mb-3 relative">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              class="input-field text-sm w-full"
              placeholder="Buscar por nombre o usuario..."
              autocomplete="off"
            />
            <!-- Search results dropdown -->
            <div
              v-if="searchResults.length > 0"
              class="absolute z-10 left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
            >
              <button
                v-for="user in searchResults"
                :key="user.id"
                @click="handleInviteUser(user)"
                class="w-full text-left px-3 py-2.5 hover:bg-gray-700/50 transition-colors flex items-center justify-between gap-2 border-b border-gray-700/50 last:border-b-0"
              >
                <div class="min-w-0">
                  <p class="text-sm text-white font-medium truncate">
                    {{ user.firstName }} {{ user.lastName }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">@{{ user.username }}</p>
                </div>
                <span class="text-xs text-primary-400 shrink-0">Invitar</span>
              </button>
            </div>
            <p v-if="searchQuery.length >= 2 && searchResults.length === 0 && !searching" class="text-xs text-gray-500 mt-1">
              No se encontraron usuarios
            </p>
          </div>

          <!-- Pending members -->
          <div v-for="m in pendingMembers" :key="m.userId" class="flex items-center justify-between py-2.5 px-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="text-xs text-amber-400 shrink-0">⏳</span>
              <div class="min-w-0">
                <p class="text-sm text-gray-300 truncate">{{ getMemberDisplay(m.userId) }}</p>
                <p class="text-xs text-gray-500 truncate">{{ getMemberSubtitle(m.userId) }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-slate-500">{{ m.role }}</span>
                  <span v-if="m.isInvolved" class="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium uppercase tracking-wider">Implicado</span>
                </div>
              </div>
            </div>
            <div class="flex gap-1 shrink-0 ml-2">
              <button v-if="m.status === 'pending'" @click="handleAcceptMember(m.userId)" class="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded hover:bg-green-600/30">Aceptar</button>
              <button @click="handleRemoveMember(m.userId)" class="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded hover:bg-red-600/30">Eliminar</button>
            </div>
          </div>

          <!-- Active members -->
          <div v-for="m in activeMembers" :key="m.userId" class="flex items-center justify-between py-2.5 px-3 bg-gray-800/30 rounded-lg mb-1">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="min-w-0">
                <p class="text-sm text-gray-300 truncate">{{ getMemberDisplay(m.userId) }}</p>
                <p class="text-xs text-gray-500 truncate">{{ getMemberSubtitle(m.userId) }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                    :class="m.role === 'admin' ? 'bg-primary-500/20 text-primary-300' : 'bg-gray-700 text-gray-400'">
                    {{ m.role }}
                  </span>
                  <span v-if="m.isInvolved" class="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium uppercase tracking-wider">Implicado</span>
                  <span v-if="m.userId === settingsGroup.ownerId" class="text-xs text-amber-400 shrink-0">👑</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <button 
                v-if="isAdmin && m.userId !== authStore.user?.id"
                @click="toggleInvolved(m.userId)"
                class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all duration-200 flex items-center gap-1.5 border"
                :class="m.isInvolved 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'"
                :title="m.isInvolved ? 'Quitar de implicados' : 'Marcar como implicado'"
              >
                <span class="text-xs">{{ m.isInvolved ? '✅' : '➕' }}</span>
                <span>{{ m.isInvolved ? 'Implicado' : 'Implicar' }}</span>
              </button>
              <button
                v-if="m.userId !== settingsGroup.ownerId"
                @click="handleRemoveMember(m.userId)"
                class="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Expulsar
              </button>
            </div>
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
      <!-- Pending invitations section -->
      <div v-if="groupStore.pendingInvitations.length > 0" class="mb-10">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">✉️</span> Invitaciones pendientes
          <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">{{ groupStore.pendingInvitations.length }}</span>
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in groupStore.pendingInvitations"
            :key="group.id"
            class="card border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-semibold text-lg text-white">{{ group.name }}</h3>
              <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full shrink-0">✉️ Invitación</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>👥 {{ getActiveCount(group) }} miembros</span>
              <span>📅 {{ new Date(group.createdAt).toLocaleDateString('es') }}</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="handleRespondInvitation(group.id, 'accept')"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all duration-200"
                :disabled="responding"
              >
                ✅ Aceptar
              </button>
              <button
                @click="handleRespondInvitation(group.id, 'reject')"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all duration-200"
                :disabled="responding"
              >
                ❌ Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Owned groups section -->
      <div v-if="groupStore.ownedGroups.length > 0" class="mb-10">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="text-xl">👑</span> Mis grupos (propietario)
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in groupStore.ownedGroups"
            :key="group.id"
            @click="selectGroup(group)"
            class="card cursor-pointer hover:border-primary-500/50 hover:shadow-primary-500/10 transition-all duration-300"
            :class="{ 'opacity-60 border-amber-500/20': group.closed }"
          >
            <!-- Header: name + settings -->
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg text-white flex-1 min-w-0 truncate">
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
            <div class="flex flex-wrap gap-1.5 mb-3">
              <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">👑 Propietario</span>
              <span v-if="group.closed" class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">🔒 Cerrado</span>
            </div>
            <!-- Info -->
            <div>
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
                <span class="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded-full">🤝 Miembro</span>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-4 text-sm text-gray-400">
              <span>👥 {{ getActiveCount(group) }} miembros</span>
              <span>📅 {{ new Date(group.createdAt).toLocaleDateString('es') }}</span>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-800/50">
              <button
                @click.stop="handleLeaveGroup(group)"
                class="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                🚪 Salir del grupo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore, type UserInfo } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'

const groupStore = useGroupStore()
const authStore = useAuthStore()
const router = useRouter()

const showCreate = ref(false)
const newGroupName = ref('')
const creating = ref(false)
const responding = ref(false)
const updatingFamily = ref(false)

// Genealogical data
const parents = ref([{ firstName: '', lastName1: '', lastName2: '' }])
const siblings = ref<{ firstName: string; lastName1: string; lastName2: string }[]>([])
const preferredSurnames = ref({ lastName1: '', lastName2: '' })

// Auto-suggest surnames based on parents
watch(parents, (newParents) => {
  if (newParents.length >= 1 && !preferredSurnames.value.lastName1) {
    preferredSurnames.value.lastName1 = newParents[0].lastName1
  }
  if (newParents.length >= 2 && !preferredSurnames.value.lastName2) {
    preferredSurnames.value.lastName2 = newParents[1].lastName1
  }
}, { deep: true })

// Settings modal state
const settingsGroup = ref<any>(null)
const editName = ref('')
const showInvite = ref(false)

// Search state
const searchQuery = ref('')
const searchResults = ref<UserInfo[]>([])
const searching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const activeMembers = computed(() =>
  settingsGroup.value?.members.filter((m: any) => m.status === 'active') || []
)
const pendingMembers = computed(() =>
  settingsGroup.value?.members.filter((m: any) => m.status === 'pending' || m.status === 'invited') || []
)

const isAdmin = computed(() => {
  if (authStore.isRoot) return true
  if (!settingsGroup.value || !authStore.user) return false
  const member = settingsGroup.value.members.find((m: any) => m.userId === authStore.user.id)
  return member?.role === 'admin'
})

const toggleInvolved = async (userId: string) => {
  if (!settingsGroup.value) return
  try {
    const updated = await groupStore.toggleInvolvedMember(settingsGroup.value.id, userId)
    settingsGroup.value = { ...updated }
  } catch (error) {
    console.error('Error toggling involved status:', error)
  }
}

onMounted(() => {
  groupStore.fetchGroups()
})

function getMemberDisplay(userId: string): string {
  const info = groupStore.getMemberInfo(userId)
  if (!info) return userId.slice(-8)
  return `${info.firstName} ${info.lastName}`
}

function getMemberSubtitle(userId: string): string {
  const info = groupStore.getMemberInfo(userId)
  if (!info) return ''
  return `@${info.username}`
}

function addParent() {
  parents.value.push({ firstName: '', lastName1: '', lastName2: '' })
}
function removeParent(index: number) {
  parents.value.splice(index, 1)
}
function addSibling() {
  siblings.value.push({ firstName: '', lastName1: '', lastName2: '' })
}
function removeSibling(index: number) {
  siblings.value.splice(index, 1)
}

async function handleCreate() {
  creating.value = true
  try {
    const group = await groupStore.createGroup(
      newGroupName.value,
      parents.value,
      siblings.value,
      preferredSurnames.value
    )
    newGroupName.value = ''
    parents.value = [{ firstName: '', lastName1: '', lastName2: '' }]
    siblings.value = []
    preferredSurnames.value = { lastName1: '', lastName2: '' }
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

async function openSettings(group: any) {
  settingsGroup.value = { ...group }
  editName.value = group.name
  showInvite.value = false
  searchQuery.value = ''
  searchResults.value = []
  
  // Initialize family data for editing
  parents.value = group.parents && group.parents.length > 0 
    ? group.parents.map((p: any) => ({ ...p }))
    : [{ firstName: '', lastName1: '', lastName2: '' }]
  siblings.value = group.siblings ? group.siblings.map((s: any) => ({ ...s })) : []
  preferredSurnames.value = group.preferredSurnames 
    ? { ...group.preferredSurnames }
    : { lastName1: '', lastName2: '' }

  // Load member details
  const memberIds = group.members.map((m: any) => m.userId)
  await groupStore.loadMemberDetails(memberIds)
}

async function handleUpdateFamily() {
  if (!settingsGroup.value) return
  updatingFamily.value = true
  try {
    const updated = await groupStore.updateGroupFamilyContext(
      settingsGroup.value.id,
      parents.value,
      siblings.value,
      preferredSurnames.value
    )
    settingsGroup.value = { ...updated }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al actualizar el contexto familiar')
  } finally {
    updatingFamily.value = false
  }
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const results = await groupStore.searchUsers(searchQuery.value)
      // Filter out already-members
      const memberIds = new Set(settingsGroup.value?.members.map((m: any) => m.userId) || [])
      searchResults.value = results.filter((u) => !memberIds.has(u.id))
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

async function handleInviteUser(user: UserInfo) {
  if (!settingsGroup.value) return
  try {
    const updated = await groupStore.inviteUser(settingsGroup.value.id, user.id)
    settingsGroup.value = { ...updated }
    searchQuery.value = ''
    searchResults.value = []
    // Add to member details cache
    groupStore.memberDetails.set(user.id, user)
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al invitar')
  }
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

async function handleRespondInvitation(groupId: string, action: 'accept' | 'reject') {
  responding.value = true
  try {
    await groupStore.respondToInvitation(groupId, action)
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al responder')
  } finally {
    responding.value = false
  }
}

async function handleLeaveGroup(group: any) {
  if (!confirm(`¿Seguro que quieres salir del grupo "${group.name}"?`)) return
  try {
    await groupStore.leaveGroup(group.id)
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al salir del grupo')
  }
}
</script>
