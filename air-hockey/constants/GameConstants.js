import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export const GAME_WIDTH = SCREEN_WIDTH
export const GAME_HEIGHT = SCREEN_HEIGHT

export const PUCK_RADIUS = 16
export const MALLET_RADIUS = 36
export const GOAL_WIDTH = 80
export const GOAL_DEPTH = 10
export const GOAL_BOX_RADIUS = 80
export const CENTER_LINE_COLOR = '#ffffff'
export const GOAL_CREASE_COLOR = '#ffffff'
export const GOAL_HOLE_COLOR = '#000000'

export const WALL_THICKNESS = 20

export const PHYSICS = {
  GRAVITY: { x: 0, y: 0 },
  PUCK_RESTITUTION: 0.85,
  PUCK_FRICTION: 0.01,
  PUCK_FRICTION_AIR: 0.005,
  PUCK_SPEED_LIMIT: 25,
  MALLET_RESTITUTION: 0.85,
  MALLET_FRICTION: 0.1,
  MALLET_SPEED_LIMIT: 30,
  MALLET_DENSITY: 0.005,
  PUCK_DENSITY: 0.002,
  WALL_RESTITUTION: 0.85,
}

export const AI_CONFIG = {
  EASY: { lerpFactor: 0.03, reactionDelay: 300 },
  MEDIUM: { lerpFactor: 0.06, reactionDelay: 150 },
  HARD: { lerpFactor: 0.12, reactionDelay: 50 },
}

export const NEON_COLORS = {
  TABLE: '#0a0a1a',
  TABLE_LINES: '#1a1a3a',
  PUCK: '#00ffff',
  PUCK_GLOW: '#00ffff',
  PLAYER_MALLET: '#ff00ff',
  PLAYER_MALLET_GLOW: '#ff00ff',
  AI_MALLET: '#ffff00',
  AI_MALLET_GLOW: '#ffff00',
  WALL: '#4444ff',
  WALL_GLOW: '#00ffff',
  WALL_SPARKLE: '#00ffff',
  GOAL_PLAYER: '#ff4444',
  GOAL_AI: '#44ff44',
  OBSTACLE: '#ff8800',
  OBSTACLE_GLOW: '#ff8800',
  SCORE_TEXT: '#ffffff',
  SPARK_PRIMARY: '#ffaa00',
  SPARK_SECONDARY: '#ffff00',
  SPARK_WHITE: '#ffffff',
}

export const SPARK_CONFIG = {
  PARTICLE_COUNT: 12,
  PARTICLE_LIFETIME: 250,
  PARTICLE_SPEED: 80,
  CONTACT_THRESHOLD: 15,
  MALLET_PROXIMITY_THRESHOLD: 60,
  VELOCITY_THRESHOLD: 2,
}

export const BOUNCE_CONFIG = {
  SQUEEZE_FACTOR: 0.75,
  GLOW_INTENSITY_MULTIPLIER: 2,
  RECOVERY_DURATION: 150,
}

export const GAME_MODES = {
  SINGLE_PLAYER: 'single_player',
  LOCAL_MULTIPLAYER: 'local_multiplayer',
  STAGE_MODE: 'stage_mode',
}

export const STAGE_LEVELS = [
  {
    id: 1,
    name: 'Basic',
    obstacles: [],
  },
  {
    id: 2,
    name: 'Two Bars',
    obstacles: [
      { type: 'rect', x: 0.3, y: 0.5, width: 0.02, height: 0.15, static: true },
      { type: 'rect', x: 0.7, y: 0.5, width: 0.02, height: 0.15, static: true },
    ],
  },
  {
    id: 3,
    name: 'Moving Bar',
    obstacles: [
      {
        type: 'rect',
        x: 0.5,
        y: 0.5,
        width: 0.03,
        height: 0.2,
        static: false,
        moveX: 0.3,
        speed: 0.002,
      },
    ],
  },
  {
    id: 4,
    name: 'Center Circle',
    obstacles: [{ type: 'circle', x: 0.5, y: 0.5, radius: 0.08, static: true }],
  },
  {
    id: 5,
    name: 'Four Corners',
    obstacles: [
      { type: 'circle', x: 0.25, y: 0.4, radius: 0.05, static: true },
      { type: 'circle', x: 0.75, y: 0.4, radius: 0.05, static: true },
      { type: 'circle', x: 0.25, y: 0.6, radius: 0.05, static: true },
      { type: 'circle', x: 0.75, y: 0.6, radius: 0.05, static: true },
    ],
  },
]

export const GOAL_RESET_DELAY = 3000
export const COUNTDOWN_DURATION = 3
