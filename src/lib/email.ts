import { Resend } from 'resend';
import { createSupabaseBuildClient } from './supabase/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

type EmailTemplate = {
  slug: string;
  subject: string;
  body_html: string;
};

// Fallback templates in case database is unavailable
const FALLBACK_TEMPLATES: Record<string, EmailTemplate> = {
  newsletter_welcome: {
    slug: 'newsletter_welcome',
    subject: 'Welcome to 8020 Films Newsletter',
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to the 8020 Films Newsletter!</h2>
  <p>Thank you for subscribing to our newsletter.</p>
  <p>You'll be the first to know about our latest projects, behind-the-scenes content, and industry insights from our team in Paris, London, and Los Angeles.</p>
  <p>In the meantime, feel free to explore our <a href="https://8020films.com/work">latest work</a>.</p>
  <p>Best regards,<br>The 8020 Films Team</p>
  <hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
  <p style="color: #666; font-size: 12px;">
    8020 Films | Paris • London • Los Angeles<br>
    <a href="https://8020films.com">8020films.com</a>
  </p>
</div>`,
  },
  quote_notification: {
    slug: 'quote_notification',
    subject: 'New Quote Request from {{first_name}} {{last_name}} at {{company}}',
    body_html: `<h2>New Quote Request</h2>
<table style="border-collapse: collapse; width: 100%; max-width: 600px;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Company</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{company}}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{first_name}} {{last_name}}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
    <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:{{email}}">{{email}}</a></td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Job Title</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{job_title}}</td>
  </tr>
  {{#project_type}}
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Project Type</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{project_type}}</td>
  </tr>
  {{/project_type}}
  {{#budget_range}}
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Budget Range</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{budget_range}}</td>
  </tr>
  {{/budget_range}}
  {{#how_heard}}
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">How They Heard</td>
    <td style="padding: 8px; border: 1px solid #ddd;">{{how_heard}}</td>
  </tr>
  {{/how_heard}}
</table>
<h3>Message</h3>
<p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px;">{{message}}</p>
<hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
<p style="color: #666; font-size: 12px;">This quote request was submitted via the 8020 Films website.</p>`,
  },
  quote_confirmation: {
    slug: 'quote_confirmation',
    subject: 'Thank you for your quote request - 8020 Films',
    body_html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Thank you for reaching out!</h2>
  <p>Hi {{first_name}},</p>
  <p>We've received your quote request and our team is reviewing it. We typically respond within the hour during business hours.</p>
  <p>Here's a summary of your request:</p>
  <ul>
    <li><strong>Company:</strong> {{company}}</li>
    {{#project_type}}<li><strong>Project Type:</strong> {{project_type}}</li>{{/project_type}}
    {{#budget_range}}<li><strong>Budget Range:</strong> {{budget_range}}</li>{{/budget_range}}
  </ul>
  <p><strong>Your message:</strong></p>
  <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 4px;">{{message}}</p>
  <p>In the meantime, feel free to explore our <a href="https://8020films.com/work">portfolio</a>.</p>
  <p>Best regards,<br>The 8020 Films Team</p>
  <hr style="margin-top: 24px; border: none; border-top: 1px solid #ddd;">
  <p style="color: #666; font-size: 12px;">
    8020 Films | Paris • London • Los Angeles<br>
    <a href="https://8020films.com">8020films.com</a>
  </p>
</div>`,
  },
};

async function getEmailTemplate(slug: string): Promise<EmailTemplate> {
  try {
    const supabase = createSupabaseBuildClient();
    const { data, error } = await supabase
      .from('email_templates')
      .select('slug, subject, body_html')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.warn(`Failed to fetch email template '${slug}', using fallback`);
      return FALLBACK_TEMPLATES[slug] || FALLBACK_TEMPLATES.newsletter_welcome;
    }

    return data;
  } catch (error) {
    console.warn(`Error fetching email template '${slug}':`, error);
    return FALLBACK_TEMPLATES[slug] || FALLBACK_TEMPLATES.newsletter_welcome;
  }
}

function renderTemplate(template: string, variables: Record<string, string | null>): string {
  let result = template;

  // Handle conditional blocks: {{#variable}}content{{/variable}}
  // These blocks are shown only if the variable has a truthy value
  Object.entries(variables).forEach(([key, value]) => {
    const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`, 'g');
    if (value) {
      // Keep the content, remove the markers
      result = result.replace(conditionalRegex, '$1');
    } else {
      // Remove the entire block
      result = result.replace(conditionalRegex, '');
    }
  });

  // Replace simple variables: {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  });

  return result;
}

export async function sendNewsletterWelcome(email: string) {
  if (!resend) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const template = await getEmailTemplate('newsletter_welcome');
    const variables = { email };
    const renderedSubject = renderTemplate(template.subject, variables);
    const renderedBody = renderTemplate(template.body_html, variables);

    await resend.emails.send({
      from: '8020 Films <hello@updates.8020films.com>',
      replyTo: 'hello@8020films.com',
      to: email,
      subject: renderedSubject,
      html: renderedBody,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send newsletter welcome:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendQuoteNotification(data: QuoteEmailData) {
  if (!resend) {
    return { success: false, error: 'Email not configured' };
  }

  const notificationEmail = process.env.QUOTE_NOTIFICATION_EMAIL || 'hello@8020films.com';

  const variables: Record<string, string | null> = {
    company: data.company,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    job_title: data.job_title,
    project_type: data.project_type,
    budget_range: data.budget_range,
    message: data.message,
    how_heard: data.how_heard,
  };

  try {
    // Send notification to 8020 Films team
    const notificationTemplate = await getEmailTemplate('quote_notification');
    const notificationSubject = renderTemplate(notificationTemplate.subject, variables);
    const notificationBody = renderTemplate(notificationTemplate.body_html, variables);

    await resend.emails.send({
      from: '8020 Films Quotes <quotes@updates.8020films.com>',
      to: notificationEmail,
      replyTo: data.email,
      subject: notificationSubject,
      html: notificationBody,
    });

    // Send confirmation to the customer
    const confirmationTemplate = await getEmailTemplate('quote_confirmation');
    const confirmationSubject = renderTemplate(confirmationTemplate.subject, variables);
    const confirmationBody = renderTemplate(confirmationTemplate.body_html, variables);

    await resend.emails.send({
      from: '8020 Films <hello@updates.8020films.com>',
      replyTo: 'hello@8020films.com',
      to: data.email,
      subject: confirmationSubject,
      html: confirmationBody,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send quote notification:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
