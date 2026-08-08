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
    process.env.RESEND_FROM_EMAIL || "OAGPT Security <noreply@ozairahmad.com>";

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not defined in environment variables.");
    return;
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("❌ Resend API Error:", error.message);
    throw new Error(`Resend Error: ${error.message}`);
  }

  console.log(`✅ Verification email sent to ${to} (ID: ${data?.id})`);
  return data;
}
