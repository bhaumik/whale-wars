# WebSockets Documentation

## Overview

WebSockets provide a persistent connection between a client and server, allowing for real-time, bi-directional communication. This is essential for multiplayer games like Whale Wars, where players need to receive updates about other players and game elements in real-time.

## Server-Side Implementation (Node.js with ws)

Our game uses the `ws` package for Node.js to handle WebSocket connections.

### Server Setup

```javascript
const WebSocket = require('ws');
const express = require('express');
const app = express();

// Set up HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Create WebSocket server instance
const wss = new WebSocket.Server({ server });
```

### Connection Handling

```javascript
wss.on('connection', (ws) => {
  // Generate unique ID for this connection
  const playerId = uuidv4();
  
  // Store connection in players map
  players.set(playerId, {
    id: playerId,
    ws: ws,
    // Other player properties
  });
  
  // Handle incoming messages
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    handleMessage(playerId, message);
  });
  
  // Handle disconnection
  ws.on('close', () => {
    players.delete(playerId);
    broadcastPlayerList();
  });
  
  // Send initial game state
  sendInitialState(ws, playerId);
});
```

## Client-Side Implementation (Browser)

### Establishing Connection

```javascript
const wsUrl = 'wss://whale-wars.onrender.com';
const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to server');
  sendPlayerInfo();
};
```

### Handling Messages

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'init':
      // Initialize game state
      initializeGameState(data);
      break;
    case 'update':
      // Update game state
      updateGameState(data);
      break;
    // Other message types
  }
};
```

### Error Handling

```javascript
ws.onclose = () => {
  console.log('Disconnected from server');
  // Implement reconnection logic
  setTimeout(reconnect, backoffDelay);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## Message Protocol

Our game uses a JSON-based message protocol:

### Server to Client Messages

1. **Initialization**
   ```json
   {
     "type": "init",
     "playerId": "unique-id",
     "players": [/* player objects */],
     "fish": [/* fish objects */]
   }
   ```

2. **Game State Update**
   ```json
   {
     "type": "update",
     "players": [/* updated player objects */],
     "fish": [/* updated fish objects */]
   }
   ```

### Client to Server Messages

1. **Player Information**
   ```json
   {
     "type": "playerInfo",
     "name": "Player Name",
     "color": "#hex-color"
   }
   ```

2. **Player Movement**
   ```json
   {
     "type": "move",
     "x": 123,
     "y": 456,
     "angle": 1.23
   }
   ```

## Best Practices

1. **Always validate input data** before processing
2. **Implement reconnection logic** with exponential backoff
3. **Handle connection errors** gracefully
4. **Optimize message size** to reduce bandwidth usage
5. **Monitor connection health** with periodic ping/pong
6. **Scale WebSocket servers** for large numbers of concurrent users

## Performance Considerations

- Batch updates to reduce message frequency
- Use binary protocols for very high-performance needs
- Consider using compression for large messages
- Implement rate limiting to prevent abuse 