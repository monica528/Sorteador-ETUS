export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
