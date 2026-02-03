# 🔒 Plano de Correção de Vulnerabilidades de Segurança
## Budget Chat Bot v2 (Octopus AI Assistant)

> **Status**: Planejamento Concluído
> **Data**: 02/02/2026
> **Versão Atual**: v1.x
> **Versão Alvo**: v2.0 (Fase 1) → v2.1 (Fase 2)

---

## 📊 VULNERABILIDADES IDENTIFICADAS

| Severidade | Problema | Arquivo | Impacto |
|------------|----------|---------|---------|
| 🔴 **CRÍTICO** | API Key exposta no frontend | `src/hooks/useChat.ts:6` | Qualquer usuário pode copiar e abusar do webhook |
| 🔴 **CRÍTICO** | Dependências vulneráveis | `package.json` | XSS, Command Injection, Prototype Pollution |
| 🟠 **ALTO** | Sem validação de entrada | `src/hooks/useChat.ts:58` | Possível injection |
| 🟠 **ALTO** | Regex vulnerável (ReDoS) | `src/components/ChatMessage.tsx:14` | URLs maliciosas travam navegador |
| 🟡 **MÉDIO** | localStorage não criptografado | `src/hooks/useChat.ts:46` | Dados sensíveis em plaintext |
| 🟡 **MÉDIO** | Falta CSP headers | `nginx.conf` | Sem proteção contra XSS |
| 🟡 **MÉDIO** | Sem rate limiting | - | Possível abuse/DoS |
| ⚪ **BAIXO** | Typo no título | `src/components/ChatHeader.tsx:38` | "Assistent" → "Assistant" |

---

## 🎯 PRINCÍPIOS DO PLANO

1. **Simplicidade**: Manter configuração via `.env` e `colors.ts`
2. **Replicabilidade**: Deploy fácil com `docker-compose up`
3. **Segurança**: Resolver vulnerabilidades sem complexidade excessiva
4. **Backward Compatibility**: Não quebrar deploys existentes

---

## 📋 FASE 1: CORREÇÕES CRÍTICAS (1 Semana)

### 1.1 Atualizar Dependências Vulneráveis ⚡

**CVEs Atuais**:
- `@remix-run/router ≤1.23.1` - XSS via Open Redirects (CVSS 8.0)
- `glob 10.2.0-10.4.5` - Command Injection (CVSS 7.5)
- `lodash 4.0.0-4.17.21` - Prototype Pollution (CVSS 5.3)

**Solução**:
```bash
npm audit fix
npm update react-router-dom @remix-run/router glob lodash
```

**Teste**: `npm audit` deve mostrar **0 vulnerabilities**

---

### 1.2 Corrigir Typo no Título ✏️

**Arquivo**: `src/components/ChatHeader.tsx:38`

```tsx
// ANTES
<h1>Octopus AI Assistent</h1>

// DEPOIS
<h1>Octopus AI Assistant</h1>
```

---

### 1.3 Adicionar Validação de Entrada 🛡️

**Arquivo**: `src/hooks/useChat.ts`

**Implementação**:
```typescript
// Constantes
const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 1;

// Função de sanitização
const sanitizeInput = (input: string): string => {
  const sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized.replace(/\s+/g, ' ').trim();
};

// No sendMessage:
const sanitized = sanitizeInput(content);

if (sanitized.length < MIN_MESSAGE_LENGTH) {
  setError('Mensagem muito curta');
  return;
}

if (sanitized.length > MAX_MESSAGE_LENGTH) {
  setError(`Mensagem muito longa (máximo ${MAX_MESSAGE_LENGTH} caracteres)`);
  return;
}

// Usar 'sanitized' no payload
```

**Teste**: Enviar mensagem com 5001 caracteres → deve bloquear

---

### 1.4 Proteger API Key via Nginx Proxy 🔐

#### Decisão Arquitetural

**Opção Escolhida**: **Nginx como Proxy Reverso** ✅

**Por quê?**
- ✅ Zero código novo (apenas config)
- ✅ API Key fica server-side
- ✅ Mantém simplicidade do SaaS
- ✅ Performance nativa do Nginx

#### Como Funciona

**ANTES** (Inseguro):
```
Browser → Webhook Externo
Headers: X-API-Key: "exposta-no-js"
```

