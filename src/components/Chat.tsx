import { useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { EmptyChat } from './EmptyChat';
import { BackgroundEffects } from './BackgroundEffects';
import { getEnv } from '@/lib/env';

export const Chat = () => {
  const { messages, isLoading, sendMessage, startNewSession } = useChat();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Verificar se há FAQs configuradas
  const hasFAQs = [
    getEnv('VITE_FAQ_1'),
    getEnv('VITE_FAQ_2'),
    getEnv('VITE_FAQ_3'),
    getEnv('VITE_FAQ_4'),
    getEnv('VITE_FAQ_5'),
  ].some((faq) => Boolean(faq?.trim()));

  // Detecta se o usuário está perto do final do scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 150;
    shouldAutoScroll.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Auto-scroll ao detectar qualquer mudança no conteúdo (incluindo animação de digitação)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = () => {
      if (shouldAutoScroll.current && container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    const observer = new MutationObserver(scrollToBottom);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  // Mensagem das opções predefinidas (firstmsg=true)
  const handleSuggestionClick = useCallback((content: string) => {
    sendMessage(content, true);
  }, [sendMessage]);

  // Mensagem digitada livremente (firstmsg=false)
  const handleUserInput = useCallback((content: string) => {
    sendMessage(content, false);
  }, [sendMessage]);

  return (
    <div className="relative flex flex-col bg-background overflow-hidden" style={{ height: '100dvh' }}>
      <BackgroundEffects />

      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader onNewConversation={startNewSession} />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 min-h-full flex flex-col justify-end md:justify-start">
            {messages.length === 0 ? (
              <EmptyChat onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="space-y-3 pb-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>
        </div>

        <ChatInput
          onSend={handleUserInput}
          isLoading={isLoading}
          disabled={hasFAQs && messages.length === 0}
        />
      </div>
    </div>
  );
};
