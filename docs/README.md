# Whale Wars Documentation

## Overview

This directory contains comprehensive documentation for the Whale Wars multiplayer game. Whale Wars is a browser-based game where players control whales, eat smaller players to grow larger, and compete to become the biggest whale on Farcaster. The game is a playful take on the crypto term "whale" (large holders) but with actual whales that grow in size as they consume others.

## Documentation Files

### Core Architecture

- [Game Architecture](game-architecture.md) - Overview of the entire game system architecture including client-side and server-side components
- [Express Server](express-server.md) - Details on the Express.js server configuration and API endpoints
- [WebSockets](websockets.md) - Documentation of the WebSocket implementation for real-time multiplayer functionality

### Farcaster Integration

- [Farcaster Mini Apps](farcaster-mini-apps.md) - Documentation about Farcaster Mini Apps specifications, features, and SDK
- [Farcaster Integration](farcaster-integration.md) - Implementation details for how Whale Wars integrates with Farcaster
- [Updating Farcaster Configuration](farcaster-updates.md) - Guide for updating the Farcaster Mini App configuration and metadata
- [Mobile Optimization](mobile-optimization.md) - Optimizations for mobile-like view in Farcaster Mini Apps

### Debugging and Troubleshooting

- [WebSocket Debugging](websocket-debugging.md) - Guide for diagnosing and fixing WebSocket connection issues

## Game Concept

Whale Wars plays on a double meaning:

1. **Literal Whales**: Players control whale characters that grow larger as they consume other players and food
2. **Crypto Whales**: A nod to the crypto term for large holders, as players aim to become the "biggest whale" on Farcaster

Players start small and must strategically eat smaller players while avoiding larger ones. The social sharing features allow players to brag about their whale status or commiserate about being swallowed by larger whales.

## Quick References

### Configuration Files

- `public/.well-known/farcaster.json` - Farcaster Mini App configuration and metadata
- `index.html` - Main game file with Farcaster frame metadata
- `server.js` - Server implementation with WebSocket and Express.js
- `package.json` - Project dependencies

### Key Dependencies

- `ws` - WebSocket implementation for Node.js
- `express` - Web server framework
- `cors` - Cross-origin resource sharing middleware
- `uuid` - For generating unique identifiers
- `@farcaster/frame-sdk` - Official Farcaster SDK for Mini Apps

### Farcaster SDK Features

The game uses the official Farcaster Frame SDK to:
- Access user information
- Enable social sharing of whale-themed achievements
- Authenticate users
- Control the splash screen
- Handle navigation between screens
- Support wallet interactions

### Social Sharing Features

Players can share different achievements and game states:
- Being the biggest whale on Farcaster
- Getting swallowed by another player
- Achieving a high rank among whales
- Going on a "whale spree" (consuming multiple players in succession)

### Deployment

The game is deployed on Render with the following configuration:

```
service: whale-wars
repo: https://github.com/yourusername/whale-wars
branch: main
buildCommand: npm install
startCommand: node server.js
```

## Development Workflow

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm start`
4. Access the game at http://localhost:8080
5. Test across multiple Farcaster clients

## Cross-Client Compatibility

The game is optimized to work across different Farcaster clients:

1. **Warpcast**: Primary client with full feature support
2. **Coinbase Wallet**: Optimized for the in-app wallet integration
3. **Other clients**: Graceful fallback for basic functionality

## Debugging

Check the browser console and server logs for detailed metrics and error information. The game includes comprehensive logging for:

- WebSocket connection status
- Game performance metrics
- Player actions and state changes
- Farcaster integration events

## External Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Frame SDK GitHub Repository](https://github.com/farcasterxyz/miniapps)
- [Mini Apps Developer Chat](https://warpcast.com/~/developers/frames)
- [What's New in the SDK](https://miniapps.farcaster.xyz/docs/sdk/changelog)

## Contributing

Please review all documentation before making changes to the codebase. Follow the established architectural patterns and code style. 