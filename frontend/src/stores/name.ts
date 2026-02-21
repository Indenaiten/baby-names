import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

interface BabyName {
  id: string
  name: string
  gender: 'boy' | 'girl' | 'unisex'
  proposedBy: string
  groupId: string
  averageScore: number
  totalRatings: number
  createdAt: string
}

interface Rating {
  id: string
  nameId: string
  userId: string
  score: number
  comment: string
  createdAt: string
}

interface Comment {
  id: string
  nameId: string
  userId: string
  text: string
  parentId: string | null
  createdAt: string
}

export const useNameStore = defineStore('name', () => {
  const names = ref<BabyName[]>([])
  const myNames = ref<BabyName[]>([])
  const unratedNames = ref<BabyName[]>([])
  const ratings = ref<Rating[]>([])
  const myRatings = ref<Rating[]>([])
  const comments = ref<Comment[]>([])
  const loading = ref(false)

  async function fetchNames(groupId: string, gender?: string) {
    loading.value = true
    try {
      const params = gender ? { gender } : {}
      const { data } = await api.get(`/groups/${groupId}/names`, { params })
      names.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchMyNames(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/names/mine`)
    myNames.value = data
  }

  async function fetchUnratedNames(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/names/unrated`)
    unratedNames.value = data
  }

  async function proposeName(groupId: string, name: string, gender: string) {
    const { data } = await api.post(`/groups/${groupId}/names`, { name, gender })
    names.value.unshift(data)
    myNames.value.unshift(data)
    return data
  }

  async function deleteName(nameId: string) {
    await api.delete(`/names/${nameId}`)
    names.value = names.value.filter((n) => n.id !== nameId)
    myNames.value = myNames.value.filter((n) => n.id !== nameId)
  }

  async function rateName(nameId: string, score: number, comment: string) {
    const { data } = await api.post(`/names/${nameId}/rate`, { score, comment })
    unratedNames.value = unratedNames.value.filter((n) => n.id !== nameId)
    // Update the name's average in local state
    const name = names.value.find((n) => n.id === nameId)
    if (name) {
      const total = name.totalRatings
      name.averageScore = Math.round(((name.averageScore * total + score) / (total + 1)) * 100) / 100
      name.totalRatings = total + 1
    }
    return data
  }

  async function fetchRatings(nameId: string) {
    const { data } = await api.get(`/names/${nameId}/ratings`)
    ratings.value = data
  }

  async function fetchMyRatings(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/ratings/mine`)
    myRatings.value = data
  }

  async function fetchComments(nameId: string) {
    const { data } = await api.get(`/names/${nameId}/comments`)
    comments.value = data
  }

  async function addComment(nameId: string, text: string, parentId?: string) {
    const { data } = await api.post(`/names/${nameId}/comments`, { text, parentId: parentId || null })
    comments.value.push(data)
    return data
  }

  return {
    names, myNames, unratedNames, ratings, myRatings, comments, loading,
    fetchNames, fetchMyNames, fetchUnratedNames, proposeName, deleteName,
    rateName, fetchRatings, fetchMyRatings, fetchComments, addComment,
  }
})
