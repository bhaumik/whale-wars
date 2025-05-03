# WebSocket Debugging Guide

## Common WebSocket Issues

WebSocket connections can fail for several reasons. This guide helps identify and resolve common issues in the Whale Wars game.

## Client-Side Console Errors

### Connection Failed

```
🌐 [WEBSOCKET] Connecting to: wss://whale-wars.onrender.com
🌐 [ERROR] WebSocket error: Error in connection establishment
```

### Connection Closed Unexpectedly

```
🌐 [WEBSOCKET] Disconnected from server
🌐 [WEBSOCKET] Reconnecting in 1000ms... (attempt 1)
```

## Debugging Steps

### 1. Check Browser Console

Always start by opening your browser's developer tools (F12 or right-click -> Inspect) and checking the Console tab for error messages.

### 2. Verify WebSocket URL

Check that the client is using the correct WebSocket URL:

**Development**: `ws://localhost:8080`
**Production**: `wss://whale-wars.onrender.com`

Note the protocol differences:
- `ws://` - Unencrypted WebSocket (HTTP equivalent)
- `wss://` - Encrypted WebSocket (HTTPS equivalent)

### 3. Check Network Tab

In browser developer tools, go to the Network tab and filter by "WS" to see WebSocket connections:

1. Look for the WebSocket connection attempt
2. Check the status (101 Switching Protocols = success)
3. Inspect the request/response headers

### 4. Server Logs

Check the server logs for connection attempts and errors:

```
Server listening on port 8080
[WEBSOCKET] New connection from 192.168.1.100
[WEBSOCKET] Error: client terminated connection
```

### 5. CORS Issues

WebSocket connections can be affected by CORS policies. Check for CORS-related errors in the console:

```
Access to XMLHttpRequest at 'wss://whale-wars.onrender.com' from origin 'https://example.com' has been blocked by CORS policy
```

### 6. Proxy/Firewall Issues

WebSockets may be blocked by firewalls or proxies. Check:

1. Corporate network restrictions
2. VPN configurations
3. Personal firewall settings

### 7. Server Availability

Verify the server is running and accessible:

```bash
# Check if server is responding to HTTP requests
curl -I https://whale-wars.onrender.com

# Example successful response
HTTP/2 200
content-type: text/html; charset=utf-8
date: Wed, 23 Jun 2023 15:40:12 GMT
```

## Common Solutions

### Client-Side Fixes

#### 1. Use the Correct WebSocket URL

```javascript
// Development
const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8080` 
    : `wss://${window.location.hostname}`;
    
this.ws = new WebSocket(wsUrl);
```

#### 2. Implement Reconnection Logic

```javascript
function connectWebSocket() {
    const ws = new WebSocket(wsUrl);
    
    ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 1000);
    };
    
    // Other event handlers...
    
    return ws;
}
```

#### 3. Check Browser Support

Ensure the browser supports WebSockets:

```javascript
if (!('WebSocket' in window)) {
    console.error('WebSockets are not supported in this browser');
    // Show fallback UI
}
```

### Server-Side Fixes

#### 1. Proper CORS Configuration

```javascript
app.use(cors({
    origin: ['https://whale-wars.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
```

#### 2. Handle Connection Errors

```javascript
wss.on('connection', (ws) => {
    ws.isAlive = true;
    
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    // Other event handlers...
});
```

#### 3. Implement Heartbeat

```javascript
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});
```

## Testing WebSocket Connection

Use this code snippet in the browser console to test WebSocket connections:

```javascript
function testWebSocket(url) {
    console.log(`Testing connection to ${url}...`);
    const testWs = new WebSocket(url);
    
    testWs.onopen = () => {
        console.log('✅ Connection successful!');
        testWs.close();
    };
    
    testWs.onerror = (error) => {
        console.error('❌ Connection failed:', error);
    };
}

// Test production
testWebSocket('wss://whale-wars.onrender.com');

// Test local
testWebSocket('ws://localhost:8080');
```

## Helpful Tools

1. **WebSocket King**: Browser extension for testing WebSocket connections
2. **Wireshark**: Network protocol analyzer that can capture WebSocket traffic
3. **curl**: Command-line tool that can make WebSocket connection attempts with `--include` flag 