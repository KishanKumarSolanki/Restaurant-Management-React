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
          <div className="space-y-4 sm:space-y-6">
            {/* summary cards: mobile par 2x2 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[['Total Orders', data.summary.totalOrders], ['Completed', data.summary.completedOrders], ['Active', data.summary.activeOrders], ['Total Spent', money(data.summary.totalSpent)]].map(([label, value]) => (
                <div key={label} className="card min-w-0 p-3 sm:p-5">
                  <p className="truncate text-[11px] uppercase text-gray-500 sm:text-xs">{label}</p>
                  <p className="mt-1 truncate text-lg font-bold sm:text-2xl">{value}</p>
                </div>
              ))}
            </div>

            {/* profile */}
            <div className="card">
              <div className="card-header"><h5>Profile</h5></div>
              <div className="card-body grid gap-3 text-sm sm:gap-4 md:grid-cols-2">
                <p className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-primary" /> <a href={`tel:${c.phone}`} className="break-all hover:underline">{c.phone}</a></p>
                <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" /> <span className="min-w-0 break-words">{c.address}</span></p>
                <div className="min-w-0"><p className="text-xs uppercase text-gray-500">Notes</p><p className="break-words">{c.notes || '-'}</p></div>
                <div className="min-w-0"><p className="text-xs uppercase text-gray-500">Preferences</p><p className="break-words">{c.preferences || '-'}</p></div>
                <div className="min-w-0 md:col-span-2"><p className="text-xs uppercase text-gray-500">Feedback</p><p className="break-words">{c.feedback || '-'}</p></div>
              </div>
            </div>

            {/* order history */}
            <div className="card">
              <div className="card-header"><h5>Order History</h5></div>
              <div className="card-body !px-0 sm:!px-5">
                {data.orders.data.length === 0 ? <p className="py-6 text-center text-gray-500">No orders yet.</p> : (
                  <>
                    {/* mobile: card list */}
                    <ul className="divide-y divide-gray-100 md:hidden">
                      {data.orders.data.map((o) => (
                        <li key={o.id} className="space-y-1.5 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 break-words text-sm font-medium">{o.ordername}</p>
                            <span className="shrink-0 text-sm font-semibold">{money(o.amount)}</span>
                          </div>
                          <p className="break-words text-xs text-gray-500">{o.items.map((i) => i.itemName).join(', ') || '-'}</p>
                          <div className="flex items-center justify-between gap-2">
                            <Badge value={o.status} />
                            <span className="text-xs text-gray-500">Qty {o.quantity}</span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* tablet / desktop: table */}
                    <div className="table-wrap hidden overflow-x-auto md:block">
                      <table className="table">
                        <thead><tr><th>Order</th><th>Items</th><th>Qty</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                          {data.orders.data.map((o) => (
                            <tr key={o.id}>
                              <td className="font-medium">{o.ordername}</td>
                              <td className="max-w-64 truncate">{o.items.map((i) => i.itemName).join(', ') || '-'}</td>
                              <td>{o.quantity}</td><td className="whitespace-nowrap">{money(o.amount)}</td><td><Badge value={o.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                <div className="px-4 sm:px-0"><Pagination meta={data.orders.meta} onChange={setPage} /></div>
              </div>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}