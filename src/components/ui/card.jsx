export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-card text-card-foreground border border-border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
