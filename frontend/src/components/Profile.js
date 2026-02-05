import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundCanvas from './BackgroundCanvas';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatarUrl: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user, updateUser, logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        else if (user) setProfile((p) => ({ ...p, name: user.name || '', email: user.email || '' }));
      } catch (err) {
        console.warn('Profile load failed', err);
      }
    };
    load();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const saveProfile = async () => {
    setLoading(true);
    setStatus('');
    try {
      const send = async (method) => fetch(`${API_URL}/api/profile`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(profile),
      });

      let res = await send('PUT');
      if (res.status === 404) res = await send('POST');

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }

      const data = await res.json();
      setProfile(data.profile || profile);
      setStatus('Saved');
      if (data.profile?.name || data.profile?.email) {
        updateUser({ name: data.profile.name, email: data.profile.email });
      }
    } catch (err) {
      setStatus('Error saving');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Delete failed');
      setProfile({ name: '', email: '', bio: '', avatarUrl: '' });
      setStatus('Deleted');
    } catch (err) {
      setStatus('Error deleting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    setUploading(true);
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatarUrl: reader.result }));
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      setStatus('Error reading image');
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setProfile((p) => ({ ...p, avatarUrl: '' }));
  };

  return (
    <div className="profile-page">
      <BackgroundCanvas />
      <div className="profile-shell">
        <header className="profile-header">
          <div className="header-left">
            <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="title">Profile</h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="primary" onClick={saveProfile} disabled={loading}>Save</button>
            <button className="ghost" onClick={deleteProfile} disabled={loading}>Delete</button>
              <button className="ghost" onClick={() => { logout(); navigate('/'); }}>
                Logout
              </button>
          </div>
        </header>

        <div className="profile-grid">
          <div className="card">
            <label>Full Name</label>
            <input name="name" value={profile.name} onChange={handleChange} placeholder="Your name" />

            <label>Email</label>
            <input name="email" value={profile.email} onChange={handleChange} placeholder="you@example.com" />

            <label>Bio</label>
            <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Short bio" rows={4} />

            <label>Avatar URL</label>
            <input name="avatarUrl" value={profile.avatarUrl} onChange={handleChange} placeholder="https://..." />

            <label>Or upload a photo</label>
            <input type="file" accept="image/*" onChange={handleAvatarFile} />
            <div className="btn-row">
              <button type="button" className="ghost" onClick={clearAvatar} disabled={uploading || loading}>Remove</button>
              {uploading && <span className="status">Loading image...</span>}
            </div>

            {status && <p className="status">{status}</p>}
          </div>

          <div className="card preview">
            <div className="avatar" style={{ backgroundImage: profile.avatarUrl ? `url(${profile.avatarUrl})` : 'none' }}>
              {!profile.avatarUrl && <span>👤</span>}
            </div>
            <h3>{profile.name || 'Your Name'}</h3>
            <p className="muted">{profile.email || 'you@example.com'}</p>
            <p>{profile.bio || 'Tell the world who you are.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
