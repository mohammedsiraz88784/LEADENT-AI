import nodemailer from 'nodemailer';

export interface EmailDeliveryResult {
  sent: boolean;
  configured: boolean;
  reason?: string;
  messageId?: string;
}

export function isEmailDeliveryConfigured(): boolean {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USERNAME;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  return Boolean(host && user && pass);
}

export function getRequiredEmailEnvVars(): { name: string; description: string; set: boolean }[] {
  return [
    {
      name: 'SMTP_HOST',
      description: 'SMTP Server Host (e.g. smtp.gmail.com, smtp.sendgrid.net, smtp.mailgun.org)',
      set: Boolean(process.env.SMTP_HOST || process.env.EMAIL_HOST)
    },
    {
      name: 'SMTP_PORT',
      description: 'SMTP Server Port (e.g. 587 for TLS, 465 for SSL, 25)',
      set: Boolean(process.env.SMTP_PORT || process.env.EMAIL_PORT)
    },
    {
      name: 'SMTP_USER',
      description: 'SMTP Username / Authenticated email address',
      set: Boolean(process.env.SMTP_USER || process.env.EMAIL_USERNAME)
    },
    {
      name: 'SMTP_PASS',
      description: 'SMTP Password or Provider API Key / App Password',
      set: Boolean(process.env.SMTP_PASS || process.env.EMAIL_PASSWORD)
    },
    {
      name: 'SMTP_FROM',
      description: 'Sender address (e.g. "LEADENT AI <admissions@leadent.ai>")',
      set: Boolean(process.env.SMTP_FROM || process.env.EMAIL_FROM)
    }
  ];
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  purpose: 'registration' | 'login' | 'verification' = 'verification'
): Promise<EmailDeliveryResult> {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USERNAME;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"LEADENT AI Academic Platform" <${user || 'no-reply@leadent.ai'}>`;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    console.log(
      `\n[LEADENT AI EMAIL OTP SERVICE]\n` +
      `------------------------------------------------------------\n` +
      `Status: Real email delivery NOT configured in environment.\n` +
      `Recipient: ${toEmail}\n` +
      `Purpose: ${purpose.toUpperCase()}\n` +
      `Generated Dynamic 6-Digit OTP: ${otp}\n` +
      `Validity: 5 minutes (300 seconds)\n` +
      `Required Env Vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM\n` +
      `------------------------------------------------------------\n`
    );
    return {
      sent: false,
      configured: false,
      reason: 'SMTP email provider environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });

    const actionText =
      purpose === 'registration'
        ? 'confirming your student account registration'
        : purpose === 'login'
        ? 'logging into your academic workspace'
        : 'verifying your email address';

    const subject = `Your LEADENT AI Verification Code: ${otp}`;

    const textContent = `
Hello,

Your 6-digit verification code for ${actionText} on LEADENT AI is:

${otp}

This verification code is strictly valid for 5 minutes.
For security, please never share this code with anyone.

If you did not request this verification code, please ignore this message.

— LEADENT AI Academic Intelligence Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LEADENT AI Verification Code</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 28px 32px; background: #4f46e5; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">LEADENT AI</h1>
        <p style="margin: 4px 0 0; font-size: 12px; color: #e0e7ff; font-weight: 500;">Academic Mastery & Syllabus Diagnostic Platform</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Verify Your Email Address</h2>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
          You are receiving this email for <strong>${actionText}</strong>. Please enter the 6-digit code below into LEADENT AI to proceed:
        </p>

        <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace;">${otp}</span>
          <p style="margin: 8px 0 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Expires in 5 minutes</p>
        </div>

        <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
          <strong>Security Notice:</strong> Never share this code with anyone. LEADENT AI administrators will never ask for your verification code.
        </p>
        <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
          If you did not request this email, no further action is required.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          © ${new Date().getFullYear()} LEADENT AI Academic Systems. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`[LEADENT AI OTP] Successfully dispatched email via SMTP to ${toEmail}. MessageId: ${info.messageId}`);
    return {
      sent: true,
      configured: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error(`[LEADENT AI OTP] Failed to dispatch email to ${toEmail}:`, err);
    return {
      sent: false,
      configured: true,
      reason: err.message || 'SMTP transmission error'
    };
  }
}
