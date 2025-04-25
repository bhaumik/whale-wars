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

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    ws.playerId = playerId;
    console.log(`Player ${playerId} connected`);

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
                        Object.assign(existingPlayer, {
                            x: data.x,
                            y: data.y,
                            radius: data.radius
                        });

                        // Broadcast player update
                        wss.clients.forEach((client) => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'playerMoved',
                                    player: existingPlayer
                                }));
                            }
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
        console.log(`Player ${playerId} disconnected`);
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