**DEPOIS** (Seguro):
```
Browser → /api/webhook → Nginx → Webhook Externo
                         (adiciona X-API-Key secreta)
```

#### Implementação

**1. Criar `nginx.conf.template`** (renomear nginx.conf)

```nginx
server {
    listen 8083;
    root /usr/share/nginx/html;

    # NOVO: Proxy para webhook
    location /api/webhook {
        proxy_pass ${WEBHOOK_URL_BACKEND};
        proxy_set_header X-API-Key "${WEBHOOK_API_KEY_BACKEND}";
        proxy_set_header Content-Type "application/json";
        proxy_http_version 1.1;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # ... resto da config existente
}
```

**2. Modificar `env.sh`**

Adicionar no final:
```bash
# Processar template nginx
export WEBHOOK_URL_BACKEND="${VITE_WEBHOOK_URL:-}"
export WEBHOOK_API_KEY_BACKEND="${VITE_WEBHOOK_API_KEY:-}"

envsubst '${WEBHOOK_URL_BACKEND} ${WEBHOOK_API_KEY_BACKEND}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "nginx.conf configured with webhook proxy"
```

**3. Modificar `Dockerfile`**

```dockerfile
# Stage 2: Nginx
FROM nginx:alpine

RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN apk add --no-cache gettext

COPY env.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8083
CMD ["nginx", "-g", "daemon off;"]
```

**4. Modificar `src/hooks/useChat.ts`**

```typescript
// ANTES:
const WEBHOOK_URL = getEnv('VITE_WEBHOOK_URL');
const WEBHOOK_API_KEY = getEnv('VITE_WEBHOOK_API_KEY');

// DEPOIS:
const WEBHOOK_URL = '/api/webhook';  // Nginx fará proxy

// No fetch, remover header X-API-Key:
const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // REMOVER: 'X-API-Key': WEBHOOK_API_KEY
  },
  body: JSON.stringify(payload)
});
```

**Teste de Segurança**:
```bash
# Verificar que API Key NÃO está no JS
curl http://localhost:8083/assets/*.js | grep "WEBHOOK_API_KEY"
# Não deve encontrar nada!
```

---

### 1.5 Criptografar localStorage 🔒

**Arquivo**: `src/hooks/useChat.ts`

**Instalar**:
```bash
npm install crypto-js
npm install -D @types/crypto-js
```

**Implementação**:
```typescript
import CryptoJS from 'crypto-js';

// Gerar chave única por navegador
const getEncryptionKey = (): string => {
  const KEY_STORAGE = 'chat_encryption_key';
  let key = localStorage.getItem(KEY_STORAGE);

  if (!key) {
    key = CryptoJS.lib.WordArray.random(32).toString();
    localStorage.setItem(KEY_STORAGE, key);
  }

  return key;
};

const ENCRYPTION_KEY = getEncryptionKey();

// Funções helper
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encrypted: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

// No useEffect de salvamento:
useEffect(() => {
  if (sessionId && messages.length > 0) {
    const session: ChatSession = { id: sessionId, messages, createdAt: new Date() };
    const encrypted = encryptData(JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY, encrypted);
  }
}, [sessionId, messages]);

// No useEffect de carregamento:
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const decrypted = decryptData(stored);
      if (!decrypted) throw new Error('Falha na descriptografia');

      const session: ChatSession = JSON.parse(decrypted);
      setSessionId(session.id);
      setMessages(session.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } catch {
      startNewSession();
    }
  } else {
    startNewSession();
  }
}, []);
```

**Teste**: Verificar no DevTools → Application → localStorage que dados estão em Base64 criptografado

---

## 📋 FASE 2: MELHORIAS (1 Semana)

### 2.1 Adicionar CSP Headers 🛡️

**Arquivo**: `nginx.conf.template`

Adicionar dentro do bloco `server {}`:
```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
" always;

add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**Teste**: `curl -I http://localhost:8083` → verificar headers CSP

---

### 2.2 Rate Limiting ⏱️

#### Frontend (useChat.ts)

```typescript
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10;
const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const recentRequests = requestTimestamps.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const waitTime = Math.ceil((Math.min(...recentRequests) + RATE_LIMIT_WINDOW - now) / 1000);
    setError(`Limite de ${RATE_LIMIT_MAX_REQUESTS} mensagens/min atingido. Aguarde ${waitTime}s.`);
    return false;
  }

  setRequestTimestamps([...recentRequests, now]);
  return true;
};

// No sendMessage, antes do fetch:
if (!checkRateLimit()) return;
```

