import { AlertCircle } from 'lucide-react';
import Spinner from './Spinner.jsx';

// loading / error ek jagah handle
export default function DataState({ loading, error, onRetry, children }) {
  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-sm text-red-600">{error}</p>
        {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  return children;
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      {Icon && <Icon size={36} className="text-gray-400" />}
      <h5 className="text-lg font-medium text-gray-500">{title}</h5>
      {children}
    </div>
  );
}
