"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendContactMessage, type ContactFormState } from "@/lib/email";
import { Button } from "@/components/ui/button";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const t = useTranslations("contact");
  const [state, formAction, isPending] = useActionState(
    sendContactMessage,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          {t("messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </div>
      <Button type="submit" disabled={isPending} className="self-start rounded-sm">
        {t("submit")}
      </Button>
      {state.status === "success" && (
        <p className="text-sm text-signal">{t("success")}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-destructive">{t("error")}</p>
      )}
    </form>
  );
}
