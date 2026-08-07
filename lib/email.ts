import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "OAGPT Security <onboarding@resend.dev>";

  if (!resend) {
    console.log("--------------------------------------------------");
    console.log("✉️ [RESEND_API_KEY NOT SET] Email verification link:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("--------------------------------------------------");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend Email Error:", error);
      throw new Error(error.message);
    }

    console.log(`✅ Verification email sent to ${to} (ID: ${data?.id})`);
  } catch (err: any) {
    console.error("Failed to send email via Resend:", err);
  }
}
