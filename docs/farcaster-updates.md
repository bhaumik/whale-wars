# Updating Farcaster Mini App Configuration

This guide explains how to update the Farcaster Mini App configuration for Whale Wars.

## Current Configuration

The Farcaster Mini App configuration is stored in two main locations:

1. **`public/.well-known/farcaster.json`** - Domain verification and app configuration
2. **Frame meta tags in `index.html`** - Embedded frame configuration

## Updating farcaster.json

The `farcaster.json` file contains the following sections:

### 1. Account Association

```json
"accountAssociation": {
  "header": "eyJmaWQiOjg0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDY4OTE1OUU4NGNFM2Y4YzVEMUFlRmVERDI5OUYzMzBEOUEzRUJjYWUifQ",
  "payload": "eyJkb21haW4iOiJ3aGFsZS13YXJzLm9ucmVuZGVyLmNvbSJ9",
  "signature": "MHgwZDQwZDdjYjY2NThjODA3Mzg0NTViMTIxYWEyNTMxYjBkMDYzN2Y2OGY5NDg3MDk0NWUwNDkwNGMwYjFhN2U0MzYwMTg2ZWE1N2VkYTMzM2IxYTgyMGZlNDRlZjA0YjcyZTFlMzc5MjgzOGJiM2Y5ZGI1NGZhYzRmODE5N2RiOTFj"
}
```

This section verifies ownership of the domain. To update it:

