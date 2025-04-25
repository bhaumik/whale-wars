export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle the frame action here
  // For now, just return a basic response
  return res.status(200).json({
    version: 'vNext',
    image: 'https://whale-wars.vercel.app/preview.png',
    buttons: [{ label: 'Play Again', action: 'post' }],
  });
} 