// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { query } from '@/lib/db';
import sgMail from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  const SENDGRID_API_KEY   = process.env.SENDGRID_API_KEY;
  const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET;
  const NEXT_PUBLIC_URL    = process.env.NEXT_PUBLIC_URL;

  if (!SENDGRID_API_KEY || !RESET_TOKEN_SECRET || !NEXT_PUBLIC_URL) {
    const missing = [
      !SENDGRID_API_KEY   && 'SENDGRID_API_KEY',
      !RESET_TOKEN_SECRET && 'RESET_TOKEN_SECRET',
      !NEXT_PUBLIC_URL    && 'NEXT_PUBLIC_URL',
    ].filter(Boolean);
    console.error('[Forgot-password] Missing env vars:', missing.join(', '));
    return NextResponse.json(
      { error: 'Server configuration error. Please try again later.' },
      { status: 500 }
    );
  }

  sgMail.setApiKey(SENDGRID_API_KEY);
  const secret = new TextEncoder().encode(RESET_TOKEN_SECRET);

  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT id, email, first_name, auth_provider
       FROM leads
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with that email address.' },
        { status: 404 }
      );
    }

    if (user.auth_provider !== 'email') {
      return NextResponse.json(
        {
          error: `This account uses ${user.auth_provider} sign-in. Please use the "${
            user.auth_provider.charAt(0).toUpperCase() + user.auth_provider.slice(1)
          }" button to sign in.`,
        },
        { status: 400 }
      );
    }

    const token = await new SignJWT({
      sub: String(user.id),
      email: user.email,
      purpose: 'password-reset',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const resetUrl = `${NEXT_PUBLIC_URL}/reset-password?token=${token}`;
    const appUrl   = NEXT_PUBLIC_URL.replace(/^https?:\/\//, '');

    await sgMail.send({
      to: user.email,

      // ── FIX 1: from must exactly match a Sender Identity verified in SendGrid ──
      // Go to SendGrid → Settings → Sender Authentication → verify admin@rexonproperties.in
      from: {
        email: 'admin@rexonproperties.in',
        name: 'Rexon',
      },

      // ── FIX 2: reply-to keeps replies off the no-reply address ──
      replyTo: {
        email: 'support@rexonproperties.in',
        name: 'Rexon Support',
      },

      subject: 'Reset your Rexon password',

      // ── FIX 3: List-Unsubscribe header — required by Gmail/Yahoo bulk rules ──
      headers: {
        'List-Unsubscribe': `<mailto:support@rexonproperties.in?subject=unsubscribe>, <${NEXT_PUBLIC_URL}/unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        // Categorise as transactional so filters treat it correctly
        'X-Entity-Ref-ID': `rexon-password-reset-${user.id}-${Date.now()}`,
      },

      // ── FIX 4: SendGrid mail settings ──
      mailSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      } as any,

      // ── FIX 5: SendGrid category helps deliverability analytics ──
      categories: ['password-reset', 'transactional'],

      html: buildEmailHtml({ firstName: user.first_name, resetUrl, appUrl }),
      text: buildEmailText({ firstName: user.first_name, resetUrl }),
    });

    console.log('[Password Reset Email Sent]', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'A password reset link has been sent to your email.',
    });
  } catch (error) {
    console.error('[Forgot-password Error]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

function buildEmailHtml({ firstName, resetUrl, appUrl }: {
  firstName: string;
  resetUrl: string;
  appUrl: string;
}) {
  // ── FIX 6: No CSS gradients, no -webkit- prefixes, no fancy CSS
  // Gmail strips <style> blocks entirely — use only inline styles
  // Keep it clean and simple: plain backgrounds, no gradient tricks
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <title>Reset your Rexon password</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (shows in inbox preview, hidden in email body) -->
  <span style="display:none;font-size:1px;color:#f1f5f9;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Reset your Rexon password — this link expires in 1 hour.
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Logo row -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="margin:0;font-size:24px;font-weight:800;color:#1d4ed8;letter-spacing:-0.5px;">Rexon</p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Properties</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;" bgcolor="#ffffff">

              <!-- Top accent bar — solid colour, no gradient (spam safe) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background-color:#1d4ed8;border-radius:12px 12px 0 0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 36px 36px;">

                    <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;line-height:1.3;">
                      Reset your password
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
                      Hi ${firstName},<br/>
                      We received a request to reset the password for your Rexon account. Click the button below to choose a new one.
                    </p>

                    <!-- CTA button — solid colour, no gradient -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="border-radius:8px;background-color:#1d4ed8;" bgcolor="#1d4ed8">
                          <a href="${resetUrl}"
                             target="_blank"
                             style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link -->
                    <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 28px;font-size:12px;color:#1d4ed8;word-break:break-all;line-height:1.5;">
                      ${resetUrl}
                    </p>

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr><td style="height:1px;background-color:#e2e8f0;">&nbsp;</td></tr>
                    </table>

                    <!-- Notice box — solid bg, no gradient -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0;font-size:12px;color:#78716c;line-height:1.7;">
                            <strong style="color:#c2410c;">This link expires in 1 hour</strong> and can only be used once.<br/>
                            If you did not request a password reset, no action is needed — your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">
                You received this because a password reset was requested for your account at
                <a href="https://${appUrl}" style="color:#1d4ed8;text-decoration:none;">${appUrl}</a>.
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                &copy; ${new Date().getFullYear()} Rexon Properties. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildEmailText({ firstName, resetUrl }: { firstName: string; resetUrl: string }) {
  return `Hi ${firstName},

We received a request to reset the password for your Rexon account.

Reset your password by visiting the link below:
${resetUrl}

This link expires in 1 hour and can only be used once.

If you did not request a password reset, no action is needed — your password will remain unchanged.

---
Rexon Properties
rexonproperties.in`;
}