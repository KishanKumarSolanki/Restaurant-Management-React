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

  // bahar click karne par band + "/" dabane par focus
  useEffect(() => {
    const onClick = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); input.current?.focus(); }
      if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  const go = (path) => { setOpen(false); setQ(''); navigate(path); };
  const empty = res && !res.customers.length && !res.items.length && !res.orders.length;

  const Group = ({ title, rows, render }) => rows.length > 0 && (
    <div className="py-1">
      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      {rows.map(render)}
    </div>
  );
  const Row = ({ onClick, left, right }) => (
    <button key={left} type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-50">
      <span className="truncate">{left}</span><span className="shrink-0 text-xs text-gray-500">{right}</span>
    </button>
  );

  return (
    <div ref={box} className="relative mx-auto w-full max-w-xl text-left">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        ref={input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => res && setOpen(true)}
        placeholder="Search customers, menu items, orders...  ( / )"
        className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-10 text-sm text-gray-900 shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/40"
      />
      {q && (
        <button type="button" onClick={() => { setQ(''); setRes(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search"><X size={16} /></button>
      )}
      {open && res && (
        <div className="absolute z-30 mt-2 max-h-96 w-full overflow-y-auto rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black/5">
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

  return (
    <div className="card lg:col-span-2">
      <div className="card-header">
        <h5 className="flex items-center gap-2"><Flame size={18} className="text-primary" /> Quick Order</h5>
        <Link to="/orders/new" className="text-xs font-medium text-primary hover:underline">Full order form <ArrowRight size={12} className="inline" /></Link>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-5">
        {/* menu */}
        <div className="md:col-span-3">
          <input className="input mb-3" placeholder="Menu me dhundo..." value={term} onChange={(e) => setTerm(e.target.value)} />
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition ${cat === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
            ))}
          </div>
          {li ? <p className="py-8 text-center text-sm text-gray-500">Menu load ho raha hai...</p>
            : shown.length === 0 ? <EmptyState icon={Utensils} title="Koi item nahi mila" />
            : (
              <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {shown.map((i) => (
                  <div key={i.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition ${basket[i.id] ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-gray-500">{money(i.price)}</p>
                    </div>
                    {basket[i.id] ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button type="button" className="icon-btn !h-7 !w-7 border-gray-300" onClick={() => change(i.id, -1)} aria-label="Kam karo"><Minus size={13} /></button>
                        <span className="w-5 text-center text-sm font-semibold">{basket[i.id]}</span>
                        <button type="button" className="icon-btn !h-7 !w-7 border-primary text-primary" onClick={() => change(i.id, 1)} aria-label="Badhao"><Plus size={13} /></button>
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
        <div className="flex flex-col rounded-xl bg-gray-50 p-4 md:col-span-2">
          <label className="label" htmlFor="qo-customer">Customer</label>
          <select id="qo-customer" className="input mb-3" value={customerno} onChange={(e) => setCustomerno(e.target.value)} disabled={lc}>
            <option value="">{lc ? 'Loading...' : 'Select customer'}</option>
            {customers.map((c) => <option key={c.id} value={c.customerno}>{c.name} ({c.customerno})</option>)}
          </select>

          <div className="mb-3 min-h-24 flex-1 space-y-1.5 overflow-y-auto">
            {lines.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">Basket khaali hai. Menu se item add karo.</p>
              : lines.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{qty} × {item.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-medium">{money(qty * item.price)}</span>
                    <button type="button" onClick={() => change(item.id, -qty)} className="text-gray-400 hover:text-red-600" aria-label={`${item.name} hatao`}><Trash2 size={14} /></button>
                  </span>
                </div>
              ))}
          </div>

          <input className="input mb-3" placeholder="Notes (optional)" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="mb-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-600">{totalQty} item{totalQty === 1 ? '' : 's'}</span>
            <span className="text-lg font-bold">{money(total)}</span>
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={place} disabled={saving || !lines.length}>
            <Send size={15} /> {saving ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- chhote widgets ----------
function Stat({ to, icon: Icon, label, value, sub, tone }) {
  return (
    <Link to={to} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={22} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="truncate text-2xl font-bold">{value}</p>
        {sub && <p className="truncate text-xs text-gray-500">{sub}</p>}
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
        <div className="flex h-32 items-end gap-2">
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
    <div className="space-y-6">
      {/* hero */}
      <section className="relative rounded-2xl bg-cover bg-center px-4 py-12 text-center text-white" style={{ backgroundImage: "linear-gradient(rgba(20,10,50,.72),rgba(20,10,50,.72)), url('/img/bg5.jpg')" }}>
        <p className="mb-1 flex items-center justify-center gap-2 text-sm text-white/80">
          <Clock size={14} />
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <h1 className="mb-2 text-3xl font-bold drop-shadow-lg md:text-5xl">{greeting(now.getHours())}, {user?.name?.split(' ')[0]}</h1>
        <p className="mb-6 text-white/85">Aaj ka cafe ek nazar me. Order lo, search karo, sab yahin se.</p>
        <GlobalSearch />
      </section>

      {/* stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !data ? Array.from({ length: 4 }, (_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />) : data && (
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
      <section className="grid gap-6 lg:grid-cols-3">
        <QuickOrder onPlaced={reload} />
        <div className="space-y-6">
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
          <div className="table-wrap">
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
        )}
      </section>

      {/* shortcuts */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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