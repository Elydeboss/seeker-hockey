import { GAME_WIDTH, GAME_HEIGHT } from '../constants/GameConstants'

export const createObstacle = (world, obstacleConfig) => {
  const Matter = require('matter-js')
  const { Bodies } = Matter

  const x = obstacleConfig.x * GAME_WIDTH
  const y = obstacleConfig.y * GAME_HEIGHT

  let body

  if (obstacleConfig.type === 'circle') {
    const radius = obstacleConfig.radius * Math.min(GAME_WIDTH, GAME_HEIGHT)
    body = Bodies.circle(x, y, radius, {
      label: 'obstacle',
      isStatic: obstacleConfig.static,
      restitution: 0.8,
      friction: 0.1,
    })
    return {
      body,
      position: { x, y },
      type: 'obstacle',
      radius,
      shape: 'circle',
      config: obstacleConfig,
    }
  }

  const width = obstacleConfig.width * GAME_WIDTH
  const height = obstacleConfig.height * GAME_HEIGHT

  body = Bodies.rectangle(x, y, width, height, {
    label: 'obstacle',
    isStatic: obstacleConfig.static,
    restitution: 0.8,
    friction: 0.1,
  })

  return {
    body,
    position: { x, y },
    type: 'obstacle',
    width,
    height,
    shape: 'rect',
    config: obstacleConfig,
  }
}

export const createObstaclesForLevel = (world, levelConfig) => {
  return levelConfig.obstacles.map((obs) => createObstacle(world, obs))
}

export const updateObstaclePosition = (obstacleEntity, time) => {
  const Matter = require('matter-js')
  const { Body } = Matter

  if (obstacleEntity.config.static) return

  const config = obstacleEntity.config
  let newX, newY

  if (config.moveX) {
    const baseX = config.x * GAME_WIDTH
    const amplitude = config.moveX * GAME_WIDTH
    newX = baseX + Math.sin(time * config.speed) * amplitude
    newY = config.y * GAME_HEIGHT
  }

  if (newX !== undefined && newY !== undefined) {
    Body.setPosition(obstacleEntity.body, { x: newX, y: newY })
  }
}
