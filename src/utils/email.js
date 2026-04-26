import nodemailer from "nodemailer";
import env from "../config/env.js";

const hasEmailConfig =
  Boolean(env.EMAIL_HOST) &&
  Boolean(env.EMAIL_USER) &&
  Boolean(env.EMAIL_PASS) &&
  Boolean(env.EMAIL_FROM) &&
  Boolean(env.EMAIL_PORT);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT),
      secure: false,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  : null;

if (transporter) {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email transporter error:", err.message);
    } else {
      console.log("📧 Email transporter ready");
    }
  });
} else {
  console.warn("⚠️ Email transporter disabled; EMAIL_* environment variables incomplete");
}

/* ================= BASE WRAPPER ================= */
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    
    <div style="background:#0f172a;color:#ffffff;padding:16px 24px;">
      <h2 style="margin:0;">Viplora Tech</h2>
    </div>

    <div style="padding:24px;color:#111827;font-size:15px;line-height:1.6;">
      ${content}
    </div>

    <div style="background:#f1f5f9;padding:14px;text-align:center;font-size:12px;color:#6b7280;">
      © ${new Date().getFullYear()} Viplora Tech. All rights reserved.
    </div>

  </div>
</body>
</html>
`;

/* ================= SEND EMAIL ================= */
export const sendEmail = async ({ to, subject, html, attachments }) => {
  if (!transporter) {
    console.warn("⚠️ Skipping email send: transporter not configured");
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      ...(Array.isArray(attachments) && attachments.length ? { attachments } : {}),
    });
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};

/* ================= OTP EMAIL ================= */
export const sendOtpEmail = async (to, otp) => {
  const html = baseTemplate(
    "OTP Verification",
    `
      <h3 style="margin-top:0;">OTP Verification</h3>
      <p>Your One-Time Password (OTP) is:</p>

      <div style="
        font-size:28px;
        font-weight:bold;
        letter-spacing:6px;
        background:#f1f5f9;
        padding:12px;
        text-align:center;
        border-radius:6px;
        margin:16px 0;
      ">
        ${otp}
      </div>

      <p>This OTP is valid for <b>10 minutes</b>.</p>
      <p style="color:#dc2626;font-size:13px;">
        ⚠️ Do not share this OTP with anyone.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Your OTP Code",
    html,
  });
};

/* ================= WELCOME EMAIL ================= */
export const sendWelcomeEmail = async (to, name, role) => {
  const roleLabel =
    role === "superadmin"
      ? "Super Administrator"
      : role === "admin"
      ? "Administrator"
      : "User";

  const html = baseTemplate(
    "Welcome",
    `
      <h3>Welcome to Viplora Tech 🎉</h3>
      <p>Hello <b>${name}</b>,</p>
      <p>Your account has been successfully created.</p>

      <p><b>Role:</b> ${roleLabel}</p>

      <p>You can now log in and start using the system.</p>
    `
  );

  return sendEmail({
    to,
    subject: "Welcome to Viplora Tech",
    html,
  });
};

/* ================= PASSWORD CHANGED ================= */
export const sendPasswordChangedEmail = async (to) => {
  const html = baseTemplate(
    "Password Changed",
    `
      <h3>Password Updated</h3>
      <p>Your account password has been changed successfully.</p>

      <p style="color:#dc2626;">
        If this was not you, please contact support immediately.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Security Alert: Password Changed",
    html,
  });
};

/* ================= COMPLAINT FORWARDING ================= */
export const sendComplaintForwardEmail = async ({ to, complaint, departmentName }) => {
  const complainerDetails = complaint.complainer || {};
  const complainerName = complainerDetails.name || "N/A";
  const complainerPhone = complainerDetails.phone || "N/A";
  const talukaName = complainerDetails.taluka?.name || "N/A";
  const villageName = complainerDetails.village?.name || "N/A";

  const attachments = Array.isArray(complaint.media) ? complaint.media : [];
  const attachmentsHtml = attachments.length
    ? `<h4>Attachments (${attachments.length}):</h4><ul>${attachments
        .map((attachment, index) => {
          const label = attachment.type
            ? `${attachment.type.charAt(0).toUpperCase()}${attachment.type.slice(1)}`
            : "File";
          const url = attachment.url || "#";
          return `<li><b>Attachment ${index + 1} (${label}):</b> <a href="${url}" target="_blank" rel="noreferrer">Open</a></li>`;
        })
        .join("")}</ul>`
    : "";

  const voiceHtml = complaint.voiceNote?.url
    ? `<h4>Voice Note:</h4><p><a href="${complaint.voiceNote.url}" target="_blank" rel="noreferrer">🎧 Listen (${complaint.voiceNote.format || "audio"})</a></p>`
    : "";

  const html = baseTemplate(
    "New Complaint Assigned",
    `
      <h3 style="margin-top:0;color:#0f172a;">Complaint Forwarded to ${departmentName}</h3>
      <p>Hello,</p>
      <p>A new complaint has been forwarded to your department for necessary action.</p>

      <div style="background:#f8fafc;padding:16px;border-radius:6px;border-left:4px solid #0f172a;margin:16px 0;">
        <p style="margin:4px 0;"><b>Complaint ID:</b> ${complaint.complaintId}</p>
        <p style="margin:4px 0;"><b>Complainer:</b> ${complainerName}</p>
        <p style="margin:4px 0;"><b>Date:</b> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
      </div>

      <h4>Complainer Details:</h4>
      <p style="margin:4px 0;"><b>Name:</b> ${complainerName}</p>
      <p style="margin:4px 0;"><b>Phone:</b> ${complainerPhone}</p>
      <p style="margin:4px 0;"><b>Taluka:</b> ${talukaName}</p>
      <p style="margin:4px 0;"><b>Village:</b> ${villageName}</p>

      <h4>Details:</h4>
      <p><b>Subject:</b> ${complaint.subject || "N/A"}</p>
      <p><b>Description:</b> ${complaint.description || "N/A"}</p>

      ${voiceHtml}
      ${attachmentsHtml}

      <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:13px;color:#64748b;">
        Please review the details and take the necessary steps. This is a system-generated email.
      </p>
    `
  );

  // Build real file attachments so recipients receive the files (not just links)
  const mailAttachments = [];
  attachments.forEach((attachment, index) => {
    if (!attachment?.url) return;
    const ext = (() => {
      try {
        const pathname = new URL(attachment.url).pathname;
        const match = pathname.match(/\.([a-zA-Z0-9]{1,6})$/);
        if (match) return match[1].toLowerCase();
      } catch (_) { /* noop */ }
      if (attachment.type === "image") return "jpg";
      if (attachment.type === "video") return "mp4";
      if (attachment.type === "pdf") return "pdf";
      if (attachment.type === "audio") return "mp3";
      return "bin";
    })();
    const label = attachment.type || "file";
    mailAttachments.push({
      filename: `${complaint.complaintId}-${label}-${index + 1}.${ext}`,
      path: attachment.url,
    });
  });

  if (complaint.voiceNote?.url) {
    mailAttachments.push({
      filename: `${complaint.complaintId}-voiceNote.${complaint.voiceNote.format || "mp3"}`,
      path: complaint.voiceNote.url,
    });
  }

  return sendEmail({
    to,
    subject: `Forwarded Complaint: ${complaint.complaintId}`,
    html,
    attachments: mailAttachments,
  });
};

export default transporter;
