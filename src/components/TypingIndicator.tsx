import { Logo } from './Logo';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 flex items-center justify-center">
        <Logo size={24} className="text-primary animate-pulse" />
      </div>

      <div className="message-assistant px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
            <span className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }} />
            <span className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
