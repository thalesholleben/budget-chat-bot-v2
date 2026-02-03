# Multi-stage build para otimizar o tamanho da imagem

# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
# As variáveis VITE_* são injetadas em runtime via env-config.js
# Os valores de build time servem apenas como fallback
ARG VITE_WEBHOOK_URL
ARG VITE_WEBHOOK_API_KEY
ARG VITE_EXTERNAL_LINK
ARG VITE_PROFESSIONAL_NAME
ARG VITE_PROFESSIONAL_TITLE
ARG VITE_HEADER_SUBTITLE
ARG VITE_FAQ_1
ARG VITE_FAQ_2
ARG VITE_FAQ_3
ARG VITE_FAQ_4
ARG VITE_FAQ_5
ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL
ENV VITE_WEBHOOK_API_KEY=$VITE_WEBHOOK_API_KEY
ENV VITE_EXTERNAL_LINK=$VITE_EXTERNAL_LINK
ENV VITE_PROFESSIONAL_NAME=$VITE_PROFESSIONAL_NAME
ENV VITE_PROFESSIONAL_TITLE=$VITE_PROFESSIONAL_TITLE
ENV VITE_HEADER_SUBTITLE=$VITE_HEADER_SUBTITLE
ENV VITE_FAQ_1=$VITE_FAQ_1
ENV VITE_FAQ_2=$VITE_FAQ_2
ENV VITE_FAQ_3=$VITE_FAQ_3
ENV VITE_FAQ_4=$VITE_FAQ_4
ENV VITE_FAQ_5=$VITE_FAQ_5

RUN npm run build

# Stage 2: Nginx para servir a aplicação
FROM nginx:alpine

# Criar diretório para templates do Nginx
RUN mkdir -p /etc/nginx/templates

# Copiar template do Nginx (será processado em runtime)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Instalar envsubst + htpasswd para processar variáveis e gerar auth
RUN apk add --no-cache gettext apache2-utils

# Copiar script de injeção de variáveis em runtime
COPY env.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta 80 (padrão do Easypanel e outros orchestrators)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
