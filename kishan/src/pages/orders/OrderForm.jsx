import { Link, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Utensils } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import DataState from '../../components/DataState.jsx';
import { Input, Select, Textarea } from '../../components/Field.jsx';
import { useResourceForm } from '../../hooks/useResourceForm.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useCart } from '../../context/CartContext.jsx';
import { money } from '../../utils/format.js';

const blankLine = () => ({ item: '', quantity: 1, itemNotes: '', itemStatus: 'pending' });
const initial = { ordername: '', customerno: '', status: 'pending', notes: '', items: [blankLine()] };
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export default function OrderForm() {
  const { id } = useParams();
  const cart = useCart();
  const { data: customers } = useFetch('/customers', { all: true });
  const { data: itemsData } = useFetch('/items', { all: true });
  const menu = itemsData?.data || [];
  const priceOf = (itemId) => menu.find((m) => m.id === itemId)?.price || 0;

  const f = useResourceForm({
    endpoint: '/orders', id, initial, recordKey: 'order', redirect: id ? '/orders' : '/cart', onSaved: () => cart.refresh(),
    fromRecord: (o) => ({
      ordername: o.ordername, customerno: o.customerno, status: o.status, notes: o.notes ?? '',
      items: o.items.length ? o.items.map((i) => ({ item: i.item, quantity: i.quantity, itemNotes: i.itemNotes ?? '', itemStatus: i.itemStatus })) : [blankLine()],
    }),
  });

  const setLine = (idx, patch) => f.setForm((s) => ({ ...s, items: s.items.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));
  const addLine = () => f.setForm((s) => ({ ...s, items: [...s.items, blankLine()] }));
  const removeLine = (idx) => f.setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));

  const totalQty = f.form.items.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
  const totalAmt = f.form.items.reduce((s, l) => s + (Number(l.quantity) || 0) * priceOf(l.item), 0);
  const lineErr = (idx, key) => f.errors[`items.${idx}.${key}`];

  return (
    <>
      <PageHeader title={f.isEdit ? 'Edit Order' : 'Create Order'} crumbs={[{ label: 'Orders', to: '/orders' }, { label: f.isEdit ? 'Edit' : 'Create' }]} />
      <div className="card"><div className="card-body">
        <DataState loading={f.loading} error={f.loadError}>
          <form onSubmit={f.submit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Order Reference" name="ordername" value={f.form.ordername} onChange={f.set} error={f.errors.ordername} placeholder="e.g. Table 4 / Takeaway #12" />
              <Select label="Customer" name="customerno" value={f.form.customerno} onChange={f.set} error={f.errors.customerno}>
                <option value="">Select Customer</option>
                {(customers?.data || []).map((c) => <option key={c.id} value={c.customerno}>{c.name} ({c.customerno})</option>)}
              </Select>
              <Select label="Order Status" name="status" value={f.form.status} onChange={f.set} error={f.errors.status}>
                {['pending', 'processing', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{cap(s)}</option>)}
              </Select>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-500">Live Summary</p>
                <div className="mt-2 flex justify-between font-semibold"><span>Total Quantity</span><span>{totalQty}</span></div>
                <div className="mt-1 flex justify-between font-semibold"><span>Total Amount</span><span>{money(totalAmt)}</span></div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50">
              <div className="flex items-center justify-between rounded-t-xl bg-white px-4 py-3 shadow-sm">
                <h5 className="flex items-center gap-2 font-semibold"><Utensils size={18} className="text-primary" /> Order Items</h5>
                <button type="button" className="btn btn-primary btn-sm" onClick={addLine}><Plus size={14} /> Add Line</button>
              </div>
              <div className="space-y-3 p-4">
                {f.errors.items && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{f.errors.items}</p>}
                {f.form.items.map((l, idx) => (
                  <div key={idx} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <Select label="Menu Item" value={l.item} onChange={(e) => setLine(idx, { item: e.target.value })} error={lineErr(idx, 'item')}>
                        <option value="">Choose item</option>
                        {menu.map((m) => <option key={m.id} value={m.id}>{m.name} - {m.category}{m.isAvailable ? '' : ' (Out of Stock)'}</option>)}
                      </Select>
                    </div>
                    <div className="lg:col-span-2"><Input label="Qty" type="number" min="1" max="50" value={l.quantity} onChange={(e) => setLine(idx, { quantity: e.target.value })} error={lineErr(idx, 'quantity')} /></div>
                    <div className="lg:col-span-3">
                      <Select label="Item Status" value={l.itemStatus} onChange={(e) => setLine(idx, { itemStatus: e.target.value })} error={lineErr(idx, 'itemStatus')}>
                        {['pending', 'preparing', 'ready', 'served'].map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                      </Select>
                    </div>
                    <div className="lg:col-span-3"><span className="label">Line Total</span><div className="input bg-gray-50">{money((Number(l.quantity) || 0) * priceOf(l.item))}</div></div>
                    <div className="lg:col-span-10"><Input label="Customization / Notes" value={l.itemNotes} onChange={(e) => setLine(idx, { itemNotes: e.target.value })} error={lineErr(idx, 'itemNotes')} placeholder="Example: Extra cheese, no onion" /></div>
                    <div className="flex items-end lg:col-span-2">
                      <button type="button" className="btn btn-outline-danger w-full" disabled={f.form.items.length === 1} onClick={() => removeLine(idx)}><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Textarea label="Special Instructions" name="notes" value={f.form.notes} onChange={f.set} error={f.errors.notes} />

            <div className="flex justify-between border-t border-gray-100 pt-4">
              <Link to="/orders" className="btn btn-secondary"><ArrowLeft size={16} /> Cancel</Link>
              <button className="btn btn-primary" disabled={f.busy}><Save size={16} /> {f.busy ? 'Saving...' : f.isEdit ? 'Update Order' : 'Place Order'}</button>
            </div>
          </form>
        </DataState>
      </div></div>
    </>
  );
}
