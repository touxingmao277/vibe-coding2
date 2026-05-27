<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal">
      <button class="close-btn" @click="close">&times;</button>
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <form @submit.prevent="submit" class="form">
        <input v-model="username" placeholder="用户名" required minlength="2" maxlength="20" />
        <input v-model="password" type="password" placeholder="密码" required minlength="4" />
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn" :disabled="loading">{{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}</button>
      </form>
      <p class="switch" @click="isLogin = !isLogin">
        {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const auth = useAuthStore()
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function close() { emit('close') }

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (isLogin.value) {
      await auth.login(username.value, password.value)
    } else {
      await auth.register(username.value, password.value)
    }
    username.value = ''
    password.value = ''
    close()
  } catch (e) {
    error.value = e.response?.data?.error || e.response?.data?.username?.[0] || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #1a1a2e; border: 1px solid #333; border-radius: 12px; padding: 28px; width: 340px; position: relative; }
.close-btn { position: absolute; top: 8px; right: 12px; background: none; border: none; color: #666; font-size: 24px; cursor: pointer; }
h2 { margin: 0 0 16px; color: #fff; text-align: center; }
.form { display: flex; flex-direction: column; gap: 12px; }
input { background: #16213e; border: 1px solid #333; color: #fff; padding: 10px 14px; border-radius: 6px; font-size: 14px; outline: none; }
input:focus { border-color: #4a4; }
.btn { background: #4a4; color: #fff; border: none; padding: 10px; font-size: 15px; border-radius: 6px; cursor: pointer; transition: background .2s; }
.btn:hover { background: #5c5; }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.error { color: #f55; font-size: 13px; text-align: center; margin: 0; }
.switch { text-align: center; color: #4a4; font-size: 13px; cursor: pointer; margin: 12px 0 0; }
</style>