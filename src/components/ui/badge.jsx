export function Badge({ className = '', variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-etus-mint text-etus-dark',
    success: 'bg-etus-green/20 text-etus-dark border border-etus-green/30',
    warning: 'bg-accent-yellow/30 text-n-800 border border-accent-yellow/50',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-accent-blue/30 text-n-800 border border-accent-blue/50',
    outline: 'bg-transparent text-n-600 border border-border',
    pink: 'bg-accent-pink/30 text-n-800 border border-accent-pink/50',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}
