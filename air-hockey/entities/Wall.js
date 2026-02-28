import { GAME_WIDTH, GAME_HEIGHT, WALL_THICKNESS, PHYSICS, GOAL_WIDTH } from '../constants/GameConstants'

export const createWalls = (world) => {
  const Matter = require('matter-js')
  const { Bodies } = Matter

  const goalHalfWidth = GOAL_WIDTH / 2
  const leftWallWidth = GAME_WIDTH / 2 - goalHalfWidth
  const wallSegments = []

  const topWallLeft = Bodies.rectangle(leftWallWidth / 2, WALL_THICKNESS / 2, leftWallWidth, WALL_THICKNESS, {
    label: 'wall_top_left',
    isStatic: true,
    restitution: PHYSICS.WALL_RESTITUTION,
  })
  wallSegments.push(topWallLeft)

  const topWallRight = Bodies.rectangle(
    GAME_WIDTH - leftWallWidth / 2,
    WALL_THICKNESS / 2,
    leftWallWidth,
    WALL_THICKNESS,
    {
      label: 'wall_top_right',
      isStatic: true,
      restitution: PHYSICS.WALL_RESTITUTION,
    },
  )
  wallSegments.push(topWallRight)

  const bottomWallLeft = Bodies.rectangle(
    leftWallWidth / 2,
    GAME_HEIGHT - WALL_THICKNESS / 2,
    leftWallWidth,
    WALL_THICKNESS,
    {
      label: 'wall_bottom_left',
      isStatic: true,
      restitution: PHYSICS.WALL_RESTITUTION,
    },
  )
  wallSegments.push(bottomWallLeft)

  const bottomWallRight = Bodies.rectangle(
    GAME_WIDTH - leftWallWidth / 2,
    GAME_HEIGHT - WALL_THICKNESS / 2,
    leftWallWidth,
    WALL_THICKNESS,
    {
      label: 'wall_bottom_right',
      isStatic: true,
      restitution: PHYSICS.WALL_RESTITUTION,
    },
  )
  wallSegments.push(bottomWallRight)

  const leftWall = Bodies.rectangle(WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT, {
    label: 'wall_left',
    isStatic: true,
    restitution: PHYSICS.WALL_RESTITUTION,
  })
  wallSegments.push(leftWall)

  const rightWall = Bodies.rectangle(GAME_WIDTH - WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT, {
    label: 'wall_right',
    isStatic: true,
    restitution: PHYSICS.WALL_RESTITUTION,
  })
  wallSegments.push(rightWall)

  const walls = wallSegments.map((body) => {
    const isHorizontal = body.label.includes('top') || body.label.includes('bottom')
    return {
      body,
      position: body.position,
      type: 'wall',
      width: isHorizontal ? body.bounds.max.x - body.bounds.min.x : WALL_THICKNESS,
      height: isHorizontal ? WALL_THICKNESS : GAME_HEIGHT,
    }
  })

  return walls
}
