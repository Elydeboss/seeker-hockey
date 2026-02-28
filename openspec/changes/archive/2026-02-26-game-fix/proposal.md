## Why

The air hockey game's physics system has issues that affect gameplay quality. Puck behavior is unpredictable, collisions feel unnatural, and there are problems with boundary handling. These issues reduce player immersion and make the game less enjoyable.

## What Changes

- Fix puck collision detection with walls and mallet
- Improve velocity handling to prevent puck from getting stuck or moving erratically
- Add proper boundary enforcement to keep puck in play
- Tune physics parameters for realistic air hockey feel

## Capabilities

### New Capabilities

- `physics-repair`: Comprehensive fix for all physics-related issues in the game

### Modified Capabilities

## Impact

- `air-hockey/systems/Physics.js` - Core physics engine fixes
- `air-hockey/entities/Puck.js` - Puck entity behavior
- `air-hockey/entities/Mallet.js` - Mallet collision handling
- `air-hockey/entities/Wall.js` - Wall boundary logic
