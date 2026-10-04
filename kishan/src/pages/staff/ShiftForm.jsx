import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input, Select, Textarea } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';
import { useFetch } from '../../hooks/useFetch.js';
import { dateOnly } from '../../utils/format.js';

const initial = { user: '', shiftDate: '', startTime: '09:00', endTime: '17:00', section: '', status: 'scheduled', notes: '' };

export default function ShiftForm() {
  const { id } = useParams();
  const { data: staff } = useFetch('/staff-members', { all: true });
  const f = useResourceForm({
    endpoint: '/staff-shifts', id, initial, recordKey: 'staffShift', redirect: '/staff-shifts',
    fromRecord: (s) => ({ user: s.user || '', shiftDate: dateOnly(s.shiftDate), startTime: s.startTime, endTime: s.endTime, section: s.section ?? '', status: s.status, notes: s.notes ?? '' }),
  });

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Shift' : 'Schedule Shift'} crumbs={[{ label: 'Shifts', to: '/staff-shifts' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card max-w-3xl"><div className="card-body">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Staff Member" name="user" value={f.form.user} onChange={f.set} error={f.errors.user}>
                <option value="">Select staff</option>
                {(staff?.data || []).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
              </Select>
              <Input label="Shift Date" name="shiftDate" type="date" value={f.form.shiftDate} onChange={f.set} error={f.errors.shiftDate} />
              <Input label="Start Time" name="startTime" type="time" value={f.form.startTime} onChange={f.set} error={f.errors.startTime} />
              <Input label="End Time" name="endTime" type="time" value={f.form.endTime} onChange={f.set} error={f.errors.endTime} />
              <Input label="Section" name="section" value={f.form.section} onChange={f.set} error={f.errors.section} placeholder="Kitchen, Floor, Counter..." />
              <Select label="Status" name="status" value={f.form.status} onChange={f.set} error={f.errors.status}>
                <option value="scheduled">Scheduled</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="off">Off</option>
              </Select>
            </div>
            <Textarea label="Notes" name="notes" value={f.form.notes} onChange={f.set} error={f.errors.notes} />
            <div className="flex justify-between border-t border-gray-100 pt-4">
              <Link to="/staff-shifts" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Shift' : 'Save Shift'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}
