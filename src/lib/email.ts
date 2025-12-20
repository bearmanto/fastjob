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


        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

// ============================================
// Smart Job Alerts - Email Digest
// ============================================

interface JobAlertData {
    recipientName: string;
    recipientEmail: string;
    jobs: {
        id: string;
        title: string;
        company: string;
        location: string;
        salary: string;
        matchScore: number;
    }[];
}

export async function sendJobAlertDigest(data: JobAlertData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const jobListHtml = data.jobs.map(job => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <a href="${appUrl}/job/${job.id}" 
                   style="color: #3a5a40; font-weight: bold; text-decoration: none;">
                    ${job.title}
                </a>
                <br>
                <span style="color: #666; font-size: 12px;">
                    ${job.company} • ${job.location}
                </span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <span style="color: #588157;">${job.salary}</span>
                <br>
                <span style="font-size: 11px; color: #999;">${job.matchScore}% match</span>
            </td>
        </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #3a5a40; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .footer { padding: 16px 24px; background: #f5f5f5; font-size: 12px; color: #666; }
        a { color: #3a5a40; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">🔔 New Jobs For You</h1>
    </div>
    
    <div class="content">
        <p>Hi ${data.recipientName || 'there'},</p>
        
        <p>We found <strong>${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''}</strong> matching your preferences:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            ${jobListHtml}
        </table>
        
        <a href="${appUrl}/dashboard" 
           style="display: inline-block; background: #3a5a40; color: white; 
                  padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">
            View All Jobs
        </a>
    </div>
    
    <div class="footer">
        <p>
            <a href="${appUrl}/profile#alerts">Manage alert preferences</a> | 
            <a href="${appUrl}/profile#alerts?unsubscribe=true">Unsubscribe</a>
        </p>
        <p style="margin-top: 8px;">This email was sent by FastJob because you enabled job alerts.</p>
    </div>
</body>
</html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'FastJob <onboarding@resend.dev>',
            to: data.recipientEmail,
            subject: `🔔 ${data.jobs.length} New Job${data.jobs.length > 1 ? 's' : ''} Match Your Profile`,
            html: html,
        });

        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Job alert email error:', error);
        return { success: false, error };
    }
}


// ============================================
// Application Status Updates
// ============================================

interface ApplicationStatusData {
    recipientName: string;
    recipientEmail: string;
    jobTitle: string;
    companyName: string;
    status: 'shortlisted' | 'rejected';
}

export async function sendApplicationStatusUpdate(data: ApplicationStatusData) {
    const isShortlisted = data.status === 'shortlisted';
    const subject = isShortlisted
        ? `Update: You've been shortlisted for ${data.jobTitle}`
        : `Update regarding your application for ${data.jobTitle}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const content = isShortlisted
        ? `<p>Great news! Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been <strong>shortlisted</strong>.</p>
           <p>This means the hiring team is interested in your profile and may reach out soon for next steps.</p>`
        : `<p>Thank you for your interest in the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.</p>
           <p>After careful review, receiving a high volume of applications, the team has decided not to proceed with your application at this time.</p>
           <p>We wish you the best in your job search.</p>`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #3a5a40; color: white; padding: 24px; text-align: center; }
                .content { padding: 24px; }
                .footer { padding: 16px 24px; background: #f5f5f5; font-size: 12px; color: #666; }
                a { color: #3a5a40; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">Application Update</h1>
            </div>
            
            <div class="content">
                <p>Hi ${data.recipientName || 'there'},</p>
                
                ${content}
                
                <p style="margin-top: 24px;">
                    <a href="${appUrl}/dashboard" 
                       style="display: inline-block; background: #3a5a40; color: white; 
                              padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">
                        View Application Status
                    </a>
                </p>
            </div>
            
            <div class="footer">
                <p>This email was sent via FastJob.</p>
            </div>
        </body>
        </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'FastJob <onboarding@resend.dev>',
            to: data.recipientEmail,
            subject: subject,
            html: html,
        });

        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('Status update email error:', error);
        return { success: false, error };
    }
}
