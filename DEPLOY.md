# Guia de Deploy - VPS

Instruções completas para fazer deploy do Octopus AI Assistant em uma VPS.

## Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Docker e Docker Compose instalados
- Acesso SSH à VPS
- Domínio configurado (opcional, mas recomendado)

## 1. Preparar a VPS

### 1.1 Conectar via SSH

```bash
ssh usuario@seu-servidor.com
```

### 1.2 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar Docker

```bash
# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Adicionar usuário ao grupo docker (para rodar sem sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 1.4 Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## 2. Fazer Upload do Projeto

### Opção A: Via Git (Recomendado)

```bash
# Na VPS
cd ~
git clone <seu-repositorio-git>
cd budget-chat-bot
```

### Opção B: Via SCP (do seu computador local)

```bash
# No seu computador local
cd /caminho/para/budget-chat-bot
tar -czf budget-chat-bot.tar.gz .
scp budget-chat-bot.tar.gz usuario@seu-servidor.com:~

# Na VPS
cd ~
mkdir budget-chat-bot
tar -xzf budget-chat-bot.tar.gz -C budget-chat-bot
cd budget-chat-bot
```

## 3. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << EOF
VITE_WEBHOOK_URL=https://bot.thalesgomes.com/webhook/chat-bot
VITE_WEBHOOK_API_KEY=967abe596f4fa80749a72798c4b80bd54f99457b02a0d0cd06bd9ad9d6cb740c
EOF
```

**Importante**: Substitua os valores pelas suas configurações reais.

## 4. Build e Deploy

### 4.1 Build da imagem Docker

```bash
docker build -t octopus-ai-assistant \
  --build-arg VITE_WEBHOOK_URL=https://bot.thalesgomes.com/webhook/chat-bot \
  --build-arg VITE_WEBHOOK_API_KEY=967abe596f4fa80749a72798c4b80bd54f99457b02a0d0cd06bd9ad9d6cb740c \
  .
```

### 4.2 Ou usar Docker Compose (mais fácil)

```bash
docker-compose up -d
```

## 5. Verificar se está funcionando

```bash
# Ver logs
docker-compose logs -f

# Verificar se o container está rodando
docker ps

# Testar localmente na VPS
curl http://localhost:8080
```

## 6. Configurar Nginx como Proxy Reverso (Opcional, mas recomendado)

### 6.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Criar configuração do site

```bash
sudo nano /etc/nginx/sites-available/octopus-ai
```

Cole a seguinte configuração:

```nginx
server {
    listen 80;
    server_name chat.thalesgomes.com;  # Substitua pelo seu domínio

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/octopus-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.4 Configurar SSL com Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d chat.thalesgomes.com

# Renovação automática (já configurado automaticamente)
sudo certbot renew --dry-run
```

## 7. Configurar Firewall

```bash
# Permitir HTTP, HTTPS e SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 8. Comandos Úteis

### Parar o container

```bash
docker-compose down
```

### Reiniciar o container

```bash
docker-compose restart
```

### Ver logs em tempo real

```bash
docker-compose logs -f
```

### Atualizar a aplicação

```bash
# Puxar alterações do Git
git pull

# Rebuild e restart
docker-compose down
docker-compose up -d --build
```

### Limpar imagens antigas

```bash
docker system prune -a
```

## 9. Monitoramento

### Ver uso de recursos

```bash
docker stats
```

### Ver logs do Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 10. Backup

### Fazer backup do projeto

```bash
# Backup da aplicação
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Backup do .env (importante!)
cp .env .env.backup
```

## 11. Troubleshooting

### Container não inicia

```bash
docker-compose logs
docker ps -a
```

### Verificar variáveis de ambiente

```bash
docker-compose config
```

### Testar build local

```bash
docker build -t test-build .
docker run -p 8080:8080 test-build
```

### Limpar tudo e recomeçar

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 12. Estrutura de Produção Recomendada

```
/home/usuario/
├── budget-chat-bot/          # Aplicação
│   ├── .env                  # Variáveis de ambiente (NÃO commitar)
│   ├── docker-compose.yml
│   └── ...
└── backups/                  # Backups regulares
    ├── backup-20260131.tar.gz
    └── ...
```

## 13. Segurança

1. **Nunca exponha a porta 8080 diretamente** - Use Nginx como proxy reverso
2. **Use HTTPS** - Configure SSL com Let's Encrypt
3. **Mantenha o sistema atualizado** - `sudo apt update && sudo apt upgrade`
4. **Use senhas fortes** - Para SSH e variáveis de ambiente
5. **Configure fail2ban** - Para proteção contra brute force
6. **Faça backups regulares** - Automatize com cron jobs

## 14. URLs Importantes

Após o deploy:

- **HTTP**: http://chat.thalesgomes.com
- **HTTPS**: https://chat.thalesgomes.com

Configure o DNS do seu domínio para apontar para o IP da VPS:

```
Tipo: A
Nome: chat (ou @)
Valor: IP_DA_SUA_VPS
TTL: 3600
```

## Suporte

Para problemas ou dúvidas, verifique:

- Logs do Docker: `docker-compose logs`
- Logs do Nginx: `/var/log/nginx/`
- Status dos containers: `docker ps`
