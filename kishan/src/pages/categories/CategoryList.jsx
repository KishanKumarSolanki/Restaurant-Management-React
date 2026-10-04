import { Link } from 'react-router-dom';
import { Tags, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';

export default function CategoryList() {
  const l = useCrudList('/menu-categories');
  return (
    <>
      <PageHeader title="Menu Categories" crumbs={[{ label: 'Menu Categories' }]} actions={<Link to="/menu-categories/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Add Category</Link>} />
      <div className="card">
        <div className="card-header"><h5 className="flex items-center gap-2"><Tags size={18} /> Category List</h5></div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={Tags} title="No Categories Found"><Link to="/menu-categories/new" className="btn btn-primary btn-sm mt-2">Add First Category</Link></EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Items</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((c, i) => (
                      <tr key={c.id}>
                        <td>{(l.meta.page - 1) * l.meta.limit + i + 1}</td>
                        <td className="font-medium">{c.name}</td>
                        <td className="max-w-64 truncate">{c.description || '-'}</td>
                        <td>{c.itemsCount}</td>
                        <td><Badge value={c.isActive ? 'active' : 'inactive'} /></td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link to={`/menu-categories/${c.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
                            <button onClick={() => l.setToDelete(c)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white" title="Delete"><Trash2 size={15} /></button>
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
        <p>Delete category <strong>{l.toDelete?.name}</strong>?</p>
        <p className="text-gray-500">Items in this category will stay but become uncategorised.</p>
      </ConfirmModal>
    </>
  );
}
