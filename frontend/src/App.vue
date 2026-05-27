<template>
  <div class="app" :class="{ dark: game.darkTheme, light: !game.darkTheme }">
    <header class="header">
      <h1>俄罗斯方块</h1>
      <div class="user-area">
        <template v-if="auth.isLoggedIn">
          <span class="username">{{ auth.user?.username }}</span>
          <button class="btn-sm" @click="auth.logout()">退出</button>
        </template>
        <template v-else>
          <button class="btn-sm" @click="showLogin = true">登录 / 注册</button>
        </template>
      </div>
    </header>

    <main class="main">
      <div class="left-panel">
        <div class="panel-section">
          <NextPiece />
        </div>
        <div class="panel-section">
          <ScorePanel />
        </div>
        <div class="panel-section">
          <GameHistory />
        </div>
        <div class="panel-section">
          <Settings />
        </div>
      </div>

      <div class="center">
        <GameCanvas :restart="tetris.restart" :togglePause="tetris.togglePause" />
        <div class="controls-hint">
          方向键移动 · 上键旋转 · 空格直接落下 · P暂停 · R重新开始
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-section">
          <Leaderboard />
        </div>
      </div>
    </main>

    <LoginModal :show="showLogin" @close="showLogin = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useGameStore } from './stores/gameStore'
import { useLeaderboardStore } from './stores/leaderboardStore'
import { useTetris } from './composables/useTetris'
import GameCanvas from './components/GameCanvas.vue'
import NextPiece from './components/NextPiece.vue'
import ScorePanel from './components/ScorePanel.vue'
import Leaderboard from './components/Leaderboard.vue'
import LoginModal from './components/LoginModal.vue'
import Settings from './components/Settings.vue'
import GameHistory from './components/GameHistory.vue'

const auth = useAuthStore()
const game = useGameStore()
const lb = useLeaderboardStore()
const tetris = useTetris()
const showLogin = ref(false)

onMounted(() => {
  auth.fetchProfile()
  tetris.mount('gameCanvas', 'nextCanvas')
  tetris.startGame()
  lb.fetchLeaderboard()

  watch(() => auth.isLoggedIn, (val) => {
    if (val) {
      lb.fetchMyRank(auth.token)
      lb.fetchMyHistory(auth.token)
    }
  }, { immediate: true })
})

onUnmounted(() => {
  tetris.unmount()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
.app.dark { --bg: #0f0f23; --panel: #1a1a2e; --text: #e0e0e0; background: var(--bg); color: var(--text); height: 100vh; }
.app.light { --bg: #e8e8f0; --panel: #ffffff; --text: #222; background: var(--bg); color: var(--text); height: 100vh; }
.app { display: flex; flex-direction: column; }

.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: var(--panel); border-bottom: 1px solid rgba(255,255,255,0.05); }
.header h1 { font-size: 22px; letter-spacing: 2px; }
.user-area { display: flex; align-items: center; gap: 12px; }
.username { font-size: 14px; color: #4a4; }
.btn-sm { background: #334; color: #ccc; border: 1px solid #555; padding: 5px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; transition: .2s; }
.btn-sm:hover { background: #445; color: #fff; }

.main { flex: 1; display: flex; justify-content: center; gap: 20px; padding: 20px; overflow: auto; }
.left-panel, .right-panel { width: 200px; display: flex; flex-direction: column; gap: 16px; }
.center { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.panel-section { background: var(--panel); border-radius: 8px; padding: 14px; border: 1px solid rgba(255,255,255,0.04); }
.controls-hint { color: #666; font-size: 11px; text-align: center; }
</style>