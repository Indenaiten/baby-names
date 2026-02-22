import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

interface BabyName {
  id: string
  name: string
  gender: 'boy' | 'girl' | 'unisex'
  proposedBy: string
  proposerName?: string
  groupId: string
  averageScore: number
  totalRatings: number
  description?: string
  createdAt: string
}

interface Rating {
  id: string
  nameId: string
  userId: string
  userName?: string
  score: number
  createdAt: string
  name?: BabyName // Added for myRatings if backend provides it, or to be filled
}

interface Comment {
  id: string
  nameId: string
  userId: string
  userName?: string
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

  async function proposeName(groupId: string, name: string, gender: string, description?: string) {
    const { data } = await api.post(`/groups/${groupId}/names`, { name, gender, description })
    names.value.unshift(data)
    myNames.value.unshift(data)
    return data
  }

  async function deleteName(nameId: string) {
    await api.delete(`/names/${nameId}`)
    names.value = names.value.filter((n) => n.id !== nameId)
    myNames.value = myNames.value.filter((n) => n.id !== nameId)
  }

  async function rateName(nameId: string, score: number) {
    const { data } = await api.post(`/names/${nameId}/rate`, { score })
    unratedNames.value = unratedNames.value.filter((n) => n.id !== nameId)

    // Update the name's average in local state
    const name = names.value.find((n) => n.id === nameId)
    if (name) {
      const existingRating = myRatings.value.find(r => r.nameId === nameId)
      if (existingRating) {
        // Update: replace old score with new score
        const total = name.totalRatings
        name.averageScore = Math.round(((name.averageScore * total - existingRating.score + score) / total) * 100) / 100
        existingRating.score = score
      } else {
        // New rating: increment count
        const total = name.totalRatings
        name.averageScore = Math.round(((name.averageScore * total + score) / (total + 1)) * 100) / 100
        name.totalRatings = total + 1
        // Add to myRatings
        myRatings.value.push(data)
      }
    }
    return data
  }

  async function deleteRating(nameId: string) {
    await api.delete(`/names/${nameId}/rate`)

    const name = names.value.find((n) => n.id === nameId)
    const ratingIndex = myRatings.value.findIndex(r => r.nameId === nameId)

    if (name && ratingIndex !== -1) {
      const score = myRatings.value[ratingIndex].score
      const total = name.totalRatings
      if (total > 1) {
        name.averageScore = Math.round(((name.averageScore * total - score) / (total - 1)) * 100) / 100
      } else {
        name.averageScore = 0
      }
      name.totalRatings = total - 1
      myRatings.value.splice(ratingIndex, 1)
    }
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

  async function exportNames(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/export`)
    return data
  }

  return {
    names, myNames, unratedNames, ratings, myRatings, comments, loading,
    fetchNames, fetchMyNames, fetchUnratedNames, proposeName, deleteName,
    rateName, deleteRating, fetchRatings, fetchMyRatings, fetchComments, addComment, exportNames,
  }
})
