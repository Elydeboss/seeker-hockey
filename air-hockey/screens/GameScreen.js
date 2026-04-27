import React, { useRef, useEffect, useCallback } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import { useSharedValue, runOnJS, useFrameCallback } from 'react-native-reanimated'

import { GameRenderer } from '../components/GameRenderer'
import { GameUI } from '../components/GameUI'
import { initPhysics, addBodies, stepPhysics, syncEntityPosition, destroyEngine } from '../systems/Physics'
import { createAISystem } from '../systems/AISystem'
import { createPuck, resetPuck } from '../entities/Puck'
import { createMallet, setMalletPosition, constrainMallet } from '../entities/Mallet'
import { createWalls } from '../entities/Wall'
import { createGoals } from '../entities/Goal'
import { createObstaclesForLevel, updateObstaclePosition } from '../entities/Obstacle'
import { GAME_MODES, STAGE_LEVELS, PUCK_RADIUS, GOAL_WIDTH, GAME_HEIGHT, GAME_WIDTH } from '../constants/GameConstants'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const activeTouches = new Map()

export const GameScreen = ({
  gameMode,
  difficulty,
  currentStage,
  gameStateRef,
  gameConfigRef,
  onReset,
  onScoreUpdate,
}) => {
  const physicsRef = useRef(null)
  const entitiesRef = useRef({})
  const aiSystemRef = useRef(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const lastPhysicsUpdateTimeRef = useRef(0)
  const layoutRef = useRef({ x: 0, y: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT })
  const tickRef = useRef(0)
  const PHYSICS_UPDATE_INTERVAL = 16.67 // Cap physics at 60fps

  const scoreRef = useRef({ player: 0, ai: 0 })
  const countdownRef = useRef(3)
  const countdownIntervalRef = useRef(null)
  const gameStateShared = useSharedValue('playing')

  const gameModeRef = useRef(gameMode ?? GAME_MODES.SINGLE_PLAYER)

  const [, forceUpdate] = React.useState(0)

  useEffect(() => {
    gameModeRef.current = gameMode
  }, [gameMode])

  const updateMalletForTouch = useCallback(
    (x, y, isPlayer2) => {
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
    },
    [gameStateRef],
  )

  const handleTouchStart = useCallback(
    (x, y, touchIndex) => {
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
    (x, y, touchIndex) => {
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

  const handleTouchEnd = useCallback((touchIndex) => {
    activeTouches.delete(touchIndex)
  }, [])

  const handleLayout = useCallback((event) => {
    layoutRef.current = event.nativeEvent.layout
  }, [])

  const triggerGoal = useCallback(
    (goalType) => {
      const puck = entitiesRef.current.puck
      if (puck) {
        resetPuck(puck)
      }

      if (goalType === 'player') {
        scoreRef.current = { ...scoreRef.current, player: scoreRef.current.player + 1 }
      } else {
        scoreRef.current = { ...scoreRef.current, ai: scoreRef.current.ai + 1 }
      }

      gameConfigRef.current.score = scoreRef.current

      if (onScoreUpdate) {
        onScoreUpdate(scoreRef.current)
      }

      gameStateRef.current = 'countdown'
      countdownRef.current = 3
      forceUpdate((t) => t + 1)

      // Clear any existing countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }

      let count = 3
      countdownIntervalRef.current = setInterval(() => {
        count -= 1
        countdownRef.current = count
        forceUpdate((t) => t + 1)
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
          gameStateRef.current = 'playing'
          forceUpdate((t) => t + 1)
        }
      }, 1000)
    },
    [gameStateRef, gameConfigRef, onScoreUpdate],
  )

  const physicsStep = useCallback(
    (deltaTime) => {
      // Use fixed timestep for reliable physics regardless of frame callback timing
      const stepDelta = 16.67 // Fixed 60fps timestep

      if (gameStateRef.current !== 'playing') return

      timeRef.current += stepDelta

      const puck = entitiesRef.current.puck
      const mallet2 = entitiesRef.current.mallet2
      // console.log('[DEBUG] Before stepPhysics, puck:', puck?.position, 'mallet2:', mallet2?.position)
      stepPhysics(stepDelta, puck?.body, mallet2?.body)
      // console.log('[DEBUG] After stepPhysics, puck:', puck?.body?.position)

      if (puck) {
        const puckX = puck.body.position.x
        const puckY = puck.body.position.y
        const goalHalfWidth = GOAL_WIDTH / 2
        const goalLeft = GAME_WIDTH / 2 - goalHalfWidth
        const goalRight = GAME_WIDTH / 2 + goalHalfWidth

        const inGoalXRange = puckX > goalLeft && puckX < goalRight

        if (puckY < -PUCK_RADIUS * 2 && inGoalXRange) {
          triggerGoal('ai')
          return
        } else if (puckY > GAME_HEIGHT + PUCK_RADIUS * 2 && inGoalXRange) {
          triggerGoal('player')
          return
        } else {
          const goals = Object.values(entitiesRef.current).filter((e) => e.type === 'goal')
          for (const goal of goals) {
            const dx = puck.body.position.x - goal.position.x
            const dy = puck.body.position.y - goal.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < PUCK_RADIUS + 30) {
              triggerGoal(goal.goalType)
              return
            }
          }
        }
      }

      // Sync entity positions in place to avoid creating new objects every frame
      Object.values(entitiesRef.current).forEach((entity) => {
        if (entity.body) {
          syncEntityPosition(entity)
        }
      })

      // console.log('[DEBUG] After sync, puck:', entitiesRef.current.puck?.position)

      const currentGameMode = gameModeRef.current
      if (
        aiSystemRef.current &&
        (currentGameMode === GAME_MODES.SINGLE_PLAYER || currentGameMode === GAME_MODES.STAGE_MODE)
      ) {
        // console.log('[DEBUG] Before AI update, mallet2:', entitiesRef.current.mallet2?.position)
        entitiesRef.current = aiSystemRef.current.update(entitiesRef.current, timeRef.current)
        // console.log('[DEBUG] After AI update, mallet2:', entitiesRef.current.mallet2?.position)
      }

      if (currentGameMode === GAME_MODES.STAGE_MODE) {
        const obstacles = Object.values(entitiesRef.current).filter((e) => e.type === 'obstacle')
        obstacles.forEach((obs) => {
          if (obs.config && !obs.config.static) {
            updateObstaclePosition(obs, timeRef.current)
          }
        })
      }

      const constrainedMallet1 = entitiesRef.current.mallet1
      const constrainedMallet2 = entitiesRef.current.mallet2
      if (constrainedMallet1) constrainMallet(constrainedMallet1)
      if (constrainedMallet2) constrainMallet(constrainedMallet2)
    },
    [gameStateRef, triggerGoal],
  )

  const gameLoopCallback = useCallback(
    (timestamp) => {
      const deltaTime = lastFrameTimeRef.current ? timestamp - lastFrameTimeRef.current : 16.67
      lastFrameTimeRef.current = timestamp

      // Only run physics at 60fps cap to prevent excessive updates on 120Hz screens
      const timeSinceLastPhysics = timestamp - lastPhysicsUpdateTimeRef.current
      if (timeSinceLastPhysics >= PHYSICS_UPDATE_INTERVAL) {
        lastPhysicsUpdateTimeRef.current = timestamp - (timeSinceLastPhysics % PHYSICS_UPDATE_INTERVAL)
        physicsStep(PHYSICS_UPDATE_INTERVAL)
      }
    },
    [physicsStep],
  )

  useFrameCallback((frameInfo) => {
    'worklet'
    const delta = frameInfo.timeSincePreviousFrame ?? 16
    runOnJS(gameLoopCallback)(delta)
    tickRef.current += 1
  })

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
      mallet1 = createMallet(world, 'player1', false)
      mallet2 = createMallet(world, 'ai', true)
      aiSystem = createAISystem(difficulty)
      aiSystemRef.current = aiSystem
      console.log(
        '[DEBUG] SINGLE_PLAYER: mallet1 (player) at y=',
        mallet1.position.y,
        ', mallet2 (AI) at y=',
        mallet2.position.y,
      )
    } else if (gameMode === GAME_MODES.LOCAL_MULTIPLAYER) {
      mallet1 = createMallet(world, 'player1', false)
      mallet2 = createMallet(world, 'player2', true)
    } else if (gameMode === GAME_MODES.STAGE_MODE) {
      mallet1 = createMallet(world, 'player1', false)
      mallet2 = createMallet(world, 'ai', true)
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
  }, [gameMode, difficulty, currentStage])

  useEffect(() => {
    // Start countdown before game begins
    gameStateRef.current = 'countdown'
    countdownRef.current = 3
    forceUpdate((t) => t + 1)

    const countdownInterval = setInterval(() => {
      countdownRef.current -= 1

      if (countdownRef.current <= 0) {
        clearInterval(countdownInterval)
        countdownIntervalRef.current = null
        gameStateRef.current = 'playing'
        forceUpdate((t) => t + 1)
      } else {
        forceUpdate((t) => t + 1)
      }
    }, 1000)

    countdownIntervalRef.current = countdownInterval

    initializeGame()

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
      destroyEngine()
    }
  }, [initializeGame, forceUpdate, gameStateRef])

  const handlePause = useCallback(() => {
    gameStateRef.current = 'paused'
    forceUpdate((t) => t + 1)
  }, [gameStateRef])

  const handleResume = useCallback(() => {
    gameStateRef.current = 'playing'
    forceUpdate((t) => t + 1)
  }, [gameStateRef])

  const handleMainMenu = useCallback(() => {
    if (onReset) onReset()
  }, [onReset])

  return (
    <View style={styles.container}>
      <View style={styles.gameContainer} onLayout={handleLayout}>
        <GameRenderer
          entitiesRef={entitiesRef}
          scoreRef={scoreRef}
          countdownRef={countdownRef}
          gameStateRef={gameStateRef}
          tickRef={tickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </View>

      <GameUI
        gameMode={gameMode}
        score={scoreRef.current}
        gameState={gameStateRef.current}
        countdown={countdownRef.current}
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
