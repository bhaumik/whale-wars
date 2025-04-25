const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors({
    origin: ['https://whale-wars.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Explicit route for Farcaster manifest
app.get('/.well-known/farcaster.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '.well-known', 'farcaster.json'));
});

// Root route should serve the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Specific routes for images to ensure they're served
app.get('/icon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'icon.png'));
});

app.get('/preview.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'preview.png'));
});

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

// Game state
const players = new Map();
const fish = new Map();
const playerUpdates = new Map(); // Store pending updates
const UPDATE_INTERVAL = 50; // Send updates every 50ms (20 updates/sec)

// Performance monitoring
const metrics = {
    connectedPlayers: 0,
    messagesSent: 0,
    messagesReceived: 0,
    bytesSent: 0,
    bytesReceived: 0,
    lastReset: Date.now()
};

// Log metrics every minute
setInterval(() => {
    const now = Date.now();
    const timeWindow = (now - metrics.lastReset) / 1000; // seconds
    console.log('📊 [METRICS] Performance Report:');
    console.log(`- Connected Players: ${metrics.connectedPlayers}`);
    console.log(`- Messages/sec: ${((metrics.messagesSent + metrics.messagesReceived) / timeWindow).toFixed(2)}`);
    console.log(`- Bandwidth/sec: ${((metrics.bytesSent + metrics.bytesReceived) / timeWindow / 1024).toFixed(2)} KB`);
    console.log(`- Total Bandwidth: ${((metrics.bytesSent + metrics.bytesReceived) / 1024 / 1024).toFixed(2)} MB`);
    
    // Reset counters but keep player count
    metrics.messagesSent = 0;
    metrics.messagesReceived = 0;
    metrics.bytesSent = 0;
    metrics.bytesReceived = 0;
    metrics.lastReset = now;
}, 60000);

// Initialize some fish
function initializeFish() {
    for (let i = 0; i < 200; i++) {
        const fishId = uuidv4();
        fish.set(fishId, {
            id: fishId,
            x: Math.random() * 5000,
            y: Math.random() * 5000,
            radius: 3 + Math.random() * 15,
            color: ['#ff6b6b', '#ffd93d', '#6c5ce7', '#a8e6cf', '#ff8b94', '#00cec9'][Math.floor(Math.random() * 6)]
        });
    }
}

initializeFish();

// Clean up disconnected players periodically
setInterval(() => {
    wss.clients.forEach(client => {
        if (client.readyState !== WebSocket.OPEN) {
            if (client.playerId) {
                players.delete(client.playerId);
                // Broadcast player left
                wss.clients.forEach(otherClient => {
                    if (otherClient.readyState === WebSocket.OPEN) {
                        otherClient.send(JSON.stringify({
                            type: 'playerLeft',
                            playerId: client.playerId
                        }));
                    }
                });
            }
        }
    });
}, 30000);

// Batch and send updates periodically
setInterval(() => {
    if (playerUpdates.size === 0) return;
    
    // Group updates by player
    const updates = Array.from(playerUpdates.entries()).map(([playerId, update]) => ({
        id: playerId,
        x: Math.round(update.x * 10) / 10, // Round to 1 decimal
        y: Math.round(update.y * 10) / 10,
        r: Math.round(update.radius)
    }));
    
    // Clear pending updates
    playerUpdates.clear();
    
    // Send batch update to all clients
    const updateMessage = JSON.stringify({
        type: 'batchUpdate',
        t: Date.now(), // timestamp
        u: updates // shortened key names for bandwidth
    });
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateMessage);
            metrics.messagesSent++;
            metrics.bytesSent += updateMessage.length;
        }
    });
}, UPDATE_INTERVAL);

wss.on('connection', (ws) => {
    metrics.connectedPlayers++;
    
    const playerId = uuidv4();
    ws.playerId = playerId;
    console.log(`Player ${playerId} connected (Total: ${metrics.connectedPlayers})`);

    // Don't create a player immediately, wait for playerInfo
    console.log('Waiting for player info...');

    // Send initial game state without the new player
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        players: Array.from(players.values()),
        fish: Array.from(fish.values())
    }));

    ws.on('message', (message) => {
        metrics.messagesReceived++;
        metrics.bytesReceived += message.length;
        
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'playerInfo':
                    // Create or update player when we get their info
                    const player = {
                        id: playerId,
                        x: 2500,
                        y: 2500,
                        radius: 20,
                        color: '#0066cc',
                        name: data.name,
                        fid: data.fid,
                        avatar: data.avatar
                    };
                    
                    // Add player to game
                    players.set(playerId, player);
                    console.log(`Player ${data.name} (${playerId}) joined the game`);

                    // Broadcast new player to all clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'playerJoined',
                                player: player
                            }));
                        }
                    });
                    break;

                case 'updatePlayer':
                    const existingPlayer = players.get(playerId);
                    if (existingPlayer) {
                        // Update player state
                        Object.assign(existingPlayer, {
                            x: data.x,
                            y: data.y,
                            radius: data.radius
                        });
                        
                        // Queue update for batch sending
                        playerUpdates.set(playerId, {
                            x: data.x,
                            y: data.y,
                            radius: data.radius
                        });
                    }
                    break;

                case 'fishEaten':
                    if (fish.has(data.fishId)) {
                        fish.delete(data.fishId);
                        // Create a new fish at a random location
                        const newFishId = uuidv4();
                        const newFish = {
                            id: newFishId,
                            x: Math.random() * 5000,
                            y: Math.random() * 5000,
                            radius: 3 + Math.random() * 15,
                            color: ['#ff6b6b', '#ffd93d', '#6c5ce7', '#a8e6cf', '#ff8b94', '#00cec9'][Math.floor(Math.random() * 6)]
                        };
                        fish.set(newFishId, newFish);

                        // Broadcast fish update
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'fishUpdate',
                                    eaten: data.fishId,
                                    new: newFish
                                }));
                            }
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        metrics.connectedPlayers--;
        console.log(`Player ${playerId} disconnected (Total: ${metrics.connectedPlayers})`);
        players.delete(playerId);

        // Broadcast player left
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'playerLeft',
                    playerId: playerId
                }));
            }
        });
    });

    ws.on('error', (error) => {
        console.error(`Error for player ${playerId}:`, error);
    });
}); 