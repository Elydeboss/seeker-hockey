import React, { useState, useEffect, useRef, useCallback } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'

import { GameRenderer } from '../components/GameRenderer'
import { GameUI } from '../components/GameUI'
import { initPhysics, addBodies, stepPhysics, syncEntityPosition, clearWorld, destroyEngine } from '../systems/Physics'
import { createAISystem } from '../systems/AISystem'
import { createPuck, resetPuck } from '../entities/Puck'
import { createMallet, setMalletPosition, constrainMallet } from '../entities/Mallet'
import { createWalls } from '../entities/Wall'
import { createGoals } from '../entities/Goal'
import { createObstaclesForLevel, updateObstaclePosition } from '../entities/Obstacle'
import { GAME_MODES, STAGE_LEVELS, PUCK_RADIUS, GOAL_WIDTH, GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const activeTouches = new Map()

export const GameScreen = ({ gameMode, difficulty, currentStage, onReset, onScoreUpdate }) => {
  const physicsRef = useRef(null)
  const entitiesRef = useRef({})
  const aiSystemRef = useRef(null)
  const timeRef = useRef(0)
  const gameLoopRef = useRef(null)
  const lastFrameTimeRef = useRef(0)
  const gameModeRef = useRef(gameMode ?? GAME_MODES.SINGLE_PLAYER)
  const gameStateRef = useRef('playing')
  const layoutRef = useRef({ x: 0, y: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT })

  useEffect(() => {
    gameModeRef.current = gameMode
  }, [gameMode])

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [gameState, setGameState] = useState('playing')
  const [countdown, setCountdown] = useState(3)
  const [entities, setEntities] = useState({})

  useEffect(() => {
    if (onScoreUpdate && (score.player > 0 || score.ai > 0)) {
      onScoreUpdate(score)
    }
  }, [score, onScoreUpdate])

  const updateMalletForTouch = useCallback((x, y, isPlayer2) => {
    if (gameStateRef.current !== 'playing') return

    const currentGameMode = gameModeRef.current

    if (currentGameMode === GAME_MODES.SINGLE_PLAYER || currentGameMode === GAME_MODES.STAGE_MODE) {
      const mallet1 = entitiesRef.current.mallet1
      if (mallet1) {
        setMalletPosition(mallet1, x, y)
      }
    } else if (currentGameMode === GAME_MODES.LOCAL_MULTIPLAYER) {
      if (isPlayer2) {
        const mallet2 = entitiesRef.current.mallet2
        if (mallet2) {
          setMalletPosition(mallet2, x, y)
        }
      } else {
        const mallet1 = entitiesRef.current.mallet1
        if (mallet1) {
          setMalletPosition(mallet1, x, y)
        }
      }
    }
  }, [])

  const handleTouchStart = useCallback(
    (event) => {
      const { locationX, locationY, touchIndex } = event.nativeEvent

      const x = locationX - layoutRef.current.x
      const y = locationY - layoutRef.current.y

      const isBottomHalf = y > SCREEN_HEIGHT / 2

      let isPlayer2 = false
      const currentGameMode = gameModeRef.current

      if (currentGameMode === GAME_MODES.LOCAL_MULTIPLAYER) {
        isPlayer2 = isBottomHalf
      }

      activeTouches.set(touchIndex, {
        isPlayer2,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        lastTime: Date.now(),
      })

      updateMalletForTouch(x, y, isPlayer2)
    },
    [updateMalletForTouch],
  )

  const handleTouchMove = useCallback(
    (event) => {
      const { locationX, locationY, touchIndex } = event.nativeEvent

      const x = locationX - layoutRef.current.x
      const y = locationY - layoutRef.current.y

      const touchData = activeTouches.get(touchIndex)
      if (touchData) {
        touchData.lastX = x
        touchData.lastY = y
        touchData.lastTime = Date.now()

        updateMalletForTouch(x, y, touchData.isPlayer2)
      }
    },
    [updateMalletForTouch],
  )

  const handleTouchEnd = useCallback((event) => {
    const { touchIndex } = event.nativeEvent
    activeTouches.delete(touchIndex)
  }, [])

  const handleLayout = useCallback((event) => {
    layoutRef.current = event.nativeEvent.layout
  }, [])

  const handleGoal = useCallback((goalType) => {
    const puck = entitiesRef.current.puck
    if (puck) {
      resetPuck(puck)
    }

    if (goalType === 'player') {
      setScore((prev) => {
        return { ...prev, player: prev.player + 1 }
      })
    } else {
      setScore((prev) => {
        return { ...prev, ai: prev.ai + 1 }
      })
    }

    setGameState('countdown')
    setCountdown(3)

    let count = 3
    const interval = setInterval(() => {
      count -= 1
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setGameState('playing')
      }
    }, 1000)
  }, [])

  const gameLoop = useCallback(
    (timestamp) => {
      if (gameState !== 'playing') {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const deltaTime = lastFrameTimeRef.current ? timestamp - lastFrameTimeRef.current : 16.67
      lastFrameTimeRef.current = timestamp

      const clampedDelta = Math.min(deltaTime, 16.66)

      timeRef.current += clampedDelta

      const puck = entitiesRef.current.puck
      const mallet2 = entitiesRef.current.mallet2
      stepPhysics(clampedDelta, puck?.body, mallet2?.body)

      if (puck) {
        const puckX = puck.body.position.x
        const puckY = puck.body.position.y
        const goalHalfWidth = GOAL_WIDTH / 2
        const goalLeft = GAME_WIDTH / 2 - goalHalfWidth
        const goalRight = GAME_WIDTH / 2 + goalHalfWidth

        const inGoalXRange = puckX > goalLeft && puckX < goalRight

        if (puckY < -PUCK_RADIUS * 2 && inGoalXRange) {
          handleGoal('ai')
        } else if (puckY > GAME_HEIGHT + PUCK_RADIUS * 2 && inGoalXRange) {
          handleGoal('player')
        } else {
          const goals = Object.values(entitiesRef.current).filter((e) => e.type === 'goal')
          for (const goal of goals) {
            const dx = puck.body.position.x - goal.position.x
            const dy = puck.body.position.y - goal.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < PUCK_RADIUS + 30) {
              handleGoal(goal.goalType)
              break
            }
          }
        }
      }

      const currentGameMode = gameModeRef.current
      if (
        aiSystemRef.current &&
        (currentGameMode === GAME_MODES.SINGLE_PLAYER || currentGameMode === GAME_MODES.STAGE_MODE)
      ) {
        entitiesRef.current = aiSystemRef.current.update(entitiesRef.current, timeRef.current)
      }

      if (currentGameMode === GAME_MODES.STAGE_MODE) {
        const obstacles = Object.values(entitiesRef.current).filter((e) => e.type === 'obstacle')
        obstacles.forEach((obs) => {
          if (obs.config && !obs.config.static) {
            updateObstaclePosition(obs, timeRef.current)
          }
        })
      }

      const updatedEntities = {}
      Object.entries(entitiesRef.current).forEach(([key, entity]) => {
        if (entity.body) {
          updatedEntities[key] = syncEntityPosition(entity)
        } else {
          updatedEntities[key] = entity
        }
      })

      entitiesRef.current = updatedEntities
      setEntities({ ...updatedEntities })

      const constrainedMallet1 = entitiesRef.current.mallet1
      const constrainedMallet2 = entitiesRef.current.mallet2
      if (constrainedMallet1) constrainMallet(constrainedMallet1)
      if (constrainedMallet2) constrainMallet(constrainedMallet2)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    },
    [gameState, handleGoal],
  )

  const initializeGame = useCallback(() => {
    activeTouches.clear()

    const { engine, world } = initPhysics()
    physicsRef.current = { engine, world }

    const puck = createPuck(world)
    const walls = createWalls(world)
    const goals = createGoals(world)

    let mallet1,
      mallet2,
      aiSystem = null,
      obstacles = []

    if (gameMode === GAME_MODES.SINGLE_PLAYER) {
      mallet1 = createMallet(world, 'player1', true)
      mallet2 = createMallet(world, 'ai', false)
      aiSystem = createAISystem(difficulty)
      aiSystemRef.current = aiSystem
    } else if (gameMode === GAME_MODES.LOCAL_MULTIPLAYER) {
      mallet1 = createMallet(world, 'player1', true)
      mallet2 = createMallet(world, 'player2', false)
    } else if (gameMode === GAME_MODES.STAGE_MODE) {
      mallet1 = createMallet(world, 'player1', true)
      mallet2 = createMallet(world, 'ai', false)
      const stageConfig = STAGE_LEVELS.find((s) => s.id === currentStage) || STAGE_LEVELS[0]
      obstacles = createObstaclesForLevel(world, stageConfig)
      aiSystem = createAISystem(difficulty || 'MEDIUM')
      aiSystemRef.current = aiSystem
    }

    addBodies(
      [
        puck.body,
        ...walls.map((w) => w.body),
        ...goals.map((g) => g.body),
        mallet1?.body,
        mallet2?.body,
        ...obstacles.map((o) => o.body),
      ].filter(Boolean),
    )

    const entities = {
      puck,
      mallet1,
      mallet2,
      ...walls.reduce((acc, wall, i) => {
        acc[`wall_${i}`] = wall
        return acc
      }, {}),
      ...goals.reduce((acc, goal, i) => {
        acc[`goal_${i}`] = goal
        return acc
      }, {}),
      ...obstacles.reduce((acc, obs, i) => {
        acc[`obstacle_${i}`] = obs
        return acc
      }, {}),
    }

    entitiesRef.current = entities
    setEntities(entities)
  }, [gameMode, difficulty, currentStage])

  useEffect(() => {
    initializeGame()

    gameLoopRef.current = requestAnimationFrame((timestamp) => {
      lastFrameTimeRef.current = timestamp
      gameLoop(timestamp)
    })

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      destroyEngine()
    }
  }, [initializeGame, gameLoop])

  const handlePause = useCallback(() => {
    setGameState('paused')
  }, [])

  const handleResume = useCallback(() => {
    setGameState('playing')
  }, [])

  const handleMainMenu = useCallback(() => {
    if (onReset) onReset()
  }, [onReset])

  return (
    <View style={styles.container}>
      <View
        style={styles.gameContainer}
        onLayout={handleLayout}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <GameRenderer entities={entities} />
      </View>

      <GameUI
        gameMode={gameMode}
        score={score}
        gameState={gameState}
        countdown={countdown}
        difficulty={difficulty}
        currentStage={currentStage}
        onModeSelect={() => {}}
        onDifficultyChange={() => {}}
        onStageSelect={() => {}}
        onReset={handleMainMenu}
        onPause={handlePause}
        onResume={handleResume}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  gameContainer: {
    flex: 1,
  },
})

export default GameScreen
