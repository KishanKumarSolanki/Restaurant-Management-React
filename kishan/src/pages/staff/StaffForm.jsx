import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';
import { dateOnly } from '../../utils/format.js';

const initial = { name: '', email: '', phone: '', role: 'staff', wage: '', hireDate: '', password: '', passwordConfirmation: '' };

export default function StaffForm() {
  const { id } = useParams();
  const f = useResourceForm({
    endpoint: '/staff-members', id, initial, recordKey: 'staffMember', redirect: '/staff-members',
    fromRecord: (s) => ({ name: s.name, email: s.email, phone: s.phone ?? '', role: s.role, wage: s.wage ?? '', hireDate: dateOnly(s.hireDate), password: '', passwordConfirmation: '' }),
  });

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Staff Member' : 'Add Staff Member'} crumbs={[{ label: 'Staff Members', to: '/staff-members' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card max-w-3xl"><div className="card-body">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full Name" name="name" value={f.form.name} onChange={f.set} error={f.errors.name} />
              <Input label="Email" name="email" type="email" value={f.form.email} onChange={f.set} error={f.errors.email} />
              <Input label="Phone" name="phone" value={f.form.phone} onChange={f.set} error={f.errors.phone} />
              <Input label="Role" name="role" value={f.form.role} onChange={f.set} error={f.errors.role} placeholder="chef, waiter, cashier..." />
              <Input label="Wage (Rs.)" name="wage" type="number" min="0" step="0.01" value={f.form.wage} onChange={f.set} error={f.errors.wage} />
              <Input label="Hire Date" name="hireDate" type="date" value={f.form.hireDate} onChange={f.set} error={f.errors.hireDate} />
              <Input label={f.isEdit ? 'New Password' : 'Password'} name="password" type="password" value={f.form.password} onChange={f.set} error={f.errors.password} autoComplete="new-password" hint={f.isEdit ? 'Khali chhodo to password nahi badlega' : 'Minimum 8 characters'} />
              <Input label="Confirm Password" name="passwordConfirmation" type="password" value={f.form.passwordConfirmation} onChange={f.set} error={f.errors.passwordConfirmation} autoComplete="new-password" />
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-4">
              <Link to="/staff-members" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Staff' : 'Save Staff'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}
