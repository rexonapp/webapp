import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface SendWelcomeEmailParams {
  fullName: string;
  email: string;
  city: string;
}

export async function sendWelcomeEmail({
  fullName,
  email,
  city,
}: SendWelcomeEmailParams) {
  try {
    // Render the React email component to HTML
    const emailHtml = await render(WelcomeEmail({ fullName, email, city }));

    // SendGrid message configuration
    const msg = {
      to: email,
      from:'no-reply@pryzmatech.com',
      subject: `Welcome to Rexon, ${fullName}! 🏠`,
      html: emailHtml,
      // Optional: Add plain text version
      text: `Welcome to Rexon, ${fullName}! We're thrilled to have you on board.`,
      // Optional: Add categories for tracking
      categories: ['customer-onboarding', 'welcome-email'],
      // Optional: Add custom args for tracking
      customArgs: {
        customer_city: city,
        email_type: 'welcome',
      },
    };

    // Send email via SendGrid
    const response = await sgMail.send(msg);

    console.log('Welcome email sent successfully via SendGrid');
    console.log('SendGrid Response:', response[0].statusCode);

    return { 
      success: true, 
      data: {
        statusCode: response[0].statusCode,
        messageId: response[0].headers['x-message-id'],
      }
    };

  } catch (error: any) {
    console.error('Failed to send welcome email via SendGrid:', error);

    // SendGrid specific error handling
    if (error.response) {
      console.error('SendGrid Error Body:', error.response.body);
    }

    return { 
      success: false, 
      error: error.message || 'Failed to send email',
    };
  }
}