import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Input } from '../../components/Field.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { errorMessage, fieldErrors } from '../../api/client.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await register(form);
      navigate('/home', { replace: true });
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(Object.keys(fe).length ? fe : { email: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start managing your restaurant" footer={<>Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" name="name" value={form.name} onChange={set} error={errors.name} autoComplete="name" autoFocus />
        <Input label="Email" name="email" type="email" value={form.email} onChange={set} error={errors.email} autoComplete="username" />
        <Input label="Password" name="password" type="password" value={form.password} onChange={set} error={errors.password} autoComplete="new-password" hint="Minimum 8 characters" />
        <Input label="Confirm Password" name="passwordConfirmation" type="password" value={form.passwordConfirmation} onChange={set} error={errors.passwordConfirmation} autoComplete="new-password" />
        <button className="btn btn-primary w-full" disabled={busy}><UserPlus size={16} /> {busy ? 'Creating...' : 'Register'}</button>
      </form>
    </AuthShell>
  );
}
