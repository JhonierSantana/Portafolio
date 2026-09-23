# Portafolio — Jhonier Santana

Portafolio profesional de desarrollador frontend, construido con Next.js (App Router), TypeScript, Tailwind CSS y next-intl (bilingüe ES/EN).

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion
- next-intl (rutas `/es`, `/en`)
- MDX para case studies de proyectos
- Resend (formulario de contacto)
- Vitest (unit) + Playwright (e2e)

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (redirige a `/es`).

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `RESEND_API_KEY`: API key de [Resend](https://resend.com) para el formulario de contacto.
- `CONTACT_EMAIL_TO`: correo destino de los mensajes de contacto.
- `NEXT_PUBLIC_SITE_URL`: dominio de producción, usado en `metadataBase`, `sitemap.ts` y `robots.ts`.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm run lint` — ESLint.
- `npm run test` — tests unitarios (Vitest).
- `npm run test:e2e` — tests end-to-end (Playwright, hace build + start).

## Contenido

Los case studies de proyectos viven en `src/content/projects/{es,en}/*.mdx`. Cada archivo exporta un objeto `metadata` (título, resumen, stack, etc.) y el cuerpo MDX como contenido del caso de estudio.

## Animaciones

`src/components/motion/reveal.tsx` expone `Reveal`, `RevealGroup` y `RevealItem`: primitivos client-side reutilizables sobre Framer Motion para animar entrada al hacer scroll (`whileInView`, dispara una sola vez). Se usan como wrapper alrededor de Server Components (Experience, Skills, listados) sin convertirlos en Client Components — solo el wrapper es cliente. Variants compartidos en `src/lib/motion.ts`.

## Pendiente antes de producción

- Configurar `RESEND_API_KEY` y `CONTACT_EMAIL_TO` en producción (Vercel) para que el formulario de contacto envíe correos reales.
- Configurar `NEXT_PUBLIC_SITE_URL` con el dominio real una vez desplegado.
