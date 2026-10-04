export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}
