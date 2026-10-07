import { Link } from 'react-router-dom';
import { Users, Utensils, Receipt, UserCheck, ClipboardCheck, PlusCircle, AlertTriangle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch.js';
import DataState from '../components/DataState.jsx';
import { timeAgo, num } from '../utils/format.js';

const gradients = ['from-[#ff6a00] to-[#ee0979]', 'from-[#43cea2] to-[#185a9d]', 'from-[#00b09b] to-[#96c93d]', 'from-[#7f00ff] to-[#e100ff]'];

export default function Dashboard() {
  const { data: d, loading, error, reload } = useFetch('/dashboard');

  return (
    <DataState loading={loading} error={error} onRetry={reload}>
      {d && (
        <div className="space-y-4 sm:space-y-6">
          {/* hero */}
          <section className="card overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center md:gap-6">
              <div className="max-w-2xl">
                <span className="mb-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary sm:text-xs">Cafe Express Control Center</span>
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Operations Dashboard</h1>
                <p className="mb-4 text-sm text-gray-600 sm:mb-5 sm:text-base">Orders, staff assignments aur restaurant flow ko ek hi jagah se track karo. Unassigned orders dekho, staff assign karo aur recent allocations monitor karo.</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link to="/staff/assign" className="btn btn-primary w-full sm:w-auto"><ClipboardCheck size={16} /> Assign Orders</Link>
                  <Link to="/orders" className="btn btn-outline w-full sm:w-auto"><Receipt size={16} /> View Orders</Link>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow md:block md:p-6 md:text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority Queue</p>
                  <p className="my-1 hidden text-5xl font-bold text-red-600 md:block">{d.unassignedOrders}</p>
                  <p className="max-w-52 text-sm text-gray-500">Active orders abhi staff assignment ka wait kar rahe hain.</p>
                </div>
                <p className="shrink-0 text-4xl font-bold text-red-600 md:hidden">{d.unassignedOrders}</p>
              </div>
            </div>
          </section>

          {/* stats */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[['Total Customers', Users, d.totalCustomers], ['Menu Items', Utensils, d.totalItems], ['Total Orders', Receipt, d.totalOrders], ['Staff Members', UserCheck, d.totalStaff]].map(([title, Icon, value], i) => (
              <div key={title} className="card flex flex-col items-center justify-center gap-1.5 p-4 text-center sm:gap-2 sm:p-6">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br sm:h-12 sm:w-12 ${gradients[i]} text-white`}><Icon size={20} /></span>
                <p className="text-xs text-gray-500 sm:text-sm">{title}</p>
                <p className="text-2xl font-bold sm:text-3xl">{num(value)}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* staff assignment overview */}
            <div className="card min-w-0 lg:col-span-2">
              <div className="card-header"><h5>Staff Assignment Overview</h5><Link to="/staff/assign" className="btn btn-outline btn-sm">Manage</Link></div>
              <div className="card-body">
                <div className="mb-4 grid grid-cols-3 gap-2 text-center sm:mb-5 sm:gap-3">
                  {[['Active Orders', d.activeOrders, 'text-primary'], ['Unassigned', d.unassignedOrders, 'text-red-600'], ['Completed', d.completedOrders, 'text-emerald-600']].map(([label, v, color]) => (
                    <div key={label} className="rounded-xl bg-gray-50 p-2.5 sm:p-4">
                      <p className="truncate text-[10px] uppercase text-gray-500 sm:text-xs">{label}</p>
                      <p className={`text-xl font-bold sm:text-2xl ${color}`}>{v}</p>
                    </div>
                  ))}
                </div>
                {d.recentAssignments.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">Abhi tak koi assigned order record nahin hai.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {d.recentAssignments.map((o) => (
                      <li key={o.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{o.ordername}</p>
                          <p className="text-xs text-gray-500">Customer {o.customerno} | Qty {o.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:block sm:text-right">
                          <p className="truncate text-sm font-medium text-primary">{o.assignmentName}</p>
                          <p className="shrink-0 text-xs text-gray-500">{timeAgo(o.assignedAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* quick actions */}
            <div className="card">
              <div className="card-header"><h5>Quick Actions</h5></div>
              <div className="card-body space-y-2">
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1">
                  <Link to="/orders/new" className="btn btn-primary w-full"><PlusCircle size={16} /> Create Order</Link>
                  <Link to="/staff/assign" className="btn btn-outline w-full"><ClipboardCheck size={16} /> Assign Staff</Link>
                  <Link to="/customers" className="btn btn-secondary w-full"><Users size={16} /> Customers</Link>
                  <Link to="/items" className="btn btn-secondary w-full"><Utensils size={16} /> Menu Items</Link>
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="mb-1 flex items-center gap-2 font-semibold text-amber-800"><AlertTriangle size={16} className="shrink-0" /> Need attention: {d.unassignedOrders}</p>
                  <p className="text-amber-800/80">Unassigned orders ko &quot;Assign Orders&quot; se turant staff ke saath map kar sakte ho.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </DataState>
  );
}