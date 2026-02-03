// ============================================
// FONTES DO APP
// Escolha uma das opções abaixo:
// 'DEFAULT', 'POPPINS' ou 'MONTSERRAT'
// Após alterar, faça commit + push para aplicar.
// ============================================

export const FONT_PRESET = 'MONTSERRAT';

// ============================================
// CONFIGURAÇÃO DAS FONTES (não precisa mexer aqui)
// ============================================

export const FONT_PRESETS = {
  DEFAULT: {
    body: "'Crimson Pro', ui-serif, Georgia, serif",
    heading: "'Space Grotesk', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap'
  },
  POPPINS: {
    body: "'Poppins', system-ui, sans-serif",
    heading: "'Poppins', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
  },
  MONTSERRAT: {
    body: "'Montserrat', system-ui, sans-serif",
    heading: "'Montserrat', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap'
  }
} as const;

export type FontPreset = keyof typeof FONT_PRESETS;
