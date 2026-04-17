import type * as React from 'react';

export function PocSharedUi() {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: '1px solid rgba(16,32,51,0.12)',
      }}
    >
      <h1>Welcome to PocSharedUi!</h1>
    </div>
  );
}

export type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function AppButton({
  variant = 'primary',
  style,
  ...props
}: AppButtonProps) {
  const base: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(16,32,51,0.18)',
    cursor: 'pointer',
    fontWeight: 700,
  };

  const variants: Record<NonNullable<AppButtonProps['variant']>, React.CSSProperties> =
    {
      primary: { background: '#102033', color: '#ffffff' },
      secondary: { background: '#f4f7fb', color: '#102033' },
    };

  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
    />
  );
}

export default PocSharedUi;
