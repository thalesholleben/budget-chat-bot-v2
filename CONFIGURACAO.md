# 🎨 Guia de Configuração - Budget Chat Bot

Este guia mostra como personalizar seu assistente de IA alterando as variáveis de ambiente no **EasyPanel**.

---

## 📋 Variáveis Disponíveis

### 1️⃣ Configurações Técnicas (Obrigatórias)

```env
VITE_WEBHOOK_URL=https://seu-servidor.com/webhook
VITE_WEBHOOK_API_KEY=sua-chave-secreta-aqui
```

- **VITE_WEBHOOK_URL**: URL do webhook para comunicação com a IA (fornecida pela equipe técnica)
- **VITE_WEBHOOK_API_KEY**: Chave de segurança para autenticação (fornecida pela equipe técnica)

---

### 2️⃣ Cores do Aplicativo

Para alterar as cores, edite o arquivo **`src/config/colors.ts`**:

```typescript
export const ACCENT_COLOR = '#d97757';      // cor principal de destaque
export const ACCENT_GRADIENT = '#d8623b';   // cor do gradiente (segunda cor)
export const BACKGROUND_COLOR = '#262420';  // cor de fundo do app
```

**O que cada cor controla:**

- **ACCENT_COLOR**: Cor principal de destaque (botões, bordas, links, ícones)
- **ACCENT_GRADIENT**: Cor usada em degradês junto com a cor principal (deixe igual à principal para cores sólidas)
- **BACKGROUND_COLOR**: Cor de fundo de toda a interface (cards, bordas e outros elementos são gerados automaticamente baseados nesta cor)

**Exemplos de combinações:**

| Estilo | ACCENT_COLOR | BACKGROUND_COLOR |
|--------|--------------|------------------|
| Azul Corporativo | `#2F5FA7` | `#0A1929` |
| Verde Natural | `#2FA76B` | `#0D1F1A` |
| Roxo Premium | `#7B2FA7` | `#1A0D1F` |
| Vermelho Energia | `#A72F3F` | `#1F0A0D` |
| Laranja Amigável | `#A7692F` | `#1F1A0D` |
| Minimalista | `#FFFFFF` | `#000000` |

