import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundCanvas from './BackgroundCanvas';
import './Auth.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register({ name: form.name, email: form.email, password: form.password });
      setStatus('Account created');
      navigate('/chat');
    } catch (err) {
      setStatus(err.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BackgroundCanvas />
      <div className="auth-shell">
        <header className="auth-header">
          <h1>Create Account</h1>
          <Link className="ghost" to="/login">Have an account?</Link>
        </header>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />

          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />

          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••" required />

          <button className="primary" type="submit" disabled={loading}>Sign Up</button>
          {status && <p className="status">{status}</p>}
        </form>
        <Link className="icon-btn" to="/">← Back</Link>
      </div>
    </div>
  );
}

export default Register;
