# FarCaster Mini App Template

This is a template for building FarCaster mini apps. It provides a minimal setup to get you started with building Frame-enabled applications that can be embedded in FarCaster.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Vercel account
- Vercel CLI (will be installed as part of the project dependencies)

## Getting Started

1. Clone this template:
```bash
git clone <your-repo-url>
cd <your-project-name>
```

2. Install dependencies:
```bash
npm install
```

3. Update the following in `index.html`:
   - Replace all instances of `your-app-url.com` with your actual domain
   - Update the app name in the `fc:frame` meta tag
   - Customize the styling as needed

4. Add your images:
   - Add a preview image (1200x800 pixels) as `public/preview.png`
   - Add an icon (200x200 pixels) as `public/icon.png`
   - Or replace with your own image names and update the URLs in `index.html`

5. Login to Vercel (if not already logged in):
```bash
vercel login
```

## Development

To run the app locally:

```bash
npm run dev
# or
vercel dev
```

This will start a development server at `http://localhost:3000`. The development server will automatically reload if you make changes to the code.

## Deployment

To deploy your app to Vercel:

```bash
npm run deploy
# or
vercel deploy
```

This will deploy your app to Vercel and provide you with a production URL.

## Testing in FarCaster

1. After deploying, copy your production URL (e.g., `https://your-app.vercel.app`)
2. Open the [Mini App Debug Tool](https://warpcast.com/~/developers/mini-apps/debug) on desktop
3. Enter your app URL and hit *Preview*

## Project Structure

- `index.html` - The main entry point of your app
- `public/` - Static assets (images, etc.)
  - `preview.png` - Preview image (1200x800 pixels)
  - `icon.png` - App icon (200x200 pixels)
- `vercel.json` - Vercel deployment configuration

## Important Notes

1. **Frame Meta Tag**: Make sure to update the `fc:frame` meta tag in `index.html` with your app's specific details:
   - `imageUrl` must be a 3:2 aspect ratio image (max 1024 characters)
   - `splashImageUrl` must be 200x200px
   - `version` must be "1" or "next"
   - `button.title` max length is 32 characters
   - `button.action.url` max length is 1024 characters

2. **Images**: The template includes placeholder images in the `public` directory:
   - `preview.png` should be 1200x800 pixels (3:2 aspect ratio)
   - `icon.png` should be 200x200 pixels

3. **SDK**: The template uses the ESM version of the Frame SDK via CDN. If you prefer to use npm:
   ```bash
   npm install @farcaster/frame-sdk
   ```
   Then update the import in `index.html` accordingly.

## Development Tips

1. Always test your changes locally before deploying
2. Mini Apps should be rendered in a vertical modal:
   - Mobile sizes are dictated by device dimensions
   - Web sizes should be set to 424x695px
3. Use the FarCaster Frame SDK for native features:
   - Authentication
   - Notifications
   - Wallet interactions
4. Test thoroughly in the Warpcast Mini App Debug Tool before sharing

## SDK Implementation Best Practices

This template includes several key optimizations that ensure reliable loading in the Farcaster client:

1. **CDN-based SDK Loading**: We use the ESM CDN version of the SDK directly:
   ```javascript
   import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
   ```
   This approach is more reliable than npm-based imports when running in the Farcaster client.

2. **Proper Event Handling**: We wait for the DOM to be fully loaded before initializing:
   ```javascript
   document.addEventListener('DOMContentLoaded', async () => {
       try {
           console.log('Calling ready...');
           await sdk.actions.ready();
           console.log('Ready called successfully');
       } catch (e) {
           console.error('Error calling ready:', e);
       }
   });
   ```

3. **Error Handling and Debugging**: The template includes console logging to help debug initialization issues:
   - Logs when ready() is about to be called
   - Logs successful initialization
   - Catches and logs any errors that occur

These practices help ensure your app loads reliably in the Farcaster client and make it easier to debug any issues that arise.

## Resources

- [Official FarCaster Mini Apps Documentation](https://docs.farcaster.xyz/reference/frames/spec)
- [Warpcast Developer Tools](https://warpcast.com/~/developers)
- [Vercel Documentation](https://vercel.com/docs) 