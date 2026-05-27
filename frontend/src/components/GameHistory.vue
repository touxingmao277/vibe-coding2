<template>
  <div class="game-history">
    <h3>📊 历史战绩</h3>
    <div v-if="history.length === 0" class="empty">暂无游戏记录</div>
    <div v-else class="chart">
      <div class="bars">
        <div v-for="(h, i) in history" :key="h.id" class="bar-col" :title="fmtTooltip(h)">
          <div class="bar" :style="{ height: barHeight(h.score) + '%' }"></div>
          <span class="bar-label">{{ i + 1 }}</span>
        </div>
      </div>
      <div class="mini-summary">
        最近 {{ history.length }} 局 · 最高 {{ maxScore }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLeaderboardStore } from '../stores/leaderboardStore'

const lb = useLeaderboardStore()
const history = computed(() => lb.myHistory)
const maxScore = computed(() => history.value.length ? Math.max(...history.value.map(h => h.score)) : 0)

function barHeight(s) {
  return maxScore.value > 0 ? (s / maxScore.value * 100) : 0
}

function fmtTooltip(h) {
  return `${h.score}分 · Lv.${h.level} · ${h.lines}行`
}
</script>

<style scoped>
.game-history { }
.game-history h3 { margin: 0 0 8px; font-size: 15px; color: #ccc; }
.empty { text-align: center; color: #666; padding: 16px; font-size: 13px; }
.chart { }
.bars { display: flex; align-items: flex-end; gap: 3px; height: 80px; padding: 4px 0; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.bar { width: 100%; background: linear-gradient(to top, #4a4, #6c6); border-radius: 2px 2px 0 0; min-height: 2px; transition: height .3s; }
.bar-label { font-size: 9px; color: #666; margin-top: 2px; }
.mini-summary { font-size: 11px; color: #888; text-align: center; margin-top: 4px; }
</style>