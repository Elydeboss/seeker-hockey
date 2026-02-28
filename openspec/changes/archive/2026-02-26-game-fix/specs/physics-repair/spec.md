## ADDED Requirements

### Requirement: Puck collides realistically with walls

The physics system MUST ensure the puck bounces off walls with consistent energy loss, simulating a real air hockey table surface.

#### Scenario: Puck bounces off top wall

- **WHEN** puck moving upward contacts the top wall
- **THEN** puck reverses vertical velocity with 0.85 restitution coefficient
- **AND** puck remains within game boundaries

#### Scenario: Puck bounces off side walls

- **WHEN** puck moving horizontally contacts left or right wall
- **THEN** puck reverses horizontal velocity with 0.85 restitution coefficient
- **AND** puck remains within game boundaries

#### Scenario: Puck approaches corner

- **WHEN** puck contacts corner where two walls meet
- **THEN** puck reflects velocity correctly based on collision normal
- **AND** puck does not pass through walls

### Requirement: Puck velocity is clamped to prevent instability

The physics system MUST limit puck velocity to prevent physics engine instability and ensure playable speeds.

#### Scenario: Puck exceeds speed limit

- **WHEN** puck velocity exceeds PUCK_SPEED_LIMIT (25 units)
- **THEN** velocity is clamped to maximum allowed magnitude
- **AND** puck direction is preserved

#### Scenario: Puck velocity resets after goal

- **WHEN** a goal is scored and puck is reset to center
- **THEN** puck velocity is set to zero
- **AND** puck is positioned at center of play area

### Requirement: Puck collides properly with mallet

The physics system MUST handle puck-mallet collisions to feel responsive and natural.

#### Scenario: Player mallet hits puck

- **WHEN** player mallet contacts puck
- **THEN** puck receives impulse based on mallet velocity
- **AND** collision follows conservation of momentum principles

#### Scenario: AI mallet hits puck

- **WHEN** AI mallet contacts puck
- **THEN** puck receives impulse based on AI mallet velocity
- **AND** collision uses same physics as player mallet

### Requirement: Puck stays within game boundaries

The physics system MUST prevent the puck from escaping the playable area under any circumstances.

#### Scenario: Puck pushed toward wall

- **WHEN** external force pushes puck toward boundary
- **THEN** boundary enforcement applies counter-force
- **AND** puck position is clamped to valid range

#### Scenario: High-speed collision near wall

- **WHEN** puck collides with mallet at high speed near wall
- **THEN** boundary check runs after physics step
- **AND** puck is repositioned inside if it escapes

### Requirement: Collision categories prevent unwanted interactions

The physics system MUST use proper collision filtering to ensure puck only interacts with appropriate objects.

#### Scenario: Puck interacts with obstacles

- **WHEN** puck contacts obstacle in stage mode
- **THEN** puck bounces off obstacle with correct restitution
- **AND** obstacle remains stationary

#### Scenario: Puck passes through goal

- **WHEN** puck contacts goal sensor
- **THEN** puck continues through (goal is a sensor, not solid)
- **AND** score is incremented
