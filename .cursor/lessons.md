# Whale Wars Project Lessons

This file captures important lessons, fixes, configurations, and "gotchas" discovered during the development of the Whale Wars game.

## Fixes and Solutions

### WebSocket Connectivity
- Ensure the ping handler in the server uses the correct WebSocket reference
- Implement reconnection logic with exponential backoff to handle disconnections gracefully

### Canvas Rendering
- Always verify canvas existence before manipulating it to prevent null reference errors
- Implement a proper resizeCanvas method to handle window resizing

### Performance Optimization
- Implement entity culling to only render elements visible on screen
- Throttle position updates to reduce network traffic
- Use shorter field names in network messages to reduce payload size

### Security Best Practices
- Validate all client input on the server side to prevent injection attacks
- Use token-based authentication for WebSocket connections
- Implement rate limiting to prevent flooding attacks
- Add server-side validation for game mechanics to prevent cheating

## Configuration Tips

### Responsive Design
- Use media queries to adjust UI elements for different screen sizes
- Implement touch-specific controls for mobile devices with visual feedback

### Error Handling
- Create a notification system for displaying errors and game events
- Log detailed error information server-side for debugging

## Farcaster Integration

### Authentication
- For Farcaster clients, use event-based approach for automatic authentication
- Check message events for Farcaster user data
- Always support standalone/anonymous mode with fallback
- Use multiple fallback methods (getContext API, message events) to handle different clients
- Set timeouts for authentication to avoid indefinite waiting
- Store and use session tokens for reconnection

### SDK Integration
- Import SDK from CDN for direct browser usage
- Call sdk.actions.ready() as soon as possible to hide splash screen
- Use sdk.actions.composeCast() for sharing to Farcaster
- Handle errors gracefully with fallback sharing options
- Keep SDK versions updated to the latest available (currently 0.0.37)

### Cross-Client Compatibility
- Test in multiple Farcaster clients (Warpcast, Coinbase Wallet)
- Provide fallback mechanisms for clients with limited functionality
- Always include anonymous play option for standalone web users
- Use the Web Share API as fallback for non-Farcaster clients
- Implement clipboard copying as a last resort for sharing

### Mini App Configuration
- Use "vNext" as version in frame meta tags and farcaster.json
- Structure farcaster.json according to the latest specification
- Include all required fields in proper format (image, buttons, etc.)
- Use post_redirect action for buttons directing to external URLs
- Set proper image dimensions and aspect ratios

### Social Features
- Implement achievement sharing with dynamic image generation
- Create custom invite links with unique room IDs
- Use verification badges for Farcaster verified users
- Add special styling for Farcaster users in UI elements
- Create dynamic Frame images using HTML for sharing content

## Known Issues and Workarounds

- Double tap detection on mobile requires careful timing configuration
- Memory leaks can occur if event listeners aren't properly removed
- WebSocket connections may timeout in certain network conditions
- Some Farcaster clients don't support all SDK actions - always provide fallbacks
- Authentication might fail silently in some clients - implement timeout handling
- Image generation for Frames needs proper dimensions (1.91:1 aspect ratio) 