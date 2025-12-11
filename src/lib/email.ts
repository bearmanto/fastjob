import { Resend } from 'resend';

// Initialize Resend client
// In test mode, you can only send to your own verified email
const resend = new Resend(process.env.RESEND_API_KEY);

interface InterviewInviteData {
    applicantName: string;
    applicantEmail: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: Date;
    location?: string;
    meetingLink?: string;
    description?: string;
}

export async function sendInterviewInvite(data: InterviewInviteData) {
    // Format date and time
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    const formattedDate = data.scheduledAt.toLocaleDateString('en-US', dateOptions);
    const formattedTime = data.scheduledAt.toLocaleTimeString('en-US', timeOptions);

    // Build location/meeting section
    let locationHtml = '';
    if (data.location) {
        locationHtml += `<p><strong>📍 Location:</strong> ${data.location}</p>`;
    }
    if (data.meetingLink) {
        locationHtml += `<p><strong>🔗 Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`;
    }

    // Build description section
    const descriptionHtml = data.description
        ? `<div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-left: 4px solid #3a5a40;">
            <strong>Additional Notes:</strong>
            <p style="margin: 8px 0 0 0;">${data.description}</p>
           </div>`
        : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #3a5a40; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .highlight { background: #e8f5e9; padding: 16px; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 16px 24px; background: #f5f5f5; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Interview Invitation</h1>
    </div>
    
    <div class="content">
        <p>Hi ${data.applicantName || 'there'},</p>
        
        <p>Great news! <strong>${data.companyName}</strong> would like to schedule an interview with you for the <strong>${data.jobTitle}</strong> position.</p>
        
        <div class="highlight">
            <p style="margin: 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0 0 0;"><strong>⏰ Time:</strong> ${formattedTime}</p>
            ${locationHtml}
        </div>
        
        ${descriptionHtml}
        
        <p style="margin-top: 24px;">Please confirm your availability by replying to this email.</p>
        
        <p>Good luck with your interview!</p>
        
        <p style="margin-top: 32px;">
            Best regards,<br>
            <strong>The ${data.companyName} Team</strong>
        </p>
    </div>
    
    <div class="footer">
        <p>This email was sent via FastJob. If you didn't apply for this position, please ignore this message.</p>
    </div>
</body>
</html>
    `;

    try {
        const result = await resend.emails.send({
            // In test mode, use Resend's test domain
            from: 'FastJob <onboarding@resend.dev>',
            to: data.applicantEmail,
            subject: `Interview Invitation: ${data.jobTitle} at ${data.companyName}`,
            html: html,
        });

        console.log('Email sent:', result);
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}
