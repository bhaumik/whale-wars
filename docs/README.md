# Whale Wars Documentation

## Overview

This directory contains comprehensive documentation for the Whale Wars multiplayer game. Whale Wars is a browser-based game where players control whales, eat fish to grow larger, and compete with other players. The goal is to be the biggest whale on Farcaster

## Documentation Files

### Core Architecture

- [Game Architecture](game-architecture.md) - Overview of the entire game system architecture including client-side and server-side components
- [Express Server](express-server.md) - Details on the Express.js server configuration and API endpoints
- [WebSockets](websockets.md) - Documentation of the WebSocket implementation for real-time multiplayer functionality

### Farcaster Integration

- [Farcaster Mini Apps](farcaster-mini-apps.md) - General documentation about Farcaster Mini Apps specifications and requirements
- [Farcaster Integration](farcaster-integration.md) - Specific implementation details for how Whale Wars integrates with Farcaster
- [Updating Farcaster Configuration](farcaster-updates.md) - Guide for updating the Farcaster Mini App configuration
- [Mobile Optimization](mobile-optimization.md) - Optimizations for mobile-like view in Farcaster Mini Apps

### Debugging and Troubleshooting

- [WebSocket Debugging](websocket-debugging.md) - Guide for diagnosing and fixing WebSocket connection issues

## Quick References

### Configuration Files

- `public/.well-known/farcaster.json` - Farcaster Mini App configuration file
- `index.html` - Main game file with Farcaster frame metadata
- `server.js` - Server implementation with WebSocket and Express.js
- `package.json` - Project dependencies

### Key Dependencies

- `ws` - WebSocket implementation for Node.js
- `express` - Web server framework
- `cors` - Cross-origin resource sharing middleware
- `uuid` - For generating unique identifiers

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

## Debugging

Check the browser console and server logs for detailed metrics and error information. The game includes comprehensive logging for:

- WebSocket connection status
- Game performance metrics
- Player actions and state changes
- Farcaster integration events

## External Resources

- [Official Farcaster MiniApps Repository](https://github.com/farcasterxyz/miniapps) - Examples and official utilities for building Mini Apps
- [Farcaster Documentation](https://docs.farcaster.xyz/) - Official Farcaster documentation

## Contributing

Please review all documentation before making changes to the codebase. Follow the established architectural patterns and code style. 