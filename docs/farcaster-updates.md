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
  "buttonTitle": "🎮 Play Now",
  "splashImageUrl": "https://whale-wars.onrender.com/icon.png",
  "splashBackgroundColor": "#0066cc",
  "webhookUrl": "https://whale-wars.onrender.com/api/webhook"
}
```

To update the frame configuration:

1. Modify the properties as needed, ensuring:
   - All URLs are absolute (starting with `https://`)
   - `name` is your Mini App name
   - `buttonTitle` is 32 characters or less
   - `version` stays as "1" (unless specifically changing to a newer version)
2. Save the file
3. Deploy your changes to production

## Updating HTML Meta Tags

The HTML meta tags in `index.html` control how your Mini App appears in Farcaster:

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://whale-wars.onrender.com/preview.png","button":{"title":"🎮 Start","action":{"type":"launch_frame","url":"https://whale-wars.onrender.com?v=1","name":"Whale Wars"}}}' />
```

To update these tags:

1. Modify the JSON content as needed
2. Ensure all URLs are absolute
3. Make sure the `version` is set to "next" for the latest features
4. The `button.action.type` should be "launch_frame" for a Mini App
5. Save the file and deploy changes

## Image Requirements

When updating images, ensure they meet these requirements:

1. **Preview Image (`preview.png`)**:
   - 1200x800 pixels (3:2 aspect ratio)
   - Under 1MB in size
   - PNG or JPG format

2. **Icon Image (`icon.png`)**:
   - 200x200 pixels (1:1 aspect ratio)
   - Under 256KB in size
   - PNG format (preferably with transparency)

## Testing Changes

After updating configurations:

1. Deploy your changes to production
2. Test your Mini App in the [Farcaster Debug Tool](https://warpcast.com/~/developers/mini-apps/debug)
3. Check that all images load properly
4. Verify buttons work as expected
5. Test the user flow from start to finish

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

## Version Updates

When the Farcaster team releases new Mini App versions:

1. Check the [official Farcaster documentation](https://docs.farcaster.xyz/reference/) for changes
2. Update the `version` field in both the HTML meta tag and `farcaster.json`
3. Implement any required changes to support new features
4. Test thoroughly before deploying

## Additional Resources

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/reference/mini-apps/specification)
- [Warpcast Developer Portal](https://warpcast.com/~/developers)
- [Mini App Debug Tool](https://warpcast.com/~/developers/mini-apps/debug) 