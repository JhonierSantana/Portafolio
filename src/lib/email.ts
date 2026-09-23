"use server";

import { Resend } from "resend";

export type ContactFormState = {
  status: "idle" | "success" | "error";
};

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;

  if (!apiKey || !to) {
    console.error("Missing RESEND_API_KEY or CONTACT_EMAIL_TO env vars");
    return { status: "error" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Portafolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — Portafolio`,
      text: `De: ${name} <${email}>\n\n${message}`,
    });
    return { status: "success" };
  } catch (error) {
    console.error("Failed to send contact message", error);
    return { status: "error" };
  }
}
