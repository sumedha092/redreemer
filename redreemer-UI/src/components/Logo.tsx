interface LogoProps { size?: 'sm' | 'md' | 'lg'; }

export default function Logo({ size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e000" />
            <stop offset="100%" stopColor="#ffe44d" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
        <text x="14" y="22" textAnchor="middle" fill="#111827" fontSize="18" fontWeight="800" fontFamily="Space Grotesk, sans-serif">R</text>
        <path d="M22 8 L26 4 M26 4 L26 8 M26 4 L22 4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: textSize, lineHeight: 1 }}>
        <span style={{ background: 'linear-gradient(90deg, #f5e000, #ffe44d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Re</span>
        <span style={{ color: '#111827' }}>dreemer</span>
      </span>
    </div>
  );
}