1. Visit the [Farcaster Developer Portal](https://warpcast.com/~/developers)
2. Choose "Domain Verification"
3. Enter your domain (e.g., `whale-wars.onrender.com`)
4. Follow the instructions to generate a new association
5. Replace the entire `accountAssociation` object in `farcaster.json`

### 2. Frame Configuration

```json
"frame": {
  "version": "1",
  "name": "Whale Wars",
  "iconUrl": "https://whale-wars.onrender.com/icon.png",
  "homeUrl": "https://whale-wars.onrender.com",
  "imageUrl": "https://whale-wars.onrender.com/preview.png",
  "buttonTitle": "🐳 Become a Whale",
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
```

To update the frame configuration:

1. Modify the properties as needed, ensuring:
   - All URLs are absolute (starting with `https://`)
   - `name` is your Mini App name (30 chars max, no emojis)
   - `buttonTitle` is 32 characters or less (note: this field is deprecated but still supported)
   - `version` stays as "1" (unless specifically changing to a newer version)
   
2. Add or update the new metadata fields:
   - `subtitle`: Short description under the app name (30 chars max)
   - `description`: Promotional message displayed on Mini App Page (170 chars max)
   - `primaryCategory`: One of: games, social, finance, utility, productivity, health-fitness, news-media, music, shopping, education, developer-tools, entertainment, art-creativity
   - `tags`: Up to 5 descriptive tags for filtering/search
   - `heroImageUrl`: Promotional display image (1200x630px, 1.91:1 ratio)
   - `tagline`: Marketing tagline (30 chars max)
   - `ogTitle`, `ogDescription`, `ogImageUrl`: Open graph metadata for sharing

3. Save the file and deploy your changes to production

## Updating HTML Meta Tags

The HTML meta tags in `index.html` control how your Mini App appears in Farcaster:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://whale-wars.onrender.com/preview.png","button":{"title":"🐳 Become a Whale","action":{"type":"launch_frame","url":"https://whale-wars.onrender.com?v=1","name":"Whale Wars"}}}' />
```

To update these tags:

1. Modify the JSON content as needed
2. Ensure all URLs are absolute
3. Make sure the `version` is set to "next" for the latest features
4. Note that the `url` parameter is now optional - if not provided, it defaults to the current page URL
5. The URL max length has been increased to 1024 characters
6. The `button.action.type` should be "launch_frame" for a Mini App
7. Save the file and deploy changes

## Image Requirements

When updating images, ensure they meet these requirements:

1. **Preview Image (`preview.png` or `imageUrl`)**:
   - 1200x800 pixels (3:2 aspect ratio)
   - Under 1MB in size
   - PNG or JPG format
   - Consider using an image that shows a large whale consuming smaller ones to reinforce the game's concept

2. **Icon Image (`icon.png`)**:
   - 1024x1024 pixels (1:1 aspect ratio)
   - PNG format, no alpha (transparency)
   - No text, use a bold recognizable whale logo

3. **Splash Image (`splashImageUrl`)**:
   - 200x200 pixels (1:1 aspect ratio)
   - Under 256KB in size
   - PNG format (preferably with transparency)
   - Use a recognizable whale icon that matches your branding

4. **Hero Image (`heroImageUrl` and `ogImageUrl`)**:
   - 1200x630 pixels (1.91:1 ratio)
   - JPG or PNG format
   - Should show your brand clearly with minimal text
   - Consider an image showing a whale growing in size or consuming smaller elements

5. **Screenshots (`screenshotUrls`)**:
   - Portrait orientation, 1284x2778 pixels
   - Show core features of your app
   - Include gameplay moments highlighting the whale growth mechanics

## Cross-Client Compatibility

When updating your Mini App, consider compatibility across different Farcaster clients:

1. **Warpcast**: Primary client with full feature support
2. **Coinbase Wallet**: Optimized for the in-app wallet integration
   - Prefer wallet authentication over Sign In with Farcaster
   - Avoid Warpcast-specific deeplinks in the `openUrl` function
3. **Other clients**: Ensure graceful fallback for basic functionality

## Authentication Methods

Consider different authentication approaches based on the client:

1. **Wallet Authentication**: Recommended for Coinbase Wallet
2. **Context Data Authentication**: Use for basic auth with minimal friction
3. **Sign In with Farcaster**: Full authentication but may require deeplinks in some clients

## Testing Changes

After updating configurations:

1. Deploy your changes to production
2. Test your Mini App in the [Farcaster Debug Tool](https://warpcast.com/~/developers/mini-apps/debug)
3. Test in multiple clients (Warpcast, Coinbase Wallet)
4. Check that all images load properly
5. Verify buttons work as expected
6. Test the user flow from start to finish
7. Test social sharing with different game outcomes (being the top whale, getting eaten, etc.)

## Troubleshooting

### Common Issues

1. **Domain Verification Fails**:
   - Ensure the `accountAssociation` is correctly copied from the developer portal
   - Verify the domain in the payload matches your actual domain

2. **Images Don't Load**:
   - Check that image URLs are absolute and publicly accessible
   - Verify image dimensions and formats meet requirements

3. **Buttons Don't Work**:
   - Ensure button actions have the correct type and valid URLs
   - Check that the webhook endpoint is correctly implemented

4. **Mini App Doesn't Launch**:
   - Verify the `launch_frame` action has the correct URL
   - Check browser console for JavaScript errors

5. **SDK Actions Fail**:
   - Ensure you're using the latest SDK version (currently 0.0.37)
   - Check that SDK actions are called after the SDK is initialized

## SDK Version Updates

The current SDK version is 0.0.37 (as of April 30, 2025) with the following recent changes:

- Added experimental wallet actions: `swapToken`, `sendToken`, and `viewToken`
- Added `noindex` field to manifest 
- Introduced new manifest metadata fields
- Deprecated `imageUrl` and `buttonTitle` fields (still supported but may be removed in future)
- URL max length increased to 1024 characters
- Made `url` optional in `actionLaunchFrameSchema`

To update the SDK:

```bash
npm install @farcaster/frame-sdk@latest
```

## Additional Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Frame SDK GitHub Repository](https://github.com/farcasterxyz/miniapps)
- [Mini Apps Developer Chat](https://warpcast.com/~/developers/frames)
- [What's New in the SDK](https://miniapps.farcaster.xyz/docs/sdk/changelog) 