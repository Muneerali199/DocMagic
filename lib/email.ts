import nodemailer from 'nodemailer';

// Helper to create a reusable Nodemailer transporter.
// In development (no EMAIL_HOST provided) it will fallback to Ethereal test account.
async function createTransporter() {
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: create a test account for local development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Sends a welcome email to a newly registered user.
 * @param to The recipient email address.
 * @param name Optional recipient name for personalisation.
 * @returns The result from Nodemailer and an optional previewUrl when using Ethereal.
 */
export async function sendWelcomeEmail(to: string, name?: string) {
  const transporter = await createTransporter();

  const subject = 'Welcome to DocMagic!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome${name ? `, ${name}` : ''}!</h2>
      <p>Thank you for joining <strong>DocMagic</strong>, your AI-powered document creation platform.</p>
      <p>We're excited to help you create professional resumes, presentations, CVs, and letters in seconds.</p>
      <p>If you have any questions, just reply to this email—we're always happy to help.</p>
      <p style="margin-top: 30px;">Cheers,<br/>The DocMagic Team</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@docmagic.com',
    to,
    subject,
    html,
  });

  const previewUrl = process.env.EMAIL_HOST ? null : nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Welcome email preview URL: ${previewUrl}`);
  }
  return { info, previewUrl };
} 