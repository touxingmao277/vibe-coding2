import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('tetris-token') || null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  api.interceptors.request.use((config) => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }
    return config
  })

  async function register(username, password) {
    const res = await api.post('/register/', { username, password })
    token.value = res.data.access
    user.value = res.data.user
    localStorage.setItem('tetris-token', res.data.access)
    return res.data
  }

  async function login(username, password) {
    const res = await api.post('/login/', { username, password })
    token.value = res.data.access
    user.value = res.data.user
    localStorage.setItem('tetris-token', res.data.access)
    return res.data
  }

  async function logout() {
    try {
      await api.post('/logout/')
    } catch {}
    token.value = null
    user.value = null
    localStorage.removeItem('tetris-token')
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await api.get('/profile/')
      user.value = res.data
    } catch {
      token.value = null
      user.value = null
      localStorage.removeItem('tetris-token')
    }
  }

  return { user, token, isLoggedIn, register, login, logout, fetchProfile }
})