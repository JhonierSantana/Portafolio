"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FaPaperPlane } from "react-icons/fa6";
import { sendContactMessage, type ContactFormState } from "@/lib/email";
import { Button } from "@/components/ui/button";

const initialState: ContactFormState = { status: "idle" };

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-signal focus-visible:ring-2 focus-visible:ring-signal/40";

export function ContactForm() {
  const contactTexts = useTranslations("contact");
  const [formState, submitForm, isSending] = useActionState(sendContactMessage, initialState);

  return (
    <form action={submitForm} className="mt-5 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          {contactTexts("nameLabel")}
        </label>
        <input id="name" name="name" autoComplete="name" required className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {contactTexts("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          {contactTexts("messageLabel")}
        </label>
        <textarea id="message" name="message" required rows={6} className={`${fieldClass} resize-y`} />
      </div>

      <Button type="submit" disabled={isSending} className="h-10 gap-2 self-start rounded-sm px-5">
        <FaPaperPlane aria-hidden className="size-3.5" />
        {isSending ? contactTexts("sending") : contactTexts("submit")}
      </Button>

      {formState.status === "success" && (
        <p
          role="status"
          className="rounded-md border border-signal/60 bg-signal/10 px-3 py-2 text-sm text-signal"
        >
          {contactTexts("success")}
        </p>
      )}
      {formState.status === "error" && (
        <p
          role="alert"
          className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {contactTexts("error")}
        </p>
      )}
    </form>
  );
}
