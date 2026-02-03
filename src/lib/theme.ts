import {
  ACCENT_COLOR,
  ACCENT_GRADIENT,
  ACCENT_TERTIARY,
  BACKGROUND_COLOR,
  BACKGROUND_SECONDARY,
  FONT_PRESET,
  FONT_PRESETS,
  ENABLE_GRID,
  ENABLE_GLOW,
  ENABLE_FLOATING_ORBS,
} from '@/config/design';

// Re-exportar flags para uso nos componentes
export { ENABLE_GRID, ENABLE_GLOW, ENABLE_FLOATING_ORBS };

/**
 * Converte HEX para HSL no formato que o Tailwind espera: "H S% L%"
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # se existir
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Formata HSL para o formato do Tailwind CSS: "H S% L%"
 */
function formatHSL(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

/**
 * Gera versão mais clara de uma cor (para hover)
 */
function lighten(hsl: { h: number; s: number; l: number }, amount: number) {
  return { ...hsl, l: Math.min(100, hsl.l + amount) };
}

/**
 * Gera versão dessaturada (para disabled)
 */
function desaturate(hsl: { h: number; s: number; l: number }) {
  return { h: hsl.h, s: Math.round(hsl.s * 0.3), l: Math.max(20, hsl.l - 13) };
}

/**
 * Aplica as cores de destaque nas CSS variables do :root
 */
export function applyAccentColors() {
  const accentHex = ACCENT_COLOR;
  const gradientHex = ACCENT_GRADIENT;

  if (!accentHex) return;

  const accent = hexToHSL(accentHex);
  const accentStr = formatHSL(accent.h, accent.s, accent.l);

  // Cor hover: 12% mais clara
  const hover = lighten(accent, 12);
  const hoverStr = formatHSL(hover.h, hover.s, hover.l);

  // Cor active: 8% mais clara
  const active = lighten(accent, 8);
  const activeStr = formatHSL(active.h, active.s, active.l);

  // Cor disabled: dessaturada
  const disabled = desaturate(accent);
  const disabledStr = formatHSL(disabled.h, disabled.s, disabled.l);

  // Cor do gradiente: usa variável ou versão mais clara da cor principal
  let gradientStr: string;
  if (gradientHex?.trim()) {
    const gradient = hexToHSL(gradientHex);
    gradientStr = formatHSL(gradient.h, gradient.s, gradient.l);
  } else {
    const autoGradient = lighten(accent, 18);
    gradientStr = formatHSL(autoGradient.h, autoGradient.s, autoGradient.l);
  }

  // Cor terciária
  const tertiaryHex = ACCENT_TERTIARY;
  let tertiaryStr: string;
  if (tertiaryHex?.trim()) {
    const tertiary = hexToHSL(tertiaryHex);
    tertiaryStr = formatHSL(tertiary.h, tertiary.s, tertiary.l);
  } else {
    const autoTertiary = lighten(accent, 24);
    tertiaryStr = formatHSL(autoTertiary.h, autoTertiary.s, autoTertiary.l);
  }

  const root = document.documentElement;

  // Cores principais
  root.style.setProperty('--primary', accentStr);
  root.style.setProperty('--accent', accentStr);
  root.style.setProperty('--ring', accentStr);
  root.style.setProperty('--sidebar-primary', accentStr);
  root.style.setProperty('--sidebar-ring', accentStr);

  // Cores derivadas
  root.style.setProperty('--primary-hover', hoverStr);
  root.style.setProperty('--primary-active', activeStr);
  root.style.setProperty('--primary-disabled', disabledStr);

  // Cor do gradiente
  root.style.setProperty('--accent-secondary', gradientStr);

  // Cor terciária
  root.style.setProperty('--accent-tertiary', tertiaryStr);
}

/**
 * Aplica a cor de fundo (background) personalizada
 */
export function applyBackgroundColor() {
  const bgHex = BACKGROUND_COLOR;

  if (!bgHex) return;

  const bg = hexToHSL(bgHex);
  const bgStr = formatHSL(bg.h, bg.s, bg.l);

  // Derivar cores relacionadas ao background
  const cardBg = lighten(bg, 3);  // Card um pouco mais claro
  const cardStr = formatHSL(cardBg.h, cardBg.s, cardBg.l);

  const secondaryBg = lighten(bg, 5);  // Secondary/muted
  const secondaryStr = formatHSL(secondaryBg.h, secondaryBg.s, secondaryBg.l);

  const borderBg = lighten(bg, 10);  // Border mais claro
  const borderStr = formatHSL(borderBg.h, borderBg.s, borderBg.l);

  // Background secundário (para gradiente)
  const bgSecHex = BACKGROUND_SECONDARY;
  let bgSecStr = bgStr; // default: igual ao principal (sólido)
  if (bgSecHex?.trim() && bgSecHex !== bgHex) {
    const bgSec = hexToHSL(bgSecHex);
    bgSecStr = formatHSL(bgSec.h, bgSec.s, bgSec.l);
  }

  const root = document.documentElement;

  // Aplicar cores de background
  root.style.setProperty('--background', bgStr);
  root.style.setProperty('--background-secondary', bgSecStr);
  root.style.setProperty('--sidebar-background', bgStr);

  // Aplicar cores derivadas
  root.style.setProperty('--card', cardStr);
  root.style.setProperty('--popover', cardStr);
  root.style.setProperty('--secondary', secondaryStr);
  root.style.setProperty('--muted', secondaryStr);
  root.style.setProperty('--input', secondaryStr);
  root.style.setProperty('--sidebar-accent', secondaryStr);

  // Bordas
  root.style.setProperty('--border', borderStr);
  root.style.setProperty('--sidebar-border', borderStr);
}

/**
 * Aplica as fontes personalizadas
 * Nota: Fontes são carregadas no index.html via preconnect/preload
 */
export function applyFonts() {
  const preset = FONT_PRESETS[FONT_PRESET] || FONT_PRESETS.DEFAULT;

  // Aplicar apenas as CSS variables (fontes já estão no index.html)
  document.documentElement.style.setProperty('--font-body', preset.body);
  document.documentElement.style.setProperty('--font-heading', preset.heading);
  document.documentElement.style.setProperty('--font-scale', String(preset.scale));
}
