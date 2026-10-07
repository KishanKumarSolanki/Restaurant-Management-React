import { useState } from 'react';
import { CheckCircle2, ClipboardList, CookingPot } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import api, { errorMessage } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { money } from '../../utils/format.js';

export default function MyOrders() {
  const { data, loading, error, reload } = useFetch('/staff/orders');
  const toast = useToast();
  const [busyOrder, setBusyOrder] = useState('');
  const orders = data?.data || [];

  const updateStatus = async (order, fulfillmentStatus) => {
    setBusyOrder(order.id);
    try {
      toast.success((await api.patch(`/staff/orders/${order.id}/fulfillment`, { fulfillmentStatus })).data.message);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyOrder('');
    }
  };

  return (
    <>
      <PageHeader title="My Assigned Orders" crumbs={[{ label: 'Staff', to: '/staff-members' }, { label: 'My Assigned Orders' }]} />
      <DataState loading={loading && !data} error={error} onRetry={reload}>
        {data && (orders.length === 0
          ? <EmptyState icon={ClipboardList} title="No Active Orders Assigned">Orders assigned to you will appear here.</EmptyState>
          : <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <article key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{order.ordername}</h2>
                    <p className="text-sm text-gray-500">{order.customerno}{order.billNumber ? ` · ${order.billNumber}` : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge value={order.status} />
                    <Badge value={order.fulfillmentStatus || 'preparing'} />
                  </div>
                </div>
                <div className="my-4 space-y-2 border-y border-gray-100 py-3">
                  {order.items.map((item) => (
                    <div key={item.id || item._id} className="flex justify-between gap-3 text-sm">
                      <span>{item.quantity}× {item.itemName}</span>
                      <span>{money(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                {order.assignmentNotes && <p className="mb-3 text-sm text-gray-600"><strong>Notes:</strong> {order.assignmentNotes}</p>}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>Total: {money(order.amount)}</strong>
                  {order.fulfillmentStatus === 'preparing' && (
                    <button className="btn btn-primary btn-sm" disabled={busyOrder === order.id} onClick={() => updateStatus(order, 'ready')}>
                      <CookingPot size={15} /> {busyOrder === order.id ? 'Updating...' : 'Mark order ready'}
                    </button>
                  )}
                  {order.fulfillmentStatus === 'ready' && (
                    <button className="btn btn-primary btn-sm" disabled={busyOrder === order.id} onClick={() => updateStatus(order, 'served')}>
                      <CheckCircle2 size={15} /> {busyOrder === order.id ? 'Updating...' : 'Mark as served'}
                    </button>
                  )}
                  {order.fulfillmentStatus === 'served' && <p className="text-sm font-medium text-emerald-700">Served — waiting for admin approval</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </DataState>
    </>
  );
}
