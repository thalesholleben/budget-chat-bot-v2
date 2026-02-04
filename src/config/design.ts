// ============================================
// DESIGN DO APP — ARQUIVO ÚNICO DE CUSTOMIZAÇÃO
// Mude aqui para personalizar o app inteiro.
// Após alterar, faça commit + push para aplicar.
// ============================================

// --- CORES ---
export const ACCENT_COLOR = '#c346f4';         // Cor primária (botões, links, destaque)
export const ACCENT_GRADIENT = '#8736b9';      // Cor secundária (gradientes)
export const ACCENT_TERTIARY = '#38bdf8';      // Cor terciária (detalhes, brilhos, badges)
export const BACKGROUND_COLOR = '#0b0d13';     // Cor de fundo principal
export const BACKGROUND_SECONDARY = '#0b0d13'; // Cor de fundo secundária (gradiente; igual = sólido)

// --- FONTES ---
// Opções: 'DEFAULT' | 'POPPINS' | 'MONTSERRAT'
export const FONT_PRESET = 'POPPINS';

// --- EFEITOS ---
export const ENABLE_GRID = true;               // Grade de malha no fundo
export const ENABLE_GLOW = true;               // Brilho suave nos elementos interativos
export const ENABLE_FLOATING_ORBS = true;      // Orbes animados no background

// ============================================
// CONFIGURAÇÃO DAS FONTES (não precisa mexer aqui)
// ============================================

export const FONT_PRESETS = {
  DEFAULT: {
    body: "'Crimson Pro', ui-serif, Georgia, serif",
    heading: "'Space Grotesk', system-ui, sans-serif",
    local: false,
    scale: 1,     // fator de escala para FAQs e balões de diálogo
  },
  POPPINS: {
    body: "'Poppins', system-ui, sans-serif",
    heading: "'Poppins', system-ui, sans-serif",
    local: true,
    scale: 0.88,  // Poppins tem x-height maior, reduz nos balões e FAQs
  },
  MONTSERRAT: {
    body: "'Montserrat', system-ui, sans-serif",
    heading: "'Montserrat', system-ui, sans-serif",
    local: true,
    scale: 0.88,  // Montserrat tem x-height maior, reduz nos balões e FAQs
  }
} as const;

export type FontPreset = keyof typeof FONT_PRESETS;
