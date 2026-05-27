<template>
  <div class="score-panel">
    <div class="stat"><span class="label">分数</span><span class="value">{{ game.score }}</span></div>
    <div class="stat"><span class="label">等级</span><span class="value">{{ game.level }}</span></div>
    <div class="stat"><span class="label">消行</span><span class="value">{{ game.linesCleared }}</span></div>
    <div class="stat"><span class="label">耗时</span><span class="value">{{ fmtTime }}</span></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
const game = useGameStore()

const fmtTime = computed(() => {
  const s = game.durationSeconds
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})
</script>

<style scoped>
.score-panel { display: flex; flex-direction: column; gap: 8px; }
.stat { display: flex; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 4px; }
.label { color: #888; font-size: 13px; }
.value { font-size: 18px; font-weight: bold; color: #fff; }
</style>