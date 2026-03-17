# Color del Dólar — Contexto del proyecto

## Qué es
Web app Next.js 16 que muestra la cotización del dólar blue y oficial en Argentina en tiempo real.
Dominio: **colordeldolar.com.ar** — Deploy en Vercel.

## Stack
- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** + SCSS modules
- **Drizzle ORM** + **Neon** (PostgreSQL serverless)
- **dolarapi.com** como fuente de cotizaciones
- **Twitter API v2** + **Google Drive API** para publicación automática de tweets con imagen
- Auth: JWT con `jose` (cookie `admin_token`)

## Estructura clave
```
src/
  app/
    page.tsx              — SSR: fetch inicial a dolarapi, JSON-LD SEO
    HomeClient.tsx        — Client: polling configurable, estado mercado abierto/cerrado
    layout.tsx            — metadata, fuentes, SEO
    admin/                — panel admin (login, dashboard)
    api/
      dolar/route.ts      — proxy a dolarapi.com
      config/route.ts     — config pública (polling, horarios)
      admin/
        login/route.ts    — auth JWT
        logout/route.ts
        config/route.ts   — CRUD configuración en DB
        imagen/route.ts   — genera imagen del dólar con satori + resvg
  components/
    dolar-value.tsx       — card de cotización
    ThemeToggle.tsx       — toggle dark/light
  lib/
    auth.ts               — JWT helpers
    fecha.ts              — formateo de fechas en AR
    market-hours.ts       — lógica mercado abierto/cerrado
    twitter.ts            — cliente Twitter API
    drive.ts              — upload a Google Drive
    imagen-dolar.tsx      — generación de imagen con Satori
  db/
    schema.ts             — tablas: cotizaciones_diarias, configuracion
    index.ts              — cliente Neon/Drizzle
  proxy.ts                — proxy helper
scripts/
  tweet.mjs               — script para tweetear cotización diaria
  get-refresh-token.mjs   — obtener refresh token de Google
```

## DB Schema
- `cotizaciones_diarias`: id, tipo (blue|oficial), fecha, apertura_compra, apertura_venta, cierre_compra, cierre_venta
- `configuracion`: clave (PK), valor — claves usadas: `polling_activo`, `polling_intervalo`, `mercado_hora_apertura`, `mercado_hora_cierre`
- `dolar_snapshot`: fila única (id=1, siempre sobreescrita con upsert) — guarda el valor previo del dólar para calcular tendencia (↑↓) sin crecer la DB

## Convenciones
- Idioma: español en UI y comentarios
- Fechas siempre en timezone Argentina
- `npm run dev` para desarrollo local
- `npm run db:generate` y `npm run db:migrate` para migraciones Drizzle

## Memoria de trabajo
Ver `/home/mausedar/.claude/projects/-home-mausedar-proyectos-colordeldolar/memory/MEMORY.md` para historial de decisiones y trabajo reciente.
