# Production Root-Cause Report

Date: 2026-08-27  
Domain: `myvedicastrology.in`

## 1. Application Stack

```text
React 19 + Vite + React Router
  -> same-origin Express 5 API (Node/tsx)
       -> direct PostgreSQL via pg Pool
       -> Razorpay server API and SMTP/Postfix
  -> Supabase Edge Functions only for chat, enquiry, and palm-reading
```

- Frontend: React/Vite; React Router; no React Query, Redux, SWR, or IndexedDB.
- Backend: Express REST routes. Admin auth is an HTTP-only JWT cookie; user auth is a bearer JWT persisted through Capacitor Preferences or browser `localStorage`.
- Database: PostgreSQL via `pg`, pool size 10, 10-second connection timeout, 30-second idle timeout. The current direct-Postgres schema is the legacy `enquiries` model.
- Payments: Razorpay checkout, server-created orders, server-side HMAC verification, and a separate subscription webhook.
- Deployment: repository contains a Node process on port 3002 with optional PM2/cPanel and an Apache/Nginx reverse-proxy example. A live reverse-proxy/process listing was not available in this session.

## 2. Root Cause

### ROOT CAUSE #1: The live production deployment is stale and missing runtime configuration

The live site is not running the verified local revision: its root contains Vite refresh markup and its assets are dated 2026-08-19, versus the local build dated 2026-08-27. Live API evidence shows the running process cannot access the expected admin configuration, Razorpay keys, or public PostgreSQL data. This is the direct reason production remains broken after source changes. Localhost works because `.env.local` supplies the required values and the current source is used. The fix is deployment/restart and runtime environment correction, not another browser-cache workaround.

### ROOT CAUSE #2: Production API routing could send Express routes to nonexistent Supabase functions

`src/lib/api.ts` previously redirected every `/api/*` request when `VITE_API_MODE=supabase`. That included `/api/auth`, `/api/admin`, `/api/razorpay`, `/api/user`, and all PostgreSQL content routes, although the repository only deploys `chat`, `enquiry`, and `palm-reading` functions. This explains admin/login/payment failures and why public pages could show fallback data. The router now redirects only those three actual function names.

### ROOT CAUSE #3: Production content silently fell back to stale bundled seed data

`src/lib/data/index.ts` returned build-time services, homams, testimonials, and page defaults whenever an API request failed. A wrong API target, database outage, or proxy error therefore looked like a successful response and differed between browsers/builds. Production now does not substitute bundled records after an API failure; bundled data remains a development fallback.

### ROOT CAUSE #4: Razorpay payment could fail open

`src/components/payment/RazorpayButton.tsx` previously continued with orderless checkout if order creation failed and skipped server verification in that path. A successful-looking checkout could therefore have no verified server record. The UI now requires a server-created order, a complete Razorpay response, and successful server verification before calling `onSuccess`.

### ROOT CAUSE #5: Razorpay subscriptions had inconsistent configuration and webhook verification

One-time payments read environment or database settings, while `server/routes/subscriptions.ts` read only environment variables. Subscription webhooks also verified `JSON.stringify(req.body)` after parsing and accepted missing signatures. The subscription route now shares key lookup, requires `RAZORPAY_WEBHOOK_SECRET`, captures the raw request body before JSON parsing, and uses a timing-safe signature comparison.

### ROOT CAUSE #6: Email deliverability configuration was inconsistent

The application had inconsistent mail identity/TLS handling, production evidence showed `mail.myvedicastrology.in` was not covered by the SMTP certificate, and DNS exposed two SPF records. Mail paths now share aligned `From`, `Reply-To`, envelope sender, and TLS handling. DNS still requires manual consolidation.

### ROOT CAUSE #7: The documented production install could omit the runtime TypeScript loader

The server is started from `server/index.ts` with `tsx`, but `tsx` was previously a dev dependency while the hosting instructions used `npm install --omit=dev`. The package manifest and lockfile now classify `tsx` as a production dependency, and the nonexistent `build:all` server-build step was removed.

### ROOT CAUSE #8: Booking/payment persistence failures were reported as success

`server/routes/enquiry.ts` previously swallowed PostgreSQL insert errors and returned `{ok:true}`. `server/routes/razorpay.ts` likewise acknowledged verified payment before its booking update completed. Production database failures could therefore create a successful-looking checkout or booking with no durable record. Both paths now return an error when persistence fails.

