interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
}

export default function Logo({ size = 'md', iconOnly = false }: LogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 48, xl: 64 };
  const textSizes = { sm: '15px', md: '19px', lg: '26px', xl: '34px' };
  const gaps = { sm: 7, md: 9, lg: 11, xl: 14 };

  const px = iconSizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${gaps[size]}px` }}>
      <img
        src="/reverse-logo.png"
        alt="Redreemer"
        width={px}
        height={px}
        style={{ borderRadius: '20%', flexShrink: 0, display: 'block' }}
      />
      {!iconOnly && (
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          fontSize: textSizes[size],
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #c9a800, #f5e000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Re</span>
          <span style={{ color: '#111827' }}>dreemer</span>
        </span>
      )}
    </div>
  );
}
