import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input, Select, Textarea } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';
import { useFetch } from '../../hooks/useFetch.js';

const initial = { name: '', price: '', menuCategory: '', description: '', isAvailable: 'true' };

export default function ItemForm() {
  const { id } = useParams();
  const { data: cats } = useFetch('/menu-categories', { all: true });
  const f = useResourceForm({
    endpoint: '/items', id, initial, recordKey: 'item', redirect: '/items',
    fromRecord: (it) => ({ name: it.name, price: it.price, menuCategory: it.menuCategory || '', description: it.description ?? '', isAvailable: String(it.isAvailable) }),
    toPayload: (v) => ({ ...v, isAvailable: v.isAvailable === 'true' }),
  });

  // active categories + (edit me) item ki current category
  const options = (cats?.data || []).filter((c) => c.isActive || c.id === f.form.menuCategory);

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Menu Item' : 'Add Menu Item'} crumbs={[{ label: 'Menu Items', to: '/items' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card max-w-3xl"><div className="card-body">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Item Name" name="name" value={f.form.name} onChange={f.set} error={f.errors.name} />
              <Input label="Price (Rs.)" name="price" type="number" min="1" step="0.01" value={f.form.price} onChange={f.set} error={f.errors.price} />
              <Select label="Category" name="menuCategory" value={f.form.menuCategory} onChange={f.set} error={f.errors.menuCategory}>
                <option value="">Select category</option>
                {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Availability" name="isAvailable" value={f.form.isAvailable} onChange={f.set} error={f.errors.isAvailable}>
                <option value="true">Available</option><option value="false">Out of Stock</option>
              </Select>
            </div>
            {cats && options.length === 0 && <p className="text-sm text-amber-700">Pehle ek category banao: <Link to="/menu-categories/new" className="font-medium underline">Add Category</Link></p>}
            <Textarea label="Description" name="description" value={f.form.description} onChange={f.set} error={f.errors.description} />
            <div className="flex justify-between border-t border-gray-100 pt-4">
              <Link to="/items" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Item' : 'Save Item'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}
