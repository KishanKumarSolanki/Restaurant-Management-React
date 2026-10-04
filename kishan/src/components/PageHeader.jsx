import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, crumbs = [], actions }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {crumbs.length > 0 && (
        <nav className="mt-2 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link to="/home" className="text-primary hover:underline">Home</Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={14} />
              {c.to ? <Link to={c.to} className="text-primary hover:underline">{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
