import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ----------------------------
// 1. Create Transporter
// ----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host, port, secure for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: Verify mail transporter (Good for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Server Error:", error);
  } else {
    console.log("✅ Email Server Ready");
  }
});

// ----------------------------
// 2. Basic Email Send Function
// ----------------------------
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.log("❌ Email Sending Error:", err);
  }
};

// ----------------------------
// 3. Pre-Built Functions (Example)
// ----------------------------

// 🔹 Send OTP Email
export const sendOtpEmail = async (to, otp) => {
  const html = `
    <h2>Your OTP</h2>
    <p>Your verification OTP is: <b>${otp}</b></p>
    <p>This OTP is valid for 10 minutes.</p>
  `;
  return sendEmail(to, "Your OTP Code", html);
};

// 🔹 Send Welcome Email
export const sendWelcomeEmail = async (to, name) => {
  const html = `
    <h2>Welcome ${name} 🎉</h2>
    <p>Thanks for joining our platform.</p>
  `;
  return sendEmail(to, "Welcome to Our Platform", html);
};

// 🔹 Send Password Reset Email
export const sendResetPasswordEmail = async (to, resetLink) => {
  const html = `
    <h2>Password Reset Requested</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;
  return sendEmail(to, "Reset Your Password", html);
};

// Export transporter if needed elsewhere
export default transporter;



// import { sendOtpEmail, sendWelcomeEmail, sendResetPasswordEmail } from "../utils/emailService.js";

// // Example usage:
// await sendOtpEmail("test@gmail.com", 123456);

// await sendWelcomeEmail("user@gmail.com", "Amit");

// await sendResetPasswordEmail("user@gmail.com", "https://yourapp.com/reset/123");
