# Hosting Team — Action Required

## What needs to happen (takes ~2 minutes)

The Node.js app on this server needs to pull the latest code from GitHub and restart.

**GitHub repo:** https://github.com/[your-repo-url]
**Latest commit:** fde5a55 — "fix: read Razorpay keys and admin credentials from DB when env vars missing"

---

## Option A — cPanel "Setup Node.js App" (recommended)

1. Log into cPanel
2. Go to **Software → Setup Node.js App**
3. Find the app for `myvedicastrology.in`
4. Click **Pull from Git** (or "Deploy" if using Git Version Control)
5. Click **Restart** (or Stop → Start)

After deployment, configure the runtime environment required by `/api/health`, including the PostgreSQL connection, `JWT_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. The admin and one-time Razorpay credentials may be read from the existing database settings.

---

## Option B — SSH

```bash
cd /home/$(whoami)/myvedicastrology.in
git pull origin master
npm install --omit=dev
npm run migrate:runtime
# Then restart the Node.js app via pm2, forever, or cPanel
pm2 restart all       # if using pm2
# OR
pm2 restart server    # if named "server"
```

---

## Why this fixes it

The site currently shows:
- "Razorpay keys not configured" → payment broken
- "Admin login not configured" → admin panel broken

The fix is already in the code (committed to GitHub). The code now reads
Razorpay keys and admin credentials from the database automatically when the
database connection is available. The webhook secret is not stored there and
must be configured in the server environment.

---

## After restart, verify

```bash
# Should return {"ok":true} with a Set-Cookie header
curl -X POST https://myvedicastrology.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'

# Should return {"ok":true,"order":{...}}
curl -X POST https://myvedicastrology.in/api/razorpay/order \
  -H "Content-Type: application/json" \
  -d '{"amount":100000}'
```
