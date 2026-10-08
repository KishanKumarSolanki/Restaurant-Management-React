import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, CookingPot, LogOut, Utensils } from 'lucide-react';
import Badge from '../../../components/Badge.jsx';
import DataState, { EmptyState } from '../../../components/DataState.jsx';
import api, { errorMessage } from '../../../api/client.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { money } from '../../../utils/format.js';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch('/staff/orders');
  const toast = useToast();
  const [busyOrder, setBusyOrder] = useState('');
  const orders = data?.data || [];
  const role = user?.role?.trim().toLowerCase();
  const canMarkReady = ['cook', 'chef', 'kitchen'].includes(role);
  const canMarkServed = ['waiter', 'server'].includes(role);

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

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-ink"><Utensils size={20} /> Cafe Express</div>
            <p className="mt-1 text-sm text-gray-500">{user?.name} · {user?.role}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={signOut}><LogOut size={15} /> Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-ink">Staff Dashboard</h1>
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
                    {canMarkReady && order.fulfillmentStatus === 'preparing' && (
                      <button className="btn btn-primary btn-sm" disabled={busyOrder === order.id} onClick={() => updateStatus(order, 'ready')}>
                        <CookingPot size={15} /> {busyOrder === order.id ? 'Updating...' : 'Mark order ready'}
                      </button>
                    )}
                    {canMarkServed && order.fulfillmentStatus === 'ready' && (
                      <button className="btn btn-primary btn-sm" disabled={busyOrder === order.id} onClick={() => updateStatus(order, 'served')}>
                        <CheckCircle2 size={15} /> {busyOrder === order.id ? 'Updating...' : 'Mark as served'}
                      </button>
                    )}
                    {order.fulfillmentStatus === 'served' && <p className="text-sm font-medium text-emerald-700">Served — waiting for admin approval</p>}
                    {order.fulfillmentStatus === 'preparing' && !canMarkReady && <p className="text-sm text-gray-500">Waiting for kitchen staff</p>}
                    {order.fulfillmentStatus === 'ready' && !canMarkServed && <p className="text-sm text-gray-500">Waiting for waiter service</p>}
                    {!canMarkReady && !canMarkServed && order.fulfillmentStatus !== 'served' && <p className="text-sm text-gray-500">View-only access for this role</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </DataState>
      </main>
    </div>
  );
}