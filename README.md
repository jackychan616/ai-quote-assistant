# AI Quote + Follow-up Assistant

由查詢到成交，一站式管理：
- Leads 管理（新增 / 搜尋 / 編輯）
- Quote Draft（支援 line items）
- Follow-ups（手動 + 自動建立）
- Dashboard KPI（pipeline + pending 跟進）

## Structure

- `apps/web` - Next.js 14 App Router frontend + API routes
- `docs` - implementation, API, deployment, demo script
- `supabase/migrations` - SQL migrations

## Quick start

```bash
cd apps/web
npm install
npm run dev
```

開發網址：`http://localhost:3000`

## Required env (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database setup

在 Supabase SQL Editor 執行：
- `supabase/migrations/20260227210000_init_ai_quote_assistant.sql`

## Main pages

- `/dashboard`
- `/lead/new`
- `/lead/:id`
- `/quote/:id`
- `/quotes`
- `/followups`

## Automation endpoints

- `POST /api/followups/auto`
  - 為 `quoted` 狀態而且未有 pending follow-up 的 leads，自動建立 D+1 跟進。
- `POST /api/demo/seed`
  - 一鍵建立 demo leads / quote / follow-up 測試資料。

## More docs

- `docs/DEPLOYMENT.md`
- `docs/DEMO_SCRIPT.md`
- `docs/ONE_PAGER.md`
- `docs/API_CONTRACTS.md`
- `docs/IMPLEMENTATION_PLAN.md`

