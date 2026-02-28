## 1. Update Physics Constants

- [x] 1.1 Set PUCK_RESTITUTION to 0.85 in GameConstants.js
- [x] 1.2 Set WALL_RESTITUTION to 0.85 in GameConstants.js
- [x] 1.3 Set MALLET_RESTITUTION to 0.85 in GameConstants.js
- [x] 1.4 Add WALL_RESTITUTION constant if not present

## 2. Improve Boundary Enforcement

- [x] 2.1 Add boundary check function in Physics.js
- [x] 2.2 Call boundary check after each physics step
- [x] 2.3 Clamp puck position to stay within walls
- [x] 2.4 Apply bounce-back force when puck approaches boundary

## 3. Fix Velocity Clamping

- [x] 3.1 Move velocity clamping to before physics step
- [x] 3.2 Ensure velocity magnitude is clamped correctly
- [x] 3.3 Preserve velocity direction when clamping

## 4. Verify Collision Categories

- [x] 4.1 Review collision filter categories in Puck.js
- [x] 4.2 Review collision filter categories in Mallet.js
- [x] 4.3 Review collision filter categories in Wall.js
- [x] 4.4 Verify goal sensor does not block puck

## 5. Testing

- [x] 5.1 Test puck bouncing off all four walls
- [x] 5.2 Test puck-mallet collision responsiveness
- [x] 5.3 Test high-speed collisions near boundaries
- [x] 5.4 Test puck reset after goal scored
- [x] 5.5 Test with stage mode obstacles
