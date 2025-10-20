import axios from 'axios';

const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY;
const TESTMAIL_API_URL = 'https://api.testmail.app/api/send';

export async function sendTestMail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  if (!TESTMAIL_API_KEY) throw new Error('Testmail API key not set');
  const headers = {
    Authorization: `Bearer ${TESTMAIL_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const data = {
    to,
    subject,
    text,
    html,
  };
  const response = await axios.post(TESTMAIL_API_URL, data, { headers });
  return response.data;
}
