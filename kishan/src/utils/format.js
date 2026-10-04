export const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const num = (n) => Number(n || 0).toLocaleString('en-IN');

// "2026-10-05T00:00:00.000Z" -> "2026-10-05"
export const dateOnly = (v) => (v ? String(v).slice(0, 10) : '');

export const fmtDate = (v) => {
  const d = dateOnly(v);
  if (!d) return '-';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const timeAgo = (v) => {
  if (!v) return 'Assigned recently';
  const s = Math.max(1, Math.floor((Date.now() - new Date(v).getTime()) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, secs] of units) {
    if (s >= secs) {
      const n = Math.floor(s / secs);
      return `${n} ${name}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
