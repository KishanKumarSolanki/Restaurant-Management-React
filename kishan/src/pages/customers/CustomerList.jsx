import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, Eye, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';

export default function CustomerList() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const l = useCrudList('/customers', { search: query || undefined });

  const submitSearch = (e) => {
    e.preventDefault();
    l.setPage(1);
    setQuery(search.trim());
  };

  return (
    <>
      <PageHeader title="Customers" crumbs={[{ label: 'Customers' }]} actions={<Link to="/customers/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Add Customer</Link>} />
      <div className="card">
        <div className="card-header">
          <h5 className="flex items-center gap-2"><Users size={18} /> Customer List</h5>
          <form onSubmit={submitSearch} className="flex gap-2">
            <input className="input !w-56" placeholder="Search name / no / phone" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-outline btn-sm" aria-label="Search"><Search size={14} /></button>
          </form>
        </div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={Users} title="No Customers Found"><Link to="/customers/new" className="btn btn-primary btn-sm mt-2">Add First Customer</Link></EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>#</th><th>Customer No</th><th>Name</th><th>Phone</th><th>Address</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((c, i) => (
                      <tr key={c.id}>
                        <td>{(l.meta.page - 1) * l.meta.limit + i + 1}</td>
                        <td className="font-medium">{c.customerno}</td>
                        <td>{c.name}</td>
                        <td>{c.phone}</td>
                        <td className="max-w-64 truncate">{c.address}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link to={`/customers/${c.id}`} className="icon-btn border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white" title="View"><Eye size={15} /></Link>
                            <Link to={`/customers/${c.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
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
        <p>Are you sure you want to delete customer <strong>{l.toDelete?.name}</strong>?</p>
      </ConfirmModal>
    </>
  );
}
