import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Utensils } from 'lucide-react';
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
  const orderRef = useRef(null);

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
  const totalQty = lines.reduce((sum, item) => sum + item.quantity, 0);
  const changeQuantity = (id, value) => setBasket((current) => {
    const next = { ...current };
    if (value <= 0) delete next[id]; else next[id] = Math.min(50, value);
    return next;
  });

  const scrollToOrder = () => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-8">
        <div className="card w-full p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto mb-4 text-green-600" size={56} />
          <h1 className="text-xl font-bold sm:text-2xl">Order received!</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">The restaurant has added your order to its cart and will prepare it shortly.</p>
          <Link className="btn btn-primary mt-6 w-full sm:w-auto" to="/order">Place another order</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24 lg:pb-10">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:py-4">
          <Utensils size={22} className="shrink-0" />
          <span className="text-lg font-bold sm:text-xl">Cafe Express</span>
          <span className="ml-auto text-xs text-white/70 sm:text-sm">Scan • choose • order</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:py-8 lg:grid-cols-[1fr_360px]">
        {/* menu */}
        <section className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Order from our menu</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">Choose your items, then send the order directly to our team.</p>

          {loading ? (
            <p className="mt-8 text-gray-500">Loading menu…</p>
          ) : menuError ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              <p>Unable to load the menu: {menuError}</p>
              <button type="button" className="btn btn-outline btn-sm mt-3" onClick={loadMenu}>Try again</button>
            </div>
          ) : menu.length === 0 ? (
            <p className="mt-6 rounded-lg bg-white p-4 text-gray-600">No menu items are available right now. Please ask the restaurant staff.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
              {menu.map((item) => {
                const quantity = basket[item.id] || 0;
                return (
                  <article key={item.id} className={`card p-4 transition sm:p-5 ${quantity ? 'ring-2 ring-primary/40' : ''}`}>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">{item.category}</p>
                    <h2 className="mt-1 break-words text-base font-semibold sm:text-lg">{item.name}</h2>
                    <p className="mt-2 text-sm text-gray-500 sm:min-h-10">{item.description || 'Freshly prepared for you.'}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <strong>{money(item.price)}</strong>
                      {quantity ? (
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label={`Remove ${item.name}`} className="icon-btn !h-10 !w-10 sm:!h-8 sm:!w-8" onClick={() => changeQuantity(item.id, quantity - 1)}><Minus size={16} /></button>
                          <span className="w-6 text-center font-semibold">{quantity}</span>
                          <button type="button" aria-label={`Add ${item.name}`} className="icon-btn !h-10 !w-10 border-primary text-primary sm:!h-8 sm:!w-8" onClick={() => changeQuantity(item.id, quantity + 1)}><Plus size={16} /></button>
                        </div>
                      ) : (
                        <button type="button" className="btn btn-outline btn-sm !px-4 !py-2 sm:!px-3 sm:!py-1.5" onClick={() => changeQuantity(item.id, 1)}><Plus size={14} /> Add</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* order summary + form */}
        <aside ref={orderRef} className="card h-fit scroll-mt-4 p-4 sm:p-5 lg:sticky lg:top-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={20} className="text-primary" /> Your order</h2>
          <div className="my-4 max-h-60 space-y-2 overflow-y-auto border-y border-gray-100 py-3 lg:max-h-72">
            {lines.length ? lines.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 break-words">{item.quantity}× {item.name}</span>
                <span className="shrink-0">{money(item.price * item.quantity)}</span>
              </div>
            )) : <p className="text-sm text-gray-500">Your basket is empty.</p>}
          </div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <input className="input text-base sm:text-sm" placeholder="Your name" autoComplete="name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input className="input text-base sm:text-sm" placeholder="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select className="input text-base sm:text-sm" aria-label="Table number" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}>
              <option value="">Select table / takeaway</option>
              {TABLES.map((table) => <option key={table} value={table}>Table {table}</option>)}
            </select>
            <textarea className="input text-base sm:text-sm" placeholder="Special instructions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" />
            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
            <button className="btn btn-primary w-full" disabled={busy || !lines.length}>{busy ? 'Sending order…' : 'Place order'}</button>
          </form>
        </aside>
      </div>

      {/* mobile floating bar: tap karke order form par jao (lg se upar chhup jaata hai) */}
      {lines.length > 0 && (
        <button
          type="button"
          onClick={scrollToOrder}
          className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-2xl lg:hidden"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <span className="flex items-center gap-2"><ShoppingBag size={16} /> {totalQty} item{totalQty === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-1">{money(total)} · Checkout <ArrowRight size={14} /></span>
        </button>
      )}
    </main>
  );
}