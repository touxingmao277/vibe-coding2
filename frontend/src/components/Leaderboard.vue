<template>
  <div class="leaderboard">
    <h3>🏆 排行榜</h3>
    <div v-if="myRank !== null" class="my-rank">
      我的排名：<strong>{{ myRank }}</strong> / {{ totalPlayers }} · 最高 {{ myBestScore }}
    </div>
    <div class="list">
      <div v-for="(s, i) in scores" :key="s.id" class="row">
        <span class="rank" :class="medal(i)">{{ i + 1 }}</span>
        <span class="name">{{ s.player_name }}</span>
        <span class="pts">{{ s.score }}</span>
      </div>
      <div v-if="scores.length === 0" class="empty">暂无记录</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLeaderboardStore } from '../stores/leaderboardStore'

const lb = useLeaderboardStore()
const scores = computed(() => lb.scores)
const myRank = computed(() => lb.myRank)
const totalPlayers = computed(() => lb.totalPlayers)
const myBestScore = computed(() => lb.myBestScore)

function medal(i) {
  if (i === 0) return 'gold'
  if (i === 1) return 'silver'
  if (i === 2) return 'bronze'
  return ''
}
</script>

<style scoped>
.leaderboard { }
.leaderboard h3 { margin: 0 0 8px; font-size: 15px; }
.my-rank { font-size: 12px; color: #aaa; margin-bottom: 8px; padding: 6px 10px; background: rgba(255,215,0,0.1); border-radius: 4px; }
.list { max-height: 340px; overflow-y: auto; }
.row { display: flex; align-items: center; padding: 5px 8px; border-radius: 3px; gap: 8px; font-size: 13px; }
.row:nth-child(even) { background: rgba(255,255,255,0.03); }
.rank { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; font-weight: bold; color: #999; }
.rank.gold { background: #ffd700; color: #000; }
.rank.silver { background: #c0c0c0; color: #000; }
.rank.bronze { background: #cd7f32; color: #fff; }
.name { flex: 1; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pts { font-weight: bold; color: #fff; }
.empty { text-align: center; color: #666; padding: 20px; font-size: 13px; }
</style>