import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {year} Jhonier Santana. {t("rights")}
        </p>
        <div className="flex gap-6">
          <a href="mailto:jhonier_2504@hotmail.com" className="hover:text-signal transition-colors">
            Email
          </a>
          <a
            href="https://github.com/JhonierSantana"
            target="_blank"
            rel="noreferrer"
            className="hover:text-signal transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/jhonier-yesid-santana-pedroza-457492265"
            target="_blank"
            rel="noreferrer"
            className="hover:text-signal transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
