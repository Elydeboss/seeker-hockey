import { GAME_WIDTH, GAME_HEIGHT, PUCK_RADIUS, PHYSICS } from '../constants/GameConstants'

export const createPuck = (world) => {
  const Matter = require('matter-js')
  const { Bodies } = Matter

  const puck = Bodies.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PUCK_RADIUS, {
    label: 'puck',
    restitution: PHYSICS.PUCK_RESTITUTION,
    friction: PHYSICS.PUCK_FRICTION,
    frictionAir: PHYSICS.PUCK_FRICTION_AIR,
    density: PHYSICS.PUCK_DENSITY,
    isSensor: false,
    collisionFilter: {
      category: 0x0001,
      mask: 0x0002 | 0x0004 | 0x0008,
    },
  })

  return {
    body: puck,
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
    radius: PUCK_RADIUS,
    type: 'puck',
  }
}

export const resetPuck = (puckEntity) => {
  const Matter = require('matter-js')
  const { Body } = Matter

  Body.setPosition(puckEntity.body, {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
  })
  Body.setVelocity(puckEntity.body, { x: 0, y: 0 })
  Body.setAngularVelocity(puckEntity.body, 0)
}
