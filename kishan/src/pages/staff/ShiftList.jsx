import { Link } from 'react-router-dom';
import { CalendarClock, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import DataState, { EmptyState } from '../../components/DataState.jsx';
import Badge from '../../components/Badge.jsx';
import { useCrudList } from '../../hooks/useCrudList.js';
import { fmtDate } from '../../utils/format.js';

export default function ShiftList() {
  const l = useCrudList('/staff-shifts');
  return (
    <>
      <PageHeader title="Staff Shifts" crumbs={[{ label: 'Staff Members', to: '/staff-members' }, { label: 'Shifts' }]} actions={<Link to="/staff-shifts/new" className="btn btn-primary btn-sm"><PlusCircle size={14} /> Schedule Shift</Link>} />
      <div className="card">
        <div className="card-header"><h5 className="flex items-center gap-2"><CalendarClock size={18} /> Shift Schedule</h5></div>
        <div className="card-body">
          <DataState loading={l.loading} error={l.error} onRetry={l.reload}>
            {l.rows.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No Shifts Scheduled"><Link to="/staff-shifts/new" className="btn btn-primary btn-sm mt-2">Schedule First Shift</Link></EmptyState>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Date</th><th>Staff</th><th>Time</th><th>Section</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {l.rows.map((s) => (
                      <tr key={s.id}>
                        <td>{fmtDate(s.shiftDate)}</td>
                        <td><div className="font-medium">{s.user?.name || 'Deleted staff'}</div><div className="text-xs text-gray-500">{s.user?.role}</div></td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.section || '-'}</td>
                        <td><Badge value={s.status} /></td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link to={`/staff-shifts/${s.id}/edit`} className="icon-btn border-primary text-primary hover:bg-primary hover:text-white" title="Edit"><Pencil size={15} /></Link>
                            <button onClick={() => l.setToDelete(s)} className="icon-btn border-red-500 text-red-600 hover:bg-red-600 hover:text-white" title="Delete"><Trash2 size={15} /></button>
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
        <p>Delete this shift for <strong>{l.toDelete?.user?.name}</strong> on {fmtDate(l.toDelete?.shiftDate)}?</p>
      </ConfirmModal>
    </>
  );
}
