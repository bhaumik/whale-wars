# Farcaster Mini Apps Documentation

## Overview

Mini Apps are web applications built with HTML, CSS, and JavaScript that can be discovered and used within Farcaster clients. They enable developers to create engaging, interactive experiences directly within the Farcaster ecosystem.

## Key Concepts

- **Mini Apps**: Self-contained applications that run inside Farcaster clients
- **Frame Metadata**: Special meta tags that define how a Mini App appears and behaves
- **Button Actions**: Interactions users can have with Mini Apps
- **Frame Context**: User information and state available to the Mini App

## Getting Started

For new projects, you can set up an app using the `@farcaster/create-mini-app` CLI:

```bash
# npm
npm create @farcaster/mini-app

# pnpm
pnpm create @farcaster/mini-app

# yarn
yarn create @farcaster/mini-app
```

For existing projects, install the Frame SDK:

```bash
# npm
npm install @farcaster/frame-sdk

# pnpm
pnpm add @farcaster/frame-sdk

# yarn
yarn add @farcaster/frame-sdk
```

## Required Configuration

### 1. `farcaster.json` Configuration

This file must be placed at `/.well-known/farcaster.json` on your domain:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
    "payload": "eyJkb21haW4iOiJleGFtcGxlLmNvbSJ9",
    "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
  },
  "frame": {
    "version": "1",
    "name": "Your Mini App Name",
    "iconUrl": "https://yourdomain.com/icon.png",
    "homeUrl": "https://yourdomain.com",
    "imageUrl": "https://yourdomain.com/preview.png",
    "buttonTitle": "Start App",
    "splashImageUrl": "https://yourdomain.com/splash.png",
    "splashBackgroundColor": "#0066cc",
    "webhookUrl": "https://yourdomain.com/api/webhook",
    "subtitle": "A short description",
    "description": "A longer description of what your app does (up to 170 characters)",
    "screenshotUrls": [
      "https://yourdomain.com/screenshot1.png",
      "https://yourdomain.com/screenshot2.png",
      "https://yourdomain.com/screenshot3.png"
    ],
    "primaryCategory": "games",
    "tags": [
      "example",
      "game",
      "multiplayer"
    ],
    "heroImageUrl": "https://yourdomain.com/hero.png",
    "tagline": "Your catchy tagline",
    "ogTitle": "Your Mini App - Short Tag",
    "ogDescription": "Brief summary of your app's core benefit",
    "ogImageUrl": "https://yourdomain.com/og.png"
  }
}
```

### 2. Frame Metadata in HTML

The frame metadata is specified using a special meta tag in your HTML:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://yourdomain.com/image.png","button":{"title":"Start","action":{"type":"launch_frame","url":"https://yourdomain.com","name":"Your App"}}}' />
```

## Button Action Types

- `launch_frame`: Launches the Mini App in a new frame
- `post`: Posts a message with the Mini App
- `post_redirect`: Posts a message and redirects to another URL
- `link`: Opens an external link

## SDK Features

The Mini App SDK provides several features to enhance your app's functionality:

### Context

Access information about the user and environment. Users already logged into a Farcaster client are automatically authenticated without needing to sign in again:

```javascript
import { sdk } from '@farcaster/frame-sdk';

// Automatic authentication through client context
async function getUserContext() {
  try {
    // This automatically provides user info when opened in a Farcaster client
    // No explicit login or Sign In With Farcaster required
    const context = await sdk.getContext();
    
    if (context.user) {
      console.log('User is already authenticated:', context.user.username);
      // Use context.user.fid, context.user.username, context.user.pfp.url etc.
      return context.user;
    } else {
      console.log('No user context available');
      return null;
    }
  } catch (error) {
    console.error('Error getting context:', error);
    return null;
  }
}
```

### Authentication Best Practices

1. **Default to Automatic Authentication**: Always try to get user context first. This works automatically for users in Farcaster clients.

2. **Use Sign In With Farcaster as Fallback**: Only use explicit sign-in for users outside Farcaster clients or for actions requiring additional verification:

```javascript
async function authenticateUser() {
  // First try automatic authentication from context
  try {
    const context = await sdk.getContext();
    if (context.user && context.user.fid) {
      return {
        authenticated: true,
        user: context.user
      };
    }
  } catch (e) {
    console.log('Not in a Farcaster client or context unavailable');
  }
  
  // Only show explicit sign-in if automatic auth failed
  try {
    const nonce = await generateNonce();
    const result = await sdk.actions.signIn({ nonce });
    // Verify the signature on your server
    return { authenticated: true, signature: result };
  } catch (e) {
    console.error('Sign in failed:', e);
    return { authenticated: false };
  }
}
```

### Actions

- `addFrame`: Prompts the user to add the Mini App
- `close`: Closes the Mini App
- `composeCast`: Prompts the user to create a cast
- `ready`: Hides the Splash Screen
- `signIn`: Prompts the user to Sign In with Farcaster (use only when necessary)
- `openUrl`: Opens an external URL
- `viewProfile`: View a Farcaster profile

### Experimental Wallet Actions

- `sendToken`: Open the send form with pre-filled token and recipient
- `swapToken`: Open the swap form with pre-filled tokens
- `viewToken`: Displays a token

## Cross-Client Compatibility

When building Mini Apps:

- Use official SDK functions instead of platform-specific deeplinks
- Test in multiple clients (Warpcast, Coinbase Wallet, etc.)
- Follow authentication best practices for each client

## Best Practices

1. **Responsive Design**: Ensure your Mini App works well on mobile devices
2. **Fast Loading**: Optimize performance for quick loading
3. **Clear Instructions**: Provide clear guidance to users
4. **Error Handling**: Implement robust error handling
5. **User Authentication**: Use proper authentication for user actions

## Development Rewards

Warpcast gives out weekly rewards to top developers on the network. Winners are determined based on engagement metrics and are refreshed every Wednesday at 17:00 UTC.

## Reference

- [Official Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Frame SDK GitHub Repository](https://github.com/farcasterxyz/miniapps)
- [Mini Apps Developer Chat](https://warpcast.com/~/developers/frames) 