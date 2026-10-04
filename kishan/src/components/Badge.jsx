import { cap } from '../utils/format.js';

const COLORS = {
  completed: 'bg-emerald-100 text-emerald-800', paid: 'bg-emerald-100 text-emerald-800', served: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800', available: 'bg-emerald-100 text-emerald-800',
  ready: 'bg-sky-100 text-sky-800', preparing: 'bg-sky-100 text-sky-800', 'in-progress': 'bg-sky-100 text-sky-800',
  pending: 'bg-amber-100 text-amber-800', scheduled: 'bg-amber-100 text-amber-800',
  processing: 'bg-gray-200 text-gray-700', off: 'bg-gray-200 text-gray-600', inactive: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-100 text-red-700', unavailable: 'bg-red-100 text-red-700',
};

export default function Badge({ value, children, className = '' }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[value] || 'bg-gray-100 text-gray-700'} ${className}`}>
      {children ?? cap(value)}
    </span>
  );
}
