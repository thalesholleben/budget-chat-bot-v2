import { useState, memo, ReactNode } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useTypingEffect } from '@/hooks/useTypingEffect';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Processa negrito: **texto** ou *texto*
const renderBold = (text: string, keyPrefix: string): ReactNode[] => {
  const result: ReactNode[] = [];
  // Prioridade: **** > ** > *
  const boldRegex = /\*{1,4}([^*]+)\*{1,4}/g;
  let lastIndex = 0;

  for (const match of text.matchAll(boldRegex)) {
    const start = match.index!;
    // Texto antes do match
    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start));
    }
    // Texto em negrito (sem os asteriscos)
    result.push(
      <strong key={`${keyPrefix}-${start}`} className="font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = start + match[0].length;
  }

  // Texto restante após o último match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
};

// Transforma URLs https em links clicáveis e texto em negrito
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https:\/\/[^\s]+)/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlRegex)) {
    const start = match.index!;
    // Texto antes da URL — processar negrito
    if (start > lastIndex) {
      result.push(...renderBold(text.slice(lastIndex, start), `t-${start}`));
    }
    // URL como link
    result.push(
      <a
        key={`url-${start}`}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-[hsl(var(--primary-hover))] transition-colors break-all"
      >
        {match[0]}
      </a>
    );
    lastIndex = start + match[0].length;
  }

  // Texto restante após a última URL — processar negrito
  if (lastIndex < text.length) {
    result.push(...renderBold(text.slice(lastIndex), `t-end`));
  }

  return result;
};

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isQuote = message.type === 'quote';
  const isPix = message.type === 'pix';
  const isPriceTable = message.type === 'price_table';
  const [copied, setCopied] = useState(false);

  // Efeito de digitação apenas para mensagens do assistente
  const { displayedText, isTyping } = useTypingEffect(
    !isUser ? message.content : message.content,
    !isUser ? 6 : 0 // 6ms entre cada caractere para assistente, 0 para usuário (instantâneo)
  );

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isValidPrice = (price: number | null | undefined): price is number => {
    return price !== null && price !== undefined && price > 0 && !isNaN(price);
  };

  const handleCopyPixKey = async () => {
    if (!message.pixKey) return;
    try {
      await navigator.clipboard.writeText(message.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = message.pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-105',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80'
            : 'bg-gradient-to-br from-card to-card/80 border border-border/50'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Logo size={24} className="text-primary" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[75%] px-3 py-2 transition-all duration-300',
          isUser ? 'message-user' : 'message-assistant',
          isQuote && !isUser && 'quote-highlight',
          isPix && !isUser && 'quote-highlight',
          isPriceTable && !isUser && 'quote-highlight'
        )}
      >
        <p className="leading-relaxed whitespace-pre-wrap inline">
          {!isUser ? renderTextWithLinks(displayedText) : renderTextWithLinks(message.content)}
          {!isUser && isTyping && <span className="animate-pulse">▋</span>}
          <span className={cn(
            "text-[10px] ml-2",
            isUser ? "text-foreground/50" : "text-muted-foreground/70"
          )}>
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </p>

        {isQuote && message.value !== null && message.value !== undefined && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Valor estimado:</span>
            </div>
            <span className="text-2xl font-bold gradient-text font-heading">
              {formatValue(message.value)}
            </span>
          </div>
        )}

        {isPix && message.pixKey && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            {message.pixType && (
              <span className="text-[10px] font-medium text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {message.pixType}
              </span>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-mono text-foreground/90 break-all">
                {message.pixKey}
              </span>
              <button
                onClick={handleCopyPixKey}
                className="flex-shrink-0 p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 active:scale-95"
                title="Copiar chave PIX"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-green-400 mt-1 block">Chave copiada!</span>
            )}
          </div>
        )}

        {isPriceTable && message.priceItems && message.priceItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <div className="max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
              {message.priceItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between gap-3 py-1.5 px-1',
                    index !== message.priceItems!.length - 1 && 'border-b border-border/30'
                  )}
                >
                  <span className="text-[13px] text-foreground/85 truncate">{item.name}</span>
                  <span className="text-[13px] font-semibold text-foreground/95 whitespace-nowrap">
                    {isValidPrice(item.price) ? formatValue(item.price) : '-'}
                  </span>
                </div>
              ))}
            </div>
            {message.showTotal === true && message.priceItems.length > 1 && (
              <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-primary/30 px-1">
                <span className="text-xs font-medium text-muted-foreground">Total</span>
                <span className="text-lg font-bold gradient-text font-heading">
                  {formatValue(
                    message.priceItems
                      .filter(item => isValidPrice(item.price))
                      .reduce((sum, item) => sum + item.price!, 0)
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
