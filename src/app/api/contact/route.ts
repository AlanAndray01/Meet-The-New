import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';

// Helper to check MX records (simple domain existence check)
async function checkDomainExists(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // 1. Basic Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Email Syntax Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 3. Domain Existence Check (Simple Verification)
    const domainExists = await checkDomainExists(email);
    if (!domainExists) {
      return NextResponse.json({ error: 'Email domain does not exist or cannot receive emails.' }, { status: 400 });
    }

    // 4. Send Email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g. 'your-email@gmail.com'
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'arslanshah.dev@gmail.com', // User's email
      subject: `New Portfolio Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #91c8e4;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #91c8e4;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 });
  }
}
