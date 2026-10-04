import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { Input } from '../components/Field.jsx';
import api, { errorMessage, fieldErrors } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function useSubmit(fn) {
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const run = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setErrors({});
    try { await fn(); } catch (err) { setErrors(fieldErrors(err)); toast.error(errorMessage(err)); } finally { setBusy(false); }
  };
  return { errors, busy, run, setErrors };
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [info, setInfo] = useState({ name: user.name, email: user.email });
  const infoForm = useSubmit(async () => {
    const res = await api.patch('/profile', info);
    setUser(res.data.user);
    toast.success(res.data.message);
  });

  const [pw, setPw] = useState({ currentPassword: '', password: '', passwordConfirmation: '' });
  const pwForm = useSubmit(async () => {
    const res = await api.put('/profile/password', pw);
    setPw({ currentPassword: '', password: '', passwordConfirmation: '' });
    toast.success(res.data.message);
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delPw, setDelPw] = useState('');
  const delForm = useSubmit(async () => {
    await api.delete('/profile', { data: { password: delPw } });
    logout();
    navigate('/');
  });

  return (
    <>
      <PageHeader title="Profile" crumbs={[{ label: 'Profile' }]} />
      <div className="max-w-2xl space-y-6">
        <form onSubmit={infoForm.run} className="card space-y-4 p-6">
          <h5 className="font-semibold">Profile Information</h5>
          <Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} error={infoForm.errors.name} />
          <Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} error={infoForm.errors.email} />
          <button className="btn btn-primary" disabled={infoForm.busy}>{infoForm.busy ? 'Saving...' : 'Save'}</button>
        </form>

        <form onSubmit={pwForm.run} className="card space-y-4 p-6">
          <h5 className="font-semibold">Update Password</h5>
          <Input label="Current Password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={pwForm.errors.currentPassword} autoComplete="current-password" />
          <Input label="New Password" type="password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} error={pwForm.errors.password} autoComplete="new-password" />
          <Input label="Confirm Password" type="password" value={pw.passwordConfirmation} onChange={(e) => setPw({ ...pw, passwordConfirmation: e.target.value })} error={pwForm.errors.passwordConfirmation} autoComplete="new-password" />
          <button className="btn btn-primary" disabled={pwForm.busy}>{pwForm.busy ? 'Saving...' : 'Update Password'}</button>
        </form>

        <div className="card space-y-3 p-6">
          <h5 className="font-semibold text-red-600">Delete Account</h5>
          <p className="text-sm text-gray-600">Account delete karne ke baad ye wapas nahi aa sakta.</p>
          <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>Delete Account</button>
        </div>
      </div>

      <ConfirmModal open={confirmDelete} title="Delete your account?" confirmLabel="Delete Account" busy={delForm.busy} onConfirm={delForm.run} onCancel={() => setConfirmDelete(false)}>
        <Input label="Enter your password to confirm" type="password" value={delPw} onChange={(e) => setDelPw(e.target.value)} error={delForm.errors.password} />
      </ConfirmModal>
    </>
  );
}
