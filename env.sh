#!/bin/sh

# Gera env-config.js com variáveis de ambiente em runtime
# Isso permite mudar configurações sem rebuild da imagem Docker

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_WEBHOOK_URL: "${VITE_WEBHOOK_URL:-}",
  VITE_WEBHOOK_API_KEY: "${VITE_WEBHOOK_API_KEY:-}",
  VITE_EXTERNAL_LINK: "${VITE_EXTERNAL_LINK:-}",
  VITE_PROFESSIONAL_NAME: "${VITE_PROFESSIONAL_NAME:-}",
  VITE_PROFESSIONAL_TITLE: "${VITE_PROFESSIONAL_TITLE:-}",
  VITE_HEADER_SUBTITLE: "${VITE_HEADER_SUBTITLE:-}",
  VITE_FAQ_1: "${VITE_FAQ_1:-}",
  VITE_FAQ_2: "${VITE_FAQ_2:-}",
  VITE_FAQ_3: "${VITE_FAQ_3:-}",
  VITE_FAQ_4: "${VITE_FAQ_4:-}",
  VITE_FAQ_5: "${VITE_FAQ_5:-}"
};
EOF

echo "env-config.js generated successfully"

# Processar template nginx.conf com variáveis de ambiente
export WEBHOOK_URL_BACKEND="${VITE_WEBHOOK_URL:-}"
export WEBHOOK_API_KEY_BACKEND="${VITE_WEBHOOK_API_KEY:-}"
export RULES_URL_BACKEND="${RULES_URL_BACKEND:-}"
export RULES_API_KEY_BACKEND="${RULES_API_KEY_BACKEND:-}"

envsubst '${WEBHOOK_URL_BACKEND} ${WEBHOOK_API_KEY_BACKEND} ${RULES_URL_BACKEND} ${RULES_API_KEY_BACKEND}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "nginx.conf configured with webhook proxy"

# Gerar .htpasswd para /admin (HTTP Basic Auth)
if [ -n "${ADMIN_USER:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  htpasswd -bc /etc/nginx/.htpasswd "$ADMIN_USER" "$ADMIN_PASSWORD"
  echo "htpasswd generated for admin user: $ADMIN_USER"
else
  echo "WARNING: ADMIN_USER/ADMIN_PASSWORD not set, /admin will be unprotected"
  touch /etc/nginx/.htpasswd
fi
