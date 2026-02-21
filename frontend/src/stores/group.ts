import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

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
  closed: boolean
  createdAt: string
}

export interface UserInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export const useGroupStore = defineStore('group', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const loading = ref(false)
  const memberDetails = ref<Map<string, UserInfo>>(new Map())

  const ownedGroups = computed(() => {
    const authStore = useAuthStore()
    return groups.value.filter((g) => g.ownerId === authStore.user?.id)
  })

  const invitedGroups = computed(() => {
    const authStore = useAuthStore()
    return groups.value.filter((g) => g.ownerId !== authStore.user?.id)
  })

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

  async function renameGroup(groupId: string, name: string) {
    const { data } = await api.put(`/groups/${groupId}/rename`, { name })
    currentGroup.value = data
    const idx = groups.value.findIndex((g) => g.id === groupId)
    if (idx !== -1) groups.value[idx] = data
    return data
  }

  async function closeGroup(groupId: string, closed: boolean) {
    const { data } = await api.put(`/groups/${groupId}/close`, { closed })
    currentGroup.value = data
    const idx = groups.value.findIndex((g) => g.id === groupId)
    if (idx !== -1) groups.value[idx] = data
    return data
  }

  async function deleteGroup(groupId: string) {
    await api.delete(`/groups/${groupId}`)
    groups.value = groups.value.filter((g) => g.id !== groupId)
    if (currentGroup.value?.id === groupId) currentGroup.value = null
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

  async function searchUsers(query: string): Promise<UserInfo[]> {
    const { data } = await api.get('/users/search', { params: { q: query } })
    return data
  }

  async function loadMemberDetails(userIds: string[]) {
    const missing = userIds.filter((id) => !memberDetails.value.has(id))
    if (missing.length === 0) return
    try {
      const { data } = await api.post('/users/by-ids', { ids: missing })
      for (const user of data) {
        memberDetails.value.set(user.id, user)
      }
    } catch {
      // silently fail
    }
  }

  function getMemberInfo(userId: string): UserInfo | undefined {
    return memberDetails.value.get(userId)
  }

  return {
    groups, currentGroup, loading,
    ownedGroups, invitedGroups, memberDetails,
    fetchGroups, fetchGroup, createGroup,
    renameGroup, closeGroup, deleteGroup,
    inviteUser, joinGroup, acceptMember, removeMember,
    searchUsers, loadMemberDetails, getMemberInfo,
  }
})
