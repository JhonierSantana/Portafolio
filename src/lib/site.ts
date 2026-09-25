const LOCAL_SITE_URL = "http://localhost:3000";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProductionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  const rawUrl =
    configuredUrl || (vercelProductionDomain ? `https://${vercelProductionDomain}` : LOCAL_SITE_URL);
  const urlWithProtocol = /^https?:\/\//.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  return urlWithProtocol.replace(/\/+$/, "");
}

export const siteUrl = resolveSiteUrl();

export const staticRoutes = ["/", "/proyectos", "/sobre-mi", "/contacto"] as const;
