export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      {...props}
    />
  );
}
