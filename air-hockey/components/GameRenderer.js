import React, { memo, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  NEON_COLORS,
  GOAL_WIDTH,
  GOAL_BOX_RADIUS,
  CENTER_LINE_COLOR,
  GOAL_CREASE_COLOR,
  GOAL_HOLE_COLOR,
} from '../constants/GameConstants'

const NeonCircle = memo(
  ({ cx, cy, radius, color, glowColor = null, glowRadius = 0, innerColor = null, innerRadius = 0 }) => {
    return (
      <>
        {glowRadius > 0 && glowColor && (
          <View
            style={[
              styles.glow,
              {
                width: radius * 2 + glowRadius * 2,
                height: radius * 2 + glowRadius * 2,
                borderRadius: radius + glowRadius,
                backgroundColor: glowColor,
                position: 'absolute',
                left: cx - radius - glowRadius,
                top: cy - radius - glowRadius,
                opacity: 0.3,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.circle,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor: color,
              position: 'absolute',
              left: cx - radius,
              top: cy - radius,
            },
          ]}
        />
        {innerColor && innerRadius > 0 && (
          <View
            style={[
              styles.innerCircle,
              {
                width: innerRadius * 2,
                height: innerRadius * 2,
                borderRadius: innerRadius,
                backgroundColor: innerColor,
                position: 'absolute',
                left: cx - innerRadius,
                top: cy - innerRadius,
              },
            ]}
          />
        )}
      </>
    )
  },
)

const NeonRect = memo(({ x, y, width, height, color, opacity = 1, borderRadius = 0 }) => {
  return (
    <View
      style={[
        styles.rect,
        {
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          backgroundColor: color,
          opacity,
          borderRadius,
        },
      ]}
    />
  )
})

const GoalCrease = memo(({ isTop }) => {
  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: GAME_WIDTH / 2 - GOAL_BOX_RADIUS,
          top: isTop ? 0 : GAME_HEIGHT - GOAL_BOX_RADIUS,
          width: GOAL_BOX_RADIUS * 2,
          height: GOAL_BOX_RADIUS,
          borderTopLeftRadius: isTop ? GOAL_BOX_RADIUS : 0,
          borderTopRightRadius: isTop ? GOAL_BOX_RADIUS : 0,
          borderBottomLeftRadius: isTop ? 0 : GOAL_BOX_RADIUS,
          borderBottomRightRadius: isTop ? 0 : GOAL_BOX_RADIUS,
          borderWidth: 2,
          borderColor: GOAL_CREASE_COLOR,
          borderTopWidth: isTop ? 2 : 0,
          borderBottomWidth: isTop ? 0 : 2,
          backgroundColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: GAME_WIDTH / 2 - GOAL_WIDTH / 2,
          top: isTop ? 0 : GAME_HEIGHT - 10,
          width: GOAL_WIDTH,
          height: 10,
          backgroundColor: GOAL_HOLE_COLOR,
        }}
      />
    </>
  )
})

const PuckView = memo(({ puck }) => {
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

const MalletView = memo(({ mallet }) => {
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

const StaticElements = memo(() => (
  <>
    <View style={styles.table} />
    <NeonRect x={0} y={GAME_HEIGHT / 2 - 1} width={GAME_WIDTH} height={2} color={CENTER_LINE_COLOR} />
    <GoalCrease isTop={true} />
    <GoalCrease isTop={false} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT / 2} radius={60} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT / 2} radius={4} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={GAME_HEIGHT - 80} radius={8} color={NEON_COLORS.TABLE_LINES} />
    <NeonCircle cx={GAME_WIDTH / 2} cy={80} radius={8} color={NEON_COLORS.TABLE_LINES} />
  </>
))

export const GameRenderer = memo(({ entities }) => {
  const entitiesList = useMemo(() => Object.values(entities), [entities])

  const goals = useMemo(() => entitiesList.filter((e) => e.type === 'goal'), [entitiesList])
  const walls = useMemo(() => entitiesList.filter((e) => e.type === 'wall'), [entitiesList])
  const puck = useMemo(() => entitiesList.find((e) => e.type === 'puck'), [entitiesList])
  const mallets = useMemo(() => entitiesList.filter((e) => e.type === 'mallet'), [entitiesList])
  const obstacles = useMemo(() => entitiesList.filter((e) => e.type === 'obstacle'), [entitiesList])

  return (
    <View style={styles.container}>
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
            borderRadius={5}
          />
        )
      })}

      <PuckView puck={puck} />

      {mallets.map((mallet, index) => (
        <MalletView key={`mallet-${index}`} mallet={mallet} />
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: NEON_COLORS.TABLE,
  },
  table: {
    position: 'absolute',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: NEON_COLORS.TABLE,
  },
  circle: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  glow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  innerCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  rect: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
})

export default GameRenderer
