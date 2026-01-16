import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type QuoteEmailData = {
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  project_type: string | null;
  budget_range: string | null;
  message: string;
  how_heard: string | null;
};

export async function sendQuoteNotification(data: QuoteEmailData) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return { success: false, error: 'Email not configured' };
  }

  const notificationEmail = process.env.QUOTE_NOTIFICATION_EMAIL || 'hello@8020films.com';

  try {
    // Send notification to 8020 Films
    await resend.emails.send({
      from: 'Quote Request <quotes@8020films.com>',
      to: notificationEmail,
      replyTo: data.email,
      subject: `New Quote Request from ${data.first_name} ${data.last_name} at ${data.company}`,
      html: `
        <h2>New Quote Request</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.company}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.first_name} ${data.last_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Job Title</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.job_title}</td>
          </tr>
          ${data.project_type ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Project Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.project_type}</td>
          </tr>
          ` : ''}
          ${data.budget_range ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Budget Range</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.budget_range}</td>
          </tr>
          ` : ''}
          ${data.how_heard ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">How They Heard</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.how_heard}</td>
          </tr>
          ` : ''}
        </table>
        <h3>Message</h3>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px;">${data.message}</p>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This quote request was submitted via the 8020 Films website.</p>
      `,
    });

    // Send confirmation to the customer
    await resend.emails.send({
      from: '8020 Films <hello@8020films.com>',
      to: data.email,
      subject: `Thank you for your quote request - 8020 Films`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${data.first_name},</p>
          <p>We've received your quote request and our team is reviewing it. We typically respond within the hour during business hours.</p>
          <p>Here's a summary of your request:</p>
          <ul>
            <li><strong>Company:</strong> ${data.company}</li>
            ${data.project_type ? `<li><strong>Project Type:</strong> ${data.project_type}</li>` : ''}
            ${data.budget_range ? `<li><strong>Budget Range:</strong> ${data.budget_range}</li>` : ''}
          </ul>
          <p><strong>Your message:</strong></p>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px;">${data.message}</p>
          <p>In the meantime, feel free to explore our <a href="https://8020films.com/work">portfolio</a>.</p>
          <p>Best regards,<br>The 8020 Films Team</p>
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            8020 Films | Paris • London • Los Angeles<br>
            <a href="https://8020films.com">8020films.com</a>
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
