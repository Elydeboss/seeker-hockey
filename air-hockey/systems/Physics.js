import Matter from 'matter-js'
import {
  PHYSICS,
  PUCK_RADIUS,
  MALLET_RADIUS,
  GAME_WIDTH,
  GAME_HEIGHT,
  WALL_THICKNESS,
  GOAL_WIDTH,
  SPARK_CONFIG,
} from '../constants/GameConstants'

let engine = null
let world = null

let lastSparkTime = 0
let sparkData = { isSparking: false, x: 0, y: 0, intensity: 0 }
let bounceData = { isBouncing: false, x: 0, y: 0, intensity: 0, wall: null }

export const initPhysics = () => {
  engine = Matter.Engine.create()
  engine.gravity.x = PHYSICS.GRAVITY.x
  engine.gravity.y = PHYSICS.GRAVITY.y

  world = engine.world

  return { engine, world }
}

export const getPhysicsEngine = () => engine
export const getPhysicsWorld = () => world

export const addBody = (body) => {
  Matter.World.add(world, body)
}

export const addBodies = (bodies) => {
  Matter.World.add(world, bodies)
}

export const removeBody = (body) => {
  Matter.World.remove(world, body)
}

export const stepPhysics = (delta = 16.67, puckBody = null, malletBody = null) => {
  if (!engine) return

  if (puckBody) {
    clampVelocity(puckBody)
  }

  if (malletBody) {
    clampMalletVelocity(malletBody)
  }

  Matter.Engine.update(engine, delta)

  if (puckBody) {
    enforceBoundary(puckBody)
  }
}

const clampVelocity = (body) => {
  if (!body) return

  const velocity = body.velocity
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

  if (speed > PHYSICS.PUCK_SPEED_LIMIT) {
    const scale = PHYSICS.PUCK_SPEED_LIMIT / speed
    Matter.Body.setVelocity(body, {
      x: velocity.x * scale,
      y: velocity.y * scale,
    })
  }
}

const clampMalletVelocity = (body) => {
  if (!body) return

  const velocity = body.velocity
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

  if (speed > PHYSICS.MALLET_SPEED_LIMIT) {
    const scale = PHYSICS.MALLET_SPEED_LIMIT / speed
    Matter.Body.setVelocity(body, {
      x: velocity.x * scale,
      y: velocity.y * scale,
    })
  }
}

const enforceBoundary = (body) => {
  if (!body) return

  const pos = body.position
  const isPuck = body.label === 'puck'
  const radius = isPuck ? PUCK_RADIUS : MALLET_RADIUS
  const minX = WALL_THICKNESS + radius
  const maxX = GAME_WIDTH - WALL_THICKNESS - radius

  const goalHalfWidth = GOAL_WIDTH / 2
  const goalLeft = GAME_WIDTH / 2 - goalHalfWidth
  const goalRight = GAME_WIDTH / 2 + goalHalfWidth

  let newX = pos.x
  let newY = pos.y
  let velX = body.velocity.x
  let velY = body.velocity.y
  let needsBounce = false

  if (pos.x < minX) {
    newX = minX
    velX = Math.abs(velX) * PHYSICS.WALL_RESTITUTION
    needsBounce = true
  } else if (pos.x > maxX) {
    newX = maxX
    velX = -Math.abs(velX) * PHYSICS.WALL_RESTITUTION
    needsBounce = true
  }

  const inGoalXRange = pos.x > goalLeft + radius && pos.x < goalRight - radius

  if (pos.y < -radius * 2 && inGoalXRange && isPuck) {
    return
  } else if (pos.y > GAME_HEIGHT + radius * 2 && inGoalXRange && isPuck) {
    return
  } else if (pos.y < WALL_THICKNESS + radius) {
    newY = WALL_THICKNESS + radius
    velY = Math.abs(velY) * PHYSICS.WALL_RESTITUTION
    needsBounce = true
  } else if (pos.y > GAME_HEIGHT - WALL_THICKNESS - radius) {
    newY = GAME_HEIGHT - WALL_THICKNESS - radius
    velY = -Math.abs(velY) * PHYSICS.WALL_RESTITUTION
    needsBounce = true
  }

  if (needsBounce) {
    Matter.Body.setPosition(body, { x: newX, y: newY })
    Matter.Body.setVelocity(body, { x: velX, y: velY })
  }
}

export const limitPuckSpeed = (puckBody) => {
  if (!puckBody) return

  const velocity = puckBody.velocity
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

  if (speed > PHYSICS.PUCK_SPEED_LIMIT) {
    const scale = PHYSICS.PUCK_SPEED_LIMIT / speed
    Matter.Body.setVelocity(puckBody, {
      x: velocity.x * scale,
      y: velocity.y * scale,
    })
  }
}

export const limitMalletSpeed = (malletBody) => {
  if (!malletBody) return

  const velocity = malletBody.velocity
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

  if (speed > PHYSICS.MALLET_SPEED_LIMIT) {
    const scale = PHYSICS.MALLET_SPEED_LIMIT / speed
    Matter.Body.setVelocity(malletBody, {
      x: velocity.x * scale,
      y: velocity.y * scale,
    })
  }
}

export const syncEntityPosition = (entity) => {
  if (!entity || !entity.body) return entity

  // Mutate in place instead of creating new objects
  entity.position.x = entity.body.position.x
  entity.position.y = entity.body.position.y
  entity.rotation = entity.body.angle

  if (entity.velocity) {
    entity.velocity.x = entity.body.velocity.x
    entity.velocity.y = entity.body.velocity.y
  }

  return entity
}

export const clearWorld = () => {
  if (!world) return
  Matter.World.clear(world, false)
}

export const destroyEngine = () => {
  if (engine) {
    Matter.Engine.clear(engine)
    engine = null
    world = null
  }
}
