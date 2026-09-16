# Deployment Guide — myvedicastrology.in

## What's in this zip

- `src/` — React frontend source
- `server/` — Express API server (Node.js)
- `dist/` — Pre-built frontend (ready to serve, no build needed)
- `.env` — Production credentials supplied securely by the hosting environment
- `package.json` — Dependencies

---

## Steps to deploy

### 1. Extract the zip
Upload and extract `vedic-astrology-deploy.zip` to your server directory (e.g. `/home/user/myvedicastrology.in/`).

### 2. Install dependencies
```bash
cd /home/user/myvedicastrology.in
npm install
npm run migrate
```

### 3. Start the server with PM2
```bash
pm2 delete vedic 2>/dev/null; true

pm2 start server/index.ts \
  --name vedic \
  --interpreter node \
  --interpreter-args "--import=tsx/esm"

pm2 save
pm2 startup
```

> `server/index.ts` auto-loads `.env` via `dotenv/config`. No `--env-file` flag needed.

### 4. Verify
- https://myvedicastrology.in — site loads
- https://myvedicastrology.in/admin/login — use the administrator credentials stored in the hosting environment
- Book a service → Pay → Razorpay popup opens ✓

---

## If pm2 is not installed
```bash
npm install -g pm2
```

## Alternative start (no pm2)
```bash
node --import=tsx/esm server/index.ts
```

> `server/index.ts` auto-loads `.env` via `dotenv/config`. No `--env-file` flag needed.

---

## Apache/Nginx reverse proxy

If Apache is the front-facing server, add a reverse proxy to port 3002:

**Apache (.htaccess or VirtualHost):** Apache's `mod_proxy` forwards
`X-Forwarded-For` automatically, but you must also forward the protocol so
secure cookies and `req.secure` resolve correctly, and forward the real client
IP as `X-Real-IP`:

```apache
ProxyPass / http://localhost:3002/
ProxyPassReverse / http://localhost:3002/
RequestHeader set X-Forwarded-Proto "https" env=HTTPS
ProxyAddHeaders On
```

**Nginx:**
```nginx
location / {
    proxy_pass http://localhost:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> Without `X-Forwarded-Proto` the app still issues `Secure` cookies in
> production (it keys off `NODE_ENV=production`), but rate limiting and request
> logging will attribute every visitor to the proxy's loopback address unless
> `X-Forwarded-For` / `X-Real-IP` are forwarded. Ensure those headers are sent.

---

## Environment (.env)

Do not package credentials in source archives. Supply them through the hosting environment or a secret manager.

Key credentials pre-configured:
- **Admin login**: configured through `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`
- **Razorpay**: configured through the server environment or approved database settings
- **Database**: Supabase PostgreSQL pooler (configured in `.env`)
- **SMTP**: mail.myvedicastrology.in port 587 (do NOT use 465 — SSL cert mismatch)

---

## Troubleshooting

**"Admin login not configured"** — The server is running old code. Restart pm2: `pm2 restart vedic`

**"Razorpay keys not configured"** — Check `.env` has `RAZORPAY_KEY_ID` set. Run `pm2 restart vedic`

**Site not loading** — Check `pm2 logs vedic` for errors. Ensure port 3002 is open.

**Emails going to spam** — Do not change DNS blindly. Verify the actual SMTP provider, the domain's current SPF/DKIM/DMARC records, and whether the app is sending with an aligned `From` / `Reply-To` / envelope sender before updating any records.
