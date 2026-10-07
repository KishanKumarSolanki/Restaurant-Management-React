import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Utensils, Receipt, LineChart, UserCheck, LayoutDashboard, ShoppingCart, Search, Plus, Minus,
  Trash2, Clock, IndianRupee, Flame, Wallet, Trophy, ArrowRight, Send, X,
} from 'lucide-react';
import api, { errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import Badge from '../components/Badge.jsx';
import { EmptyState } from '../components/DataState.jsx';
import { money, num, timeAgo } from '../utils/format.js';

const tiles = [
  { to: '/customers', icon: Users, title: 'Customers' },
  { to: '/items', icon: Utensils, title: 'Menu Items' },
  { to: '/orders', icon: Receipt, title: 'Orders' },
  { to: '/staff-members', icon: UserCheck, title: 'Staff' },
  { to: '/reports', icon: LineChart, title: 'Reports' },
  { to: '/dashboard', icon: LayoutDashboard, title: 'Dashboard' },
];

const greeting = (h) => (h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night');

// ---------- live clock ----------
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ---------- global search helpers (component ke bahar, taaki har render par remount na ho) ----------
function Group({ title, rows, render }) {
  if (!rows.length) return null;
  return (
    <div className="py-1">
      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      {rows.map(render)}
    </div>
  );
}

function Row({ onClick, left, right }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-2"
    >
      <span className="w-full min-w-0 truncate sm:w-auto">{left}</span>
      <span className="w-full shrink-0 truncate text-xs text-gray-500 sm:w-auto">{right}</span>
    </button>
  );
}

// ---------- global search ----------
function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return undefined; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: q.trim() } });
        if (!cancelled) { setRes(data); setOpen(true); }
      } catch { /* ignore */ }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  // bahar click/tap karne par band + "/" dabane par focus
  useEffect(() => {
    const onClick = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); input.current?.focus(); }
      if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (path) => { setOpen(false); setQ(''); navigate(path); };
  const empty = res && !res.customers.length && !res.items.length && !res.orders.length;

  return (
    <div ref={box} className="relative mx-auto w-full max-w-xl text-left">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        ref={input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => res && setOpen(true)}
        placeholder="Search customers, items, orders..."
        enterKeyHint="search"
        className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-10 text-base text-gray-900 shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/40 sm:text-sm"
      />
      {/* "/" shortcut hint sirf bade screen par */}
      {!q && <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-gray-200 px-1.5 text-[11px] text-gray-400 md:block">/</kbd>}
      {q && (
        <button type="button" onClick={() => { setQ(''); setRes(null); }} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600" aria-label="Clear search"><X size={16} /></button>
      )}
      {open && res && (
        <div className="absolute z-30 mt-2 max-h-[60vh] w-full overflow-y-auto rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black/5 sm:max-h-96">
          {empty && <p className="px-4 py-6 text-center text-sm text-gray-500">&quot;{q}&quot; ke liye kuch nahi mila.</p>}
          <Group title="Customers" rows={res.customers} render={(c) => <Row key={c.id} onClick={() => go(`/customers/${c.id}`)} left={c.name} right={`${c.customerno} · ${c.phone}`} />} />
          <Group title="Menu items" rows={res.items} render={(i) => <Row key={i.id} onClick={() => go(`/items/${i.id}/edit`)} left={i.name} right={`${i.category} · ${money(i.price)}`} />} />
          <Group title="Orders" rows={res.orders} render={(o) => <Row key={o.id} onClick={() => go(`/orders/${o.id}/edit`)} left={`${o.ordername}${o.billNumber ? ` (${o.billNumber})` : ''}`} right={`${money(o.amount)} · ${o.status}`} />} />
        </div>
      )}
    </div>
  );
}

