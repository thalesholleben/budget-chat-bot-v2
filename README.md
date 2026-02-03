# Octopus AI Assistant

Chatbot inteligente para orçamentos e briefings de projetos. Interface moderna e responsiva para interação com clientes.

## Características

- Interface de chat moderna com dark theme e glassmorphism
- Sistema de webhook para integração com IA
- Persistência de sessões no localStorage
- Suporte a mensagens de texto e orçamentos (quote)
- Responsivo e otimizado para mobile
- Deploy fácil com Docker

## Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: ShadcnUI + Tailwind CSS + Radix UI
- **Estado**: React Hooks + TanStack Query
- **Deploy**: Docker + Nginx

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+ e npm
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd budget-chat-bot

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Edite o arquivo .env e configure a URL do webhook
# VITE_WEBHOOK_URL=https://sua-url-do-webhook.com/webhook

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## Deploy com Docker

### Build da imagem

```bash
# Build passando a URL do webhook como argumento
docker build -t octopus-ai-assistant \
  --build-arg VITE_WEBHOOK_URL=https://sua-url-do-webhook.com/webhook \
  .
```

### Executar localmente

```bash
# Executar o container na porta 8080
docker run -d \
  -p 8080:8080 \
  --name octopus-ai \
  -e VITE_WEBHOOK_URL=https://sua-url-do-webhook.com/webhook \
  octopus-ai-assistant
```

### Usando Docker Compose

```bash
# 1. Configure a variável de ambiente
export VITE_WEBHOOK_URL=https://sua-url-do-webhook.com/webhook

# 2. Inicie o container
docker-compose up -d

# 3. Visualizar logs
docker-compose logs -f

# 4. Parar o container
docker-compose down
```

## Deploy no Easy Panel

### Passo a Passo

1. **Acesse seu Easy Panel** e crie uma nova aplicação

2. **Configure o repositório Git**
   - Conecte seu repositório GitHub/GitLab
   - O Easy Panel detectará automaticamente o Dockerfile

3. **Configure as Variáveis de Ambiente**
   - Vá em Settings > Environment Variables
   - Adicione: `VITE_WEBHOOK_URL` com a URL do seu webhook
   - Exemplo: `https://n8n.seudominio.com/webhook/chat`

4. **Configure a Porta**
   - Port: `8080`
   - Protocol: `HTTP`

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Acesse sua aplicação pela URL fornecida pelo Easy Panel

### Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_WEBHOOK_URL` | URL do webhook que receberá e responderá as mensagens | `https://api.exemplo.com/webhook` |

## Estrutura do Webhook

### Request (POST)

O chatbot envia as seguintes informações para o webhook:

```json
{
  "session_id": "session_1234567890_abc123",
  "message": "Orçamento para Sites (LPs, Lojas Virtuais, Institucional, Blog)",
  "history": [
    {
      "role": "user",
      "content": "Olá!"
    },
    {
      "role": "assistant",
      "content": "Olá! Como posso ajudar?"
    }
  ]
}
```

### Response (JSON)

O webhook deve responder com:

```json
{
  "message": "Entendo! Vou preparar um orçamento para desenvolvimento de sites...",
  "type": "text",
  "value": null
}
```

Para orçamentos (quote):

```json
{
  "message": "Baseado nas suas necessidades, o orçamento estimado é:",
  "type": "quote",
  "value": 15000.00
}
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento

# Qualidade de Código
npm run lint         # Verifica problemas no código
npm run preview      # Preview do build de produção

# Testes
npm test             # Executa testes
npm run test:watch   # Executa testes em modo watch
```

## Estrutura de Pastas

```
budget-chat-bot/
├── src/
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes UI (ShadcnUI)
│   │   ├── Chat.tsx     # Container principal
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── ...
│   ├── hooks/           # React hooks customizados
│   │   └── useChat.ts   # Hook principal do chat
│   ├── types/           # Definições TypeScript
│   │   └── chat.ts
│   ├── pages/           # Páginas da aplicação
│   ├── lib/             # Utilitários
│   └── main.tsx         # Entry point
├── public/              # Assets estáticos
├── Dockerfile           # Configuração Docker
├── nginx.conf           # Configuração Nginx
├── docker-compose.yml   # Docker Compose
└── package.json
```

## Funcionalidades

### Chat Interface
- ✅ Tela inicial com 3 opções predefinidas
- ✅ Envio de mensagens com Enter (Shift+Enter para nova linha)
- ✅ Auto-scroll para última mensagem
- ✅ Typing indicator enquanto carrega
- ✅ Persistência de conversas no localStorage
- ✅ Sistema de sessões com ID único

### Tipos de Mensagem
- **Text**: Mensagem simples de texto
- **Quote**: Orçamento com valor formatado em R$

### Design
- Dark theme moderno
- Efeito glassmorphism
- Animações suaves
- Totalmente responsivo
- Gradientes e efeitos visuais

## Suporte

Para dúvidas ou suporte, entre em contato:
- **Email**: [seu-email@exemplo.com]
- **Website**: [seu-website.com]

## Licença

Privado - Todos os direitos reservados
