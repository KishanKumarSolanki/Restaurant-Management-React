import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage, fieldErrors } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Create / Edit form ka common logic.
 *  endpoint '/customers' | id (edit) | initial | fromRecord(record)->form | toPayload(form)->body
 *  recordKey: GET /endpoint/:id response ki key | redirect: success ke baad
 */
export function useResourceForm({ endpoint, id, initial, fromRecord, toPayload, recordKey, redirect, onSaved }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    api.get(`${endpoint}/${id}`)
      .then((res) => alive && setForm(fromRecord(res.data[recordKey])))
      .catch((e) => alive && setLoadError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, endpoint]);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const payload = toPayload ? toPayload(form) : form;
      const res = id ? await api.put(`${endpoint}/${id}`, payload) : await api.post(endpoint, payload);
      toast.success(res.data.message || 'Saved successfully.');
      onSaved?.(res.data);
      navigate(redirect);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  };

  return { form, setForm, set, errors, loading, loadError, busy, submit, isEdit: !!id };
}
