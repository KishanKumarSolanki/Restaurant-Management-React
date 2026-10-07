import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input, Textarea } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';

const initial = { customerno: '', name: '', phone: '', address: '', notes: '', preferences: '', feedback: '' };

export default function CustomerForm() {
  const { id } = useParams();
  const f = useResourceForm({
    endpoint: '/customers', id, initial, recordKey: 'customer', redirect: '/customers',
    fromRecord: (c) => Object.fromEntries(Object.keys(initial).map((k) => [k, c[k] ?? ''])),
  });

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Customer' : 'Add Customer'} crumbs={[{ label: 'Customers', to: '/customers' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card"><div className="card-body !p-4 sm:!p-5">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-4 sm:space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Customer No" name="customerno" value={f.form.customerno} onChange={f.set} error={f.errors.customerno} />
              <Input label="Name" name="name" value={f.form.name} onChange={f.set} error={f.errors.name} />
              <Input label="Phone" name="phone" value={f.form.phone} onChange={f.set} error={f.errors.phone} />
              <Input label="Address" name="address" value={f.form.address} onChange={f.set} error={f.errors.address} />
            </div>
            <Textarea label="Notes (allergies, favourite table...)" name="notes" value={f.form.notes} onChange={f.set} error={f.errors.notes} />
            <Textarea label="Preferences" name="preferences" value={f.form.preferences} onChange={f.set} error={f.errors.preferences} />
            <Textarea label="Feedback" name="feedback" value={f.form.feedback} onChange={f.set} error={f.errors.feedback} />

            {/* mobile: buttons full-width, Save upar aur Cancel neeche; sm+ : left/right */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between sm:gap-3">
              <Link to="/customers" className="btn btn-secondary w-full sm:w-auto"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary w-full sm:w-auto" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Customer' : 'Save Customer'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}