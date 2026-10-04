const wrap = (id, label, error, hint, children) => (
  <div>
    {label && <label htmlFor={id} className="label">{label}</label>}
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p className="error-text">{error}</p>}
  </div>
);

export function Input({ id, label, error, hint, className = '', ...props }) {
  const fid = id || props.name;
  return wrap(fid, label, error, hint, <input id={fid} className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />);
}
export function Textarea({ id, label, error, hint, rows = 3, ...props }) {
  const fid = id || props.name;
  return wrap(fid, label, error, hint, <textarea id={fid} rows={rows} className={`input ${error ? 'input-error' : ''}`} {...props} />);
}
export function Select({ id, label, error, hint, children, ...props }) {
  const fid = id || props.name;
  return wrap(fid, label, error, hint, <select id={fid} className={`input ${error ? 'input-error' : ''}`} {...props}>{children}</select>);
}
