import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, Eye, Pencil, Trash2, Search, Phone, MapPin } from 'lucide-react';
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
      <PageHeader 
        title="Customers" 
        crumbs={[{ label: 'Customers' }]} 
        actions={
          <Link to="/customers/new" className="btn btn-primary btn-sm w-full sm:w-auto flex justify-center items-center gap-1">
            <PlusCircle size={14} /> Add Customer
          </Link>
        } 
      />

      <div className="card">
        {/* Responsive Header */}
        <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h5 className="flex items-center gap-2 font-semibold">
            <Users size={18} /> Customer List
          </h5>
          <form onSubmit={submitSearch} className="flex gap-2 w-full sm:w-auto">
            <input 
              className="input w-full sm:!w-56" 
              placeholder="Search name / no / phone" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <button className="btn btn-outline btn-sm shrink-0" aria-label="Search">
              <Search size={14} />
            </button>
          </form>
        </div>

        <div className="card-body p-3 sm:p-6">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={Users} title="No Customers Found">
                <Link to="/customers/new" className="btn btn-primary btn-sm mt-2">
                  Add First Customer
                </Link>
              </EmptyState>
            ) : (
              <>
                {/* Mobile View: Cards Layout */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {l.rows.map((c, i) => (
                    <div key={c.id} className="p-4 border rounded-lg bg-base-100 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                            #{c.customerno || (l.meta.page - 1) * l.meta.limit + i + 1}
                          </span>
                          <h6 className="font-bold text-base mt-1">{c.name}</h6>
                        </div>
                        <div className="flex gap-1">
                          <Link to={`/customers/${c.id}`} className="icon-btn border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white p-1.5 rounded" title="View">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/customers/${c.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white p-1.5 rounded" title="Edit">
                            <Pencil size={15} />
                          </Link>
                          <button onClick={() => l.setToDelete(c)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {c.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone size={14} className="shrink-0 text-gray-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}

                      {c.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400" />
                          <span className="line-clamp-2">{c.address}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table Layout */}
                <div className="table-wrap hidden md:block overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Customer No</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
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
                              <Link to={`/customers/${c.id}`} className="icon-btn border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white" title="View">
                                <Eye size={15} />
                              </Link>
                              <Link to={`/customers/${c.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit">
                                <Pencil size={15} />
                              </Link>
                              <button onClick={() => l.setToDelete(c)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-4">
              <Pagination meta={l.meta} onChange={l.setPage} />
            </div>
          </DataState>
        </div>
      </div>

      <ConfirmModal 
        open={!!l.toDelete} 
        busy={l.deleting} 
        onConfirm={() => l.confirmDelete()} 
        onCancel={() => l.setToDelete(null)}
      >
        <p>Are you sure you want to delete customer <strong>{l.toDelete?.name}</strong>?</p>
      </ConfirmModal>
    </>
  );
}