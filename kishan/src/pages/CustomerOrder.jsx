import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Minus, Plus, ShoppingBag, Utensils } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../api/client.js';
import { money } from '../utils/format.js';

// Change this count to match the number of tables in the restaurant.
const TABLES = Array.from({ length: 20 }, (_, index) => String(index + 1));

export default function CustomerOrder() {
  const [menu, setMenu] = useState([]);
  const [basket, setBasket] = useState({});
  const [form, setForm] = useState({ customerName: '', phone: '', tableNumber: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setMenuError('');
    try {
      const { data } = await api.get('/public/menu');
      if (!Array.isArray(data.data)) throw new Error('The menu response was invalid.');
      setMenu(data.data);
    } catch (error) {
      setMenu([]);
      setMenuError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const lines = useMemo(() => menu.filter((item) => basket[item.id]).map((item) => ({ ...item, quantity: basket[item.id] })), [menu, basket]);
  const total = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const changeQuantity = (id, value) => setBasket((current) => {
    const next = { ...current };
    if (value <= 0) delete next[id]; else next[id] = Math.min(50, value);
    return next;
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!lines.length) return setErrors({ form: 'Please add at least one item.' });
    setBusy(true); setErrors({});
    try {
      await api.post('/public/orders', { ...form, items: lines.map(({ id, quantity }) => ({ item: id, quantity })) });
      setSubmitted(true);
    } catch (error) {
      setErrors({ ...fieldErrors(error), form: errorMessage(error) });
    } finally { setBusy(false); }
  };

  if (submitted) return <main className="mx-auto flex min-h-screen max-w-lg items-center px-4"><div className="card w-full p-8 text-center"><CheckCircle2 className="mx-auto mb-4 text-green-600" size={56} /><h1 className="text-2xl font-bold">Order received!</h1><p className="mt-2 text-gray-600">The restaurant has added your order to its cart and will prepare it shortly.</p><Link className="btn btn-primary mt-6" to="/order">Place another order</Link></div></main>;

  return <main className="min-h-screen bg-gray-50 pb-10"><header className="bg-ink text-white"><div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4"><Utensils size={24} /><span className="text-xl font-bold">Cafe Express</span><span className="ml-auto text-sm text-white/70">Scan • choose • order</span></div></header><div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]"><section><h1 className="text-3xl font-bold">Order from our menu</h1><p className="mt-1 text-gray-600">Choose your items, then send the order directly to our team.</p>{loading ? <p className="mt-8 text-gray-500">Loading menu…</p> : menuError ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><p>Unable to load the menu: {menuError}</p><button type="button" className="btn btn-outline btn-sm mt-3" onClick={loadMenu}>Try again</button></div> : menu.length === 0 ? <p className="mt-6 rounded-lg bg-white p-4 text-gray-600">No menu items are available right now. Please ask the restaurant staff.</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{menu.map((item) => { const quantity = basket[item.id] || 0; return <article key={item.id} className="card p-5"><p className="text-xs font-medium uppercase tracking-wide text-primary">{item.category}</p><h2 className="mt-1 text-lg font-semibold">{item.name}</h2><p className="mt-2 min-h-10 text-sm text-gray-500">{item.description || 'Freshly prepared for you.'}</p><div className="mt-4 flex items-center justify-between"><strong>{money(item.price)}</strong>{quantity ? <div className="flex items-center gap-2"><button aria-label={`Remove ${item.name}`} className="icon-btn" onClick={() => changeQuantity(item.id, quantity - 1)}><Minus size={15} /></button><span className="w-5 text-center font-semibold">{quantity}</span><button aria-label={`Add ${item.name}`} className="icon-btn border-primary text-primary" onClick={() => changeQuantity(item.id, quantity + 1)}><Plus size={15} /></button></div> : <button className="btn btn-outline btn-sm" onClick={() => changeQuantity(item.id, 1)}><Plus size={14} /> Add</button>}</div></article>; })}</div>}</section><aside className="card h-fit p-5 lg:sticky lg:top-5"><h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={20} className="text-primary" /> Your order</h2><div className="my-4 space-y-2 border-y border-gray-100 py-3">{lines.length ? lines.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.quantity}× {item.name}</span><span>{money(item.price * item.quantity)}</span></div>) : <p className="text-sm text-gray-500">Your basket is empty.</p>}</div><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div><form onSubmit={submit} className="mt-5 space-y-3"><input className="input" placeholder="Your name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /><input className="input" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><select className="input" aria-label="Table number" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}><option value="">Select table / takeaway</option>{TABLES.map((table) => <option key={table} value={table}>Table {table}</option>)}</select><textarea className="input" placeholder="Special instructions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" />{errors.form && <p className="text-sm text-red-600">{errors.form}</p>}<button className="btn btn-primary w-full" disabled={busy || !lines.length}>{busy ? 'Sending order…' : 'Place order'}</button></form></aside></div></main>;
}
