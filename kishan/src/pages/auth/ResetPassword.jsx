import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Input } from '../../components/Field.jsx';
import api, { errorMessage, fieldErrors } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: params.get('email') || '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await api.post('/auth/reset-password', { ...form, token: params.get('token') || '' });
      toast.success(res.data.message);
      navigate('/login', { replace: true });
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(Object.keys(fe).length ? fe : { email: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Reset password" footer={<Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" name="email" type="email" value={form.email} onChange={set} error={errors.email || errors.token} />
        <Input label="New Password" name="password" type="password" value={form.password} onChange={set} error={errors.password} autoComplete="new-password" />
        <Input label="Confirm Password" name="passwordConfirmation" type="password" value={form.passwordConfirmation} onChange={set} error={errors.passwordConfirmation} autoComplete="new-password" />
        <button className="btn btn-primary w-full" disabled={busy}><KeyRound size={16} /> {busy ? 'Saving...' : 'Reset Password'}</button>
      </form>
    </AuthShell>
  );
}
