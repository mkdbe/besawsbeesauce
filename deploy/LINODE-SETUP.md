# Linode First-Time Setup — Besaw's Bee Sauce

Port: **3006**  
Staging domain: `besawsbeesauce.aeoui.xyz`  
Live domain (later): `besawsbeesauce.com`

---

## 1. Create the app directory

```bash
sudo mkdir -p /var/www/besawsbeesauce.com
sudo chown mdbe:mdbe /var/www/besawsbeesauce.com
```

## 2. Initial rsync from Mac

Run from your Mac:

```bash
chmod +x /Users/mdbe/claude/besawsbeesauce.com/deploy/sync.sh
./deploy/sync.sh
```

Or manually:

```bash
rsync -avz --delete \
  --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  /Users/mdbe/claude/besawsbeesauce.com/ \
  mdbe@linode:/var/www/besawsbeesauce.com/
```

## 3. Set up the .env.production on the server

```bash
ssh mdbe@linode
cp /var/www/besawsbeesauce.com/deploy/.env.production.template \
   /var/www/besawsbeesauce.com/.env.production
nano /var/www/besawsbeesauce.com/.env.production
# Fill in real Stripe keys and update NEXT_PUBLIC_SITE_URL
```

## 4. Install Node deps and build

```bash
cd /var/www/besawsbeesauce.com
npm ci --omit=dev
npm run build
```

## 5. Install the systemd service

```bash
sudo cp /var/www/besawsbeesauce.com/deploy/besawsbeesauce.service \
        /etc/systemd/system/besawsbeesauce.service
sudo systemctl daemon-reload
sudo systemctl enable besawsbeesauce
sudo systemctl start besawsbeesauce
sudo systemctl status besawsbeesauce
```

## 6. Nginx config

```bash
sudo cp /var/www/besawsbeesauce.com/deploy/nginx-besawsbeesauce.conf \
        /etc/nginx/sites-available/besawsbeesauce
sudo ln -s /etc/nginx/sites-available/besawsbeesauce \
           /etc/nginx/sites-enabled/besawsbeesauce
sudo nginx -t
```

## 7. SSL cert (staging domain)

```bash
sudo certbot --nginx -d besawsbeesauce.aeoui.xyz
```

Then reload Nginx:

```bash
sudo systemctl reload nginx
```

## 8. DNS — add staging subdomain

In Linode DNS Manager, add an A record:
- Hostname: `besawsbeesauce.aeoui.xyz`
- Target: `<linode-ip>`

---

## Ongoing deploys

From your Mac:

```bash
./deploy/sync.sh
```

This rsyncs and runs `deploy.sh` on the server (npm ci + build + service restart).

---

## Cutover to besawsbeesauce.com

When ready to go live:

1. Point `besawsbeesauce.com` DNS A record to your Linode IP
2. Add `besawsbeesauce.com` to `server_name` in the Nginx config
3. Re-run certbot to get a cert for the real domain:
   ```bash
   sudo certbot --nginx -d besawsbeesauce.aeoui.xyz -d besawsbeesauce.com
   ```
4. Update `.env.production` — change `NEXT_PUBLIC_SITE_URL` to `https://besawsbeesauce.com`
5. Update Stripe webhook endpoint URL in the Stripe dashboard
6. Redeploy: `./deploy/sync.sh`

---

## Stripe webhook setup

In the Stripe dashboard → Developers → Webhooks:
- Endpoint URL: `https://besawsbeesauce.aeoui.xyz/api/webhook`
- Events to listen for: `checkout.session.completed`
- Copy the signing secret into `.env.production` as `STRIPE_WEBHOOK_SECRET`