// ---------- quick order ----------
function QuickOrder({ onPlaced }) {
  const toast = useToast();
  const { refresh: refreshCart } = useCart();
  const { data: itemsRes, loading: li } = useFetch('/items', { all: true });
  const { data: custRes, loading: lc } = useFetch('/customers', { all: true });
  const [cat, setCat] = useState('All');
  const [term, setTerm] = useState('');
  const [basket, setBasket] = useState({}); // itemId -> qty
  const [customerno, setCustomerno] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const basketRef = useRef(null);

  const items = useMemo(() => (itemsRes?.data || []).filter((i) => i.isAvailable), [itemsRes]);
  const customers = custRes?.data || [];
  const cats = useMemo(() => ['All', ...new Set(items.map((i) => i.category))], [items]);
  const shown = items.filter((i) => (cat === 'All' || i.category === cat) && i.name.toLowerCase().includes(term.trim().toLowerCase()));
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const lines = Object.entries(basket).map(([id, qty]) => ({ item: byId.get(id), qty })).filter((l) => l.item);
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);

  const change = (id, d) => setBasket((b) => {
    const qty = Math.min(50, (b[id] || 0) + d);
    const next = { ...b };
    if (qty <= 0) delete next[id]; else next[id] = qty;
    return next;
  });

  const place = async () => {
    if (!customerno) return toast.error('Pehle customer select karo.');
    if (!lines.length) return toast.error('Kam se kam ek item add karo.');
    const customer = customers.find((c) => c.customerno === customerno);
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSaving(true);
    try {
      const { data } = await api.post('/orders', {
        ordername: `${customer?.name || customerno} - ${time}`,
        customerno,
        status: 'pending',
        notes: notes.trim() || undefined,
        items: lines.map((l) => ({ item: l.item.id, quantity: l.qty, itemStatus: 'pending' })),
      });
      toast.success(data.message || 'Order ban gaya.');
      setBasket({}); setNotes('');
      refreshCart();
      onPlaced();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const scrollToBasket = () => basketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="card lg:col-span-2">
      <div className="card-header flex-wrap gap-2">
        <h5 className="flex items-center gap-2"><Flame size={18} className="text-primary" /> Quick Order</h5>
        <Link to="/orders/new" className="text-xs font-medium text-primary hover:underline">Full order form <ArrowRight size={12} className="inline" /></Link>
      </div>
      <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 md:grid-cols-5">
        {/* menu */}
        <div className="min-w-0 md:col-span-3">
          <input className="input mb-3 text-base sm:text-sm" placeholder="Menu me dhundo..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <div className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition sm:px-3.5 sm:py-1 ${cat === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
            ))}
          </div>
          {li ? <p className="py-8 text-center text-sm text-gray-500">Menu load ho raha hai...</p>
            : shown.length === 0 ? <EmptyState icon={Utensils} title="Koi item nahi mila" />
            : (
              <div className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:max-h-80 sm:grid-cols-2">
                {shown.map((i) => (
                  <div key={i.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition ${basket[i.id] ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-gray-500">{money(i.price)}</p>
                    </div>
                    {basket[i.id] ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button type="button" className="icon-btn !h-9 !w-9 border-gray-300 sm:!h-7 sm:!w-7" onClick={() => change(i.id, -1)} aria-label="Kam karo"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm font-semibold">{basket[i.id]}</span>
                        <button type="button" className="icon-btn !h-9 !w-9 border-primary text-primary sm:!h-7 sm:!w-7" onClick={() => change(i.id, 1)} aria-label="Badhao"><Plus size={14} /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-outline btn-sm shrink-0" onClick={() => change(i.id, 1)}><Plus size={13} /> Add</button>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* basket */}
        <div ref={basketRef} className="flex scroll-mt-4 flex-col rounded-xl bg-gray-50 p-3 sm:p-4 md:col-span-2">
          <label className="label" htmlFor="qo-customer">Customer</label>
          <select id="qo-customer" className="input mb-3 text-base sm:text-sm" value={customerno} onChange={(e) => setCustomerno(e.target.value)} disabled={lc}>
            <option value="">{lc ? 'Loading...' : 'Select customer'}</option>
            {customers.map((c) => <option key={c.id} value={c.customerno}>{c.name} ({c.customerno})</option>)}
          </select>

          <div className="mb-3 min-h-24 flex-1 space-y-2 overflow-y-auto">
            {lines.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">Basket khaali hai. Menu se item add karo.</p>
              : lines.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{qty} × {item.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-medium">{money(qty * item.price)}</span>
                    <button type="button" onClick={() => change(item.id, -qty)} className="flex h-8 w-8 items-center justify-center text-gray-400 hover:text-red-600" aria-label={`${item.name} hatao`}><Trash2 size={15} /></button>
                  </span>
                </div>
              ))}
          </div>

          <input className="input mb-3 text-base sm:text-sm" placeholder="Notes (optional)" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="mb-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-600">{totalQty} item{totalQty === 1 ? '' : 's'}</span>
            <span className="text-lg font-bold">{money(total)}</span>
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={place} disabled={saving || !lines.length}>
            <Send size={15} /> {saving ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>

      {/* mobile floating basket bar (md se upar chhup jaata hai) */}
      {lines.length > 0 && (
        <button
          type="button"
          onClick={scrollToBasket}
          className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-2xl md:hidden"
        >
          <span className="flex items-center gap-2"><ShoppingCart size={16} /> {totalQty} item{totalQty === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-1">{money(total)} <ArrowRight size={14} /></span>
        </button>
      )}
    </div>
  );
}

// ---------- chhote widgets ----------
function Stat({ to, icon: Icon, label, value, sub, tone }) {
  return (
    <Link to={to} className="card group flex items-center gap-3 p-3 transition hover:-translate-y-1 hover:shadow-xl sm:gap-4 sm:p-5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${tone}`}><Icon size={20} /></span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">{label}</p>
        <p className="truncate text-lg font-bold sm:text-2xl">{value}</p>
        {sub && <p className="truncate text-[11px] text-gray-500 sm:text-xs">{sub}</p>}
      </div>
    </Link>
  );
}

function WeekChart({ week }) {
  const max = Math.max(...week.map((d) => d.sales), 1);
  const total = week.reduce((s, d) => s + d.sales, 0);
  return (
    <div className="card">
      <div className="card-header"><h5>Last 7 days</h5><span className="text-sm font-semibold text-primary">{money(total)}</span></div>
      <div className="card-body">
        <div className="flex h-32 items-end gap-1.5 sm:gap-2">
          {week.map((d, i) => {
            const day = new Date(`${d.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });
            return (
              <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${money(d.sales)} · ${d.orders} orders`}>
                <div className={`w-full rounded-t-md transition-all ${i === week.length - 1 ? 'bg-primary' : 'bg-secondary/60 group-hover:bg-secondary'}`} style={{ height: `${Math.max(4, (d.sales / max) * 100)}%` }} />
                <span className="text-[10px] text-gray-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const now = useNow();
  const tz = useMemo(() => new Date().getTimezoneOffset(), []);
  const { data, loading, error, reload } = useFetch('/home', { tzOffset: tz });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* hero */}
      <section className="relative rounded-2xl bg-cover bg-center px-4 py-8 text-center text-white sm:py-12" style={{ backgroundImage: "linear-gradient(rgba(20,10,50,.72),rgba(20,10,50,.72)), url('/img/bg5.jpg')" }}>
        <p className="mb-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs text-white/80 sm:text-sm">
          <Clock size={14} />
          <span>{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span>· {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </p>
        <h1 className="mb-2 break-words text-2xl font-bold drop-shadow-lg sm:text-3xl md:text-5xl">{greeting(now.getHours())}, {user?.name?.split(' ')[0]}</h1>
        <p className="mb-5 text-sm text-white/85 sm:mb-6 sm:text-base">Aaj ka cafe ek nazar me. Order lo, search karo, sab yahin se.</p>
        <GlobalSearch />
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading && !data ? Array.from({ length: 4 }, (_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100 sm:h-24" />) : data && (
          <>
            <Stat to="/orders" icon={Receipt} label="Orders today" value={num(data.today.orders)} sub="Cancelled ko chhodkar" tone="bg-violet-100 text-violet-700" />
            <Stat to="/reports" icon={IndianRupee} label="Sales today" value={money(data.today.sales)} tone="bg-emerald-100 text-emerald-700" />
            <Stat to="/staff/assign" icon={Flame} label="Active orders" value={num(data.activeOrders)} sub="Pending + processing" tone="bg-amber-100 text-amber-700" />
            <Stat to="/cart" icon={Wallet} label="Unpaid" value={money(data.unpaid.amount)} sub={`${num(data.unpaid.count)} order${data.unpaid.count === 1 ? '' : 's'} cart me`} tone="bg-rose-100 text-rose-700" />
          </>
        )}
      </section>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error} <button className="font-semibold underline" onClick={reload}>Try again</button></p>
      )}

      {/* quick order + side widgets */}
      <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <QuickOrder onPlaced={reload} />
        <div className="space-y-4 sm:space-y-6">
          {data && <WeekChart week={data.week} />}
          <div className="card">
            <div className="card-header"><h5 className="flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Top sellers (7 days)</h5></div>
            <div className="card-body">
              {!data || data.topItems.length === 0 ? <p className="py-3 text-center text-sm text-gray-500">Abhi koi sale nahi.</p> : (
                <ol className="space-y-3">
                  {data.topItems.map((t, i) => (
                    <li key={t._id || t.name} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                      <span className="shrink-0 text-xs text-gray-500">{num(t.quantity)} sold</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* recent orders */}
      <section className="card">
        <div className="card-header"><h5>Recent orders</h5><Link to="/orders" className="btn btn-outline btn-sm">View all</Link></div>
        {!data || data.recentOrders.length === 0 ? <EmptyState icon={Receipt} title="Abhi koi order nahi" /> : (
          <>
            {/* mobile: card list */}
            <ul className="divide-y divide-gray-100 md:hidden">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/orders/${o.id}/edit`} className="block truncate text-sm font-medium text-primary hover:underline">{o.ordername}</Link>
                      <p className="truncate text-xs text-gray-500">{o.customerno}{o.billNumber ? ` · ${o.billNumber}` : ''}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{money(o.amount)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge value={o.status} />
                    <Badge value={o.paymentStatus} />
                    <span className="ml-auto text-xs text-gray-500">{timeAgo(o.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* tablet / desktop: table */}
            <div className="table-wrap hidden overflow-x-auto md:block">
              <table className="table">
                <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Payment</th><th>Placed</th></tr></thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><Link to={`/orders/${o.id}/edit`} className="font-medium text-primary hover:underline">{o.ordername}</Link>{o.billNumber && <p className="text-xs text-gray-500">{o.billNumber}</p>}</td>
                      <td>{o.customerno}</td>
                      <td className="whitespace-nowrap">{money(o.amount)}</td>
                      <td><Badge value={o.status} /></td>
                      <td><Badge value={o.paymentStatus} /></td>
                      <td className="whitespace-nowrap text-gray-500">{timeAgo(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* shortcuts */}
      <section className="grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3 md:pb-0 lg:grid-cols-6">
        {tiles.map(({ to, icon: Icon, title }) => (
          <Link key={to} to={to} className="card flex flex-col items-center gap-2 p-4 text-center text-sm font-medium transition hover:-translate-y-1 hover:shadow-xl">
            <Icon size={26} className="text-primary" />{title}
          </Link>
        ))}
        <Link to="/cart" className="card col-span-2 flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary transition hover:-translate-y-1 hover:shadow-xl sm:col-span-3 lg:hidden"><ShoppingCart size={18} /> View Cart</Link>
      </section>
    </div>
  );
}