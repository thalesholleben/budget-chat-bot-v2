import { memo } from 'react';
import { Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import { getEnv } from '@/lib/env';

interface EmptyChatProps {
  onSuggestionClick: (message: string) => void;
}

export const EmptyChat = memo(({ onSuggestionClick }: EmptyChatProps) => {
  // Variáveis de ambiente (runtime > build time)
  const professionalName = getEnv('VITE_PROFESSIONAL_NAME') || 'Assistente IA';
  const professionalTitle = getEnv('VITE_PROFESSIONAL_TITLE') || 'Especialista em Automação';
  const externalLink = getEnv('VITE_EXTERNAL_LINK');

  const features = [
    {
      icon: Zap,
      title: 'Orçamento Rápido'
    },
    {
      icon: Clock,
      title: 'Disponível 24h'
    }
  ];

  // Construir array de opções dinamicamente baseado nas variáveis de ambiente
  const buildOptions = (): string[] => {
    const faqs = [
      getEnv('VITE_FAQ_1'),
      getEnv('VITE_FAQ_2'),
      getEnv('VITE_FAQ_3'),
      getEnv('VITE_FAQ_4'),
      getEnv('VITE_FAQ_5'),
    ];

    // Filtrar apenas FAQs que têm valor (não vazias)
    return faqs.filter((faq): faq is string => Boolean(faq?.trim()));
  };

  const options = buildOptions();

  const handleOptionClick = (option: string, index: number) => {
    // Se é a última opção e existe link externo, redireciona
    if (index === options.length - 1 && externalLink) {
      window.open(externalLink, '_blank');
    } else {
      // Caso contrário, segue o fluxo normal
      onSuggestionClick(option);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:px-8 text-center animate-slide-up">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3 font-heading">
        Olá! Sou o assistente do
      </h2>
      <p className="text-3xl md:text-4xl gradient-text font-semibold mb-2 md:mb-4 font-heading">
        {professionalName}
      </p>
      <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-7 max-w-md">
        {professionalTitle}
      </p>

      {/* Features - Moved up */}
      <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-primary/5 border border-primary/10 transition-all duration-300 hover:bg-primary/15 hover:border-primary/20"
          >
            <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
            <span className="text-xs md:text-sm text-foreground whitespace-nowrap">
              {feature.title}
            </span>
          </div>
        ))}
      </div>

      {/* Options - Condicional: só aparece se houver FAQs configuradas */}
      {options.length > 0 && (
        <div className="w-full max-w-lg space-y-2.5 md:space-y-3">
          <p className="text-sm md:text-base font-medium text-foreground mb-3 md:mb-5">Escolha uma opção para começar:</p>
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option, index)}
              className="w-full glass-card glow-interactive rounded-2xl px-5 py-3.5 md:px-6 md:py-4 text-left text-foreground hover:bg-card/80 transition-all duration-300 group flex items-center justify-between hover:border-primary/30"
              style={{ fontSize: 'calc(17px * var(--font-scale))' }}
            >
              <span>{option}</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </button>
          ))}

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-1.5 pt-2 md:pt-3 text-muted-foreground/60">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs md:text-sm font-normal italic">Dados protegidos</span>
          </div>
        </div>
      )}

      {/* Mensagem quando não há FAQs configuradas */}
      {options.length === 0 && (
        <div className="w-full max-w-lg text-center">
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Como posso ajudar você hoje?
          </p>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground/60">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs md:text-sm font-normal italic">Dados protegidos</span>
          </div>
        </div>
      )}
    </div>
  );
});