### ROOT CAUSE #9: Transient user API failures were treated as invalid sessions

`src/hooks/useAppUser.tsx` previously deleted the persisted user token for any bootstrap exception, including network failures, HTML responses from a stale deployment, and HTTP 5xx responses. An intermittent server/proxy failure could therefore become a forced logout. The client now removes the token only for explicit `401/404` responses and preserves it through transient failures.

### ROOT CAUSE #10: Schema provisioning ran as an untracked side effect of route imports

The user, subscription, astrologer, and image-column schema was previously created or altered asynchronously while Express imported route modules. A request arriving before those statements completed could fail, and provisioning errors were swallowed. The DDL is now in the idempotent `server/migrations/004_runtime_schema.sql` migration and is applied explicitly with `npm run migrate:runtime` before starting the server.

The repository also contained a plaintext PostgreSQL credential in the legacy image migration runner. The value has been removed and the runner now requires `PG_HOST`, `PG_DATABASE`, `PG_USER`, and `PG_PASSWORD` from the environment. The database password must still be rotated because source cleanup does not revoke an exposed credential.

### ROOT CAUSE #11: The admin page editor could substitute bundled defaults after an API failure

`getAdminPageContent` returned build-time `pageDefaults` for any non-2xx response. A stale deployment, database outage, or authorization failure could therefore show an apparently valid but non-current editor state. It now fails closed and the editor displays the load error instead of allowing stale defaults to be saved.

### ROOT CAUSE #12: The admin route guard treated one transient session probe failure as logout

`useAuth` previously redirected to admin login after any `/api/auth/me` network, 5xx, or stale-HTML response. The guard now retries transient/unparseable responses with bounded backoff and still denies access immediately for explicit `401/403` responses.

The `/api/health` probe also now checks effective non-empty environment/database values instead of treating an empty settings row as configured.

## 3. Evidence

### Verified production evidence

- Live database settings contained SMTP overrides for host, port, user, password, sender, and admin email; no Gmail credentials were active.
- SMTP connected and accepted mail through Postfix on `ns1.sslsecure.co.in` / `168.119.64.101`.
- The certificate covered `webmail.myvedicastrology.in`, `myvedicastrology.in`, `admin.myvedicastrology.in`, and `www.myvedicastrology.in`, but not `mail.myvedicastrology.in`.
- A real mailbox message had aligned `Return-Path`, `From`, `Reply-To`, a `DKIM-Signature` for `d=myvedicastrology.in; s=mx`, and both plain-text and HTML parts.
- DNS exposed two SPF TXT records and a monitoring-only DMARC record (`p=none`).
- The read-only PostgreSQL connection succeeded with the configured local environment and returned: `services=18`, `homams=18`, `pages=3`, `testimonials=7`, `enquiries=31`, `settings=14`, `app_users=0`, `user_subscriptions=0`. `payments` and `bookings` do not exist in this direct-Postgres schema; one-time payments are linked through `enquiries.payment_id`.
- Live HTTPS checks reached Apache `2.4.52` and Express. `GET /api/public/services` returned `500 DB error`, `GET /api/admin/services` returned `503 Admin auth not configured`, and `POST /api/razorpay/order` returned `500 Razorpay keys not configured`.
- The live root response included Vite refresh markup and asset timestamps from 2026-08-19, while the local verified build was generated on 2026-08-27. This proves the production frontend is stale/not the current local build.
- The live stack trace identified the running source location as `/home/vedic543/public_html/server/index.ts`. A valid production CORS origin was accepted and an unrelated origin was rejected.
- Live `GET /api/health` and `GET /api/not-a-route` both returned the old SPA HTML with `200` instead of the new health JSON and API `404`, confirming the latest Express revision is not deployed.
- The connected PostgreSQL `settings` table contains `jwt_secret`, `admin_email`, `admin_password`, `razorpay_key_id`, and `razorpay_key_secret` (values were not read). Because live API requests still report missing configuration and database errors, the running process is not loading the same database connection/runtime configuration; the database fallback cannot help if that connection is unavailable.

### Code/configuration evidence

