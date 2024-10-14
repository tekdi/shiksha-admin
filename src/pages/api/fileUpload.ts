import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so we can handle it manually
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('req.url ====>', req.url)
  if (req.method === 'POST') {
    try {
      // Create a new Headers object to ensure valid header types
      const headers = new Headers();

      // Forward the incoming request headers, filtering out invalid headers
      for (const [key, value] of Object.entries(req.headers)) {
        // Exclude 'content-length' as it can cause issues
        if (key.toLowerCase() !== 'content-length') {
          headers.append(key, value as string);
        }
      }

      // Read the request body as a stream
      const body = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk));
        });
        req.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        req.on('error', (err) => {
          reject(err);
        });
      });

      // Forward the request to the middleware API
      const response = await fetch(`${process.env.WORKSPACE_BASE_URL}` + `${req.url}`, {
        method: 'POST',
        headers: headers, // Use the new Headers object
        body, // Pass the request body as a Buffer
      });

      // Forward the middleware response back to the client
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Error proxying request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
