import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { toast } from 'sonner';
import { Save, Trash2, Loader2 } from 'lucide-react';

const RULES_API = '/api/rules';
const STORAGE_KEY = 'business_rules';

const Admin = () => {
  const [rules, setRules] = useState('');
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(RULES_API);
        if (!response.ok) throw new Error('Erro ao buscar regras');
        const data = await response.json();
        const fetched = Array.isArray(data) ? data[0]?.rules : data.rules;
        setRules(fetched || '');
        // Cache local
        if (fetched) localStorage.setItem(STORAGE_KEY, fetched);
      } catch {
        // Fallback: localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRules(stored);
          toast.error('Servidor indisponivel, carregando cache local');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleSave = async () => {
    if (!rules.trim()) {
      const confirmed = window.confirm(
        'ATENCAO: Voce esta prestes a salvar regras VAZIAS!\n\n' +
        'Salvar vazio vai apagar as regras do sistema.\n\n' +
        'Tem CERTEZA que deseja continuar?'
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const response = await fetch(RULES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      localStorage.setItem(STORAGE_KEY, rules);
      setSaved(true);
      toast.success('Regras salvas com sucesso');
    } catch {
      toast.error('Erro ao salvar regras no servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja apagar todas as regras?'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await fetch(RULES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: '' }),
      });

      if (!response.ok) throw new Error('Erro ao resetar');

      localStorage.removeItem(STORAGE_KEY);
      setRules('');
      setSaved(true);
      toast.success('Regras resetadas');
    } catch {
      toast.error('Erro ao resetar regras no servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setRules(value);
    setSaved(false);
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

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center h-[300px] md:h-[400px]">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <>
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
                  disabled={saved || saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={{
                    background: saved
                      ? 'hsl(var(--primary) / 0.5)'
                      : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-secondary)) 100%)',
                    boxShadow: saved ? 'none' : '0 4px 15px hsl(var(--primary) / 0.3)',
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={!rules || saving}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
