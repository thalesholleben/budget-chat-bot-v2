import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'business_rules';

const Admin = () => {
  const [rules, setRules] = useState('');
  const [saved, setSaved] = useState(true);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRules(stored);
    } else {
      // Mostrar aviso se não houver regras salvas
      setShowEmptyWarning(true);
    }
  }, []);

  const handleSave = () => {
    // Confirmar se está salvando vazio
    if (!rules.trim()) {
      const confirmed = window.confirm(
        '⚠️ ATENÇÃO: Você está prestes a salvar regras VAZIAS!\n\n' +
        'Isso pode acontecer em modo anônimo ou se o cache foi limpo.\n' +
        'Salvar vazio pode sobrescrever regras existentes no sistema.\n\n' +
        'Tem CERTEZA que deseja continuar?'
      );
      if (!confirmed) return;
    }

    localStorage.setItem(STORAGE_KEY, rules);
    setSaved(true);
    toast.success('Regras salvas com sucesso');
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRules('');
    setSaved(true);
    toast.success('Regras resetadas');
  };

  const handleChange = (value: string) => {
    setRules(value);
    setSaved(false);
    // Esconder aviso quando começar a digitar
    if (showEmptyWarning && value.trim()) {
      setShowEmptyWarning(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-card rounded-2xl border border-border/50 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl border border-primary/20 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent-secondary) / 0.1))',
              }}
            >
              <Logo size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground font-heading">
                Regras de Negocio
              </h1>
              <p className="text-xs text-muted-foreground">
                Painel de configuracao do assistente
              </p>
            </div>
          </div>

          {/* Aviso de regras vazias */}
          {showEmptyWarning && (
            <div className="mb-4 p-4 rounded-xl border-2 border-amber-400/50 bg-amber-400/10 animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-400 mb-1">
                    Nenhuma regra encontrada
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    Isso pode acontecer em modo anônimo, cache limpo, ou primeiro acesso.
                    Tenha cuidado ao salvar regras vazias, pois pode sobrescrever configurações existentes.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmptyWarning(false)}
                  className="text-foreground/50 hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={rules}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Cole aqui as regras de negocio, tabela de precos, instrucoes para o assistente..."
            className="w-full h-[300px] md:h-[400px] resize-y rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />

          {/* Preview info */}
          <p className="text-[11px] text-muted-foreground/60 mt-2">
            Essas regras entram em vigor na proxima mensagem enviada no chat.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: saved
                  ? 'hsl(var(--primary) / 0.5)'
                  : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-secondary)) 100%)',
                boxShadow: saved ? 'none' : '0 4px 15px hsl(var(--primary) / 0.3)',
              }}
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>

            <button
              onClick={handleReset}
              disabled={!rules}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-foreground/70 bg-card/50 border border-border/50 hover:bg-card hover:text-foreground transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Trash2 className="w-4 h-4" />
              Resetar regras
            </button>
          </div>

          {/* Unsaved indicator */}
          {!saved && (
            <p className="text-[11px] text-amber-400/80 mt-3 animate-fade-in">
              Alteracoes nao salvas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
