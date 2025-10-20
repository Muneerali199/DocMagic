import type { NextApiRequest, NextApiResponse } from 'next/types';
import { getAllUserEmails } from '../../lib/getAllUserEmails';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const emails = await getAllUserEmails();
    res.status(200).json({ emails });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user emails' });
  }
}
