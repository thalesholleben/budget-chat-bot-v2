import { useState, useRef, memo } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput = memo(({ onSend, isLoading, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-header p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center gap-3 glass-card rounded-3xl p-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Escolha uma opção para começar" : "Descreva o que você precisa..."}
            disabled={isLoading || disabled}
            className="min-h-[56px] max-h-40 resize-none bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground px-4 py-4"
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            size="lg"
            className="h-12 w-12 rounded-2xl bg-primary hover:bg-[hsl(var(--primary-hover))] transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="hidden md:block text-center text-xs text-muted-foreground mt-3">
          Pressione Enter para enviar • Shift + Enter para nova linha
        </p>
      </div>
    </div>
  );
});