- `supabase/config.toml` defines only `chat`, `palm-reading`, and `enquiry` functions.
- Express mounts PostgreSQL-backed `/api/auth`, `/api/public/*`, `/api/admin/*`, `/api/razorpay`, `/api/user`, and `/api/subscriptions` routes.
- `public/sw.js` bypasses `/api` and `/admin`, so it was not caching API responses. It network-fetches navigations and static assets, with offline fallback only.
- Browser storage is used for visitor identity, profile/history, and the user bearer token. It is not the source of admin content, but persisted profile/history is intentionally device-local.
- CORS allows the exact production origins; unrelated origins were rejected in a live probe. The previous source also allowed any `*.vercel.app` origin, which is now removed.
- No client import of the Supabase server helper was found. Its unused service-role factory was removed because a `VITE_SUPABASE_SERVICE_ROLE_KEY` would be exposed to browser bundles; the active server seed route uses the non-`VITE_` `SUPABASE_SERVICE_ROLE_KEY` instead.
- An untracked `vedic_razorpay_keys.csv` credential file was detected in the workspace. It was not opened or modified; the filename is now ignored to prevent accidental commits. Any credentials in that file must be revoked/rotated and the file must be removed through the owner's secure process.

## 4. Changes Made

- `src/lib/api.ts`: route only the three deployed Supabase functions to Supabase; keep Express routes on the configured API origin.
- `src/lib/data/index.ts`: prevent production fallback to stale bundled content.
- `server/index.ts`: prevent API responses from being cached and stop unknown API paths from receiving SPA HTML.
- `server/index.ts`: add a non-secret `/api/health` probe for post-deployment database/configuration verification.
- `scripts/verify-production.mjs`, `package.json`: add `npm run verify:production` to verify the deployed HTML/API/health contract without secrets.
- `src/components/payment/RazorpayButton.tsx`: remove hardcoded key and orderless fallback; require secure server order and verification.
- `server/lib/razorpay-config.ts`: centralize environment/database Razorpay key lookup.
- `server/routes/razorpay.ts`: use shared key lookup.
- `server/routes/subscriptions.ts`: use shared keys and raw-body, required-secret, timing-safe webhook verification.
- `server/routes/enquiry.ts`, `server/routes/razorpay.ts`: fail closed when booking/payment persistence fails.
- `src/hooks/useAppUser.tsx`: preserve user sessions across transient API failures.
- `server/index.ts`: retain raw webhook bytes while parsing JSON.
- `server/routes/user.ts`: remove the built-in JWT secret fallback.
- `package.json`, `package-lock.json`: make the runtime `tsx` loader available to production installs and remove the broken `build:all` reference.
- `server/lib/mailer.ts`, `server/routes/user.ts`, `server/lib/dosha-report.ts`: align mail sender, reply-to, envelope, MIME, and TLS behavior.
- `.env.example`, `DEPLOY.md`, `HOSTING_TEAM.md`, `scripts/send-test-email.mjs`: correct SMTP hostname, remove unsafe/hardcoded deployment guidance, and remove credential values from operator docs.
- `supabase/migrations/0006_restrict_public_settings.sql`: restrict public settings reads to `contact`, `brand`, and `social`.
- `src/lib/supabase/server.ts`: remove the unused client-side service-role helper so service-role credentials cannot be configured through a `VITE_*` variable.
- Added focused mailer, IMAP, and migration tests.
- Removed import-time DDL from user, subscription, astrologer, and admin image routes.
- Added the explicit idempotent runtime-schema migration and environment-only runner.
- Removed the plaintext database credential from `server/migrations/run-migration-003.mjs`.
- `.gitignore`: ignore the detected local Razorpay credential export.
- `src/lib/supabase/admin-data.ts`, `src/admin/AdminPages.tsx`: prevent failed admin page reads from becoming editable bundled defaults and show the actual load error.
- `src/hooks/useAuth.ts`: retry transient admin session probes without weakening explicit unauthorized handling.
- `server/index.ts`: make health configuration flags reflect non-empty effective values.

## 5. Production Configuration Required

The following matrix is based on the repository-wide `process.env` and `import.meta.env` scan. “Local” means the key was present in the local environment file without printing its value. “Production” means confirmed from live behavior or the read-only database inspection; the running process environment itself was not available.

