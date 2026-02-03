# Solução para Erro SSL com Cloudflare

## Problema
```
SSL_do_handshake() failed
SSL alert number 40
502 Bad Gateway
```

Este erro ocorre quando o Nginx tenta fazer `proxy_pass` usando **IP do Cloudflare** em vez do **domínio**.

---

## Causa Raiz

**O problema NÃO é falta de configuração SSL "bonita".**

### Por que acontece:

1. Cloudflare usa **SNI** (Server Name Indication)
2. SNI exige que o cliente informe o **DOMÍNIO** durante o handshake SSL
3. Quando você usa `proxy_pass https://104.21.74.47:443`, o Nginx não consegue enviar o nome do domínio
4. Cloudflare rejeita a conexão com **SSL alert 40** (handshake failure)

### O que está acontecendo:

```
❌ ERRADO: proxy_pass https://104.21.74.47:443/webhook
```

O Nginx diz: "Oi, quero HTTPS com você, sem dizer pra qual domínio."

Cloudflare responde: "Sem SNI, sem conversa." → **SSL alert 40**

```
✅ CORRETO: proxy_pass https://api.seudominio.com/webhook
```

O Nginx diz: "Quero HTTPS com api.seudominio.com"

Cloudflare responde: "OK, aqui está o certificado SSL de api.seudominio.com" → **Handshake OK**

---

## Solução

### 1. Verificar a variável WEBHOOK_URL_BACKEND

No arquivo `.env`, a variável **DEVE usar DOMÍNIO, NÃO IP**:

```bash
# ❌ ERRADO (usando IP do Cloudflare)
VITE_WEBHOOK_URL=https://104.21.74.47/webhook/chat-bot-pedro

# ✅ CORRETO (usando domínio)
VITE_WEBHOOK_URL=https://api.seudominio.com/webhook/chat-bot-pedro
```

### 2. Atualização do nginx.conf.template

Foi adicionada a configuração mínima necessária no bloco `/api/webhook`:

```nginx
# SNI obrigatório para Cloudflare
proxy_ssl_server_name on;
```

**Isso é TUDO que você precisa.** Não precisa de:
- ❌ `proxy_ssl_verify off` (gambiarra perigosa)
- ❌ `proxy_ssl_protocols` (o padrão já funciona)
- ❌ `proxy_ssl_ciphers` (irrelevante aqui)

---

## Passos para Aplicar na VPS

### 1. Corrigir o arquivo .env

**CRÍTICO:** Certifique-se que está usando DOMÍNIO, não IP:

```bash
# Editar o arquivo .env
nano .env

# Verificar se a URL está assim:
VITE_WEBHOOK_URL=https://api.seudominio.com/webhook/chat-bot-pedro

# NÃO assim:
# VITE_WEBHOOK_URL=https://104.21.74.47/webhook/chat-bot-pedro
```

### 2. Atualizar o projeto na VPS

```bash
# Navegar até o diretório do projeto
cd /caminho/do/projeto

# Fazer pull das alterações (se aplicável)
git pull origin main

# Rebuildar o container Docker com as novas variáveis
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 3. Verificar os logs

```bash
# Ver logs do container
docker-compose logs -f octopus-ai

# Ver logs do Nginx dentro do container
docker exec -it octopus-ai-assistant cat /var/log/nginx/error.log
```

---

## Como Verificar se o Problema Foi Resolvido

### 1. Verificar se está usando domínio (não IP)

```bash
# Ver o arquivo .env
cat .env | grep WEBHOOK_URL

# Deve mostrar algo como:
# VITE_WEBHOOK_URL=https://api.seudominio.com/webhook/...
#
# NÃO deve mostrar IP:
# VITE_WEBHOOK_URL=https://104.21.74.47/...
```

### 2. Testar conexão com domínio

```bash
# Testar com DOMÍNIO (deve funcionar)
curl -v https://api.seudominio.com/webhook/chat-bot-pedro

# Se testar com IP (deve dar erro SSL alert 40)
curl -v https://104.21.74.47/webhook/chat-bot-pedro
```

**O que procurar:**
- ✅ Com domínio: `SSL connection using TLSv1.2/1.3` e resposta HTTP
- ❌ Com IP: `SSL alert handshake failure` (comportamento esperado com Cloudflare)

---

## Verificação de Segurança do Cloudflare

### 1. Configuração SSL/TLS no Cloudflare

Acesse: Dashboard Cloudflare > SSL/TLS

**Modo recomendado:** Full (strict) ou Full

- ❌ **Flexible** - Pode causar problemas de handshake
- ✅ **Full** - SSL entre Cloudflare e servidor origem
- ✅ **Full (strict)** - SSL com validação de certificado

### 2. Verificar Minimum TLS Version

Dashboard Cloudflare > SSL/TLS > Edge Certificates

**Configuração:** TLS 1.2 (mínimo)

### 3. Verificar se há Firewall Rules bloqueando

Dashboard Cloudflare > Security > WAF

Verifique se não há regras bloqueando requisições do servidor origem.

---

## Troubleshooting

### 1. Ver detalhes do handshake SSL com SNI

```bash
# ✅ Testar com SNI (domínio) - DEVE FUNCIONAR
openssl s_client -connect api.seudominio.com:443 -servername api.seudominio.com

