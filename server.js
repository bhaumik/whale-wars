const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

// Serve a simple status page
app.get('/', (req, res) => {
    res.send('Whale Wars WebSocket Server - Status: Running');
});

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

    // Initialize player
    players.set(playerId, {
        id: playerId,
        x: 2500,
        y: 2500,
        radius: 20,
        color: '#0066cc',
        name: 'Anonymous',
        fid: null,
        avatar: null
    });

    // Send initial game state
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        players: Array.from(players.values()),
        fish: Array.from(fish.values())
    }));

    // Broadcast new player to others
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'playerJoined',
                player: players.get(playerId)
            }));
        }
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'updatePlayer':
                    const player = players.get(playerId);
                    if (player) {
                        Object.assign(player, {
                            x: data.x,
                            y: data.y,
                            radius: data.radius
                        });

                        // Broadcast player update
                        wss.clients.forEach((client) => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'playerMoved',
                                    player: player
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

                case 'playerInfo':
                    const existingPlayer = players.get(playerId);
                    if (existingPlayer) {
                        Object.assign(existingPlayer, {
                            name: data.name,
                            fid: data.fid,
                            avatar: data.avatar
                        });

                        // Broadcast player info update
                        wss.clients.forEach((client) => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'playerUpdated',
                                    player: existingPlayer
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