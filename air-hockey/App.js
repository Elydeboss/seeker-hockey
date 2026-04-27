import React, { useRef, useCallback, useState } from 'react'
import { StyleSheet, View, StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { GameScreen } from './screens/GameScreen'
import { GameUI } from './components/GameUI'
import { GAME_MODES } from './constants/GameConstants'

const AirHockeyApp = () => {
  const [renderKey, setRenderKey] = useState(0)

  const gameConfigRef = useRef({
    gameMode: null,
    difficulty: null,
    currentStage: null,
    score: { player: 0, ai: 0 },
    countdown: 3,
  })

  const menuStateRef = useRef('menu')

  const forceRender = useCallback(() => {
    setRenderKey((k) => k + 1)
  }, [])

  const setMenuState = useCallback(
    (state) => {
      menuStateRef.current = state
      forceRender()
    },
    [forceRender],
  )

  const handleModeSelect = useCallback(
    (mode) => {
      gameConfigRef.current.gameMode = mode
      if (mode === GAME_MODES.SINGLE_PLAYER) {
        setMenuState('difficulty')
      } else if (mode === GAME_MODES.LOCAL_MULTIPLAYER) {
        menuStateRef.current = 'playing'
        setMenuState('playing')
      } else if (mode === GAME_MODES.STAGE_MODE) {
        setMenuState('stage')
      }
    },
    [setMenuState],
  )

  const handleDifficultyChange = useCallback(
    (diff) => {
      gameConfigRef.current.difficulty = diff
      setMenuState('playing')
    },
    [setMenuState],
  )

  const handleStageSelect = useCallback(
    (stageId) => {
      gameConfigRef.current.currentStage = stageId
      gameConfigRef.current.difficulty = 'MEDIUM'
      setMenuState('playing')
    },
    [setMenuState],
  )

  const handleReset = useCallback(() => {
    gameConfigRef.current = {
      gameMode: null,
      difficulty: null,
      currentStage: null,
      score: { player: 0, ai: 0 },
      countdown: 3,
    }
    setMenuState('menu')
  }, [setMenuState])

  const handleScoreUpdate = useCallback((newScore) => {
    gameConfigRef.current.score = newScore
  }, [])

  const handlePause = useCallback(() => {
    setMenuState('paused')
  }, [setMenuState])

  const handleResume = useCallback(() => {
    setMenuState('playing')
  }, [setMenuState])

  const renderContent = () => {
    const menuState = menuStateRef.current
    const { gameMode, score, countdown, difficulty, currentStage } = gameConfigRef.current

    if (menuState === 'menu' || menuState === 'difficulty' || menuState === 'stage') {
      return (
        <GameUI
          gameMode={gameMode}
          score={score}
          gameState={menuState}
          countdown={countdown}
          difficulty={difficulty}
          currentStage={currentStage}
          onModeSelect={handleModeSelect}
          onDifficultyChange={handleDifficultyChange}
          onStageSelect={handleStageSelect}
          onReset={handleReset}
          onPause={handlePause}
          onResume={handleResume}
        />
      )
    }

    if (menuState === 'playing' || menuState === 'countdown' || menuState === 'paused') {
      return (
        <GameScreen
          gameMode={gameMode}
          difficulty={difficulty}
          currentStage={currentStage}
          gameStateRef={menuStateRef}
          gameConfigRef={gameConfigRef}
          onReset={handleReset}
          onScoreUpdate={handleScoreUpdate}
        />
      )
    }

    return (
      <GameUI
        gameMode={gameMode}
        score={score}
        gameState={menuState}
        countdown={countdown}
        difficulty={difficulty}
        currentStage={currentStage}
        onModeSelect={handleModeSelect}
        onDifficultyChange={handleDifficultyChange}
        onStageSelect={handleStageSelect}
        onReset={handleReset}
        onPause={handlePause}
        onResume={handleResume}
      />
    )
  }

  return (
    <GestureHandlerRootView style={styles.container} key={renderKey}>
      <StatusBar hidden />
      <View style={styles.container}>{renderContent()}</View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
})

export default AirHockeyApp
