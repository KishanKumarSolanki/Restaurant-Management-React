import { Link } from 'react-router-dom';
import { Utensils, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';
import { money } from '../../utils/format.js';

export default function ItemList() {
  const l = useCrudList('/items');
  return (
    <>
      <PageHeader title="Menu Items" crumbs={[{ label: 'Menu Items' }]} actions={<>
        <Link to="/menu-categories" className="btn btn-outline btn-sm">Categories</Link>
        <Link to="/items/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Add Item</Link>
      </>} />
      <div className="card">
        <div className="card-header"><h5 className="flex items-center gap-2"><Utensils size={18} /> Item List</h5></div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={Utensils} title="No Menu Items Found"><Link to="/items/new" className="btn btn-primary btn-sm mt-2">Add First Item</Link></EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Availability</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((it, i) => (
                      <tr key={it.id}>
                        <td>{(l.meta.page - 1) * l.meta.limit + i + 1}</td>
                        <td><div className="font-medium">{it.name}</div>{it.description && <div className="max-w-72 truncate text-xs text-gray-500">{it.description}</div>}</td>
                        <td>{it.category}</td>
                        <td>{money(it.price)}</td>
                        <td><Badge value={it.isAvailable ? 'available' : 'unavailable'}>{it.isAvailable ? 'Available' : 'Out of Stock'}</Badge></td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link to={`/items/${it.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
                            <button onClick={() => l.setToDelete(it)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white" title="Delete"><Trash2 size={15} /></button>
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
      <ConfirmModal open={!!l.toDelete} busy={l.deleting} onConfirm={() => l.confirmDelete()} onCancel={() => l.setToDelete(null)}>
        <p>Delete menu item <strong>{l.toDelete?.name}</strong>?</p>
      </ConfirmModal>
    </>
  );
}
