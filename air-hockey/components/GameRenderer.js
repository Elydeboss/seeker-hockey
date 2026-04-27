import React, { useCallback, useState, useEffect } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { Canvas, Circle, Rect, Text as SkiaText, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  NEON_COLORS,
  GOAL_WIDTH,
  GOAL_BOX_RADIUS,
  PUCK_RADIUS,
  MALLET_RADIUS,
  CENTER_LINE_COLOR,
  GOAL_CREASE_COLOR,
  GOAL_HOLE_COLOR,
} from '../constants/GameConstants'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const NeonCircle = React.memo(({
  cx,
  cy,
  radius,
  color,
  glowColor = null,
  glowRadius = 0,
  innerColor = null,
  innerRadius = 0,
}) => {
  return (
    <>
      {glowRadius > 0 && glowColor && (
        <Circle cx={cx} cy={cy} r={radius + glowRadius} color={glowColor} opacity={0.3} />
      )}
      <Circle cx={cx} cy={cy} r={radius} color={color} />
      {innerColor && innerRadius > 0 && <Circle cx={cx} cy={cy} r={innerRadius} color={innerColor} />}
    </>
  )
})

const NeonRect = React.memo(({ x, y, width, height, color, opacity = 1 }) => {
  return <Rect x={x} y={y} width={width} height={height} color={color} opacity={opacity} />
})

const GoalCrease = ({ isTop }) => {
  return (
    <>
      <Rect
        x={GAME_WIDTH / 2 - GOAL_BOX_RADIUS}
        y={isTop ? 0 : GAME_HEIGHT - GOAL_BOX_RADIUS}
        width={GOAL_BOX_RADIUS * 2}
        height={GOAL_BOX_RADIUS}
        color={GOAL_CREASE_COLOR}
        opacity={0.5}
      />
      <Rect
        x={GAME_WIDTH / 2 - GOAL_WIDTH / 2}
        y={isTop ? 0 : GAME_HEIGHT - 10}
        width={GOAL_WIDTH}
        height={10}
        color={GOAL_HOLE_COLOR}
      />
    </>
  )
}

const PuckView = React.memo(({ puck }) => {
  if (!puck) return null
  return (
    <>
      <NeonCircle
        cx={puck.position.x}
        cy={puck.position.y}
        radius={puck.radius}
        color={NEON_COLORS.PUCK}
        glowColor={NEON_COLORS.PUCK_GLOW}
        glowRadius={6}
      />
      <NeonCircle
        cx={puck.position.x}
        cy={puck.position.y}
        radius={puck.radius}
        color={NEON_COLORS.PUCK}
        innerColor="#ffffff"
        innerRadius={puck.radius * 0.35}
      />
    </>
  )
})

const MalletView = React.memo(({ mallet }) => {
  const isAI = mallet.playerId === 'ai'
  const color = isAI ? NEON_COLORS.AI_MALLET : NEON_COLORS.PLAYER_MALLET
  const glowColor = isAI ? NEON_COLORS.AI_MALLET_GLOW : NEON_COLORS.PLAYER_MALLET_GLOW

  return (
    <>
      <NeonCircle
        cx={mallet.position.x}
        cy={mallet.position.y}
        radius={mallet.radius}
        color={glowColor}
        glowColor={glowColor}
        glowRadius={12}
      />
      <NeonCircle cx={mallet.position.x} cy={mallet.position.y} radius={mallet.radius} color={color} />
      <NeonCircle
        cx={mallet.position.x}
        cy={mallet.position.y}
        radius={mallet.radius * 0.6}
        color={color}
        innerColor="#000000"
        innerRadius={mallet.radius * 0.25}
      />
      <NeonCircle cx={mallet.position.x} cy={mallet.position.y} radius={mallet.radius * 0.2} color="#ffffff" />
    </>
  )
})

