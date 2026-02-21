import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

interface GroupMember {
  userId: string
  role: string
  status: string
  joinedAt: string
}

interface Group {
  id: string
  name: string
  ownerId: string
  members: GroupMember[]
  createdAt: string
}

export const useGroupStore = defineStore('group', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const loading = ref(false)

  async function fetchGroups() {
    loading.value = true
    try {
      const { data } = await api.get('/groups')
      groups.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchGroup(id: string) {
    const { data } = await api.get(`/groups/${id}`)
    currentGroup.value = data
    return data
  }

  async function createGroup(name: string) {
    const { data } = await api.post('/groups', { name })
    groups.value.unshift(data)
    return data
  }

  async function inviteUser(groupId: string, userId: string) {
    const { data } = await api.post(`/groups/${groupId}/invite`, { userId })
    currentGroup.value = data
    return data
  }

  async function joinGroup(groupId: string) {
    const { data } = await api.post(`/groups/${groupId}/join`)
    return data
  }

  async function acceptMember(groupId: string, userId: string) {
    const { data } = await api.put(`/groups/${groupId}/members/${userId}`, { action: 'accept' })
    currentGroup.value = data
    return data
  }

  async function removeMember(groupId: string, userId: string) {
    const { data } = await api.put(`/groups/${groupId}/members/${userId}`, { action: 'remove' })
    currentGroup.value = data
    return data
  }

  return {
    groups, currentGroup, loading,
    fetchGroups, fetchGroup, createGroup,
    inviteUser, joinGroup, acceptMember, removeMember,
  }
})
