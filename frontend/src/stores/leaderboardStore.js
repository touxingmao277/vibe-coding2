import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const scores = ref([])
  const myRank = ref(null)
  const myBestScore = ref(0)
  const totalPlayers = ref(0)
  const myHistory = ref([])

  async function fetchLeaderboard() {
    try {
      const res = await api.get('/scores/leaderboard/')
      scores.value = res.data.scores || []
    } catch {}
  }

  async function fetchMyRank(token) {
    if (!token) return
    try {
      const res = await api.get('/scores/rank/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      myRank.value = res.data.rank
      myBestScore.value = res.data.best_score
      totalPlayers.value = res.data.total_players
    } catch {}
  }

  async function fetchMyHistory(token) {
    if (!token) return
    try {
      const res = await api.get('/scores/history/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      myHistory.value = res.data.history || []
    } catch {}
  }

  async function submitScore(token, data) {
    try {
      await api.post('/scores/submit/', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchLeaderboard()
      await fetchMyRank(token)
      await fetchMyHistory(token)
    } catch {}
  }

  return {
    scores, myRank, myBestScore, totalPlayers, myHistory,
    fetchLeaderboard, fetchMyRank, fetchMyHistory, submitScore
  }
})