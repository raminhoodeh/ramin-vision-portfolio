export type PortfolioShaderVariant = 'default' | 'bonus' | 'projects';

export function StaticShaderGradientBackground({ variant = 'default' }: { variant?: PortfolioShaderVariant }) {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-black shader-gradient-surface"
      data-shader-variant={variant}
      aria-hidden="true"
    />
  );
}
