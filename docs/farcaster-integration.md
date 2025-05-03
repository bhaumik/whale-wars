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
    "webhookUrl": "https://whale-wars.onrender.com/api/webhook",
    "subtitle": "Become the biggest whale on Farcaster",
    "description": "Compete in this multiplayer battle to become the ultimate whale on Farcaster! Grow your whale by consuming smaller players - a playful nod to crypto whale status, but with actual whales!",
    "primaryCategory": "games",
    "tags": ["game", "multiplayer", "battle", "crypto", "whales"],
    "heroImageUrl": "https://whale-wars.onrender.com/hero.png",
    "tagline": "Are you whale enough?",
    "ogTitle": "Whale Wars - The Ultimate Whale Status",
    "ogDescription": "Grow your whale, swallow smaller players, and claim your status as the biggest whale on Farcaster!",
    "ogImageUrl": "https://whale-wars.onrender.com/og.png"
  }
}
```

### HTML Frame Metadata

In `index.html`, we include the necessary meta tag for Farcaster frame integration:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://whale-wars.onrender.com/preview.png","button":{"title":"🐳 Become a Whale","action":{"type":"launch_frame","url":"https://whale-wars.onrender.com?v=1","name":"Whale Wars"}}}' />
```

## Using the Frame SDK

We use the official Farcaster Frame SDK to integrate with the Farcaster ecosystem. For users already logged into a Farcaster client (like Warpcast), we automatically use their identity without requiring additional authentication:

```javascript
// Import the SDK
import { sdk } from '@farcaster/frame-sdk';

// Initialize the game with automatic user authentication
async function initGame() {
  try {
    // Get user context - this automatically provides user info when 
    // opened in a Farcaster client without requiring explicit login
    const context = await sdk.getContext();
    
    if (context.user && context.user.username) {
      console.log('✅ User already authenticated through Farcaster client:', {
        username: context.user.username,
        fid: context.user.fid
      });
      
      // Use Farcaster user info for player data
      this.playerInfo = {
        name: context.user.username,
        fid: context.user.fid,
        // If available, use the user's profile picture as their avatar
        avatar: context.user.pfp?.url || this.defaultAvatar
      };
      
      // User is already authenticated, no further login needed
      this.isAuthenticated = true;
    } else {
      console.log('⚠️ No user context available, using anonymous mode');
      // Handle anonymous mode or optional explicit login
      this.playerInfo = {
        name: `Whale${Math.floor(Math.random() * 1000)}`,
        avatar: this.defaultAvatar
      };
    }
    
    // Hide splash screen when game is ready
    await sdk.actions.ready();
    
    // Initialize game with user context
    this.initializeGame();
  } catch (e) {
    console.log('🌐 Running in standalone web environment', e);
    // Fall back to standalone mode
    this.handleStandaloneMode();
  }
}
```

## Authentication Flow

For Whale Wars, we use a multi-tier authentication approach:

1. **Farcaster Client Auth (Automatic)**: When the game is opened in a Farcaster client (Warpcast, Coinbase Wallet), we automatically retrieve the user's identity from the client context - no login required.

2. **Standalone Web Mode**: Only when the game is accessed directly through a web browser (outside a Farcaster client) do we offer explicit login options:

```javascript
async function handleAuthentication() {
  // First try to get context - this works automatically in Farcaster clients
  try {
    const context = await sdk.getContext();
    
    if (context.user && context.user.fid) {
      // User is already authenticated through Farcaster client
      return {
        authenticated: true,
        user: context.user
      };
    }
  } catch (e) {
    console.log('Context retrieval failed, might be outside Farcaster client');
  }
  
  // If we're here, we're likely not in a Farcaster client
  // Show login options ONLY for standalone web visitors
  if (this.isStandaloneMode) {
    this.showLoginOptions();
  } else {
    // Still in a Farcaster client but couldn't get context
    // Proceed with anonymous play
    return createAnonymousSession();
  }
}
```

