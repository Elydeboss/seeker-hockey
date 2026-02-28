import { GOAL_RESET_DELAY, COUNTDOWN_DURATION, GAME_HEIGHT } from '../constants/GameConstants'
import { resetPuck } from '../entities/Puck'

export const createGameStateSystem = (callbacks = {}) => {
  let score = { player: 0, ai: 0 }
  let gameState = 'playing'
  let countdown = COUNTDOWN_DURATION
  let countdownTimer = null
  let lastGoalTime = 0

  return {
    name: 'gameState',

    getScore: () => ({ ...score }),

    getGameState: () => gameState,

    getCountdown: () => countdown,

    reset: () => {
      score = { player: 0, ai: 0 }
      gameState = 'playing'
      countdown = COUNTDOWN_DURATION
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    },

    handleCollision: (entityA, entityB) => {
      if (gameState !== 'playing') return

      const goalEntity = [entityA, entityB].find((e) => e.type === 'goal')
      const puckEntity = [entityA, entityB].find((e) => e.type === 'puck')

      if (goalEntity && puckEntity) {
        const now = Date.now()
        if (now - lastGoalTime < 1000) return
        lastGoalTime = now

        if (goalEntity.goalType === 'ai') {
          score.player += 1
          if (callbacks.onPlayerScore) {
            callbacks.onPlayerScore(score.player)
          }
        } else if (goalEntity.goalType === 'player') {
          score.ai += 1
          if (callbacks.onAIScore) {
            callbacks.onAIScore(score.ai)
          }
        }

        gameState = 'countdown'
        countdown = COUNTDOWN_DURATION

        countdownTimer = setInterval(() => {
          countdown -= 1
          if (callbacks.onCountdown) {
            callbacks.onCountdown(countdown)
          }

          if (countdown <= 0) {
            clearInterval(countdownTimer)
            countdownTimer = null
            gameState = 'playing'
            if (callbacks.onResume) {
              callbacks.onResume()
            }
          }
        }, 1000)

        if (callbacks.onGoal) {
          callbacks.onGoal(goalEntity.goalType, score)
        }
      }
    },

    setGameState: (newState) => {
      gameState = newState
    },

    pause: () => {
      if (gameState === 'playing') {
        gameState = 'paused'
      }
    },

    resume: () => {
      if (gameState === 'paused') {
        gameState = 'playing'
      }
    },
  }
}
