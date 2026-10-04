import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({ label, icon: Icon, active, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${active ? 'bg-primary text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}
      >
        {Icon && <Icon size={16} />} {label} <ChevronDown size={14} />
      </button>
      {open && (
        <div onClick={() => setOpen(false)} className={`absolute z-50 mt-1 min-w-48 overflow-hidden rounded-lg bg-white py-1 text-sm text-gray-700 shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}
