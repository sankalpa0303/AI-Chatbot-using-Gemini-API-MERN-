import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundCanvas from './BackgroundCanvas';
import SideMenu from './SideMenu';
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
      setStatus('Saved successfully');
      if (data.profile?.name || data.profile?.email) {
        updateUser({ name: data.profile.name, email: data.profile.email });
      }
    } catch (err) {
      setStatus('Error saving profile');
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <BackgroundCanvas />
      <div className="chat-layout">
        <SideMenu status="Online" onLogout={handleLogout} />

        <div className="profile-shell">
          <header className="profile-header">
            <div className="header-left">
              <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="header-text">
                <p className="eyebrow">Account Settings</p>
                <h1 className="title">My Profile</h1>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-save" onClick={saveProfile} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </header>

          <div className="profile-grid">
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title">Profile Information</h2>
                <p className="card-subtitle">Update your personal details</p>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name"
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange} 
                  placeholder="Enter your full name" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  value={profile.email} 
                  onChange={handleChange} 
                  placeholder="you@example.com" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea 
                  id="bio"
                  name="bio" 
                  value={profile.bio} 
                  onChange={handleChange} 
                  placeholder="Tell us about yourself..." 
                  rows={4} 
                />
              </div>

              <div className="divider"></div>

              <div className="card-header">
                <h2 className="card-title">Avatar</h2>
                <p className="card-subtitle">Upload or link your profile picture</p>
              </div>

              <div className="form-group">
                <label htmlFor="avatarFile">Upload Photo</label>
                <div className="file-upload-wrapper">
                  <input 
                    id="avatarFile"
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarFile}
                    className="file-input"
                  />
                  <label htmlFor="avatarFile" className="file-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </label>
                  {profile.avatarUrl && (
                    <button 
                      type="button" 
                      className="btn-clear" 
                      onClick={clearAvatar} 
                      disabled={uploading || loading}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {status && (
                <div className={`status-message ${status.includes('Error') || status.includes('failed') ? 'error' : 'success'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {status.includes('Error') || status.includes('failed') ? (
                      <circle cx="12" cy="12" r="10"/>
                    ) : (
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    )}
                    {status.includes('Error') || status.includes('failed') ? (
                      <>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </>
                    ) : (
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    )}
                  </svg>
                  {status}
                </div>
              )}

             
            </div>

            <div className="card preview-card">
              <div className="card-header">
                <h2 className="card-title">Preview</h2>
                <p className="card-subtitle">How others see you</p>
              </div>
              
              <div className="preview-content">
                <div className="avatar-wrapper">
                  <div 
                    className="avatar" 
                    style={{ 
                      backgroundImage: profile.avatarUrl ? `url(${profile.avatarUrl})` : 'none' 
                    }}
                  >
                    {!profile.avatarUrl && (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div className="avatar-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="preview-info">
                  <h3 className="preview-name">{profile.name || 'Your Name'}</h3>
                  <p className="preview-email">{profile.email || 'you@example.com'}</p>
                  <div className="preview-bio-wrapper">
                    <p className="preview-bio">{profile.bio || 'Tell the world who you are. Share your story, interests, or what makes you unique.'}</p>
                  </div>
                </div>

                <div className="preview-stats">
                 
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;