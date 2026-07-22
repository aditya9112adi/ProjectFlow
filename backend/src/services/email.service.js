import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'placeholder@gmail.com') {
    console.log('Email service not configured. Skipping email send.');
    console.log(`Would send to: ${to} | Subject: ${subject}`);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ProjectFlow" <noreply@projectflow.edu>',
    to,
    subject,
    html,
    text,
  });
};

const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProjectFlow Notification</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Inter,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;width:52px;height:52px;background:linear-gradient(135deg,#6366f1,#c026d3);border-radius:14px;line-height:52px;color:white;font-weight:900;font-size:22px;text-align:center">P</div>
      <h1 style="color:#f1f5f9;font-size:20px;font-weight:800;margin:12px 0 0">ProjectFlow</h1>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0">Academic Project Management System</p>
    </div>
    <!-- Content Card -->
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px">
      ${content}
    </div>
    <!-- Footer -->
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px">This is an automated message from ProjectFlow. Do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const sendApprovalEmail = async ({ to, name, projectTitle, phase, status, comments }) => {
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  const statusIcon = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' ? 'Approved' : 'Rejected';
  const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);

  const content = `
    <h2 style="color:#f1f5f9;font-size:22px;font-weight:800;margin:0 0 8px">
      ${statusIcon} ${phaseLabel} ${statusText}
    </h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px">Hi ${name},</p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Project</p>
      <p style="color:#f1f5f9;font-size:16px;font-weight:700;margin:0">${projectTitle}</p>
    </div>
    <div style="border-left:3px solid ${statusColor};padding-left:16px;margin-bottom:24px">
      <p style="color:${statusColor};font-size:14px;font-weight:700;margin:0 0 4px">
        ${phaseLabel} has been <strong>${statusText}</strong>
      </p>
      ${comments ? `<p style="color:#94a3b8;font-size:14px;margin:8px 0 0"><strong>Admin comments:</strong> ${comments}</p>` : ''}
    </div>
    <a href="${process.env.FRONTEND_URL}/student/project" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px">View Project Dashboard</a>
  `;

  await sendEmail({
    to,
    subject: `ProjectFlow: ${phaseLabel} ${statusText} — ${projectTitle}`,
    html: baseEmailTemplate(content),
  });
};

export const sendWelcomeEmail = async ({ to, name, role }) => {
  const content = `
    <h2 style="color:#f1f5f9;font-size:22px;font-weight:800;margin:0 0 8px">Welcome to ProjectFlow! 🎓</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px">Hi ${name}, your ${role} account has been created successfully.</p>
    <a href="${process.env.FRONTEND_URL}/login" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px">Get Started</a>
  `;
  await sendEmail({ to, subject: 'Welcome to ProjectFlow!', html: baseEmailTemplate(content) });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const content = `
    <h2 style="color:#f1f5f9;font-size:22px;font-weight:800;margin:0 0 8px">Reset Your Password</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px">Hi ${name}, click the button below to reset your password. This link expires in 15 minutes.</p>
    <a href="${resetUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px">Reset Password</a>
    <p style="color:#64748b;font-size:12px;text-align:center;margin-top:16px">If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail({ to, subject: 'ProjectFlow: Password Reset Request', html: baseEmailTemplate(content) });
};
