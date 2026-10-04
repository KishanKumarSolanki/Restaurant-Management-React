import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { Input } from '../../components/Field.jsx';
import api, { errorMessage, fieldErrors } from '../../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSent('');
    try {
      setSent((await api.post('/auth/forgot-password', { email })).data.message);
    } catch (err) {
      const fe = fieldErrors(err);
      setErrors(Object.keys(fe).length ? fe : { email: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we will send you a reset link." footer={<Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>}>
      {sent && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{sent}</div>}
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoFocus />
        <button className="btn btn-primary w-full" disabled={busy}><Mail size={16} /> {busy ? 'Sending...' : 'Email Password Reset Link'}</button>
      </form>
    </AuthShell>
  );
}
