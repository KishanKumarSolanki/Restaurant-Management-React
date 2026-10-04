import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onChange }) {
  if (!meta || meta.pages <= 1) return null;
  const { page, pages, total, limit } = meta;
  const nums = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);

  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-gray-500">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</p>
      <div className="flex items-center gap-1">
        <button className={`${btn} border-gray-300 bg-white`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous"><ChevronLeft size={16} /></button>
        {nums.map((p) => (
          <button key={p} onClick={() => onChange(p)} className={`${btn} ${p === page ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>{p}</button>
        ))}
        <button className={`${btn} border-gray-300 bg-white`} disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
