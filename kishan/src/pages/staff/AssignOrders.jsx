import { useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { Select, Textarea } from '../../components/Field.jsx';
import api, { errorMessage, fieldErrors } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { money, timeAgo } from '../../utils/format.js';

export default function AssignOrders() {
  const { data, loading, error, reload } = useFetch('/staff-assignments');
  const toast = useToast();
  const [form, setForm] = useState({ order: '', assignedTo: '', assignmentNotes: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [approving, setApproving] = useState('');
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      toast.success((await api.post('/staff-assignments', form)).data.message);
      setForm({ order: '', assignedTo: '', assignmentNotes: '' });
      reload();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const approve = async (order) => {
    setApproving(order.id);
    try {
      toast.success((await api.patch(`/orders/${order.id}/approve`)).data.message);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApproving('');
    }
  };

  return (
    <>
      <PageHeader title="Assign Orders to Staff" crumbs={[{ label: 'Staff Members', to: '/staff-members' }, { label: 'Assign Orders' }]} />
      <DataState loading={loading && !data} error={error} onRetry={reload}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Active Orders', data.stats.activeOrders, 'text-primary'], ['Unassigned', data.stats.unassignedOrders, 'text-red-600'], ['Assigned Today', data.stats.assignedToday, 'text-emerald-600']].map(([label, v, c]) => (
                <div key={label} className="card p-5"><p className="text-xs uppercase text-gray-500">{label}</p><p className={`mt-1 text-3xl font-bold ${c}`}>{v}</p></div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <form onSubmit={submit} className="card h-fit space-y-4 p-5">
                <h5 className="flex items-center gap-2 font-semibold"><ClipboardCheck size={18} className="text-primary" /> New Assignment</h5>
                <Select label="Order" name="order" value={form.order} onChange={set} error={errors.order}>
                  <option value="">Select order</option>
                  {data.orders.map((o) => <option key={o.id} value={o.id}>{o.ordername} - {o.customerno}</option>)}
                </Select>
                <Select label="Staff Member" name="assignedTo" value={form.assignedTo} onChange={set} error={errors.assignedTo}>
                  <option value="">Select staff</option>
                  {data.staffMembers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </Select>
                <Textarea label="Notes" name="assignmentNotes" value={form.assignmentNotes} onChange={set} error={errors.assignmentNotes} />
                <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Assigning...' : 'Assign Order'}</button>
              </form>

              <div className="card lg:col-span-2">
                <div className="card-header"><h5>Active Orders</h5></div>
                <div className="card-body table-wrap">
                  {data.orders.length === 0 ? <p className="py-6 text-center text-gray-500">No active orders.</p> : (
                    <table className="table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Kitchen / Service</th><th>Assigned To</th><th>Approval</th></tr></thead>
                      <tbody>
                        {data.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="font-medium">{o.ordername}</td>
                            <td>{o.customerno}</td>
                            <td>{money(o.amount)}</td>
                            <td><Badge value={o.status} /></td>
                            <td><Badge value={o.fulfillmentStatus || 'preparing'} /></td>
                            <td>{o.assignmentName
                              ? <><div className="text-primary">{o.assignmentName}</div><div className="text-xs text-gray-500">{timeAgo(o.assignedAt)}</div></>
                              : <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">Unassigned</span>}</td>
                            <td>{o.fulfillmentStatus === 'served'
                              ? <button className="btn btn-primary btn-sm" disabled={approving === o.id} onClick={() => approve(o)}><CheckCircle2 size={14} /> {approving === o.id ? 'Approving...' : 'Approve complete'}</button>
                              : <span className="text-xs text-gray-500">Available after serving</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}
