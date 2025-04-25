export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle the frame action here
  // For now, just return a basic response
  res.send({
    version: 'next',
    image: 'https://whale-wars.onrender.com/preview.png',
    button: {
      title: 'Play',
      action: {
        type: 'launch_frame',
        name: 'Whale Wars',
        url: 'https://whale-wars.onrender.com',
        splashImageUrl: 'https://whale-wars.onrender.com/icon.png',
        splashBackgroundColor: '#f5f5f5'
      }
    }
  });
} 