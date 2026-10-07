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

  // mobile: [Customer | Amount] / Items / Payment  ->  lg: ek row me 12 columns
  return (
    <div className="grid grid-cols-2 items-start gap-x-3 gap-y-3 rounded-xl border border-gray-200 p-3 sm:p-4 lg:grid-cols-12 lg:items-center lg:gap-4">
      <div className="order-1 min-w-0 lg:order-none lg:col-span-3">
        <p className="text-xs uppercase text-gray-500">Customer</p>
        <p className="break-words font-semibold">{order.customerno}</p>
        <p className="break-words text-xs text-gray-500">{order.ordername}{order.billNumber ? ` | ${order.billNumber}` : ''}</p>
      </div>

      <div className="order-2 text-right lg:order-none lg:col-span-2 lg:text-left">
        <p className="text-xs uppercase text-gray-500">Amount</p>
        <p className="text-lg font-semibold lg:text-base">{money(order.amount)}</p>
      </div>

      <div className="order-3 col-span-2 min-w-0 lg:order-none lg:col-span-4">
        <p className="text-xs uppercase text-gray-500">Order Items</p>
        <p className="break-words text-sm sm:text-base">{order.items.map((i) => i.itemName).join(', ') || 'No items'}</p>
        <p className="text-xs text-gray-500">Qty {order.quantity}</p>
      </div>

      <div className="order-4 col-span-2 border-t border-gray-100 pt-3 lg:order-none lg:col-span-3 lg:border-0 lg:pt-0">
        <div className="flex gap-2">
          <select className="input min-w-0 flex-1 text-base sm:text-sm" aria-label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
          <button className="btn btn-primary shrink-0 px-5" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button>
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
        <div className="flex flex-col gap-3 rounded-t-xl bg-primary px-4 py-3 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <h4 className="flex items-center gap-2 text-base font-semibold sm:text-lg"><ShoppingCart size={20} className="shrink-0" /> Customer Orders In Cart</h4>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-800">{orders.length} in cart</span>
            <Link to="/orders/new" className="btn btn-light btn-sm whitespace-nowrap"><PlusCircle size={14} /> Create Order</Link>
          </div>
        </div>
        <div className="card-body !p-3 sm:!p-5">
          <DataState loading={loading && !data} error={error} onRetry={reload}>
            {orders.length === 0 ? (
              <div className="py-8 text-center sm:py-10">
                <ShoppingCart size={44} className="mx-auto mb-3 text-gray-300" />
                <h5 className="text-base text-gray-500 sm:text-lg">Abhi cart me koi order nahin hai.</h5>
                <p className="mb-3 text-sm text-gray-500">Jo order create karoge, woh yahan sidha show hoga.</p>
                <Link to="/orders/new" className="btn btn-primary w-full sm:w-auto"><PlusCircle size={16} /> Create Order</Link>
              </div>
            ) : <div className="space-y-3">{orders.map((o) => <CartRow key={o.id} order={o} onSaved={done} />)}</div>}
          </DataState>
        </div>
      </div>
    </>
  );
}