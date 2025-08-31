import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    // If no email configuration is provided, create a test account
    if (!process.env.EMAIL_HOST) {
      const testAccount = await nodemailer.createTestAccount();
      transporter.options.auth.user = testAccount.user;
      transporter.options.auth.pass = testAccount.pass;
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${name}" <${email}>`, // sender address
      to: process.env.CONTACT_EMAIL || 'recipient@example.com', // recipient address
      subject: `Contact Form Submission from ${name}`, // Subject line
      text: message, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `, // html body
    });

    // For development: Log the URL where the email can be previewed (Ethereal)
    let previewUrl = '';
    if (!process.env.EMAIL_HOST) {
      previewUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log('Preview URL: %s', previewUrl);
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      previewUrl,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}