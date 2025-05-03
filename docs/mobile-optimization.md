# Mobile Optimization for Farcaster Mini Apps

## Overview

Farcaster Mini Apps are always displayed in a mobile-like view, regardless of whether they're being accessed on desktop or mobile devices. This document outlines the optimizations implemented in Whale Wars to ensure a smooth experience across all devices.

## Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

This viewport configuration:
- Sets the width to the device width
- Sets the initial scale to 1.0
- Prevents zooming (maximum-scale=1.0)
- Disables user scaling

## Touch Optimizations

### Preventing Unwanted Mobile Behaviors

```css
body {
    /* Mobile optimization - prevent text selection, bounce effects */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overscroll-behavior: none;
    position: fixed;
    width: 100%;
    height: 100%;
}
```

These CSS properties:
- Prevent text selection
- Disable callouts (context menus)
- Prevent pull-to-refresh and bounce effects
- Fix the game to the viewport

### Touch Input Handling

```javascript
// Add touch event listeners with existence checks
if (canvas) {
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
}

// Implement handlers with passive: false to prevent default behaviors
function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    // Process touch...
}
```

Touch events are handled to:
- Capture touch positions
- Translate them to game inputs
- Prevent default behaviors (like scrolling)

## SDK Gesture Management

The Frame SDK provides options to disable native gestures when they conflict with your game:

```javascript
import { sdk } from '@farcaster/frame-sdk';

// Disable native gestures when ready to prevent swipe-to-dismiss conflicts
await sdk.actions.ready({ disableNativeGestures: true });
```

Use this option when your game:
- Has horizontal swipe mechanics that conflict with swipe-to-dismiss
- Implements custom gesture handling
- Requires full control over touch events

## Network Considerations

### Mobile Network Detection

```javascript
function isMobileNetwork() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        // If Network Information API is available
        return connection.type === 'cellular' || 
               connection.effectiveType === 'slow-2g' || 
               connection.effectiveType === '2g' || 
               connection.effectiveType === '3g';
    }
    
    // Fallback detection based on user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iPad|iPhone|iPod|webOS|BlackBerry|Windows Phone/i.test(userAgent);
}
```

This detects mobile networks to:
- Adjust timeout durations
- Optimize data transfer
- Provide appropriate feedback

### WebSocket Optimizations

For mobile networks:
- Shorter connection timeouts
- More aggressive reconnection strategies
- Clearer connection status feedback
- Reduced message frequency

```javascript
// Example: Adjust WebSocket behavior based on network type
const isMobile = isMobileNetwork();
const reconnectInterval = isMobile ? 2000 : 5000; // Shorter interval on mobile
const pingInterval = isMobile ? 15000 : 30000; // More frequent pings on mobile
const messageThrottleMs = isMobile ? 100 : 50; // Less frequent updates on mobile
```

## Loading Optimization

To optimize loading experience:

1. Use splash screen effectively:

```javascript
import { sdk } from '@farcaster/frame-sdk';

// Load essential assets first
await loadCriticalAssets();

// Hide splash screen when core functionality is ready
await sdk.actions.ready();

// Continue loading non-essential assets in the background
loadNonEssentialAssets().then(() => {
    console.log('All assets loaded');
});
```

2. Implement progressive asset loading:
   - Load low-resolution textures first
   - Replace with higher-resolution as they become available
   - Prioritize gameplay-critical assets

## UI Considerations

### Touch Targets

All interactive elements should have:
- Minimum touch target size of 44x44px
- Appropriate spacing between elements (at least 8px)
- Clear visual feedback on touch

### Size & Orientation

Farcaster Mini Apps are displayed in a vertical modal with these characteristics:
- Mobile dimensions follow the device's screen size
- Web dimensions are fixed at 424x695px
- Portrait orientation is preferred

### Performance

Mobile optimizations include:
- Limiting particles and visual effects
- Throttling update rates when necessary
- Using hardware acceleration where beneficial
- Implementing view culling (only render on-screen elements)

```javascript
// Enable hardware acceleration
canvas.style.transform = 'translateZ(0)';
canvas.style.backfaceVisibility = 'hidden';

// Throttle render loop on mobile
const fps = isMobileNetwork() ? 30 : 60;
const frameInterval = 1000 / fps;
```

## Cross-Client Compatibility

Ensure your Mini App works well across different Farcaster clients:

1. **Warpcast**: Primary client with full feature support
2. **Coinbase Wallet**: May have specific rendering considerations
3. **Other clients**: Test for consistent behavior

## Testing

The game has been tested on:
- iOS (Safari) - iPhone 12+ models
- Android (Chrome) - Latest Samsung, Google Pixel devices
- Desktop browsers (Chrome, Firefox, Safari) in various window sizes
- Farcaster Mini App iframe environment in Warpcast and Coinbase Wallet

## Reference

- [Official Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Frame SDK Documentation](https://miniapps.farcaster.xyz/docs/sdk/actions/ready)
- [Mobile Web Best Practices](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) 