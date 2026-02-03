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

### 2️⃣ Design do Aplicativo (Cores, Fontes e Efeitos)

Todas as customizações visuais ficam em um **arquivo único**: **`src/config/design.ts`**

```typescript
// --- CORES ---
export const ACCENT_COLOR = '#4680f4';         // Cor primária (botões, links, destaque)
export const ACCENT_GRADIENT = '#ab54e1';      // Cor secundária (gradientes)
export const ACCENT_TERTIARY = '#38bdf8';      // Cor terciária (detalhes, brilhos)
export const BACKGROUND_COLOR = '#0b0d13';     // Cor de fundo principal
export const BACKGROUND_SECONDARY = '#0b0d13'; // Cor de fundo secundária (igual = sólido)

// --- FONTES ---
export const FONT_PRESET = 'MONTSERRAT';       // 'DEFAULT' | 'POPPINS' | 'MONTSERRAT'

// --- EFEITOS ---
export const ENABLE_GRID = true;               // Grade de malha no fundo
export const ENABLE_GLOW = true;               // Brilho suave nos elementos interativos
export const ENABLE_FLOATING_ORBS = true;      // Orbes animados no background
```

**O que cada cor controla:**

- **ACCENT_COLOR**: Cor principal de destaque (botões, bordas, links, ícones)
- **ACCENT_GRADIENT**: Cor usada em degradês junto com a cor principal
- **ACCENT_TERTIARY**: Terceira cor para detalhes e brilhos extras
- **BACKGROUND_COLOR**: Cor de fundo principal
- **BACKGROUND_SECONDARY**: Cor de fundo secundária (se diferente, cria gradiente no fundo)

**Exemplos de combinações:**

| Estilo | ACCENT_COLOR | ACCENT_GRADIENT | ACCENT_TERTIARY | BACKGROUND_COLOR |
|--------|--------------|-----------------|-----------------|------------------|
| Azul Tech | `#4680f4` | `#ab54e1` | `#38bdf8` | `#0b0d13` |
| Verde Natural | `#2FA76B` | `#34D399` | `#6EE7B7` | `#0D1F1A` |
| Roxo Premium | `#7B2FA7` | `#A855F7` | `#C084FC` | `#1A0D1F` |
| Laranja Amigável | `#d97757` | `#d8623b` | `#FBBF24` | `#262420` |

**Fontes disponíveis:**

| Preset | Descrição | Estilo |
|--------|-----------|--------|
| `DEFAULT` | Crimson Pro (corpo) + Space Grotesk (titulos) | Elegante, classico |
| `POPPINS` | Poppins (tudo) | Moderno, limpo, arredondado |
| `MONTSERRAT` | Montserrat (tudo) | Corporativo, profissional |

**Efeitos visuais:**

| Efeito | Descricao |
|--------|-----------|
| `ENABLE_GRID` | Grade de malha sutil no fundo (com fade nas bordas) |
| `ENABLE_GLOW` | Brilho suave no input e botoes ao interagir |
| `ENABLE_FLOATING_ORBS` | Orbes coloridos animados no background |

**Dicas:**
- Use sites como [coolors.co](https://coolors.co) para escolher cores harmonicas
- Para backgrounds, prefira cores escuras para melhor legibilidade
- Coloque `BACKGROUND_SECONDARY` igual ao `BACKGROUND_COLOR` para fundo solido
- Desative efeitos (`false`) para clientes que preferem visual mais limpo
- Apos alterar, faca commit + push para aplicar as mudancas

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