#### Nginx (nginx.conf.template)

Antes do bloco `server`:
```nginx
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=10r/m;
```

Dentro do `location /api/webhook`:
```nginx
location /api/webhook {
    limit_req zone=webhook_limit burst=5 nodelay;
    limit_req_status 429;

    # ... resto da config proxy
}
```

**Teste**: Enviar 15 mensagens rápidas → deve bloquear após a 10ª

---

### 2.3 Melhorar Regex de URLs 🔗

**Arquivo**: `src/components/ChatMessage.tsx:14`

**Opção 1 - Regex Segura** (simples):
```typescript
// ANTES (vulnerável):
const urlRegex = /(https:\/\/[^\s]+)/g;

// DEPOIS (segura):
const urlRegex = /(https:\/\/[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?::[0-9]{1,5})?(?:\/[^\s]*)?)/g;
```

**Opção 2 - linkify-it** (recomendada):
```bash
npm install linkify-it
```

```typescript
import LinkifyIt from 'linkify-it';
const linkify = new LinkifyIt();

const renderTextWithLinks = (text: string) => {
  const matches = linkify.match(text);
  if (!matches) return text;

  let lastIndex = 0;
  const parts: React.ReactNode[] = [];

  matches.forEach((match, i) => {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    parts.push(
      <a key={i} href={match.url} target="_blank" rel="noopener noreferrer"
         className="text-primary underline underline-offset-2 hover:text-[hsl(var(--primary-hover))] transition-colors break-all">
        {match.text}
      </a>
    );

    lastIndex = match.lastIndex;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};
```

**Teste**: `"https://" + "a".repeat(100000)` não deve travar navegador (<100ms)

---

## 📁 ARQUIVOS MODIFICADOS/CRIADOS

### FASE 1
**Modificados**:
1. `package.json` - Dependências
2. `package-lock.json` - Lock file
3. `src/components/ChatHeader.tsx` - Typo
4. `src/hooks/useChat.ts` - Validação + Crypto + Proxy
5. `Dockerfile` - Templates nginx
6. `env.sh` - Processar template
7. `.env.example` - Documentar vars

**Criados**:
8. `nginx.conf.template` - Template com proxy
9. `SECURITY_MIGRATION.md` - Guia migração

**Removidos**:
10. `nginx.conf` → `nginx.conf.template`

### FASE 2
**Modificados**:
11. `nginx.conf.template` - CSP + Rate limit
12. `src/components/ChatMessage.tsx` - Regex segura
13. `src/hooks/useChat.ts` - Rate limit frontend
14. `package.json` - linkify-it (opcional)

---

## ✅ CHECKLIST DE VALIDAÇÃO

### FASE 1
- [ ] `npm audit` mostra 0 vulnerabilidades
- [ ] Typo corrigido ("Assistant")
- [ ] Validação bloqueia mensagens >5000 chars
- [ ] API Key NÃO aparece nos arquivos JS
- [ ] API Key NÃO aparece no DevTools Network
- [ ] Proxy `/api/webhook` funciona
- [ ] localStorage criptografado (Base64 ilegível)
- [ ] Sessão persiste após reload
- [ ] Docker build completa sem erros

### FASE 2
- [ ] Headers CSP presentes (`curl -I`)
- [ ] App sem CSP violations (DevTools Console)
- [ ] Rate limit bloqueia após 10 msgs/min (frontend)
- [ ] Nginx retorna 429 após limite
- [ ] URLs clicáveis em mensagens
- [ ] Input malicioso não trava (<100ms)

---

## 🧪 TESTES COMPLETOS

### Teste 1: Build & Deploy
```bash
docker build -t octopus-v2 .
docker run -d -p 8083:8083 \
  -e VITE_WEBHOOK_URL=https://webhook.exemplo.com \
  -e VITE_WEBHOOK_API_KEY=chave-secreta \
  octopus-v2
```

### Teste 2: Segurança da API Key
```bash
# Baixar JS files
curl http://localhost:8083/assets/*.js > bundle.js

# Procurar pela chave
grep "chave-secreta" bundle.js
# Não deve encontrar nada!
```