const StaticElements = () => (
  <>
    <Rect x={0} y={0} width={GAME_WIDTH} height={GAME_HEIGHT} color={NEON_COLORS.TABLE} />
    <Rect x={0} y={GAME_HEIGHT / 2 - 1} width={GAME_WIDTH} height={2} color={CENTER_LINE_COLOR} />
    <GoalCrease isTop={true} />
    <GoalCrease isTop={false} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT / 2} radius={60} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT / 2} radius={4} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT - 80} radius={8} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={80} radius={8} color={NEON_COLORS.TABLE_LINES} />
  </>
)

const ScoreDisplay = React.memo(({ scoreRef }) => {
  const score = scoreRef.current || { player: 0, ai: 0 }
  return (
    <>
      <SkiaText
        x={SCREEN_WIDTH - 60}
        y={SCREEN_HEIGHT / 2 - 40}
        text={score.ai.toString()}
        fontSize={48}
        color={NEON_COLORS.SCORE_TEXT}
      />
      <SkiaText
        x={SCREEN_WIDTH - 60}
        y={SCREEN_HEIGHT / 2 + 40}
        text={score.player.toString()}
        fontSize={48}
        color={NEON_COLORS.SCORE_TEXT}
      />
    </>
  )
})

const CountdownDisplay = React.memo(({ countdownRef, gameStateRef }) => {
  const countdown = countdownRef.current || 0
  const state = gameStateRef.current || ''

  if (state !== 'countdown') return null

  return (
    <SkiaText
      x={GAME_WIDTH / 2 - 40}
      y={GAME_HEIGHT / 2 + 40}
      text={countdown.toString()}
      fontSize={120}
      color={NEON_COLORS.PUCK}
    />
  )
})

export const GameRenderer = ({
  entitiesRef,
  scoreRef,
  countdownRef,
  gameStateRef,
  tickRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const gesture = Gesture.Pan()
    .onBegin((event) => {
      const x = event.x
      const y = event.y
      const touchIndex = 0
      if (onTouchStart) {
        runOnJS(onTouchStart)(x, y, touchIndex)
      }
    })
    .onUpdate((event) => {
      const x = event.x
      const y = event.y
      const touchIndex = 0
      if (onTouchMove) {
        runOnJS(onTouchMove)(x, y, touchIndex)
      }
    })
    .onEnd(() => {
      const touchIndex = 0
      if (onTouchEnd) {
        runOnJS(onTouchEnd)(touchIndex)
      }
    })

  const entities = entitiesRef.current || {}
  const puck = entities.puck
  const mallets = [entities.mallet1, entities.mallet2].filter(Boolean)
  const walls = Object.entries(entities).filter(([k]) => k.startsWith('wall_')).map(([, v]) => v)
  const obstacles = Object.entries(entities).filter(([k]) => k.startsWith('obstacle_')).map(([, v]) => v)

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={styles.canvas}>
        <StaticElements />

        {walls.map((wall, index) => (
          <NeonRect
            key={`wall-${index}`}
            x={wall.position.x - wall.width / 2}
            y={wall.position.y - wall.height / 2}
            width={wall.width}
            height={wall.height}
            color={NEON_COLORS.WALL}
          />
        ))}

        {obstacles.map((obs, index) => {
          if (obs.shape === 'circle') {
            return (
              <NeonCircle
                key={`obs-${index}`}
                cx={obs.position.x}
                cy={obs.position.y}
                radius={obs.radius}
                color={NEON_COLORS.OBSTACLE}
                glowColor={NEON_COLORS.OBSTACLE_GLOW}
                glowRadius={4}
              />
            )
          }
          return (
            <NeonRect
              key={`obs-${index}`}
              x={obs.position.x - obs.width / 2}
              y={obs.position.y - obs.height / 2}
              width={obs.width}
              height={obs.height}
              color={NEON_COLORS.OBSTACLE}
            />
          )
        })}

        <PuckView puck={puck} />

        {mallets.map((mallet, index) => (
          <MalletView key={`mallet-${index}`} mallet={mallet} />
        ))}

        <ScoreDisplay scoreRef={scoreRef} />
        <CountdownDisplay countdownRef={countdownRef} gameStateRef={gameStateRef} />
      </Canvas>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  canvas: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
})

export default GameRenderer
