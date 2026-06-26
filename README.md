# viewep — Monitores Premium

E-commerce de monitores premium com visualização 3D, catálogo interativo e checkout integrado ao MercadoPago.

## Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4
- **3D:** React Three Fiber + Three.js (modelos GLB com Draco compression)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Pagamento:** MercadoPago (Checkout Pro)
- **Hospedagem:** Vercel

## Estrutura

```
src/
  components/   — UI components (cart, catalog, layout, ui)
  pages/        — Home, Checkout, Confirmation, Orders
  store/        — Zustand stores (cart, auth, app, toast)
  lib/          — Supabase client, hooks
  data/         — Dados dos produtos (fallback)

supabase/
  functions/    — Edge Functions (create-preference, mp-webhook)
  migrations/   — Schema SQL
```

## Setup

```bash
npm install
cp .env.example .env
# Preencha .env com as credenciais do Supabase e MercadoPago
npm run dev
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (apenas edge functions) |
| `MP_ACCESS_TOKEN` | Token de acesso do MercadoPago |
| `MP_WEBHOOK_SECRET` | Secret para verificar webhooks do MercadoPago (opcional) |
| `SITE_ORIGIN` | URL pública do site (ex: https://meusite.vercel.app) |
| `DB_PASSWORD` | Senha do banco Supabase |

## Deploy

### Frontend (Vercel)
Conecte o repositório ao Vercel e defina as variáveis de ambiente no dashboard.

### Edge Functions (Supabase)
```bash
npx supabase functions deploy create-preference
npx supabase functions deploy mp-webhook
```

As variáveis de ambiente das edge functions devem ser configuradas no dashboard do Supabase:
**Project Settings > Edge Functions > Secrets**

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type-check + build de produção |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview do build |
