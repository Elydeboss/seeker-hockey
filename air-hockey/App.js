import React, { useState, useCallback } from 'react'
import { StyleSheet, View, StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { GameScreen } from './screens/GameScreen'
import { GameUI } from './components/GameUI'
import { GAME_MODES } from './constants/GameConstants'

const AirHockeyApp = () => {
  const [gameMode, setGameMode] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [currentStage, setCurrentStage] = useState(null)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [gameState, setGameState] = useState('menu')
  const [countdown, setCountdown] = useState(3)

  const handleModeSelect = useCallback((mode) => {
    if (mode === GAME_MODES.SINGLE_PLAYER) {
      setGameMode(mode)
      setGameState('difficulty')
    } else if (mode === GAME_MODES.LOCAL_MULTIPLAYER) {
      setGameMode(mode)
      setGameState('playing')
    } else if (mode === GAME_MODES.STAGE_MODE) {
      setGameMode(mode)
      setGameState('stage')
    }
  }, [])

  const handleDifficultyChange = useCallback((diff) => {
    setDifficulty(diff)
    setGameState('playing')
  }, [])

  const handleStageSelect = useCallback((stageId) => {
    setCurrentStage(stageId)
    setDifficulty('MEDIUM')
    setGameState('playing')
  }, [])

  const handleReset = useCallback(() => {
    setGameMode(null)
    setDifficulty(null)
    setCurrentStage(null)
    setScore({ player: 0, ai: 0 })
    setGameState('menu')
    setCountdown(3)
  }, [])

  const handleScoreUpdate = useCallback((newScore) => {
    setScore(newScore)
  }, [])

  const handlePause = useCallback(() => {
    setGameState('paused')
  }, [])

  const handleResume = useCallback(() => {
    setGameState('playing')
  }, [])

  const renderContent = () => {
    if (gameState === 'menu' || gameState === 'difficulty' || gameState === 'stage') {
      return (
        <GameUI
          gameMode={gameMode}
          score={score}
          gameState={gameState}
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

    if (gameState === 'playing' || gameState === 'countdown' || gameState === 'paused') {
      return (
        <GameScreen
          gameMode={gameMode}
          difficulty={difficulty}
          currentStage={currentStage}
          onReset={handleReset}
          onScoreUpdate={handleScoreUpdate}
        />
      )
    }

    return (
      <GameUI
        gameMode={gameMode}
        score={score}
        gameState={gameState}
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
    <GestureHandlerRootView style={styles.container}>
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
