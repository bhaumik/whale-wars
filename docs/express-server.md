# Express.js Server Documentation

## Overview

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. In Whale Wars, we use Express to serve static files and handle HTTP requests.

## Basic Setup

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
```

## Middleware Configuration

### CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors({
    origin: ['https://whale-wars.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
```

This configuration allows requests from both the production URL and local development server, which is essential for testing.

### Static File Serving

```javascript
// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root directory
app.use(express.static(__dirname));
```

## Route Configuration

### Farcaster Mini App Configuration

```javascript
// Explicit route for Farcaster manifest
app.get('/.well-known/farcaster.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '.well-known', 'farcaster.json'));
});
```

### Main Game Route

```javascript
// Root route serves the game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
```

### Asset Routes

```javascript
// Specific routes for important assets
app.get('/icon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'icon.png'));
});

app.get('/preview.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'preview.png'));
});
```

## Server Initialization

```javascript
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
```

## WebSocket Integration

Express can share the same HTTP server instance with WebSockets:

```javascript
const WebSocket = require('ws');
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Create WebSocket server that uses the same HTTP server
const wss = new WebSocket.Server({ server });
```

## API Endpoints

### Webhook Endpoint for Farcaster

```javascript
app.post('/api/webhook', express.json(), (req, res) => {
    // Handle Farcaster webhook requests
    // This typically processes mini app interactions
    
    // Respond with a success status
    res.status(200).json({ success: true });
});
```

## Deployment Considerations

1. **Environment Variables**: Use environment variables for configuration that changes between environments (development, staging, production)

2. **Error Handling**: Implement global error handling middleware

3. **Security**: Use appropriate security headers and validate all input

4. **Logging**: Implement request logging for debugging and monitoring

5. **Compression**: Use compression middleware for faster response times

## Best Practices

1. **Organize Routes**: Separate routes into different files for better code organization

2. **Stateless Design**: Keep the server stateless to allow for horizontal scaling

3. **Validation**: Validate all incoming data before processing

4. **Rate Limiting**: Implement rate limiting to prevent abuse

5. **Monitoring**: Add health check endpoints for monitoring 