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
  const isPassword = props.type === 'password';
  const [visible, setVisible] = useState(false);
  const input = <input id={fid} className={`input ${error ? 'input-error' : ''} ${isPassword ? 'pr-11' : ''} ${className}`} {...props} type={isPassword && visible ? 'text' : props.type} />;

  return wrap(fid, label, error, hint, isPassword ? (
    <div className="relative">
      {input}
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-primary"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  ) : input);
}
export function Textarea({ id, label, error, hint, rows = 3, ...props }) {
  const fid = id || props.name;
  return wrap(fid, label, error, hint, <textarea id={fid} rows={rows} className={`input ${error ? 'input-error' : ''}`} {...props} />);
}
export function Select({ id, label, error, hint, children, ...props }) {
  const fid = id || props.name;
  return wrap(fid, label, error, hint, <select id={fid} className={`input ${error ? 'input-error' : ''}`} {...props}>{children}</select>);
}
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