# ❌ Testar sem SNI (IP) - DEVE DAR ERRO
openssl s_client -connect 104.21.74.47:443
```

**Com SNI (domínio):** Verá o certificado completo e "Verify return code: 0"

**Sem SNI (IP):** Verá erro de handshake ou certificado inválido

### 2. Testar do container

```bash
# Entrar no container
docker exec -it octopus-ai-assistant sh

# Instalar curl (se necessário)
apk add --no-cache curl

# Testar com domínio
curl -v https://api.seudominio.com/webhook
```

### 3. Verificar logs do Nginx dentro do container

```bash
# Ver erro de SSL detalhado
docker exec -it octopus-ai-assistant cat /var/log/nginx/error.log

# Procure por:
# "upstream: https://104..." → problema! Está usando IP
# "upstream: https://api.seu..." → correto! Está usando domínio
```

---

## Checklist de Verificação (Ordem Certa!)

- [ ] **CRÍTICO:** `.env` usa DOMÍNIO, não IP (`https://api.seudominio.com`, não `https://104...`)
- [ ] `proxy_ssl_server_name on;` está no nginx.conf.template
- [ ] Container Docker rebuildado após mudar .env
- [ ] Logs não mostram mais `upstream: "https://104..."`
- [ ] Teste com curl usando domínio funciona
- [ ] Cloudflare está em modo Full ou Full (strict)

---

## O que NÃO resolver o problema

Estas mudanças **não resolvem erro SNI/IP**:

- ❌ Atualizar OpenSSL
- ❌ Mudar versão do Nginx
- ❌ Ajustar `proxy_ssl_protocols`
- ❌ Ajustar `proxy_ssl_ciphers`
- ❌ Adicionar `proxy_ssl_verify off`
- ❌ Configurar firewall
- ❌ Mudar modo SSL no Cloudflare

**A ÚNICA coisa que resolve:** Usar domínio em vez de IP.

---

## Se Ainda Não Funcionar

Verifique:

1. **Você está REALMENTE usando domínio?**
   ```bash
   # Ver variável carregada no container
   docker exec octopus-ai-assistant env | grep WEBHOOK
   ```

2. **O domínio aponta para Cloudflare?**
   ```bash
   nslookup api.seudominio.com
   # Deve retornar IPs do Cloudflare (104.21.x.x, 172.67.x.x)
   ```

3. **Logs mostram domínio ou IP?**
   ```bash
   docker-compose logs octopus-ai | grep upstream
   # Deve mostrar: upstream: "https://api.seudominio.com..."
   # NÃO deve mostrar: upstream: "https://104.21..."
   ```

---

## Por que Cloudflare Exige Domínio?

**SNI (Server Name Indication)** é uma extensão do TLS que permite um servidor hospedar múltiplos sites com SSL em um único IP.

Quando você conecta via HTTPS, o fluxo é:

1. Cliente: "Quero HTTPS com **api.seudominio.com**" (enviando SNI)
2. Servidor: "OK, aqui está o certificado SSL de **api.seudominio.com**"
3. Cliente valida certificado
4. Handshake completo ✅

**Sem SNI (usando IP):**

1. Cliente: "Quero HTTPS com 104.21.74.47" (sem informar domínio)
2. Servidor Cloudflare: "Qual domínio? Eu hospedo milhares aqui!"
3. Cliente: 😶
4. Servidor: "Sem SNI = sem conversa" → **SSL alert 40** ❌

---

## Resumo Executivo

| Item | Status |
|------|--------|
| **Causa do erro** | proxy_pass usando IP em vez de domínio |
| **Solução** | Trocar IP por domínio no .env |
| **Configuração necessária** | `proxy_ssl_server_name on;` (já aplicada) |
| **Rebuildar?** | Sim, após alterar .env |
| **Complexo?** | Não, só trocar IP por domínio |

---

## Referências

- [SNI - Server Name Indication (Wikipedia)](https://en.wikipedia.org/wiki/Server_Name_Indication)
- [Nginx proxy_ssl_server_name](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_ssl_server_name)
- [Cloudflare SSL/TLS](https://developers.cloudflare.com/ssl/)