| Variable(s) | Used by | Required in production | Local | Production verified | Problem/status |
| --- | --- | --- | --- | --- | --- |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`, `PG_SSL` | `server/lib/db.ts`, migration runners | Yes | Present | DB connection confirmed, process env not confirmed | Rotate the previously exposed password; review non-SSL policy. |
| `JWT_SECRET` | Admin and user JWTs | Yes | Present | DB setting exists; live process not confirmed | Must be stable and configured in the running process or approved DB settings. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login | Yes unless DB settings are used | Present | DB settings exist; live process not confirmed | Live process reported unconfigured because the stale deployment could not use its expected config. |
| `FRONTEND_URL`, `PORT`, `NODE_ENV`, `BUILD_ID` | CORS, proxy cookies, listener, health | Yes for production deployment | Partial | Not confirmed in running process | Set exact origin, production mode, and a build identifier. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Server order/subscription creation | Yes | Present | DB settings exist; live process not confirmed | Live order endpoint reported missing keys on stale code. |
| `VITE_RAZORPAY_KEY_ID` | Browser checkout display | Yes for web checkout | Present | Live bundle not current | Must be public key only and match server account/mode. |
| `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_STAR`, `RAZORPAY_PLAN_COSMIC` | Subscription webhook/plans | Webhook secret yes; plan IDs for paid subscriptions | Webhook key present but unusable in default local process | Not confirmed | Configure webhook secret in runtime and Razorpay dashboard. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_REPLY_TO`, `SMTP_ENVELOPE_FROM`, `SMTP_TLS_SERVERNAME` | Mailer, OTP, notifications | Yes for email features | Present | SMTP delivery and headers confirmed; running process not confirmed | Use `webmail.myvedicastrology.in:465` with aligned identity. |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `OPENAI_API_KEY`, `OPENAI_MODEL` | AI routes | Required only for corresponding AI provider | Keys present locally | Not confirmed | Provider availability was not tested live. |
| `VITE_API_MODE`, `VITE_API_BASE_URL`, `VITE_SITE_URL` | Frontend API routing/native builds | Yes for the relevant build | Present | Live frontend is stale | Only the three deployed Edge Function paths may use Supabase. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_FUNCTIONS_URL` | Supabase client/functions | Required only for chat/enquiry/palm | Not all required values verified | Not confirmed | Anon key is public; no service-role key may use a `VITE_*` name. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Server seed route | Only when using admin seed | Not confirmed | Not confirmed | Keep service-role access server-only. |
| `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASS` | Diagnostic script only | No | Optional | Not applicable | Not part of application runtime. |

Variables such as `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SESSION_SECRET`, `COOKIE_DOMAIN`, `COOKIE_SECURE`, `COOKIE_SAMESITE`, `BACKEND_URL`, `API_URL`, `CORS_ORIGIN`, and `PAYMENT_MODE` are not used by the active TypeScript server or frontend configuration.

Verify without exposing values:

- `VITE_API_MODE`: must not redirect Express routes; only the three Edge Function paths may use Supabase.
- `VITE_API_BASE_URL`: required for native builds and must identify the live Express origin.
- `VITE_RAZORPAY_KEY_ID`: must match the Razorpay account/mode used by the server.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_STAR`, `RAZORPAY_PLAN_COSMIC`: must exist in the running process or approved database settings.
- `RAZORPAY_WEBHOOK_SECRET`: must match the Razorpay dashboard webhook.
- `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`, `PG_SSL`: must point to the intended production PostgreSQL instance; the verified current environment uses non-SSL direct PostgreSQL and must be reviewed against provider policy.
- `JWT_SECRET`: must be present and stable across all running processes.
- `FRONTEND_URL`: must equal the exact deployed frontend origin.
- `SMTP_HOST=webmail.myvedicastrology.in`, `SMTP_PORT=465`, `SMTP_TLS_SERVERNAME=webmail.myvedicastrology.in`, aligned sender settings, and the existing SMTP password.

## 6. Database Status

