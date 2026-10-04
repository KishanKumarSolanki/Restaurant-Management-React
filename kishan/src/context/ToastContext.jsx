import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove]
  );
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-20 z-[100] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${t.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {t.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="cursor-pointer opacity-60 hover:opacity-100" aria-label="Close"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
