import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || "Gharmai Kirana <no-reply@gharmaikirana.np>";

let transporter: Transporter | null = null;

function getTransporter() {
  if (!smtpHost) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass ?? "" } : undefined,
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<{ sent: boolean; devLink?: string }> {
  const transport = getTransporter();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      console.warn("SMTP_HOST is not configured — password-reset email was not sent.");
      return { sent: false };
    }
    return { sent: false, devLink: resetLink };
  }

  await transport.sendMail({
    to,
    from: emailFrom,
    subject: "Reset your Gharmai Kirana password",
    text: `We received a request to reset your Gharmai Kirana password. Open this link to choose a new one (valid for 30 minutes):\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
        <h2 style="color:#059669;margin-bottom:8px">Gharmai Kirana</h2>
        <p style="color:#374151">We received a request to reset your password.</p>
        <p style="margin:24px 0">
          <a href="${resetLink}"
             style="background:#059669;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Reset my password
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">This link is valid for 30 minutes and can only be used once.</p>
        <p style="color:#6b7280;font-size:13px">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
  return { sent: true };
}