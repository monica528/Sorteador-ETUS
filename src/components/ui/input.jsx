export function Input({ className = '', label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-n-800">{label}</label>}
      <input
        className={`flex h-11 w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-etus-green focus:border-etus-green transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
