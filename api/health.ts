import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      MONGODB_URI_exists: !!process.env.MONGODB_URI,
      MONGODB_URI_type: process.env.MONGODB_URI?.startsWith('mongodb+srv://') ? 'SRV (BAD)' : 
                        process.env.MONGODB_URI?.startsWith('mongodb://') ? 'DIRECT (GOOD)' : 'UNKNOWN',
      MONGODB_URI_length: process.env.MONGODB_URI?.length ?? 0,
    }
  };

  // Test mongoose import
  try {
    await import('mongoose');
    diagnostics['mongoose'] = 'loaded';
  } catch (e: any) {
    diagnostics['mongoose'] = `ERROR: ${e.message}`;
  }

  return res.status(200).json(diagnostics);
}
