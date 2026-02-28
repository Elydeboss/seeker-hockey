import { GAME_WIDTH, GAME_HEIGHT, MALLET_RADIUS, PHYSICS } from '../constants/GameConstants'

export const createMallet = (world, playerId, isPlayer1 = true) => {
  const Matter = require('matter-js')
  const { Bodies } = Matter

  const startY = isPlayer1 ? MALLET_RADIUS + 50 : GAME_HEIGHT - MALLET_RADIUS - 50

  const mallet = Bodies.circle(GAME_WIDTH / 2, startY, MALLET_RADIUS, {
    label: playerId,
    restitution: PHYSICS.MALLET_RESTITUTION,
    friction: PHYSICS.MALLET_FRICTION,
    density: PHYSICS.MALLET_DENSITY,
    isSensor: false,
    collisionFilter: {
      category: 0x0002,
      mask: 0x0001 | 0x0004 | 0x0008,
    },
  })

  const minY = isPlayer1 ? MALLET_RADIUS : GAME_HEIGHT / 2 + MALLET_RADIUS
  const maxY = isPlayer1 ? GAME_HEIGHT / 2 - MALLET_RADIUS : GAME_HEIGHT - MALLET_RADIUS

  return {
    body: mallet,
    position: { x: GAME_WIDTH / 2, y: startY },
    radius: MALLET_RADIUS,
    type: 'mallet',
    playerId,
    isPlayer1,
    minY,
    maxY,
    minX: MALLET_RADIUS,
    maxX: GAME_WIDTH - MALLET_RADIUS,
  }
}

export const constrainMallet = (malletEntity) => {
  const Matter = require('matter-js')
  const { Body, Vector } = Matter

  let { x, y } = malletEntity.body.position

  x = Math.max(malletEntity.minX, Math.min(malletEntity.maxX, x))
  y = Math.max(malletEntity.minY, Math.min(malletEntity.maxY, y))

  Body.setPosition(malletEntity.body, { x, y })
  Body.setVelocity(malletEntity.body, { x: 0, y: 0 })
}

export const setMalletPosition = (malletEntity, x, y) => {
  const Matter = require('matter-js')
  const { Body } = Matter

  const constrainedX = Math.max(malletEntity.minX, Math.min(malletEntity.maxX, x))
  const constrainedY = Math.max(malletEntity.minY, Math.min(malletEntity.maxY, y))

  Body.setPosition(malletEntity.body, { x: constrainedX, y: constrainedY })
  Body.setVelocity(malletEntity.body, { x: 0, y: 0 })
}
