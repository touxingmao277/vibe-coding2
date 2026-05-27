<template>
  <div class="game-wrapper">
    <div v-if="game.gameOver && game.showOverlay" class="overlay">
      <div class="overlay-box">
        <h2>游戏结束</h2>
        <p class="final-score">{{ game.score }} 分</p>
        <p class="final-info">等级 {{ game.level }} · 消除 {{ game.linesCleared }} 行</p>
        <p v-if="game.isNewRecord" class="new-record">★ 新纪录！</p>
        <button class="btn" @click="restart">再来一局</button>
      </div>
    </div>
    <div v-if="game.paused && !game.gameOver && game.showOverlay" class="overlay">
      <div class="overlay-box">
        <h2>暂停</h2>
        <p>按 P 继续</p>
        <button class="btn" @click="togglePause">继续游戏</button>
      </div>
    </div>
    <canvas id="gameCanvas" width="300" height="600"></canvas>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore'
const game = useGameStore()

defineProps({
  restart: { type: Function, required: true },
  togglePause: { type: Function, required: true },
})
</script>

<style scoped>
.game-wrapper { position: relative; }
canvas#gameCanvas { display: block; border-radius: 4px; box-shadow: 0 0 30px rgba(0,0,0,0.5); }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; border-radius: 4px; z-index: 10; }
.overlay-box { text-align: center; color: #fff; }
.overlay-box h2 { margin: 0 0 12px; font-size: 28px; }
.final-score { font-size: 42px; font-weight: bold; margin: 8px 0; color: #f0f000; }
.final-info { font-size: 14px; color: #aaa; margin: 4px 0; }
.new-record { color: #f00; font-size: 20px; font-weight: bold; margin: 8px 0; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.btn { background: #4a4; color: #fff; border: none; padding: 10px 32px; font-size: 16px; border-radius: 6px; cursor: pointer; margin-top: 12px; transition: background .2s; }
.btn:hover { background: #5c5; }
</style>