import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, organization, service, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send notification email to Tenadam team
    const notificationEmail = await resend.emails.send({
      from: 'Tenadam Assessment Hub <noreply@hub.tenadamconsulting.com>',
      to: ['info@tenadamconsulting.com'],
      replyTo: email, // Allow direct reply to the contact person
      subject: `New Contact Form Submission - ${service || 'General Inquiry'}`,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f766e, #10b981); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
            <p style="color: #a7f3d0; margin: 5px 0 0 0;">Tenadam Assessment Hub</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Contact Information</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0f766e;">${email}</a></p>
              ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #0f766e;">${phone}</a></p>` : ''}
              ${organization ? `<p style="margin: 5px 0;"><strong>Organization:</strong> ${organization}</p>` : ''}
              ${service ? `<p style="margin: 5px 0;"><strong>Service Interest:</strong> ${service}</p>` : ''}
            </div>
            
            <h3 style="color: #1f2937;">Message</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0f766e;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0;">This message was sent from the Tenadam Assessment Hub contact form.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Received at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission - Tenadam Assessment Hub

Contact Information:
Name: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${organization ? `Organization: ${organization}` : ''}
${service ? `Service Interest: ${service}` : ''}

Message:
${message}

---
This message was sent from the Tenadam Assessment Hub contact form.
Received at: ${new Date().toLocaleString()}
      `,
    });

    console.log('Notification email sent:', notificationEmail.data?.id);

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: 'Tenadam Training, Consultancy & Research <noreply@hub.tenadamconsulting.com>',
      to: [email],
      subject: 'Thank you for contacting Tenadam Training, Consultancy & Research PLC',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f766e, #10b981); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You!</h1>
            <p style="color: #a7f3d0; margin: 5px 0 0 0;">Tenadam Training, Consultancy & Research PLC</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">Dear ${firstName},</p>
            
            <p style="color: #1f2937; line-height: 1.6;">
              Thank you for reaching out to Tenadam Training, Consultancy & Research PLC. 
              We have received your message and will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0f766e;">
              <h3 style="color: #1f2937; margin-top: 0;">Your Message Summary:</h3>
              <p style="margin: 5px 0;"><strong>Service Interest:</strong> ${service || 'General Inquiry'}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong> ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</p>
            </div>
            
            <h3 style="color: #1f2937;">What happens next?</h3>
            <ul style="color: #1f2937; line-height: 1.6;">
              <li>Our team will review your inquiry</li>
              <li>We'll respond within 24 hours during business hours</li>
              <li>We may schedule a consultation call if needed</li>
            </ul>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #166534; margin-top: 0;">Need immediate assistance?</h4>
              <p style="color: #166534; margin: 5px 0;">Call us at: +251-911-58-4260, +251-912-44-2502, or +251-993-51-8990</p>
              <p style="color: #166534; margin: 5px 0;">Email: info@tenadamconsulting.com</p>
              <p style="color: #166534; margin: 5px 0;">Working Hours: Monday - Friday, 8:30 AM - 5:30 PM</p>
            </div>
          </div>
          
          <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0;"><strong>Tenadam Training, Consultancy & Research PLC</strong></p>
            <p style="margin: 5px 0;">Lem-Hotel Area, Addis Ababa, Ethiopia</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Transforming Potential into Performance</p>
          </div>
        </div>
      `,
      text: `
Dear ${firstName},

Thank you for reaching out to Tenadam Training, Consultancy & Research PLC.
We have received your message and will get back to you within 24 hours.

Your Message Summary:
Service Interest: ${service || 'General Inquiry'}
Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}

What happens next?
- Our team will review your inquiry
- We'll respond within 24 hours during business hours
- We may schedule a consultation call if needed

Need immediate assistance?
Call us at: +251-911-58-4260, +251-912-44-2502, or +251-993-51-8990
Email: info@tenadamconsulting.com
Working Hours: Monday - Friday, 8:30 AM - 5:30 PM

---
Tenadam Training, Consultancy & Research PLC
Lem-Hotel Area, Addis Ababa, Ethiopia
Transforming Potential into Performance
      `,
    });

    console.log('Confirmation email sent:', confirmationEmail.data?.id);

    return NextResponse.json(
      { 
        message: 'Emails sent successfully',
        notificationId: notificationEmail.data?.id,
        confirmationId: confirmationEmail.data?.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

