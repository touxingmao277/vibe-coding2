<template>
  <div class="settings">
    <h3>⚙ 设置</h3>
    <label class="toggle">
      <span>🌙 深色主题</span>
      <input type="checkbox" :checked="game.darkTheme" @change="game.darkTheme = !game.darkTheme" />
      <span class="slider"></span>
    </label>
    <label class="toggle">
      <span>🔊 音效</span>
      <input type="checkbox" :checked="game.soundEnabled" @change="game.soundEnabled = !game.soundEnabled" />
      <span class="slider"></span>
    </label>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore'
const game = useGameStore()
</script>

<style scoped>
.settings { }
.settings h3 { margin: 0 0 12px; font-size: 15px; color: #ccc; }
.toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; font-size: 13px; color: #aaa; position: relative; padding-left: 50px; }
.toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
.slider { position: absolute; left: 0; top: 0; width: 36px; height: 20px; background: #333; border-radius: 10px; transition: .3s; }
.slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 2px; top: 2px; background: #fff; border-radius: 50%; transition: .3s; }
.toggle input:checked + .slider { background: #4a4; }
.toggle input:checked + .slider::before { transform: translateX(16px); }
</style>