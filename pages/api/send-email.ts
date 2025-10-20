import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTestMail } from '../../lib/testmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { to, subject, text, html } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await sendTestMail({ to, subject, text, html });
    res.status(200).json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