This ensures that users already in a Farcaster client have a seamless experience without additional login prompts, while standalone web users still have authentication options.

## Using Farcaster User Information

When automatically authenticated in a Farcaster environment, the game uses the user's Farcaster identity:

1. Username as player name
2. FID (Farcaster ID) for unique identification
3. Profile picture as player avatar (if available)

## Social Sharing Integration

We enable players to share their achievements and game results with playful whale-themed messages:

```javascript
async function shareGameResults(score, rank, killedBy) {
  try {
    let text;
    
    if (killedBy) {
      // Player was eaten by someone else
      text = `I just got swallowed by @${killedBy} in Whale Wars! 🐳 Turns out I wasn't whale enough...`;
    } else if (rank === 1) {
      // Player was the top whale
      text = `I'm officially the BIGGEST whale on Farcaster! 🐳 Swallowed ${score} players in Whale Wars. Who dares challenge me?`;
    } else {
      // Player was ranked but not first
      text = `I was the ${rank}${getRankSuffix(rank)} biggest whale on Farcaster with ${score} points in Whale Wars! 🐳 Still growing...`;
    }
    
    const embeds = [`https://whale-wars.onrender.com/share?score=${score}&rank=${rank}`];
    
    await sdk.actions.composeCast({
      text,
      embeds
    });
  } catch (error) {
    console.error('Error sharing results:', error);
  }
}

// Helper function for rank suffixes (1st, 2nd, 3rd, etc.)
function getRankSuffix(rank) {
  if (rank % 10 === 1 && rank !== 11) return 'st';
  if (rank % 10 === 2 && rank !== 12) return 'nd';
  if (rank % 10 === 3 && rank !== 13) return 'rd';
  return 'th';
}

// Custom sharing for different achievements
async function shareWhaleAchievement(achievementType) {
  try {
    let text;
    
    switch (achievementType) {
      case 'first-whale':
        text = `I just consumed my first player in Whale Wars! My journey to become the biggest whale on Farcaster has begun! 🐳`;
        break;
      case 'whale-spree':
        text = `I'm on a whale spree! Swallowed 5 players in a row in Whale Wars! 🐳 The ocean trembles as I swim by!`;
        break;
      case 'mega-whale':
        text = `MEGA WHALE STATUS ACHIEVED! 🐳 I'm in the top 1% of whales on Farcaster. Even the crypto whales are taking notes!`;
        break;
      default:
        text = `Just made a splash in Whale Wars! 🐳 Swimming my way to the top of Farcaster!`;
    }
    
    const embeds = [`https://whale-wars.onrender.com/share?achievement=${achievementType}`];
    
    await sdk.actions.composeCast({
      text,
      embeds
    });
  } catch (error) {
    console.error('Error sharing achievement:', error);
  }
}
```

## Cross-Client Compatibility

The game is optimized to work across different Farcaster clients:

1. **Warpcast**: Primary client with full feature support
2. **Coinbase Wallet**: Optimized for the in-app wallet integration
3. **Other clients**: Graceful fallback for basic functionality

## Development Considerations

1. **Testing**: Always test in multiple Farcaster clients (Warpcast, Coinbase Wallet)
2. **Versioning**: Use URL parameters for version tracking (`?v=1`)
3. **Performance**: Optimize for mobile devices as most Farcaster users are on mobile
4. **Error Handling**: Gracefully handle cases where Farcaster context is unavailable

## Weekly Developer Rewards

Whale Wars participates in the Farcaster developer rewards program. Performance metrics such as engagement and user retention contribute to rankings in the weekly rewards distribution, which are refreshed every Wednesday at 17:00 UTC.

## Useful Links

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Frame SDK GitHub Repository](https://github.com/farcasterxyz/miniapps)
- [Mini Apps Developer Chat](https://warpcast.com/~/developers/frames) 