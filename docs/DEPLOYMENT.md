# Deployment (Vercel + Supabase)

## 1) Supabase
1. 建立 Supabase project
2. 去 SQL Editor 執行：
   - `supabase/migrations/20260227210000_init_ai_quote_assistant.sql`

## 2) Vercel
1. Import GitHub repo: `jackychan616/ai-quote-assistant`
2. Root directory 設定：`apps/web`
3. Build command：`npm run build`
4. Output：`.next`

## 3) Environment Variables
在 Vercel 加以下環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`（例如 production URL）
- `RESEND_API_KEY`（如要 email 真發送）
- `RESEND_FROM_EMAIL`（例如 `Sales Bot <noreply@yourdomain.com>`）

## 4) Post-deploy checks
- `/api/health` 回 200
- 可以新增 lead
- 可以建立 quote draft
- 可以建立 follow-up
- `/api/followups/auto` 可建立自動提醒

## 5) Cron (可選)
用 Vercel Cron 每日跑一次：
- `POST /api/followups/auto`
