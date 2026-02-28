import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { NEON_COLORS, GAME_MODES, STAGE_LEVELS, AI_CONFIG } from '../constants/GameConstants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const GameUI = ({
  gameMode,
  score,
  gameState,
  countdown,
  difficulty,
  currentStage,
  onModeSelect,
  onDifficultyChange,
  onStageSelect,
  onReset,
  onPause,
  onResume,
}) => {
  if (gameMode === null) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>AIR HOCKEY</Text>
        <Text style={styles.subtitle}>Neon Arcade</Text>

        <TouchableOpacity style={styles.menuButton} onPress={() => onModeSelect(GAME_MODES.SINGLE_PLAYER)}>
          <Text style={styles.menuButtonText}>Single Player</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => onModeSelect(GAME_MODES.LOCAL_MULTIPLAYER)}>
          <Text style={styles.menuButtonText}>Local Multiplayer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => onModeSelect(GAME_MODES.STAGE_MODE)}>
          <Text style={styles.menuButtonText}>Stage Mode</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (gameMode === GAME_MODES.SINGLE_PLAYER && difficulty === null) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>SELECT DIFFICULTY</Text>

        {Object.keys(AI_CONFIG).map((diff) => (
          <TouchableOpacity key={diff} style={styles.menuButton} onPress={() => onDifficultyChange(diff)}>
            <Text style={styles.menuButtonText}>{diff}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  if (gameMode === GAME_MODES.STAGE_MODE && currentStage === null) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>SELECT STAGE</Text>

        {STAGE_LEVELS.map((stage) => (
          <TouchableOpacity key={stage.id} style={styles.menuButton} onPress={() => onStageSelect(stage.id)}>
            <Text style={styles.menuButtonText}>
              Level {stage.id}: {stage.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.uiContainer}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>AI</Text>
        <Text style={styles.scoreText}>{score.ai}</Text>
        <Text style={styles.scoreDivider}>-</Text>
        <Text style={styles.scoreText}>{score.player}</Text>
        <Text style={styles.scoreLabel}>YOU</Text>
      </View>

      {gameState === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>PAUSED</Text>
          <TouchableOpacity style={styles.menuButton} onPress={onResume}>
            <Text style={styles.menuButtonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={onReset}>
            <Text style={styles.menuButtonText}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onPause}>
          <Text style={styles.controlButtonText}>||</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  menuContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: NEON_COLORS.PUCK,
    marginBottom: 10,
    textShadowColor: NEON_COLORS.PUCK_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: NEON_COLORS.TABLE_LINES,
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: NEON_COLORS.PLAYER_MALLET,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginVertical: 10,
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    borderRadius: 8,
  },
  menuButtonText: {
    fontSize: 18,
    color: NEON_COLORS.PLAYER_MALLET,
    fontWeight: 'bold',
  },
  uiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  scoreContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -30 }],
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: NEON_COLORS.SCORE_TEXT,
    textShadowColor: NEON_COLORS.PUCK_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: NEON_COLORS.TABLE_LINES,
    marginBottom: 5,
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    color: NEON_COLORS.TABLE_LINES,
    marginVertical: 10,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: NEON_COLORS.PUCK,
    textShadowColor: NEON_COLORS.PUCK_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: NEON_COLORS.PLAYER_MALLET,
    marginBottom: 30,
    textShadowColor: NEON_COLORS.PLAYER_MALLET_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  topControls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})

export default GameUI
