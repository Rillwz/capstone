#!/usr/bin/env bash
# One-shot bootstrap for the app on an Oracle Cloud Always Free VM (Ubuntu 24.04, arm64).
# Run as root on a fresh instance: sudo bash setup.sh
# Prereq: ingress 80/443 open in the VCN security list (see README.md).
set -euo pipefail

REPO="https://github.com/Rillwz/capstone.git"
APP=/opt/umsura
PORT=3000

[ "$(id -u)" -eq 0 ] || { echo "run as root: sudo bash setup.sh" >&2; exit 1; }

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git build-essential python3 sqlite3 openssl caddy iptables-persistent

# package.json requires Node >= 22.22.
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# The repo ships bun.lock; npm has no lockfile here.
curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

id -u umsura >/dev/null 2>&1 ||
  useradd --system --create-home --home-dir "$APP" --shell /usr/sbin/nologin umsura

if [ -d "$APP/.git" ]; then
  git -C "$APP" pull --ff-only
else
  git clone --depth 1 "$REPO" "$APP"
fi
mkdir -p "$APP/data"

# auth.config.ts reads import.meta.env.AUTH_SECRET, which Vite inlines at build time,
# so the secret must exist before the build, not just before the first request.
[ -f "$APP/.env" ] ||
  printf 'AUTH_SECRET=%s\nAUTH_TRUST_HOST=true\n' "$(openssl rand -hex 32)" > "$APP/.env"
chmod 600 "$APP/.env"
chown -R umsura:umsura "$APP"

sudo -u umsura bash -c "cd $APP && bun install --frozen-lockfile && bun run build"

cat > /etc/systemd/system/umsura.service <<EOF
[Unit]
Description=Umsura Assignment
After=network.target

[Service]
Type=simple
User=umsura
WorkingDirectory=$APP
EnvironmentFile=$APP/.env
Environment=NODE_ENV=production PORT=$PORT HOST=127.0.0.1
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# sslip.io resolves <a.b.c.d>.sslip.io to that IP, so Caddy can get a real
# Let's Encrypt certificate without buying a domain.
PUBLIC_IP=$(curl -fsS --max-time 10 https://ifconfig.me)
HOSTNAME_="${PUBLIC_IP}.sslip.io"

cat > /etc/caddy/Caddyfile <<EOF
$HOSTNAME_ {
	encode zstd gzip
	reverse_proxy 127.0.0.1:$PORT
}
EOF

# Oracle's Ubuntu image ends INPUT with a REJECT rule; the VCN security list is the
# other gate. Open both or nothing gets in.
for p in 80 443; do
  iptables -C INPUT -p tcp --dport "$p" -j ACCEPT 2>/dev/null ||
    iptables -I INPUT -p tcp --dport "$p" -j ACCEPT
done
netfilter-persistent save

systemctl daemon-reload
systemctl enable --now umsura
systemctl enable --now caddy
systemctl restart caddy

echo
echo "App:   https://$HOSTNAME_"
echo "Logs:  journalctl -u umsura -f"
echo "Next:  copy data/app.db into $APP/data/, chown umsura, then systemctl restart umsura"
