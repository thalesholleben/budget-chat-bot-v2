import { ENABLE_GRID, ENABLE_FLOATING_ORBS } from '@/lib/theme';

export const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs - 3 cores do design.ts */}
      {ENABLE_FLOATING_ORBS && (
        <>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float will-change-transform transform-gpu" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl animate-float-delayed will-change-transform transform-gpu" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-tertiary/4 rounded-full blur-3xl animate-float-slow will-change-transform transform-gpu" />
        </>
      )}

      {/* Organic shapes */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-[0.01]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M0,500 Q250,300 500,500 T1000,500 L1000,1000 L0,1000 Z"
          fill="url(#wave-gradient)"
          className="animate-wave"
        />
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent-secondary))" />
            <stop offset="100%" stopColor="hsl(var(--accent-tertiary))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Grid pattern com fade nas bordas */}
      {ENABLE_GRID && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
};
