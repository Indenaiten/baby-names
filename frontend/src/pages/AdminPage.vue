<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-display font-bold text-white">⚙️ Admin</h1>
        <p class="text-gray-400 mt-1">Gestión de usuarios</p>
      </div>
      <button @click="showCreate = true" class="btn-primary">+ Nuevo usuario</button>
    </div>

    <!-- Create user modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreate = false">
      <div class="card w-full max-w-md animate-scale-in">
        <h2 class="text-xl font-semibold mb-4">Crear usuario</h2>
        <div v-if="createError" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {{ createError }}
        </div>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <input v-model="form.username" class="input-field" placeholder="Nombre de usuario" required />
          <input v-model="form.password" class="input-field" placeholder="Contraseña" type="password" required />
          <select v-model="form.role" class="input-field">
            <option value="user">Usuario</option>
            <option value="admin" v-if="authStore.isRoot">Administrador</option>
          </select>
          <div class="flex gap-3">
            <button type="button" @click="showCreate = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="creating">
              {{ creating ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reset password modal -->
    <div v-if="resetUser" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="resetUser = null">
      <div class="card w-full max-w-sm animate-scale-in">
        <h2 class="text-xl font-semibold mb-2">Reset password</h2>
        <p class="text-sm text-gray-400 mb-4">Resetear contraseña de <span class="text-white">@{{ resetUser.username }}</span></p>
        <form @submit.prevent="handleReset" class="space-y-4">
          <input v-model="resetPassword" class="input-field" placeholder="Nueva contraseña temporal" type="password" required autofocus />
          <div class="flex gap-3">
            <button type="button" @click="resetUser = null" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1" :disabled="resetting">
              {{ resetting ? 'Reseteando...' : 'Resetear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="userStore.loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- Users table -->
    <div v-else class="card overflow-hidden p-0">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Usuario</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Rol</th>
              <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Creado</th>
              <th class="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800/50">
            <tr v-for="user in userStore.users" :key="user.id" class="hover:bg-gray-800/30 transition-colors">
              <td class="px-6 py-4">
                <span class="font-medium text-white">{{ user.username }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                  :class="user.role === 'root' ? 'bg-amber-500/20 text-amber-300' : user.role === 'admin' ? 'bg-primary-500/20 text-primary-300' : 'bg-gray-700 text-gray-300'">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500 text-sm">{{ new Date(user.createdAt).toLocaleDateString('es') }}</td>
              <td class="px-6 py-4 text-right">
                <div v-if="user.role !== 'root' && canDelete(user)" class="flex items-center justify-end gap-3">
                  <button
                    @click="openReset(user)"
                    class="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    Reset Pass
                  </button>
                  <button
                    @click="handleDelete(user)"
                    class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
                <span v-else class="text-gray-600 text-sm">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()

const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')

const form = reactive({
  username: '',
  password: '',
  role: 'user',
})

// Reset pass state
const resetUser = ref<any>(null)
const resetPassword = ref('')
const resetting = ref(false)

onMounted(() => {
  userStore.fetchUsers()
})

async function handleCreate() {
  creating.value = true
  createError.value = ''
  try {
    await userStore.createUser(form.username, form.password, form.role)
    showCreate.value = false
    form.username = ''
    form.password = ''
    form.role = 'user'
  } catch (e: any) {
    createError.value = e.response?.data?.error || 'Error al crear usuario'
  } finally {
    creating.value = false
  }
}

function canDelete(user: any) {
  if (authStore.isRoot) return true
  if (authStore.isAdmin && user.role === 'user') return true
  return false
}

async function handleDelete(user: any) {
  if (confirm(`¿Eliminar al usuario ${user.username}?`)) {
    try {
      await userStore.deleteUser(user.id)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al eliminar')
    }
  }
}

function openReset(user: any) {
  resetUser.value = user
  resetPassword.value = ''
}

async function handleReset() {
  if (!resetUser.value || !resetPassword.value) return
  resetting.value = true
  try {
    await userStore.resetPassword(resetUser.value.id, resetPassword.value)
    alert('Contraseña reseteada correctamente. El usuario tendrá que cambiarla en su próximo login.')
    resetUser.value = null
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al resetear')
  } finally {
    resetting.value = false
  }
}
</script>
