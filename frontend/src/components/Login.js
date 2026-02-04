import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundCanvas from './BackgroundCanvas';
import octoLogo from './octo1.png';
import './Auth.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      setStatus('Welcome back!');
      navigate('/chat');
    } catch (err) {
      setStatus(err.message || 'Login failed');
    } finally {
      setLoading(false);
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
              <p className="eyebrow">Welcome Back</p>
              <h1 className="auth-title">Sign In</h1>
            </div>
          </div>
          <Link className="ghost" to="/register">
            <i className="fa-solid fa-user-plus"></i>
            Need an account?
          </Link>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <i className="fa-solid fa-envelope"></i>
              Email Address
            </label>
            <input 
              id="email"
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              placeholder="you@example.com" 
              required 
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fa-solid fa-lock"></i>
              Password
            </label>
            <input 
              id="password"
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              required 
              autoComplete="current-password"
            />
          </div>

          <div className="form-footer">
            <Link className="text-link" to="/reset">
              <i className="fa-solid fa-key"></i>
              Forgot password?
            </Link>
          </div>

          <button className="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                Sign In
              </>
            )}
          </button>

          {status && (
            <div className={`status-message ${status.includes('failed') || status.includes('error') ? 'error' : 'success'}`}>
              <i className={`fa-solid ${status.includes('failed') || status.includes('error') ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
              {status}
            </div>
          )}
        </form>

        <div className="auth-footer">
          <Link className="back-link" to="/">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;