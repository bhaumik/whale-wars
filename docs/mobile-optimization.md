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
// Add touch event listeners
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
```

Touch events are handled to:
- Capture touch positions
- Translate them to game inputs
- Prevent default behaviors (like scrolling)

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

## UI Considerations

### Touch Targets

All interactive elements should have:
- Minimum touch target size of 44x44px
- Appropriate spacing between elements
- Clear visual feedback on touch

### Performance

Mobile optimizations include:
- Limiting particles and visual effects
- Throttling update rates when necessary
- Using hardware acceleration where beneficial

## Testing

The game has been tested on:
- iOS (Safari)
- Android (Chrome)
- Desktop browsers in various window sizes
- Farcaster Mini App iframe environment

## Reference

- [Official Farcaster MiniApps Repository](https://github.com/farcasterxyz/miniapps)
- [Mobile Web Best Practices](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) 