The configured read-only check connected successfully and confirmed the legacy tables and row counts above. The repository contains both Supabase migrations and a separate direct-Postgres migration tree; there is no authoritative migration-version table or live migration log available here. No production data was modified. Required payment tables from the Supabase schema are not part of the direct-Postgres deployment, so deployment must continue using `enquiries` unless the architecture is intentionally migrated. The connected settings row names include the admin and one-time Razorpay credentials, but not `razorpay_webhook_secret`; that webhook secret must be supplied in the runtime environment and configured identically in the Razorpay dashboard. The new runtime migration is idempotent, but its successful execution must be confirmed on the production database before the first restart using the revised routes.

## 7. Cache Status

- Browser cache: dynamic API responses had no explicit HTTP cache policy before the fix; they now receive `Cache-Control: no-store`.
- Local storage/Preferences: profile, history, visitor ID, and user token only.
- Query cache: none found.
- Service worker: static/navigation network-first; explicitly bypasses `/api` and `/admin`.
- CDN/Nginx: not verifiable from the repository/session.
- Confirmed stale-data mechanisms: the live deployment is stale, API failure was masked by bundled seed fallback, and dynamic API responses previously lacked an explicit `no-store` policy. The repository-side fallback and API cache behavior are now corrected.

## 8. Authentication Status

Admin login signs a seven-day JWT in an HTTP-only, `SameSite=Lax` cookie and admin routes verify that cookie. User OTP login signs a 30-day bearer JWT stored client-side. The previous user JWT default secret was removed. Express now trusts one front proxy and sets secure cookies for production or HTTPS requests. Exact production cookie persistence behind the live proxy, incognito behavior, and process consistency still require a real HTTPS browser test.

## 9. Razorpay Status

The intended flow is browser checkout -> Express order creation -> Razorpay -> Express HMAC verification -> `enquiries.payment_id` update and notification. The former client-side orderless fallback was unsafe and is removed. Subscription creation/webhooks use a separate `user_subscriptions` table. A live Razorpay order, payment, webhook delivery, and database status transition were not executed in this session.

## 10. Verification

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run lint`
- local production-mode Express smoke test: `/api/health` returned `200` with `ok:true`; an unknown `/api` path returned JSON `404` and `Cache-Control: no-store`.
- `node scripts/verify-production.mjs http://localhost:3002` passed. The same verifier against `https://myvedicastrology.in` failed on stale Vite markup, missing health/cache headers, and SPA `200` fallthrough, as expected before deployment.
- `/api/health` correctly returned `503` when the local process had no webhook secret; with a non-production smoke secret supplied only to the process, the full verifier passed with `adminAuth`, `razorpay`, `smtp`, and `webhook` all true.
- mailer, IMAP-helper, and settings-migration tests
- `git diff --check`
- read-only PostgreSQL connectivity/schema/count check
- live SMTP connection, accepted message, mailbox headers, DKIM presence, and MIME structure

Not available or not proven:

- Gmail Inbox/Spam placement and Gmail `Authentication-Results` (`SPF`, `DKIM`, `DMARC`)
- live production browser tests for admin login, cookies, incognito, cross-browser consistency, and public refresh
- live reverse-proxy, PM2/cPanel, process-count, memory, CPU, and log correlation
- live Razorpay checkout, webhook, and payment-record transition
- full production migration history and schema parity beyond the read-only checks above

## 11. Remaining Manual Actions

1. Deploy the code and restart exactly one intended Node process with `NODE_ENV=production`.
2. Confirm the live root no longer contains Vite refresh markup, and confirm `/api/*` responses come from the deployed Express revision.
3. Check `/api/health`; it must return `200` with `ok:true`, `database:"ok"`, and `adminAuth`, `razorpay`, `smtp`, and `webhook` flags true.
4. Set the Express/native API origin and ensure production builds do not route admin/payment paths to Supabase.
5. Apply Supabase migration `0006` if the Supabase project is active.
6. Configure Razorpay dashboard webhook URL/secret and send a signed test webhook.
7. Replace the two SPF records with one policy after accounting for every legitimate sender, preferably authorizing the current MX/A and `168.119.64.101`.
8. Test login, admin update/refresh in a second browser, a real Razorpay test/live-mode transaction as appropriate, and Gmail “Show original”.
9. Rotate the PostgreSQL password that was previously present in repository source, update the hosting secret, run `npm run migrate:runtime`, and restart the app.
10. Revoke/rotate any Razorpay credentials in the local credential export and remove that file securely; verify it has never been committed or uploaded.
