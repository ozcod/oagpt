import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "OAGPT Security <onboarding@resend.dev>";

  if (!apiKey || apiKey.includes("your_resend_api_key")) {
    console.log("--------------------------------------------------");
    console.log("✉️ [RESEND_API_KEY NOT SET] Email verification link:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("--------------------------------------------------");
    return;
  }

  const resend = new Resend(apiKey);

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
