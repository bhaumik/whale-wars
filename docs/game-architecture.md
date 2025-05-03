# Whale Wars Game Architecture

## Overview

Whale Wars is a multiplayer browser-based game where players control a whale and compete to eat fish and grow larger. The game is built using vanilla JavaScript with WebSockets for real-time communication between players.

## System Architecture

### Components

1. **Client-Side Game Engine**: Handles rendering, input, and game logic in the browser
2. **WebSocket Server**: Manages player connections and game state synchronization
3. **Express Server**: Serves static assets and handles HTTP requests
4. **Farcaster Integration**: Connects the game to the Farcaster ecosystem

### Architecture Diagram

```
┌────────────────────┐       WebSocket       ┌────────────────────┐
│                    │◄────Connection────────┤                    │
│                    │                       │                    │
│   Game Client      │─────Game State────────►   Game Server      │
│   (Browser)        │                       │   (Node.js)        │
│                    │◄────Updates───────────┤                    │
└────────────────────┘                       └────────────────────┘
         ▲                                             ▲
         │                                             │
         │ User Input                                  │ Server Management
         │                                             │
┌────────────────────┐                       ┌────────────────────┐
│                    │                       │                    │
│   Player           │                       │   Admin Dashboard  │
│                    │                       │   (Future)         │
└────────────────────┘                       └────────────────────┘
```

## Client-Side Architecture

### Game Loop

The main game engine runs on a standard request-animation-frame loop:

```javascript
gameLoop() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    // Update game state
    this.update(delta);
    
    // Render game
    this.render();
    
    // Schedule next frame
    requestAnimationFrame(() => this.gameLoop());
}
```

### Key Classes/Components

1. **Game**: Main game controller that manages the overall game state
2. **Player**: Represents a player character with position, size, and movement logic
3. **Fish**: Represents food items that players can collect to grow
4. **Camera**: Handles viewport management and following the player
5. **Renderer**: Manages the drawing of game elements on the canvas
6. **InputHandler**: Processes user input (keyboard, mouse, touch)
7. **NetworkManager**: Handles WebSocket communication with the server

## Server-Side Architecture

### Game State Management

The server maintains the authoritative game state, including:

1. Player positions, sizes, and states
2. Fish positions and states
3. Collision detection and resolution
4. Score tracking and leaderboards

### Networking Protocol

The server communicates with clients using a custom JSON-based protocol:

```javascript
// Server to client update
{
    "type": "update",
    "players": [
        { "id": "player1", "x": 100, "y": 200, "size": 50, ... },
        { "id": "player2", "x": 300, "y": 400, "size": 30, ... }
    ],
    "fish": [
        { "id": "fish1", "x": 150, "y": 250, "size": 5, ... },
        { "id": "fish2", "x": 350, "y": 450, "size": 8, ... }
    ]
}

// Client to server input
{
    "type": "input",
    "x": 150,
    "y": 250,
    "angle": 0.75
}
```

## Performance Optimizations

1. **Delta-Based Updates**: Only sending changed data to reduce bandwidth
2. **Area of Interest**: Only sending updates for entities near the player
3. **Interpolation**: Smoothing movement between updates for visual quality
4. **Prediction**: Client-side prediction of movement to reduce perceived latency

## Deployment Architecture

The game is deployed on Render's cloud platform:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Render Web     │     │  Render Web     │     │  Render Web     │
│  Service        │─────┤  Service        │─────┤  Service        │
│  (Instance 1)   │     │  (Instance 2)   │     │  (Instance N)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                       ┌────────▼───────┐
                       │                │
                       │  Load Balancer │
                       │                │
                       └────────────────┘
                                │
                                │
                       ┌────────▼───────┐
                       │                │
                       │   Internet     │
                       │                │
                       └────────────────┘
```

## Future Enhancements

1. **Persistent Player Accounts**: Save player progress and stats
2. **Enhanced Game Mechanics**: New power-ups, obstacles, and game modes
3. **Improved Graphics**: Enhanced visual effects and animations
4. **Social Features**: In-game chat, friend lists, and teams
5. **Server Scaling**: Sharding for handling larger player counts

## Debug & Monitoring

The game includes built-in performance monitoring:

```javascript
// Server-side metrics
setInterval(() => {
    console.log('📊 [METRICS] Performance Report:');
    console.log(`- Connected Players: ${metrics.connectedPlayers}`);
    console.log(`- Messages/sec: ${((metrics.messagesSent + metrics.messagesReceived) / timeWindow).toFixed(2)}`);
    console.log(`- Bandwidth/sec: ${((metrics.bytesSent + metrics.bytesReceived) / timeWindow / 1024).toFixed(2)} KB`);
    console.log(`- Total Bandwidth: ${((metrics.bytesSent + metrics.bytesReceived) / 1024 / 1024).toFixed(2)} MB`);
}, 60000);

// Client-side metrics
setInterval(() => {
    console.log('📊 [CLIENT] Performance Report:');
    console.log(`- FPS: ${this.metrics.fps.toFixed(1)}`);
    console.log(`- Frame Time: ${this.metrics.frameTime.toFixed(1)}ms`);
    console.log(`- Messages/sec: ${(this.metrics.messageCount / timeWindow).toFixed(1)}`);
    console.log(`- Bandwidth/sec: ${((this.metrics.bytesSent + this.metrics.bytesReceived) / timeWindow / 1024).toFixed(1)} KB`);
}, 60000);
``` 