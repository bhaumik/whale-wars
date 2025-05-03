const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// Configure CORS for Farcaster Mini App compatibility
app.use(cors({
    // Allow specific origins for better security while supporting Farcaster clients
    origin: [
        'https://whale-wars.onrender.com', 
        'http://localhost:3000',
        'http://localhost:8080',
        'https://warpcast.com', 
        'https://*.warpcast.com',
        'https://frames.fc'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Add body parser middleware for JSON
app.use(express.json());

// Add security headers middleware for Farcaster Mini App compatibility
app.use((req, res, next) => {
    // Set Content-Security-Policy to allow execution in Farcaster frames
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://cdn.jsdelivr.net https://unpkg.com https://*.warpcast.com; " +
        "connect-src 'self' wss://whale-wars.onrender.com ws://whale-wars.onrender.com ws://localhost:* wss://localhost:* https://*.warpcast.com wss://*.warpcast.com https://unpkg.com https://esm.sh; " +
        "img-src 'self' data: https:; " +
        "style-src 'self' 'unsafe-inline'; " +
        "frame-ancestors 'self' https://*.warpcast.com https://warpcast.com https://frames.fc https://*.farcaster.xyz;"
    );
    
    // Set frame-ancestors specifically for Farcaster
    res.setHeader('X-Frame-Options', 'ALLOW-FROM https://warpcast.com');
    
    next();
});

// Rate limiting system
const rateLimits = {
    messageWindow: 1000, // 1 second window
    maxMessages: 20,     // Max 20 messages per second
    playerLimits: new Map(),
    cleanupInterval: 60000 // Clean up every minute
};

// Clean up rate limiting data periodically
setInterval(() => {
    const now = Date.now();
    
    // Remove entries older than 5 minutes
    for (const [playerId, data] of rateLimits.playerLimits.entries()) {
        if (now - data.lastCleanup > 5 * 60 * 1000) {
            rateLimits.playerLimits.delete(playerId);
        }
    }
}, rateLimits.cleanupInterval);

// Rate limiting function - returns true if allowed, false if limited
function checkRateLimit(playerId) {
    const now = Date.now();
    
    // Initialize player entry if it doesn't exist
    if (!rateLimits.playerLimits.has(playerId)) {
        rateLimits.playerLimits.set(playerId, {
            messages: [],
            lastCleanup: now
        });
    }
    
    const playerLimit = rateLimits.playerLimits.get(playerId);
    
    // Cleanup old messages
    playerLimit.messages = playerLimit.messages.filter(time => now - time < rateLimits.messageWindow);
    
    // Check if exceeded limit
    if (playerLimit.messages.length >= rateLimits.maxMessages) {
        console.warn(`🛑 [RATE LIMIT] Player ${playerId} exceeded message rate limit`);
        return false;
    }
    
    // Add current message
    playerLimit.messages.push(now);
    return true;
}

// Achievement system endpoint
app.get('/api/achievement', async (req, res) => {
    try {
        const { id, preview } = req.query;
        console.log(`📊 [ACHIEVEMENT] Request for achievement ${id}, preview: ${preview}`);
        
        // Validate achievement ID
        if (!id) {
            return res.status(400).json({ error: 'Missing achievement ID' });
        }
        
        // Achievement definitions
        const achievements = {
            firstKill: {
                title: 'First Blood',
                description: 'Devoured another player for the first time',
                icon: '🩸',
                backgroundColor: '#e53e3e',
                textColor: '#ffffff'
            },
            sizeFifty: {
                title: 'Growing Up',
                description: 'Reached size 50',
                icon: '🐋',
                backgroundColor: '#3182ce',
                textColor: '#ffffff'
            },
            sizeHundred: {
                title: 'Whale Lord',
                description: 'Reached size 100',
                icon: '👑',
                backgroundColor: '#805ad5',
                textColor: '#ffffff'
            },
            fishFeast: {
                title: 'Fish Feast',
                description: 'Ate 20 fish in a single game',
                icon: '🐟',
                backgroundColor: '#38a169',
                textColor: '#ffffff'
            },
            survivor: {
                title: 'Survivor',
                description: 'Stayed alive for 3 minutes',
                icon: '⏱️',
                backgroundColor: '#dd6b20',
                textColor: '#ffffff'
            }
        };
        
        const achievement = achievements[id];
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        
        // If this is a preview request, send HTML with the achievement frame
        if (preview === 'true') {
            // Use a simple HTML template for the achievement preview
            // In a production app, you might use Canvas or a server-side image generation library
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        }
                        .achievement-card {
                            width: 100%;
                            height: 100%;
                            background-color: ${achievement.backgroundColor};
                            color: ${achievement.textColor};
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        .icon {
                            font-size: 80px;
                            margin-bottom: 20px;
                        }
                        .title {
                            font-size: 40px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .description {
                            font-size: 24px;
                            margin-bottom: 30px;
                        }
                        .footer {
                            font-size: 20px;
                            position: absolute;
                            bottom: 20px;
                            opacity: 0.9;
                        }
                    </style>
                </head>
                <body>
                    <div class="achievement-card">
                        <div class="icon">${achievement.icon}</div>
                        <div class="title">${achievement.title}</div>
                        <div class="description">${achievement.description}</div>
                        <div class="footer">Play Whale Wars</div>
                    </div>
                </body>
                </html>
            `;
            
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }
        
        // For actual Farcaster Frame rendering
        const frameResponse = {
            version: "vNext",
            image: {
                url: `https://whale-wars.onrender.com/api/achievement?id=${id}&preview=true`,
                aspectRatio: "1.91:1"
            },
            title: `${achievement.title} Unlocked!`,
            buttons: [
                {
                    label: "🎮 Play Whale Wars",
                    action: "post_redirect",
                    target: "https://whale-wars.onrender.com"
                }
            ]
        };
        
        res.json(frameResponse);
    } catch (error) {
        console.error('❌ [ERROR] Achievement generation error:', error);
        res.status(500).json({ error: 'Failed to generate achievement' });
    }
});

// Game stats sharing endpoint
app.get('/api/gamestats', async (req, res) => {
    try {
        const { size, time, fish, players, preview } = req.query;
        console.log(`📊 [STATS] Game stats request: size=${size}, time=${time}, fish=${fish}, players=${players}, preview=${preview}`);
        
        // Validate required parameters
        if (!size) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Parse values
        const finalSize = parseFloat(size) || 0;
        const survivalTime = parseInt(time) || 0;
        const fishEaten = parseInt(fish) || 0;
        const playersEaten = parseInt(players) || 0;
        
        // Format survival time (seconds to MM:SS)
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Determine the player's rank based on size
        let rankTitle = "Tiny Tadpole";
        let rankColor = "#6c757d";
        let rankEmoji = "🐟";
        
        if (finalSize >= 100) {
            rankTitle = "Legendary Leviathan";
            rankColor = "#9b59b6";
            rankEmoji = "👑";
        } else if (finalSize >= 80) {
            rankTitle = "Colossal Predator";
            rankColor = "#e74c3c";
            rankEmoji = "🔥";
        } else if (finalSize >= 60) {
            rankTitle = "Mighty Marauder";
            rankColor = "#f39c12";
            rankEmoji = "⚡";
        } else if (finalSize >= 40) {
            rankTitle = "Formidable Swimmer";
            rankColor = "#3498db";
            rankEmoji = "💪";
        } else if (finalSize >= 20) {
            rankTitle = "Growing Guppy";
            rankColor = "#2ecc71";
            rankEmoji = "🌱";
        }
        
        // If this is a preview request, send HTML with the stats frame
        if (preview === 'true') {
            // Use a simple HTML template for the stats preview
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%);
                        }
                        .stats-card {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 20px;
                            box-sizing: border-box;
                            color: white;
                        }
                        .header {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            margin-bottom: 30px;
                        }
                        .rank {
                            font-size: 40px;
                            font-weight: bold;
                            margin-bottom: 10px;
                            color: ${rankColor};
                            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        .rank-emoji {
                            font-size: 60px;
                            margin-bottom: 10px;
                        }
                        .size {
                            font-size: 60px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            width: 80%;
                            max-width: 500px;
                        }
                        .stat-item {
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 15px;
                            padding: 15px;
                            backdrop-filter: blur(5px);
                        }
                        .stat-title {
                            font-size: 16px;
                            opacity: 0.8;
                            margin-bottom: 5px;
                        }
                        .stat-value {
                            font-size: 28px;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 18px;
                            opacity: 0.9;
                        }
                    </style>
                </head>
                <body>
                    <div class="stats-card">
                        <div class="header">
                            <div class="rank-emoji">${rankEmoji}</div>
                            <div class="rank">${rankTitle}</div>
                            <div class="size">Size: ${Math.round(finalSize)}</div>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-title">Survival Time</div>
                                <div class="stat-value">${formattedTime}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-title">Fish Eaten</div>
                                <div class="stat-value">${fishEaten}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-title">Players Eaten</div>
                                <div class="stat-value">${playersEaten}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-title">Rank Title</div>
                                <div class="stat-value">${rankEmoji}</div>
                            </div>
                        </div>
                        <div class="footer">Play Whale Wars</div>
                    </div>
                </body>
                </html>
            `;
            
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }
        
        // For actual Farcaster Frame rendering
        const frameResponse = {
            version: "vNext",
            image: {
                url: `https://whale-wars.onrender.com/api/gamestats?size=${finalSize}&time=${survivalTime}&fish=${fishEaten}&players=${playersEaten}&preview=true`,
                aspectRatio: "1.91:1"
            },
            title: `${rankEmoji} Size: ${Math.round(finalSize)} - ${rankTitle}`,
            buttons: [
                {
                    label: "🎮 Play Whale Wars",
                    action: "post_redirect",
                    target: "https://whale-wars.onrender.com"
                },
                {
                    label: "👀 View Leaderboard",
                    action: "post_redirect", 
                    target: "https://whale-wars.onrender.com/leaderboard"
                }
            ]
        };
        
        res.json(frameResponse);
    } catch (error) {
        console.error('❌ [ERROR] Game stats generation error:', error);
        res.status(500).json({ error: 'Failed to generate game stats' });
    }
});

// Farcaster webhook endpoint
app.post('/api/webhook', (req, res) => {
    console.log('📱 [FARCASTER] Webhook request received:', req.body);
    
    try {
        const { untrustedData, trustedData } = req.body;
        
        if (!untrustedData) {
            return res.status(400).json({ 
                error: 'Missing untrustedData' 
            });
        }
        
        const { fid, buttonIndex, state } = untrustedData;
        console.log(`📱 [FARCASTER] User ${fid} pressed button ${buttonIndex} with state:`, state);
        
        // Following updated Farcaster Mini App specification for frame responses
        const response = {
            version: "vNext",
            image: {
                url: "https://whale-wars.onrender.com/preview.png",
                aspectRatio: "1.91:1"
            },
            buttons: [
                {
                    label: "🎮 Play Now",
                    action: "post_redirect",
                    target: `https://whale-wars.onrender.com?fid=${fid || ""}`
                }
            ]
        };
        
        // Handle button interactions based on index
        if (buttonIndex === 1) {
            if (state?.gameState === "new") {
                // Game has started
                response.buttons = [
                    {
                        label: "Continue Playing",
                        action: "post_redirect",
                        target: `https://whale-wars.onrender.com?fid=${fid || ""}`
                    },
                    {
                        label: "🏆 View Leaderboard",
                        action: "post_redirect",
                        target: "https://whale-wars.onrender.com/leaderboard"
                    }
                ];
            }
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('❌ [FARCASTER] Webhook error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Explicit route for Farcaster manifest
app.get('/.well-known/farcaster.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '.well-known', 'farcaster.json'));
});

// Add dedicated endpoint for Farcaster Frame integration
app.get('/frame', (req, res) => {
    // Serve a simplified HTML that works well in Farcaster frames
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Whale Wars</title>
            <meta name="fc:frame" content='{"version":"vNext","image":{"url":"https://whale-wars.onrender.com/preview.png","aspectRatio":"1.91:1"},"buttons":[{"label":"🎮 Play Now","action":"post_redirect","target":"https://whale-wars.onrender.com"}]}' />
            <meta property="og:title" content="Whale Wars - Multiplayer Game" />
            <meta property="og:description" content="Compete with other players to become the largest whale in the ocean!" />
            <meta property="og:image" content="https://whale-wars.onrender.com/preview.png" />
            <style>
                body { margin: 0; padding: 0; background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%); height: 100vh; display: flex; align-items: center; justify-content: center; color: white; font-family: sans-serif; }
                .container { text-align: center; }
                h1 { font-size: 3rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; margin-bottom: 2rem; }
                .button { display: inline-block; background: #0066cc; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐋 Whale Wars</h1>
                <p>Compete with other players to become the largest whale in the ocean!</p>
                <a href="https://whale-wars.onrender.com" class="button">Play Now</a>
            </div>
            
            <!-- Inline frame-sdk import script -->
            <script type="module">
                import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
                
                // Hide splash screen when page is loaded
                window.addEventListener('load', async () => {
                    try {
                        await sdk.actions.ready();
                        console.log('Frame ready, splash screen hidden');
                    } catch (err) {
                        console.error('Error hiding splash screen:', err);
                    }
                });
            </script>
        </body>
        </html>
    `;
    
    res.send(html);
});

// Root route should serve the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Leaderboard route
app.get('/leaderboard', (req, res) => {
    // Get top players based on size
    const topPlayers = Array.from(players.values())
        .sort((a, b) => b.radius - a.radius)
        .slice(0, 20);
    
    // Create a simple HTML leaderboard
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Whale Wars - Leaderboard</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%);
                    color: white;
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 30px;
                    font-size: 36px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .leaderboard {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }
                .player {
                    display: grid;
                    grid-template-columns: 50px 60px 1fr 100px;
                    padding: 15px 20px;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .player:last-child {
                    border-bottom: none;
                }
                .rank {
                    font-weight: bold;
                    font-size: 18px;
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .name {
                    font-size: 16px;
                    font-weight: 500;
                }
                .size {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: right;
                }
                .top-3 {
                    background: rgba(255, 255, 255, 0.3);
                }
                .top-1 {
                    background: rgba(255, 215, 0, 0.3);
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                }
                .button {
                    display: inline-block;
                    background: #0066cc;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: background 0.2s;
                }
                .button:hover {
                    background: #0055aa;
                }
                .empty {
                    text-align: center;
                    padding: 40px;
                    font-size: 18px;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐋 Whale Wars Leaderboard</h1>
                
                <div class="leaderboard">
                    ${topPlayers.length === 0 ? 
                        `<div class="empty">No players online at the moment. Be the first to join!</div>` : 
                        topPlayers.map((player, index) => `
                            <div class="player ${index === 0 ? 'top-1' : index < 3 ? 'top-3' : ''}">
                                <div class="rank">#${index + 1}</div>
                                <div><img class="avatar" src="${player.avatar || '/icon.png'}" alt=""></div>
                                <div class="name">${player.name}</div>
                                <div class="size">Size: ${Math.round(player.radius)}</div>
                            </div>
                        `).join('')
                    }
                </div>
                
                <div class="footer">
                    <a href="/" class="button">Play Now</a>
                </div>
            </div>
        </body>
        </html>
    `;
    
    res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Whale Wars server is running' });
});

// Specific routes for images to ensure they're served
app.get('/icon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'icon.png'));
});

app.get('/preview.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'preview.png'));
});

// Game invite endpoint
app.get('/api/invite', async (req, res) => {
    try {
        const { playerId, roomId, preview } = req.query;
        console.log(`📊 [INVITE] Request for game invite: playerId=${playerId}, roomId=${roomId}, preview=${preview}`);
        
        // Validate parameters
        if (!playerId) {
            return res.status(400).json({ error: 'Missing player ID' });
        }
        
        // Fetch player info if they exist
        const player = players.get(playerId);
        const playerName = player ? player.name : 'A Whale';
        
        // Create game room ID if not provided
        const gameRoomId = roomId || `room-${Math.floor(Math.random() * 10000)}`;
        
        // If this is a preview request, send HTML with the invite frame
        if (preview === 'true') {
            // Use a simple HTML template for the invite preview
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        }
                        .invite-card {
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%);
                            color: white;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        .header {
                            font-size: 36px;
                            font-weight: bold;
                            margin-bottom: 20px;
                        }
                        .icon {
                            font-size: 80px;
                            margin-bottom: 30px;
                        }
                        .message {
                            font-size: 24px;
                            margin-bottom: 40px;
                            max-width: 80%;
                        }
                        .footer {
                            font-size: 18px;
                            opacity: 0.9;
                            position: absolute;
                            bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="invite-card">
                        <div class="icon">🐋</div>
                        <div class="header">You're Invited!</div>
                        <div class="message">${playerName} wants you to join them in Whale Wars! Grow your whale and see who becomes the biggest in the ocean.</div>
                        <div class="footer">Tap to join the game</div>
                    </div>
                </body>
                </html>
            `;
            
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }
        
        // For actual Farcaster Frame rendering
        const frameResponse = {
            version: "vNext",
            image: {
                url: `https://whale-wars.onrender.com/api/invite?playerId=${playerId}&roomId=${gameRoomId}&preview=true`,
                aspectRatio: "1.91:1"
            },
            title: `${playerName} invited you to play Whale Wars!`,
            buttons: [
                {
                    label: "🎮 Join Game",
                    action: "post_redirect",
                    target: `https://whale-wars.onrender.com?join=${gameRoomId}`
                },
                {
                    label: "🌊 New Game",
                    action: "post_redirect", 
                    target: "https://whale-wars.onrender.com"
                }
            ]
        };
        
        res.json(frameResponse);
    } catch (error) {
        console.error('❌ [ERROR] Game invite generation error:', error);
        res.status(500).json({ error: 'Failed to generate game invite' });
    }
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

// Simple token-based authentication
const connectionTokens = new Map();

// Generate a session token for a player
function generateSessionToken(playerId) {
    const token = uuidv4(); // Simple UUID-based token
    connectionTokens.set(token, {
        playerId,
        created: Date.now()
    });
    return token;
}

// Verify session token
function verifySessionToken(token) {
    if (!connectionTokens.has(token)) {
        return false;
    }
    
    const session = connectionTokens.get(token);
    
    // Check if token is expired (24 hours)
    if (Date.now() - session.created > 24 * 60 * 60 * 1000) {
        connectionTokens.delete(token);
        return false;
    }
    
    return session;
}

// Clean up expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of connectionTokens.entries()) {
        if (now - session.created > 24 * 60 * 60 * 1000) {
            connectionTokens.delete(token);
        }
    }
}, 60 * 60 * 1000); // Check every hour

// Add player state tracking
const playerStates = {
    ALIVE: 'alive',
    DEAD: 'dead'
};

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
        i: playerId,        // id -> i
        x: Math.round(update.x * 10) / 10, // Round to 1 decimal
        y: Math.round(update.y * 10) / 10,
        r: Math.round(update.radius)  // radius -> r
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
    console.log(`🌍 [WORLD] Player ${playerId} connected (Total: ${metrics.connectedPlayers})`);
    console.log(`🌍 [WORLD] Current world state: ${players.size} players, ${fish.size} fish`);

    // Don't create a player immediately, wait for playerInfo
    console.log('👤 [PLAYER] Waiting for player info...');

    // Send initial game state without the new player
    const initialState = {
        type: 'init',
        playerId: playerId,
        players: Array.from(players.values()),
        fish: Array.from(fish.values())
    };
    console.log('🌍 [WORLD] Sending initial state:', {
        playerId,
        playerCount: initialState.players.length,
        fishCount: initialState.fish.length
    });
    
    // Generate session token for this player and include it in the initial state
    const sessionToken = generateSessionToken(playerId);
    initialState.sessionToken = sessionToken;
    
    ws.send(JSON.stringify(initialState));

    ws.on('message', (message) => {
        metrics.messagesReceived++;
        metrics.bytesReceived += message.length;
        
        // Apply rate limiting
        if (!checkRateLimit(playerId)) {
            // Too many messages, ignore this one
            return;
        }
        
        try {
            const data = JSON.parse(message);
            console.log(`📥 [MESSAGE] Received ${data.type} from ${playerId}`);

            // Validate message has required type field
            if (!data.type || typeof data.type !== 'string') {
                console.error(`❌ [ERROR] Invalid message format from ${playerId}: missing or invalid type`);
                return;
            }

            switch (data.type) {
                case 'playerInfo':
                    // Validate player info fields
                    if (!data.name || typeof data.name !== 'string') {
                        console.error(`❌ [ERROR] Invalid playerInfo from ${playerId}: missing or invalid name`);
                        return;
                    }
                    
                    // Check if client is attempting to use a session token
                    if (data.sessionToken) {
                        const session = verifySessionToken(data.sessionToken);
                        if (session) {
                            console.log(`🔐 [AUTH] Valid session token received from ${playerId}`);
                            
                            // If player exists with the original ID from the token, reconnect them
                            const originalPlayerId = session.playerId;
                            const existingPlayer = players.get(originalPlayerId);
                            
                            if (existingPlayer) {
                                console.log(`🔄 [AUTH] Reconnecting player ${existingPlayer.name} with original ID ${originalPlayerId}`);
                                
                                // Update the WebSocket's playerId to the original one
                                ws.playerId = originalPlayerId;
                                
                                // Update player info with new connection
                                // But keep their position, radius, etc.
                                existingPlayer.state = playerStates.ALIVE;
                                
                                // Send special reconnection message
                                ws.send(JSON.stringify({
                                    type: 'reconnected',
                                    playerId: originalPlayerId,
                                    player: existingPlayer
                                }));
                                
                                // Broadcast player's return to other clients
                                wss.clients.forEach((client) => {
                                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            type: 'playerJoined',
                                            player: existingPlayer
                                        }));
                                    }
                                });
                                
                                return;
                            } else {
                                console.log(`⚠️ [AUTH] Session token valid but player ${originalPlayerId} not found`);
                                // Player not found, proceed with new player creation
                            }
                        } else {
                            console.error(`❌ [AUTH] Invalid or expired session token from ${playerId}`);
                            // Invalid token, proceed with new player creation
                        }
                    }
                    
                    // Sanitize player name (remove HTML tags, limit length)
                    const sanitizedName = data.name
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .substring(0, 20);
                    
                    // Validate Farcaster data if provided
                    let fid = null;
                    let avatar = '/icon.png';
                    let verified = false;
                    let farcasterName = null;
                    
                    if (data.fid) {
                        fid = String(data.fid);
                        console.log(`👤 [AUTH] Farcaster user with FID ${fid}`);
                        
                        // Use provided Farcaster avatar if available and valid
                        if (data.avatar && typeof data.avatar === 'string' && 
                            (data.avatar.startsWith('http://') || data.avatar.startsWith('https://'))) {
                            avatar = data.avatar;
                            console.log(`🖼️ [AUTH] Using Farcaster avatar: ${avatar.substring(0, 50)}...`);
                        }
                        
                        // Store Farcaster verification status
                        verified = data.verified === true;
                        
                        // Store original Farcaster username
                        if (data.farcasterName && typeof data.farcasterName === 'string') {
                            farcasterName = data.farcasterName.substring(0, 30);
                        }
                    }
                    
                    // Create or update player when we get their info
                    const player = {
                        id: playerId,
                        x: 2500,
                        y: 2500,
                        radius: 20,
                        color: data.fid ? '#6366f1' : '#0066cc', // Special color for Farcaster users
                        name: sanitizedName,
                        fid: fid,
                        avatar: avatar,
                        state: playerStates.ALIVE,
                        verified: verified,
                        farcasterName: farcasterName,
                        joinTime: Date.now(),
                        roomId: data.roomId || null
                    };
                    
                    // Add player to game
                    players.set(playerId, player);
                    console.log(`👤 [PLAYER] ${sanitizedName} (${playerId}) joined the game`);
                    if (fid) {
                        console.log(`👤 [PLAYER] Farcaster user with FID ${fid}${verified ? ' (verified)' : ''}`);
                    }
                    console.log(`🌍 [WORLD] Updated player count: ${players.size}`);
                    
                    // Update room participants if joining a specific room
                    if (player.roomId) {
                        console.log(`🏠 [ROOM] Player joined room ${player.roomId}`);
                        // You could add additional room-based logic here
                    }

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

                case 'playerDied':
                    // Validate death type and killer info
                    if (!data.deathType || typeof data.deathType !== 'string') {
                        console.error(`❌ [ERROR] Invalid playerDied from ${playerId}: missing or invalid deathType`);
                        return;
                    }
                    
                    const deadPlayer = players.get(playerId);
                    if (deadPlayer) {
                        console.log(`💀 [DEATH] Player ${deadPlayer.name} died:`, {
                            type: data.deathType,
                            killedBy: data.killedBy,
                            position: { x: deadPlayer.x, y: deadPlayer.y },
                            finalSize: deadPlayer.radius
                        });
                        
                        deadPlayer.state = playerStates.DEAD;
                        deadPlayer.deathType = data.deathType;
                        deadPlayer.killedBy = data.killedBy;
                        
                        console.log(`🌍 [WORLD] Active players: ${Array.from(players.values()).filter(p => p.state === playerStates.ALIVE).length}`);
                        
                        // Broadcast death to all clients
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'playerDied',
                                    playerId: playerId,
                                    deathType: data.deathType,
                                    killedBy: data.killedBy
                                }));
                            }
                        });
                    }
                    break;

                case 'playerRespawn':
                    const respawningPlayer = players.get(playerId);
                    if (respawningPlayer) {
                        console.log(`🔄 [RESPAWN] Player ${respawningPlayer.name} respawning:`, {
                            previousState: respawningPlayer.state,
                            deathType: respawningPlayer.deathType
                        });
                        
                        // Reset player state
                        const spawnX = 2500 + (Math.random() - 0.5) * 1000;
                        const spawnY = 2500 + (Math.random() - 0.5) * 1000;
                        
                        Object.assign(respawningPlayer, {
                            x: spawnX,
                            y: spawnY,
                            radius: 20,
                            state: playerStates.ALIVE,
                            deathType: null,
                            killedBy: null
                        });
                        
                        console.log(`🌍 [WORLD] New spawn location: (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
                        console.log(`🌍 [WORLD] Active players: ${Array.from(players.values()).filter(p => p.state === playerStates.ALIVE).length}`);
                        
                        // Broadcast respawn to all clients
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'playerRespawned',
                                    player: respawningPlayer
                                }));
                            }
                        });
                    }
                    break;

                case 'updatePlayer':
                    // Validate position data
                    if (typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.radius !== 'number') {
                        console.error(`❌ [ERROR] Invalid updatePlayer from ${playerId}: missing or invalid position data`);
                        return;
                    }
                    
                    // Check for reasonable values - contains basic anti-cheat
                    if (data.x < 0 || data.x > 20000 || data.y < 0 || data.y > 20000 || 
                        data.radius < 0 || data.radius > 1000) {
                        console.error(`❌ [ERROR] Invalid updatePlayer from ${playerId}: position out of bounds`, {
                            x: data.x, 
                            y: data.y,
                            radius: data.radius
                        });
                        return;
                    }
                    
                    const existingPlayer = players.get(playerId);
                    if (existingPlayer && existingPlayer.state === playerStates.ALIVE) {
                        // Limit movement speed (anti-cheat) - calculate max possible movement
                        const dx = data.x - existingPlayer.x;
                        const dy = data.y - existingPlayer.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // 10 is an arbitrary max speed, adjust as needed for gameplay
                        const maxAllowedDistance = 10;
                        
                        // If movement is too fast, reject it
                        if (distance > maxAllowedDistance) {
                            console.error(`❌ [ERROR] Movement too fast from ${playerId}`, {
                                distance,
                                allowedDistance: maxAllowedDistance,
                                fromPos: { x: existingPlayer.x, y: existingPlayer.y },
                                toPos: { x: data.x, y: data.y }
                            });
                            return;
                        }
                        
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
                    // Validate fish ID
                    if (!data.fishId || typeof data.fishId !== 'string') {
                        console.error(`❌ [ERROR] Invalid fishEaten from ${playerId}: missing or invalid fishId`);
                        return;
                    }
                    
                    // Verify the fish exists
                    if (!fish.has(data.fishId)) {
                        console.error(`❌ [ERROR] Invalid fishEaten from ${playerId}: fish doesn't exist`, {
                            fishId: data.fishId
                        });
                        return;
                    }
                    
                    // Verify player can eat the fish (anti-cheat) - player must be bigger than fish
                    const eatingPlayer = players.get(playerId);
                    const targetFish = fish.get(data.fishId);
                    
                    if (!eatingPlayer || !targetFish) {
                        console.error(`❌ [ERROR] Invalid fishEaten: player or fish not found`);
                        return;
                    }
                    
                    if (eatingPlayer.radius <= targetFish.radius * 1.1) {
                        console.error(`❌ [ERROR] Player too small to eat fish`, {
                            playerRadius: eatingPlayer.radius,
                            fishRadius: targetFish.radius
                        });
                        return;
                    }
                    
                    // Check if player is close enough to eat the fish
                    const fishDx = eatingPlayer.x - targetFish.x;
                    const fishDy = eatingPlayer.y - targetFish.y;
                    const fishDistance = Math.sqrt(fishDx * fishDx + fishDy * fishDy);
                    
                    if (fishDistance > eatingPlayer.radius + targetFish.radius) {
                        console.error(`❌ [ERROR] Player too far to eat fish`, {
                            distance: fishDistance,
                            combined: eatingPlayer.radius + targetFish.radius
                        });
                        return;
                    }
                    
                    // Process valid fish eating
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
                    break;

                case 'ping':
                    // No validation needed for ping messages
                    ws.send(JSON.stringify({ type: 'pong' }));
                    metrics.messagesSent++;
                    break;
                
                case 'requestGameState':
                    // Send the current game state to the player
                    console.log(`📤 [WORLD] Sending full game state to ${playerId}`);
                    
                    ws.send(JSON.stringify({
                        type: 'gameState',
                        players: Array.from(players.values()),
                        fish: Array.from(fish.values())
                    }));
                    break;
                
                default:
                    console.error(`❌ [ERROR] Unknown message type from ${playerId}: ${data.type}`);
                    break;
            }
        } catch (error) {
            console.error('❌ [ERROR] Processing message:', error);
        }
    });

    ws.on('close', () => {
        metrics.connectedPlayers--;
        console.log(`👋 [DISCONNECT] Player ${playerId} disconnected (Total: ${metrics.connectedPlayers})`);
        
        // Only remove player if they're disconnected for more than 30 seconds
        setTimeout(() => {
            const player = players.get(playerId);
            if (player && !Array.from(wss.clients).some(client => client.playerId === playerId)) {
                console.log(`🗑️ [CLEANUP] Removing inactive player ${player.name} after 30s`);
                players.delete(playerId);
                console.log(`🌍 [WORLD] Updated player count: ${players.size}`);
                
                // Broadcast player left
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'playerLeft',
                            playerId: playerId
                        }));
                    }
                });
            }
        }, 30000);
    });

    ws.on('error', (error) => {
        console.error(`Error for player ${playerId}:`, error);
    });
}); 