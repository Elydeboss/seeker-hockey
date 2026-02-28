import { GAME_WIDTH, GAME_HEIGHT, GOAL_WIDTH, GOAL_DEPTH } from '../constants/GameConstants'

export const createGoals = (world) => {
  const Matter = require('matter-js')
  const { Bodies } = Matter

  const goalYTop = 0
  const goalYBottom = GAME_HEIGHT

  const topGoal = Bodies.rectangle(GAME_WIDTH / 2, goalYTop, GOAL_WIDTH, GOAL_DEPTH * 2, {
    label: 'goal_top',
    isSensor: true,
    isStatic: true,
  })

  const bottomGoal = Bodies.rectangle(GAME_WIDTH / 2, goalYBottom, GOAL_WIDTH, GOAL_DEPTH * 2, {
    label: 'goal_bottom',
    isSensor: true,
    isStatic: true,
  })

  return [
    {
      body: topGoal,
      position: { x: GAME_WIDTH / 2, y: goalYTop },
      type: 'goal',
      goalType: 'ai',
      width: GOAL_WIDTH,
      height: GOAL_DEPTH * 2,
    },
    {
      body: bottomGoal,
      position: { x: GAME_WIDTH / 2, y: goalYBottom },
      type: 'goal',
      goalType: 'player',
      width: GOAL_WIDTH,
      height: GOAL_DEPTH * 2,
    },
  ]
}
