import {
  GAME_WIDTH,
  GAME_HEIGHT,
  AI_CONFIG,
  MALLET_RADIUS,
  PUCK_RADIUS,
  WALL_THICKNESS,
  GOAL_WIDTH,
} from '../constants/GameConstants'
import { setMalletPosition } from '../entities/Mallet'

const predictPuckPosition = (puck, framesAhead) => {
  const steps = framesAhead
  let x = puck.position.x
  let y = puck.position.y
  let vx = puck.velocity?.x || 0
  let vy = puck.velocity?.y || 0

  const speed = Math.sqrt(vx * vx + vy * vy)
  if (speed < 1) {
    return { x, y }
  }

  const goalHalfWidth = GOAL_WIDTH / 2
  const goalLeft = GAME_WIDTH / 2 - goalHalfWidth
  const goalRight = GAME_WIDTH / 2 + goalHalfWidth
  const minX = WALL_THICKNESS + PUCK_RADIUS
  const maxX = GAME_WIDTH - WALL_THICKNESS - PUCK_RADIUS
  const minY = WALL_THICKNESS + PUCK_RADIUS
  const maxY = GAME_HEIGHT - WALL_THICKNESS - PUCK_RADIUS

  for (let i = 0; i < steps; i++) {
    x += vx * 0.5
    y += vy * 0.5

    if (x < minX) {
      x = minX
      vx = Math.abs(vx) * 0.85
    } else if (x > maxX) {
      x = maxX
      vx = -Math.abs(vx) * 0.85
    }

    const inGoalXRange = x > goalLeft + PUCK_RADIUS && x < goalRight - PUCK_RADIUS

    if (!inGoalXRange) {
      if (y < minY) {
        y = minY
        vy = Math.abs(vy) * 0.85
      } else if (y > maxY) {
        y = maxY
        vy = -Math.abs(vy) * 0.85
      }
    }
  }

  return { x, y }
}

const calculateInterceptPoint = (aiMallet, predictedPuck, difficulty) => {
  const dx = predictedPuck.x - aiMallet.position.x
  const dy = predictedPuck.y - aiMallet.position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  const aggressionFactor =
    {
      EASY: 0.3,
      MEDIUM: 0.6,
      HARD: 0.85,
    }[difficulty] || 0.6

  return {
    x: predictedPuck.x,
    y: predictedPuck.y + (GAME_HEIGHT / 2) * (1 - aggressionFactor),
  }
}

export const createAISystem = (difficulty = 'MEDIUM') => {
  const config = AI_CONFIG[difficulty] || AI_CONFIG.MEDIUM

  let targetX = GAME_WIDTH / 2
  let targetY = GAME_HEIGHT - MALLET_RADIUS - 50
  let lastPuckVelX = 0
  let lastPuckVelY = 0

  const reactionDelay = config.reactionDelay || 150
  const lerpFactor = config.lerpFactor || 0.06

  const anticipationFrames = {
    EASY: 5,
    MEDIUM: 12,
    HARD: 20,
  }

  return {
    name: 'ai',
    config,
    difficulty,

    update: (entities, time) => {
      const aiMallet = Object.values(entities).find((e) => e.type === 'mallet' && e.playerId === 'ai')
      const puck = Object.values(entities).find((e) => e.type === 'puck')

      if (!aiMallet || !puck) return entities

      const puckX = puck.position.x
      const puckY = puck.position.y
      const puckVelX = puck.velocity?.x || lastPuckVelX
      const puckVelY = puck.velocity?.y || lastPuckVelY

      lastPuckVelX = puckVelX
      lastPuckVelY = puckVelY

      // Optimization: When puck is far away in top 30%, use simple defensive positioning
      const isPuckFarAway = puckY < GAME_HEIGHT * 0.3
      if (isPuckFarAway && puckVelY < 1) {
        const defaultX = GAME_WIDTH / 2 + puckVelX * 2
        const defaultY = aiMallet.minY + 30
        setMalletPosition(aiMallet, defaultX, defaultY)
        return entities
      }

      const puckSpeed = Math.sqrt(puckVelX * puckVelX + puckVelY * puckVelY)
      const isPuckMovingTowardAI = puckVelY > 0
      const isPuckMovingAway = puckVelY < 0

      const isPuckInAITerritory = puckY > GAME_HEIGHT / 2

      const framesAhead = anticipationFrames[difficulty] || 12

      const predictedPos = predictPuckPosition(puck, framesAhead)

      if (isPuckInAITerritory) {
        const isHeadingTowardGoal = puckVelY > 0
        const isHeadingAway = puckVelY < 0

        if (isHeadingTowardGoal) {
          targetX = predictedPos.x

          const defensiveDepth =
            {
              EASY: 100,
              MEDIUM: 60,
              HARD: 30,
            }[difficulty] || 60

          targetY = Math.max(aiMallet.minY, Math.min(aiMallet.maxY, puckY + defensiveDepth))
        } else if (isHeadingAway && puckY < GAME_HEIGHT * 0.75) {
          const intercept = calculateInterceptPoint(aiMallet, predictedPos, difficulty)
          targetX = intercept.x
          targetY = Math.max(aiMallet.minY, Math.min(aiMallet.maxY, intercept.y))
        } else {
          targetX = Math.max(aiMallet.minX, Math.min(aiMallet.maxX, puckX + puckVelX * 5))
          targetY = (aiMallet.minY + aiMallet.maxY) / 2
        }
      } else {
        const isPuckComingTowardAI = puckVelY > 0 && puckY > GAME_HEIGHT * 0.3

        if (isPuckComingTowardAI) {
          const predictedWhenCrossing = predictPuckPosition(
            puck,
            Math.floor(((GAME_HEIGHT / 2 - puckY) / Math.abs(puckVelY)) * 2),
          )
          targetX = predictedWhenCrossing.x
          targetY = aiMallet.minY + 40
        } else {
          targetX = GAME_WIDTH / 2 + puckVelX * 3
          targetY = aiMallet.minY + 30
        }
      }

      targetX = Math.max(aiMallet.minX, Math.min(aiMallet.maxX, targetX))
      targetY = Math.max(aiMallet.minY, Math.min(aiMallet.maxY, targetY))

      const currentX = aiMallet.position.x
      const currentY = aiMallet.position.y

      const baseLerpFactor = lerpFactor
      const speedBonus = Math.min(puckSpeed / 20, 0.1)
      const positionLerp = isPuckInAITerritory ? baseLerpFactor * (1.5 + speedBonus) : baseLerpFactor

      const newX = currentX + (targetX - currentX) * positionLerp
      const newY = currentY + (targetY - currentY) * positionLerp

      setMalletPosition(aiMallet, newX, newY)

      return entities
    },

    setDifficulty: (newDifficulty) => {
      if (AI_CONFIG[newDifficulty]) {
        difficulty = newDifficulty
      }
    },

    getDifficulty: () => difficulty,
  }
}

export const lerp = (start, end, factor) => {
  return start + (end - start) * factor
}