### Teste 3: Funcionamento do Proxy
```bash
curl http://localhost:8083/api/webhook \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","message":"oi","firstmsg":true}'
# Deve retornar resposta do webhook
```

### Teste 4: Rate Limiting
```bash
for i in {1..15}; do
  curl -X POST http://localhost:8083/api/webhook \
    -H "Content-Type: application/json" \
    -d "{\"session_id\":\"test\",\"message\":\"msg$i\",\"firstmsg\":false}" &
done
# Mensagens 11-15 devem retornar 429
```

### Teste 5: Manual (Navegador)
1. Abrir http://localhost:8083
2. DevTools → Application → localStorage
   - `chat_session` deve estar criptografado
3. DevTools → Network → Enviar mensagem
   - Request para `/api/webhook` (não URL externa)
   - Headers SEM `X-API-Key`
4. DevTools → Console
   - Sem erros CSP
5. Enviar 11 mensagens rápidas
   - 11ª deve mostrar erro de rate limit

---

## 📊 CRONOGRAMA

### Semana 1: FASE 1
| Dia | Tarefa | Tempo |
|-----|--------|-------|
| Seg | Dependências + Typo | 2h |
| Ter | Validação entrada | 3h |
| Qua | Nginx proxy config | 4h |
| Qui | Nginx proxy frontend + Crypto | 5h |
| Sex | Testes + Docs | 6h |

### Semana 2: FASE 2
| Dia | Tarefa | Tempo |
|-----|--------|-------|
| Seg | CSP headers | 3h |
| Ter-Qua | Rate limiting | 5h |
| Qui | Regex URLs | 3h |
| Sex | QA completo | 8h |

**Total**: ~39 horas (~2 sprints)

---

## 🎯 MÉTRICAS DE SUCESSO

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Vulnerabilidades npm | 5 | 0 | 0 ✅ |
| API Key exposta | Sim | Não | Não ✅ |
| localStorage cripto | Não | Sim | Sim ✅ |
| Headers segurança | 3 | 9+ | 8+ ✅ |
| Rate limiting | Não | Sim | Sim ✅ |
| Overhead performance | 0ms | ~13ms | <50ms ✅ |

---

## 🚨 RISCOS & MITIGAÇÕES

### Risco 1: Breaking Changes
**Mitigação**:
- Criar tag `v1.x-backup` antes de começar
- Testar em staging primeiro
- Documentar migração em SECURITY_MIGRATION.md

### Risco 2: Performance
**Mitigação**:
- Testes de benchmark antes/depois
- Monitorar métricas em produção
- Overhead esperado: <15ms (aceitável)

### Risco 3: CSP Bloqueando Features
**Mitigação**:
- Começar com política permissiva
- Testar todas funcionalidades
- Ajustar conforme necessário

---

## 🔄 PLANO DE ROLLBACK

### Rollback Completo
```bash
git checkout v1.x-backup
docker-compose build --no-cache
docker-compose up -d
```
**Tempo**: ~5 min | **Downtime**: ~2 min

### Rollback Seletivo
Comentar features problemáticas no nginx.conf.template ou reverter commits específicos.

---

## 📚 RECURSOS

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Guide (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
- [crypto-js Docs](https://www.npmjs.com/package/crypto-js)
- [linkify-it Docs](https://www.npmjs.com/package/linkify-it)

---

## 📝 CHANGELOG

### [2.0.0] - Fase 1 (Segurança Crítica)
**Adicionado**:
- Validação de entrada (5000 chars max)
- Criptografia AES-256 localStorage
- Nginx proxy para API Key server-side
- Guia de migração

**Corrigido**:
- 5 CVEs de dependências (ALTA severidade)
- Typo no título
- API Key exposta no frontend

### [2.1.0] - Fase 2 (Melhorias)
**Adicionado**:
- CSP headers
- Rate limiting (10 msgs/min)
- Regex segura anti-ReDoS

**Segurança**:
- Proteção XSS via CSP
- Proteção DoS via rate limiting
- Proteção ReDoS

---

**FIM DO PLANO DE SEGURANÇA**

**Última atualização**: 02/02/2026
**Próximo passo**: Iniciar implementação FASE 1
