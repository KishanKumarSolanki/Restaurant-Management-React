import { Flame, Crown, CalendarDays, PieChart } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataState from '../components/DataState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { money, cap, fmtDate } from '../utils/format.js';

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="card h-full">
      <div className="card-header"><h5 className="flex items-center gap-2"><Icon size={18} /> {title}</h5></div>
      <div className="card-body table-wrap">{children}</div>
    </div>
  );
}
const Empty = ({ cols, text }) => <tr><td colSpan={cols} className="text-center text-gray-500">{text}</td></tr>;

export default function Reports() {
  const { data: r, loading, error, reload } = useFetch('/reports');
  const max = r ? Math.max(1, ...r.recentSales.map((x) => x.dailyRevenue)) : 1;

  return (
    <>
      <PageHeader title="Reports & Analytics" crumbs={[{ label: 'Reports' }]} />
      <DataState loading={loading} error={error} onRetry={reload}>
        {r && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[['Total Revenue', money(r.salesSummary.totalRevenue)], ['Completed Orders', r.salesSummary.completedOrders], ['Avg Order Value', money(r.salesSummary.averageOrderValue)], ['Pending Orders', r.salesSummary.pendingOrders]].map(([label, v]) => (
                <div key={label} className="card p-5"><p className="text-xs uppercase text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{v}</p></div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel icon={PieChart} title="Status Breakdown">
                <table className="table"><thead><tr><th>Status</th><th>Total Orders</th></tr></thead><tbody>
                  {r.statusBreakdown.length === 0 ? <Empty cols={2} text="No orders yet." /> : r.statusBreakdown.map((s) => <tr key={s.status}><td>{cap(s.status)}</td><td>{s.total}</td></tr>)}
                </tbody></table>
              </Panel>
              <Panel icon={Flame} title="Top Selling Items">
                <table className="table"><thead><tr><th>Item</th><th>Qty Sold</th><th>Sales</th></tr></thead><tbody>
                  {r.topItems.length === 0 ? <Empty cols={3} text="No sales data available." /> : r.topItems.map((i) => <tr key={i.itemId}><td>{i.name || 'Deleted Item'}</td><td>{i.totalQuantity}</td><td>{money(i.totalSales)}</td></tr>)}
                </tbody></table>
              </Panel>
              <Panel icon={Crown} title="Top Customers">
                <table className="table"><thead><tr><th>Customer No</th><th>Orders</th><th>Total Spent</th></tr></thead><tbody>
                  {r.topCustomers.length === 0 ? <Empty cols={3} text="No customer spending data available." /> : r.topCustomers.map((c) => <tr key={c.customerno}><td>{c.customerno}</td><td>{c.totalOrders}</td><td>{money(c.totalSpent)}</td></tr>)}
                </tbody></table>
              </Panel>
              <Panel icon={CalendarDays} title="Recent Daily Sales">
                <table className="table"><thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
                  {r.recentSales.length === 0 ? <Empty cols={3} text="No sales data available." /> : r.recentSales.map((d) => (
                    <tr key={d.saleDate}>
                      <td>{fmtDate(d.saleDate)}</td><td>{d.ordersCount}</td>
                      <td><div>{money(d.dailyRevenue)}</div><div className="mt-1 h-1.5 rounded bg-gray-100"><div className="h-1.5 rounded bg-primary" style={{ width: `${(d.dailyRevenue / max) * 100}%` }} /></div></td>
                    </tr>
                  ))}
                </tbody></table>
              </Panel>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}
