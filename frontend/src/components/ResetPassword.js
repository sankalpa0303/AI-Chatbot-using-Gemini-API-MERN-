import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundCanvas from './BackgroundCanvas';
import octoLogo from './octo1.png';
import './Auth.css';

function ResetPassword() {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [tokenHint, setTokenHint] = useState('');
  const [resetForm, setResetForm] = useState({ token: '', password: '' });

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequestStatus('');
    setTokenHint('');
    setRequestLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setRequestStatus(data.message || 'Reset code created.');
      if (data.token) {
        setTokenHint(data.token);
        setResetForm((f) => ({ ...f, token: data.token }));
      }
    } catch (err) {
      setRequestStatus(err.message || 'Could not start reset');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetStatus('');
    setResetLoading(true);
    try {
      await confirmPasswordReset({ email, token: resetForm.token, password: resetForm.password });
      setResetStatus('Password updated. Signing you in...');
      navigate('/chat');
    } catch (err) {
      setResetStatus(err.message || 'Reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BackgroundCanvas />
      <div className="auth-shell">
        <header className="auth-header">
          <div className="auth-brand">
            <img src={octoLogo} alt="Octopus AI" className="auth-brand-logo" />
            <div>
              <h1 className="auth-title">Reset Password</h1>
            </div>
          </div>
          <Link className="ghost" to="/login">Back to login</Link>
        </header>

        <form className="auth-form" onSubmit={handleRequest}>
          <label>Email</label>
          <input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button className="primary" type="submit" disabled={requestLoading}>
            Get reset code
          </button>
          {requestStatus && <p className="status">{requestStatus}</p>}
          {tokenHint && <p className="status">Your reset code: {tokenHint}</p>}
        </form>

        <form className="auth-form" onSubmit={handleReset}>
          <label>Reset code</label>
          <input
            name="token"
            value={resetForm.token}
            onChange={(e) => setResetForm((f) => ({ ...f, token: e.target.value }))}
            placeholder="Paste the code"
            required
          />

          <label>New password</label>
          <input
            name="password"
            type="password"
            value={resetForm.password}
            onChange={(e) => setResetForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••"
            required
          />

          <button className="primary" type="submit" disabled={resetLoading}>
            Update password
          </button>
          {resetStatus && <p className="status">{resetStatus}</p>}
        </form>

        <Link className="icon-btn" to="/">← Back</Link>
      </div>
    </div>
  );
}

export default ResetPassword;
