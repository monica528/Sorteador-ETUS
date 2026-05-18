export function Button({ className = '', variant = 'default', size = 'default', children, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-etus-dark/90 shadow-sm hover:shadow-md',
    secondary: 'bg-etus-green text-n-950 hover:bg-etus-lime shadow-sm',
    outline: 'border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-etus-green',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-etus-green text-n-950 hover:bg-etus-lime font-semibold shadow-sm',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} {...props}>
      {children}
    </button>
  );
}
