@AGENTS.md

# Deployment

- SSH: `ssh mdbe@linode` (port 2233, configured in ~/.ssh/config)
- App dir on server: `/var/www/besawsbeesauce.com`
- Service: `besawsbeesauce` (systemd, port 3007)
- Staging: `besawsbeesauce.aeoui.xyz`
- Admin login: `/admin/login` — password in `/var/www/besawsbeesauce.com/.env.production`

## Deploy workflow

Build happens **locally only** — never run `npm run build` on the Linode (too small, will OOM).

```
./deploy/sync.sh   # builds locally (webpack), rsyncs + installs runtime deps on server
```

## Tech notes

- `next build --webpack` — must use webpack, not Turbopack; Turbopack embeds Mac-specific native module hashes that break on Linux
- `better-sqlite3` is marked `serverExternalPackages` in next.config.ts
- DB lives at `data/beesauce.db` on the server — excluded from rsync to preserve data
- `.env.production` on server is excluded from rsync — edit manually via SSH

## TODO

- [ ] Add qty available display on product page (show "X left" or "Out of stock")
- [ ] Blog: replace markdown textarea with rich text (WYSIWYG) editor — support photos, YouTube embeds, links, bold/italic etc. (Tiptap recommended)
- [ ] Product page: qty selector (1, 2, 3…) before "Add to Cart" button
- [ ] Admin: add new product (name, description, price, category, slug, photo upload)
- [ ] Admin: show/hide products on public site (published flag per product)
- [ ] Cart icon: show item count badge top right in header
- [ ] Set real `ADMIN_PASSWORD` before going live (currently "admin")
- [ ] Get client email address → build contact form email route with Resend
- [ ] Client creates Stripe account → get publishable key, secret key → add to `.env.production`
- [ ] Set up Stripe webhook in Stripe dashboard → `https://besawsbeesauce.com/api/webhook` → event: `checkout.session.completed` → get webhook secret → add to `.env.production`
- [ ] Add `NEXT_PUBLIC_SITE_URL=https://besawsbeesauce.com` when cutting over DNS
- [ ] Add product photos for lip balm, bath bomb, candle, soap — grab from existing website (itshoneythough.com or Facebook page)
