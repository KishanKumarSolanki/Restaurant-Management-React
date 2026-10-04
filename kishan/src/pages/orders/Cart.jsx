import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, PlusCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import api, { errorMessage } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { money, cap } from '../../utils/format.js';

function CartRow({ order, onSaved }) {
  const toast = useToast();
  const [method, setMethod] = useState(order.paymentMethod || 'cash');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      toast.success((await api.patch(`/orders/${order.id}/payment`, { paymentMethod: method })).data.message);
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid items-center gap-4 rounded-xl border border-gray-200 p-4 lg:grid-cols-12">
      <div className="lg:col-span-3"><p className="text-xs uppercase text-gray-500">Customer</p><p className="font-semibold">{order.customerno}</p><p className="text-xs text-gray-500">{order.ordername}{order.billNumber ? ` | ${order.billNumber}` : ''}</p></div>
      <div className="lg:col-span-4"><p className="text-xs uppercase text-gray-500">Order Items</p><p>{order.items.map((i) => i.itemName).join(', ') || 'No items'}</p><p className="text-xs text-gray-500">Qty {order.quantity}</p></div>
      <div className="lg:col-span-2"><p className="text-xs uppercase text-gray-500">Amount</p><p className="font-semibold">{money(order.amount)}</p></div>
      <div className="lg:col-span-3">
        <div className="flex gap-2">
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}><option value="cash">Cash</option><option value="online">Online</option></select>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button>
        </div>
        <p className="mt-1 text-xs text-gray-500">Payment: {order.paymentMethod ? cap(order.paymentMethod) : 'Pending'}</p>
      </div>
    </div>
  );
}

export default function Cart() {
  const { data, loading, error, reload } = useFetch('/orders/cart');
  const cart = useCart();
  const orders = data?.data || [];
  const done = () => { reload(); cart.refresh(); };

  return (
    <>
      <PageHeader title="Cart" crumbs={[{ label: 'Cart' }]} />
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl bg-primary px-5 py-4 text-white">
          <h4 className="flex items-center gap-2 text-lg font-semibold"><ShoppingCart size={20} /> Customer Orders In Cart</h4>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-800">{orders.length} in cart</span>
            <Link to="/orders/new" className="btn btn-light btn-sm"><PlusCircle size={14} /> Create Order</Link>
          </div>
        </div>
        <div className="card-body">
          <DataState loading={loading && !data} error={error} onRetry={reload}>
            {orders.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingCart size={44} className="mx-auto mb-3 text-gray-300" />
                <h5 className="text-lg text-gray-500">Abhi cart me koi order nahin hai.</h5>
                <p className="mb-3 text-sm text-gray-500">Jo order create karoge, woh yahan sidha show hoga.</p>
                <Link to="/orders/new" className="btn btn-primary"><PlusCircle size={16} /> Create Order</Link>
              </div>
            ) : <div className="space-y-3">{orders.map((o) => <CartRow key={o.id} order={o} onSaved={done} />)}</div>}
          </DataState>
        </div>
      </div>
    </>
  );
}
