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
    const msg = "❌ RESEND_API_KEY is missing from environment variables!";
    console.error(msg);
    throw new Error(msg);
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend Error: ${error.message}`);
  }

  return data;
}
