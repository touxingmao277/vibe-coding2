import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const score = ref(0)
  const level = ref(0)
  const linesCleared = ref(0)
  const gameOver = ref(false)
  const paused = ref(false)
  const isNewRecord = ref(false)
  const showOverlay = ref(false)
  const durationSeconds = ref(0)
  const gameStartTime = ref(null)
  const darkTheme = ref(true)
  const soundEnabled = ref(true)

  let timerId = null

  function reset() {
    score.value = 0
    level.value = 0
    linesCleared.value = 0
    gameOver.value = false
    paused.value = false
    isNewRecord.value = false
    showOverlay.value = false
    durationSeconds.value = 0
    gameStartTime.value = Date.now()
    startTimer()
  }

  function startTimer() {
    stopTimer()
    timerId = setInterval(() => {
      if (!paused.value && !gameOver.value) {
        durationSeconds.value = Math.floor((Date.now() - gameStartTime.value) / 1000)
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null }
  }

  function getDuration() {
    if (gameStartTime.value) {
      return Math.floor((Date.now() - gameStartTime.value) / 1000)
    }
    return durationSeconds.value
  }

  return {
    score, level, linesCleared, gameOver, paused,
    isNewRecord, showOverlay, durationSeconds,
    darkTheme, soundEnabled,
    reset, startTimer, stopTimer, getDuration
  }
})