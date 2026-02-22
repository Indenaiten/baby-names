import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

interface User {
  id: string
  username: string
  role: string
  createdAt: string
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      const { data } = await api.get('/users')
      users.value = data
    } finally {
      loading.value = false
    }
  }

  async function createUser(username: string, password: string, role: string) {
    const { data } = await api.post('/users', { username, password, role })
    users.value.unshift(data)
    return data
  }

  async function deleteUser(userId: string) {
    await api.delete(`/users/${userId}`)
    users.value = users.value.filter((u) => u.id !== userId)
  }

  async function resetPassword(userId: string, newPassword: string) {
    await api.post(`/users/${userId}/reset-password`, { newPassword })
  }

  async function updateUserRole(userId: string, role: string) {
    await api.patch(`/users/${userId}/role`, { role })
    const user = users.value.find((u) => u.id === userId)
    if (user) user.role = role
  }

  return { users, loading, fetchUsers, createUser, deleteUser, resetPassword, updateUserRole }
})
