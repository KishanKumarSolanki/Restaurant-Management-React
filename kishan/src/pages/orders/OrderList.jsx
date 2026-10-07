import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api, { errorMessage } from '../../api/client.js';
import { money } from '../../utils/format.js';

export default function OrderList() {
  const l = useCrudList('/orders');
  const cart = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [approving, setApproving] = useState('');
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const approve = async (order) => {
    setApproving(order.id);
    try {
      toast.success((await api.patch(`/orders/${order.id}/approve`)).data.message);
      await l.reload();
      cart.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setApproving('');
    }
  };

  return (
    <>
      <PageHeader title="Order List" crumbs={[{ label: 'Orders' }]} actions={<Link to="/orders/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Create Order</Link>} />
      <div className="card">
        <div className="card-header"><h5 className="flex items-center gap-2"><ClipboardList size={18} /> Order Management</h5></div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No Orders Found"><Link to="/orders/new" className="btn btn-primary btn-sm mt-2">Create First Order</Link></EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>#</th><th>Order</th><th>Customer No</th><th>Assigned Staff</th><th>Items</th><th>Qty</th><th>Amount</th><th>Kitchen / Service</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((o, i) => (
                      <tr key={o.id}>
                        <td>{(l.meta.page - 1) * l.meta.limit + i + 1}</td>
                        <td className="font-medium">{o.ordername}{o.billNumber && <div className="text-xs font-normal text-gray-500">{o.billNumber}</div>}</td>
                        <td>{o.customerno}</td>
                        <td>{o.assignmentName
                          ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs text-sky-800">{o.assignmentName}</span>
                          : <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs">Unassigned</span>}</td>
                        <td><div className="font-medium">{o.items.length} items</div><div className="max-w-52 truncate text-xs text-gray-500">{o.items.slice(0, 2).map((x) => x.itemName).join(', ') || 'No line items'}</div></td>
                        <td>{o.quantity}</td>
                        <td>{money(o.amount)}</td>
                        <td><Badge value={o.fulfillmentStatus || 'preparing'} /></td>
                        <td><Badge value={o.status} /></td>
                        <td>
                          <div className="flex justify-end gap-1">
                            {isAdmin && o.fulfillmentStatus === 'served' && o.status !== 'completed' && (
                              <button className="btn btn-primary btn-sm" disabled={approving === o.id} onClick={() => approve(o)} title="Approve and complete order">
                                <CheckCircle2 size={14} /> {approving === o.id ? 'Approving...' : 'Complete'}
                              </button>
                            )}
                            <Link to={`/orders/${o.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
                            <button onClick={() => l.setToDelete(o)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination meta={l.meta} onChange={l.setPage} />
          </DataState>
        </div>
      </div>
      <ConfirmModal open={!!l.toDelete} busy={l.deleting} onConfirm={() => l.confirmDelete(cart.refresh)} onCancel={() => l.setToDelete(null)}>
        <p>Are you sure you want to delete order <strong>{l.toDelete?.ordername}</strong>?</p>
      </ConfirmModal>
    </>
  );
}
