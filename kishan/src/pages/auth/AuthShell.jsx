import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url('/img/bg1.jpg')" }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link to="/" className="mb-5 flex items-center justify-center gap-2 text-2xl font-bold text-primary"><Utensils /> Cafe Express</Link>
        <h1 className="text-center text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mb-5 mt-1 text-center text-sm text-gray-500">{subtitle}</p>}
        {children}
        {footer && <div className="mt-5 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}
