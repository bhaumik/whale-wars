# Farcaster Integration in Whale Wars

## Overview

Whale Wars integrates with Farcaster as a Mini App, allowing players to access the game directly from the Farcaster ecosystem. This document covers the specific integration points between Whale Wars and Farcaster.

## Configuration Files

### `public/.well-known/farcaster.json`

This file is required for domain verification and Mini App configuration:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjg0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDY4OTE1OUU4NGNFM2Y4YzVEMUFlRmVERDI5OUYzMzBEOUEzRUJjYWUifQ",
    "payload": "eyJkb21haW4iOiJ3aGFsZS13YXJzLm9ucmVuZGVyLmNvbSJ9",
    "signature": "MHgwZDQwZDdjYjY2NThjODA3Mzg0NTViMTIxYWEyNTMxYjBkMDYzN2Y2OGY5NDg3MDk0NWUwNDkwNGMwYjFhN2U0MzYwMTg2ZWE1N2VkYTMzM2IxYTgyMGZlNDRlZjA0YjcyZTFlMzc5MjgzOGJiM2Y5ZGI1NGZhYzRmODE5N2RiOTFj"
  },
  "frame": {
    "version": "1",
    "name": "Whale Wars",
    "iconUrl": "https://whale-wars.onrender.com/icon.png",
    "homeUrl": "https://whale-wars.onrender.com",
    "imageUrl": "https://whale-wars.onrender.com/preview.png",
    "buttonTitle": "🎮 Play Now",
    "splashImageUrl": "https://whale-wars.onrender.com/icon.png",
    "splashBackgroundColor": "#0066cc",
    "webhookUrl": "https://whale-wars.onrender.com/api/webhook"
  }
}
```

### HTML Frame Metadata

In `index.html`, we include the necessary meta tag for Farcaster frame integration:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://whale-wars.onrender.com/preview.png","button":{"title":"🎮 Start","action":{"type":"launch_frame","url":"https://whale-wars.onrender.com?v=1","name":"Whale Wars"}}}' />
```

## Detecting Farcaster Environment

The game detects whether it's running within a Farcaster Mini App environment:

```javascript
// Attempt to get Mini App context
try {
    console.log('⚡️ Attempting to get Mini App context...');
    window.addEventListener('message', (event) => {
        if (event.data && event.data.source === 'farcaster') {
            console.log('✅ Running in Mini App environment:', {
                user: event.data.user
            });
            
            // Use Farcaster user info for player data
            const { user } = event.data;
            if (user && user.username) {
                this.playerInfo.name = user.username;
                this.playerInfo.fid = user.fid;
            }
            
            // Initialize game with Farcaster context
            this.initializeGame();
        }
    });
} catch (e) {
    console.log('🌐 Running in standalone web environment', e);
    // Fall back to standalone mode
    this.initializeGame();
}
```

## Using Farcaster User Information

When detected in a Farcaster environment, the game uses the user's Farcaster identity:

1. Username as player name
2. FID (Farcaster ID) for unique identification
3. Profile picture as player avatar (if available)

## API Webhook Integration

The game's server includes a webhook endpoint to handle Farcaster Mini App interactions:

```javascript
app.post('/api/webhook', express.json(), (req, res) => {
    const { body } = req;
    
    // Process Farcaster webhook data
    if (body && body.untrustedData && body.untrustedData.buttonIndex) {
        // Handle button interactions
        const buttonIndex = body.untrustedData.buttonIndex;
        // Process based on button pressed
    }
    
    // Return a response to Farcaster
    res.status(200).json({
        message: "Success",
        buttons: [
            {
                label: "Play Again",
                action: "post_redirect"
            }
        ]
    });
});
```

## Development Considerations

1. **Testing**: Always test both in Farcaster environment and standalone mode
2. **Versioning**: Use URL parameters for version tracking (`?v=1`)
3. **Performance**: Optimize for mobile devices as most Farcaster users are on mobile
4. **Error Handling**: Gracefully handle cases where Farcaster context is unavailable

## Weekly Developer Rewards

Whale Wars participates in the Farcaster developer rewards program. Performance metrics such as engagement and user retention contribute to rankings in the weekly rewards distribution.

## Useful Links

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/reference/mini-apps/specification)
- [Warpcast API Documentation](https://docs.farcaster.xyz/reference/warpcast/api)
- [Developer Rewards Documentation](https://docs.farcaster.xyz/reference/warpcast/api#get-developer-reward-winners) 