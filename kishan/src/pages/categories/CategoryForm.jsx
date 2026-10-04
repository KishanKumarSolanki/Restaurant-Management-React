import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input, Select } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';

const initial = { name: '', description: '', isActive: 'true' };

export default function CategoryForm() {
  const { id } = useParams();
  const f = useResourceForm({
    endpoint: '/menu-categories', id, initial, recordKey: 'category', redirect: '/menu-categories',
    fromRecord: (c) => ({ name: c.name, description: c.description ?? '', isActive: String(c.isActive) }),
    toPayload: (v) => ({ ...v, isActive: v.isActive === 'true' }),
  });

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Category' : 'Add Category'} crumbs={[{ label: 'Menu Categories', to: '/menu-categories' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card max-w-2xl"><div className="card-body">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-4">
            <Input label="Category Name" name="name" value={f.form.name} onChange={f.set} error={f.errors.name} />
            <Input label="Description" name="description" value={f.form.description} onChange={f.set} error={f.errors.description} />
            <Select label="Status" name="isActive" value={f.form.isActive} onChange={f.set} error={f.errors.isActive}>
              <option value="true">Active</option><option value="false">Inactive</option>
            </Select>
            <div className="flex justify-between border-t border-gray-100 pt-4">
              <Link to="/menu-categories" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Category' : 'Save Category'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}
