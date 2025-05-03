# Farcaster Mini Apps Documentation

## Overview

Mini Apps (previously known as Frames v2) are interactive applications that run inside the Farcaster feed. They enable developers to create engaging, interactive experiences directly within the Farcaster ecosystem.

## Key Concepts

- **Mini Apps**: Self-contained applications that run inside Farcaster clients
- **Frame Metadata**: Special meta tags that define how a Mini App appears and behaves
- **Button Actions**: Interactions users can have with Mini Apps
- **Frame Context**: User information and state available to the Mini App

## Basic Structure

A Mini App requires a `farcaster.json` file in the `.well-known` directory of your domain and proper frame metadata in your HTML:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://example.com/image.png","button":{"title":"Start","action":{"type":"launch_frame","url":"https://example.com","name":"My App"}}}' />
```

## Required Configuration

### 1. `farcaster.json` Configuration

This file must be placed at `/.well-known/farcaster.json` on your domain:

```json
{
  "frame": {
    "version": "1",
    "name": "Your Mini App Name",
    "iconUrl": "https://yourdomain.com/icon.png",
    "homeUrl": "https://yourdomain.com",
    "imageUrl": "https://yourdomain.com/preview.png",
    "buttonTitle": "Start App",
    "splashImageUrl": "https://yourdomain.com/splash.png",
    "splashBackgroundColor": "#0066cc",
    "webhookUrl": "https://yourdomain.com/api/webhook"
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

## Accessing Frame Context

Mini Apps can access the Farcaster context to get user information:

```javascript
window.addEventListener('message', (event) => {
  if (event.data && event.data.source === 'farcaster') {
    const { user } = event.data;
    console.log('User FID:', user.fid);
    console.log('Username:', user.username);
  }
});
```

## UI Considerations

Mini Apps are always displayed in a mobile-like view, regardless of whether they're being accessed on desktop or mobile devices. When designing your Mini App:

- Design for portrait orientation with a relatively narrow width
- Ensure all interactive elements are easily tappable on mobile
- Optimize your UI for both portrait and landscape mode on mobile
- Test your Mini App on various screen sizes and devices

## Best Practices

1. **Responsive Design**: Ensure your Mini App works well on mobile devices
2. **Fast Loading**: Optimize performance for quick loading
3. **Clear Instructions**: Provide clear guidance to users
4. **Error Handling**: Implement robust error handling
5. **User Authentication**: Use proper authentication for user actions

## Development Rewards

Warpcast gives out weekly rewards to top developers on the network. Winners are determined based on engagement metrics and are refreshed every Wednesday at 17:00 UTC.

## Examples and Resources

- **Official Repository**: The [Farcaster MiniApps repository](https://github.com/farcasterxyz/miniapps) contains examples, documentation, and utilities for building Mini Apps.
- **Documentation**: Visit [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz) for more detailed guides and documentation.
- **Community**: Join the [Mini Apps Developer Chat](https://warpcast.com/~/developers/frames) on Warpcast for discussions and support.

## Reference

For more detailed information, visit the [official Farcaster documentation](https://docs.farcaster.xyz/). 