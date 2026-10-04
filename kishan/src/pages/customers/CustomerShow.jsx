import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Phone, MapPin } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import DataState from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { money } from '../../utils/format.js';

export default function CustomerShow() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(`/customers/${id}/details`, { page });
  const c = data?.customer;

  return (
    <>
      <PageHeader title={c ? c.name : 'Customer'} crumbs={[{ label: 'Customers', to: '/customers' }, { label: c?.customerno || 'Details' }]} actions={c && <Link to={`/customers/${id}/edit`} className="btn btn-primary btn-sm"><Pencil size={14} /> Edit</Link>} />
      <DataState loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[['Total Orders', data.summary.totalOrders], ['Completed', data.summary.completedOrders], ['Active', data.summary.activeOrders], ['Total Spent', money(data.summary.totalSpent)]].map(([label, value]) => (
                <div key={label} className="card p-5"><p className="text-xs uppercase text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><h5>Profile</h5></div>
              <div className="card-body grid gap-4 text-sm md:grid-cols-2">
                <p className="flex items-center gap-2"><Phone size={16} className="text-primary" /> {c.phone}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {c.address}</p>
                <div><p className="text-xs uppercase text-gray-500">Notes</p><p>{c.notes || '-'}</p></div>
                <div><p className="text-xs uppercase text-gray-500">Preferences</p><p>{c.preferences || '-'}</p></div>
                <div className="md:col-span-2"><p className="text-xs uppercase text-gray-500">Feedback</p><p>{c.feedback || '-'}</p></div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h5>Order History</h5></div>
              <div className="card-body">
                {data.orders.data.length === 0 ? <p className="py-6 text-center text-gray-500">No orders yet.</p> : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Order</th><th>Items</th><th>Qty</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {data.orders.data.map((o) => (
                          <tr key={o.id}>
                            <td className="font-medium">{o.ordername}</td>
                            <td className="max-w-64 truncate">{o.items.map((i) => i.itemName).join(', ') || '-'}</td>
                            <td>{o.quantity}</td><td>{money(o.amount)}</td><td><Badge value={o.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination meta={data.orders.meta} onChange={setPage} />
              </div>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}
