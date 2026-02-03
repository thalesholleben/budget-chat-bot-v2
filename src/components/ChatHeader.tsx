import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { getEnv } from '@/lib/env';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChatHeaderProps {
  onNewConversation: () => void;
}

export const ChatHeader = ({ onNewConversation }: ChatHeaderProps) => {
  const headerSubtitle = getEnv('VITE_HEADER_SUBTITLE') || 'Assistente IA';

  return (
    <header className="glass-header sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl rounded-full" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent-secondary) / 0.2))' }} />
              <div className="relative w-12 h-12 rounded-2xl border border-primary/20 flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent-secondary) / 0.1))' }}>
                <Logo size={32} className="text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-semibold text-foreground font-['Space_Grotesk']">
                  Octopus AIssistant
                </h1>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {headerSubtitle}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-xl transition-all duration-300 flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Nova conversa</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Iniciar nova conversa?</AlertDialogTitle>
                <AlertDialogDescription>
                  A conversa atual será apagada permanentemente. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onNewConversation}>
                  Sim, iniciar nova conversa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
};
