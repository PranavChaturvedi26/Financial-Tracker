import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Shield, Moon, Sun } from 'lucide-react';
import '../styles/Settings.css';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Profile Information</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-icon">
              <User />
            </div>
            <div className="setting-content">
              <label>Username</label>
              <p>{user?.username}</p>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <Mail />
            </div>
            <div className="setting-content">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-icon">
              <Shield />
            </div>
            <div className="setting-content">
              <label>Role</label>
              <p className={`role-badge ${user?.role}`}>{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-icon">
              {theme === 'light' ? <Sun /> : <Moon />}
            </div>
            <div className="setting-content">
              <label>Theme</label>
              <p>Current theme: {theme}</p>
            </div>
            <button className="btn-primary" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Permissions</h2>
        <div className="settings-card">
          <div className="permissions-grid">
            <div className="permission-item">
              <span>View Transactions</span>
              <span className="permission-status allowed">✓</span>
            </div>
            <div className="permission-item">
              <span>Create Transactions</span>
              <span className={`permission-status ${user?.role !== 'read-only' ? 'allowed' : 'denied'}`}>
                {user?.role !== 'read-only' ? '✓' : '✗'}
              </span>
            </div>
            <div className="permission-item">
              <span>Edit Transactions</span>
              <span className={`permission-status ${user?.role !== 'read-only' ? 'allowed' : 'denied'}`}>
                {user?.role !== 'read-only' ? '✓' : '✗'}
              </span>
            </div>
            <div className="permission-item">
              <span>Delete Transactions</span>
              <span className={`permission-status ${user?.role !== 'read-only' ? 'allowed' : 'denied'}`}>
                {user?.role !== 'read-only' ? '✓' : '✗'}
              </span>
            </div>
            <div className="permission-item">
              <span>View Analytics</span>
              <span className="permission-status allowed">✓</span>
            </div>
            <div className="permission-item">
              <span>Manage Users</span>
              <span className={`permission-status ${user?.role === 'admin' ? 'allowed' : 'denied'}`}>
                {user?.role === 'admin' ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;