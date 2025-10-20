// @ts-ignore
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { sendTestMail } from '../../lib/testmail';

// Example: POST /api/send-newsletter
// { to: [emails], subject, text, html }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { to, subject, text, html } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Support sending to multiple users
    const recipients = Array.isArray(to) ? to : [to];
    const results = [];
    for (const email of recipients) {
      const result = await sendTestMail({ to: email, subject, text, html });
      results.push(result);
    }
    res.status(200).json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send newsletter' });
  }
}