**Dicas:**
- Use sites como [coolors.co](https://coolors.co) para escolher cores harmônicas
- Para backgrounds, prefira cores escuras (preto, cinza escuro, etc) para melhor legibilidade
- Após alterar, faça commit + push para aplicar as mudanças

---

### 3️⃣ Fontes do Aplicativo

Para alterar as fontes, edite o arquivo **`src/config/fonts.ts`**:

```typescript
export const FONT_PRESET = 'DEFAULT';
```

**Opções disponíveis:**

| Preset | Descrição | Estilo |
|--------|-----------|--------|
| `DEFAULT` | Crimson Pro (corpo) + Space Grotesk (títulos) | Elegante, clássico |
| `POPPINS` | Poppins (tudo) | Moderno, limpo, arredondado |
| `MONTSERRAT` | Montserrat (tudo) | Corporativo, profissional |

**Exemplos:**

```typescript
// Para fonte moderna e limpa
export const FONT_PRESET = 'POPPINS';

// Para fonte corporativa
export const FONT_PRESET = 'MONTSERRAT';

// Para manter a fonte elegante padrão
export const FONT_PRESET = 'DEFAULT';
```

**Dica:** Após alterar, faça commit + push para aplicar as mudanças. As fontes são carregadas automaticamente do Google Fonts.

---

### 4️⃣ Personalização do Profissional

```env
VITE_PROFESSIONAL_NAME=Seu Nome
VITE_PROFESSIONAL_TITLE=Sua Especialidade
VITE_HEADER_SUBTITLE=Seu Nome • Sua Especialidade
```

**Exemplos:**
```env
VITE_PROFESSIONAL_NAME=João Silva
VITE_PROFESSIONAL_TITLE=Especialista em Marketing Digital
VITE_HEADER_SUBTITLE=João Silva • Marketing Digital
```

**Onde aparece:**
- `VITE_PROFESSIONAL_NAME`: Nome em destaque na tela inicial
- `VITE_PROFESSIONAL_TITLE`: Subtítulo abaixo do nome
- `VITE_HEADER_SUBTITLE`: Texto no cabeçalho (topo da página)

---

### 5️⃣ Perguntas Frequentes (FAQ)

Configure de **1 a 5 perguntas** que aparecerão como opções para o usuário escolher:

```env
VITE_FAQ_1=Primeira pergunta
VITE_FAQ_2=Segunda pergunta
VITE_FAQ_3=Terceira pergunta
VITE_FAQ_4=Quarta pergunta
VITE_FAQ_5=Quinta pergunta
```

**Exemplos:**
```env
VITE_FAQ_1=Quero um orçamento para site institucional
VITE_FAQ_2=Preciso de automação de processos
VITE_FAQ_3=Quero desenvolver um aplicativo
VITE_FAQ_4=Enviar briefing do meu projeto
VITE_FAQ_5=
```

**Regras importantes:**
- ✅ Você pode usar de 1 a 5 perguntas
- ✅ Deixe em branco as que não quiser usar (exemplo: `VITE_FAQ_5=`)
- ✅ Se deixar TODAS em branco, o chat ficará liberado desde o início
- ✅ A **última pergunta configurada** sempre usa a regra do link externo

---

### 6️⃣ Link Externo (Opcional)

```env
VITE_EXTERNAL_LINK=https://seu-link.com
```

**Como funciona:**
- Se você configurar um link aqui, a **ÚLTIMA PERGUNTA** das FAQs será um botão que abre esse link
- Se deixar em branco, todas as perguntas seguem o fluxo normal do chat
- Útil para redirecionar para formulários, agendamentos, etc.

**Exemplo:**
```env
VITE_FAQ_4=Agendar uma reunião
VITE_EXTERNAL_LINK=https://calendly.com/seu-usuario
```
Neste caso, ao clicar em "Agendar uma reunião", o usuário será redirecionado para o Calendly.

---

## 🎯 Casos de Uso Comuns

### Caso 1: Chat com 4 opções de FAQ (cor roxa)
```env
VITE_PROFESSIONAL_NAME=Maria Santos
VITE_PROFESSIONAL_TITLE=Consultora de Vendas
VITE_HEADER_SUBTITLE=Maria Santos • Consultora de Vendas

VITE_FAQ_1=Quero aumentar minhas vendas
VITE_FAQ_2=Preciso de treinamento para equipe
VITE_FAQ_3=Quero consultoria personalizada
VITE_FAQ_4=Falar com a Maria
VITE_FAQ_5=

VITE_EXTERNAL_LINK=https://wa.me/5511999999999
```
**Resultado**: Cor roxa nos destaques. 4 perguntas aparecem. A última ("Falar com a Maria") abre o WhatsApp.

---

### Caso 2: Chat liberado (sem FAQs)
```env
VITE_PROFESSIONAL_NAME=Pedro Costa
VITE_PROFESSIONAL_TITLE=Coach de Carreira
VITE_HEADER_SUBTITLE=Pedro Costa • Coach de Carreira

VITE_FAQ_1=
VITE_FAQ_2=
VITE_FAQ_3=
VITE_FAQ_4=
VITE_FAQ_5=

VITE_EXTERNAL_LINK=
```
**Resultado**: Nenhuma FAQ aparece. O campo de texto fica disponível desde o início.

---

### Caso 3: Apenas 2 perguntas
```env
VITE_PROFESSIONAL_NAME=Ana Oliveira
VITE_PROFESSIONAL_TITLE=Designer Gráfica
VITE_HEADER_SUBTITLE=Ana Oliveira • Design

VITE_FAQ_1=Preciso de uma identidade visual
VITE_FAQ_2=Quero ver o portfólio
VITE_FAQ_3=
VITE_FAQ_4=
VITE_FAQ_5=

VITE_EXTERNAL_LINK=https://behance.net/ana-oliveira
```
**Resultado**: Apenas 2 perguntas aparecem. A segunda abre o Behance.

---

## 🚀 Como Configurar no EasyPanel

1. Acesse seu projeto no EasyPanel
2. Vá em **Environment Variables** (Variáveis de Ambiente)
3. Edite cada variável com os valores desejados
4. Salve e aguarde o sistema reiniciar (geralmente alguns segundos)
5. Acesse seu site para ver as mudanças

---

## ⚠️ Dicas Importantes

- 📝 **Textos curtos**: Mantenha as perguntas objetivas (máximo 50 caracteres)
- 🔗 **Links externos**: Sempre comece com `https://`
- 🎨 **Nome profissional**: Pode usar nome completo ou apenas primeiro nome
- ✅ **Teste sempre**: Após alterar, acesse o site para verificar se ficou como esperado
- 🔄 **Mudanças em tempo real**: Qualquer alteração nas variáveis atualiza o site automaticamente

---

## 📞 Suporte

Dúvidas ou problemas? Entre em contato com o suporte técnico.

---

**Versão**: 2.0
**Última atualização**: Fevereiro 2026
