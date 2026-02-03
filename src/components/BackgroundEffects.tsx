export const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs - mais sutis para combinar com fundo sólido da Claude */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float will-change-transform transform-gpu" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl animate-float-delayed will-change-transform transform-gpu" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-float-slow will-change-transform transform-gpu" />
      
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
            <stop offset="100%" stopColor="hsl(var(--accent-secondary))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
};
