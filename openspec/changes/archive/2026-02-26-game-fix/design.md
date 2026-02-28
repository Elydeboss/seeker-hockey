## Context

The air hockey game uses Matter.js for physics simulation. The current implementation has several physics issues:

- Puck can get stuck or behave erratically near walls
- Collision detection between puck and mallet feels unnatural
- No proper enforcement of puck staying within boundaries
- Inconsistent restitution values cause energy loss/gain issues
- Speed limiting is applied post-step rather than preventing excessive velocity

## Goals / Non-Goals

**Goals:**

- Fix puck collision behavior with walls, mallet, and other entities
- Implement proper boundary enforcement to prevent puck escape
- Tune physics parameters for realistic air hockey feel
- Prevent puck from getting stuck or moving erratically

**Non-Goals:**

- Add new game features (AI improvements, scoring changes)
- Refactor game state management
- Change rendering or UI components

## Decisions

1. **Use pre-collision detection for boundary enforcement**
   - Instead of relying solely on wall bodies, detect when puck approaches boundary and apply counter-force
   - Alternative considered: Thicker walls - rejected due to visual impact
   - Rationale: More reliable prevention of puck escaping the play area

2. **Normalize restitution values to 0.8-0.9 range**
   - Current: Puck 1.0, Walls 0.9, Mallet 0.8 - inconsistent
   - Proposed: All collision objects use 0.85 restitution
   - Rationale: Simulates realistic air hockey table with slight energy loss

3. **Implement velocity clamping before physics step**
   - Current: Speed limited after physics update (reactive)
   - Proposed: Clamp velocity magnitude at start of each frame
   - Rationale: Prevents physics engine instability from excessive velocities

4. **Add collision category for proper filtering**
   - Current: Using basic category/mask but may not cover all cases
   - Proposed: Explicit categories: TABLE, PUCK, MALLET, WALL, GOAL
   - Rationale: Ensures puck only collides with appropriate objects

## Risks / Trade-offs

- [Risk] Changing restitution may alter game feel → [Mitigation] Test with different values, start conservative at 0.85
- [Risk] Pre-collision checks add overhead → [Mitigation] Simple bounding box checks are fast, negligible impact
- [Risk] Boundary enforcement may cause puck to "stick" to walls → [Mitigation] Apply small bounce-back force instead of hard stop
