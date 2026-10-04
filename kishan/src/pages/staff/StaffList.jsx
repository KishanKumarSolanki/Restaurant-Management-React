import { Link } from 'react-router-dom';
import { UserCheck, PlusCircle, Pencil, Trash2, CalendarClock, ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { money, fmtDate } from '../../utils/format.js';

export default function StaffList() {
  const l = useCrudList('/staff-members');
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Staff Members" crumbs={[{ label: 'Staff Members' }]} actions={<>
        <Link to="/staff-shifts" className="btn btn-outline btn-sm"><CalendarClock size={14} /> Shifts</Link>
        <Link to="/staff/assign" className="btn btn-outline btn-sm"><ClipboardCheck size={14} /> Assign Orders</Link>
        <Link to="/staff-members/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Add Staff</Link>
      </>} />
      <div className="card">
        <div className="card-header"><h5 className="flex items-center gap-2"><UserCheck size={18} /> Team</h5></div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? <EmptyState icon={UserCheck} title="No Staff Found" /> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Contact</th><th>Wage</th><th>Hired</th><th>Orders</th><th>Upcoming Shifts</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((s, i) => (
                      <tr key={s.id}>
                        <td>{(l.meta.page - 1) * l.meta.limit + i + 1}</td>
                        <td><div className="font-medium">{s.name}</div><div className="text-xs text-gray-500">{s.email}</div></td>
                        <td><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.role}</span></td>
                        <td>{s.phone || '-'}</td>
                        <td>{s.wage != null ? money(s.wage) : '-'}</td>
                        <td>{s.hireDate ? fmtDate(s.hireDate) : '-'}</td>
                        <td>{s.assignedOrdersCount}</td>
                        <td>{s.upcomingShiftsCount} <span className="text-xs text-gray-500">/ {s.staffShiftsCount}</span></td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link to={`/staff-members/${s.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
                            <button disabled={s.id === user?.id} onClick={() => l.setToDelete(s)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" title={s.id === user?.id ? 'You cannot delete yourself' : 'Delete'}><Trash2 size={15} /></button>
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
        <p>Delete staff member <strong>{l.toDelete?.name}</strong>?</p>
        <p className="text-gray-500">Their shifts will be removed and assigned orders become unassigned.</p>
      </ConfirmModal>
    </>
  );
}
