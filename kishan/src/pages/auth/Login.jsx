import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Input } from '../../components/Field.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { errorMessage, fieldErrors } from '../../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await login(form);
      navigate(location.state?.from || '/home', { replace: true });
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(Object.keys(fe).length ? fe : { email: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to manage your restaurant" footer={<>New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" name="email" type="email" value={form.email} onChange={set} error={errors.email} autoComplete="username" autoFocus />
        <Input label="Password" name="password" type="password" value={form.password} onChange={set} error={errors.password} autoComplete="current-password" />
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-primary hover:underline">Forgot your password?</Link></div>
        <button className="btn btn-primary w-full" disabled={busy}><LogIn size={16} /> {busy ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthShell>
  );
}
