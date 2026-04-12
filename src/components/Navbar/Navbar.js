import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Read user from localStorage on every route change
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    if (stored && role === 'patient') {
      setUser(JSON.parse(stored));
    } else {
      setUser(null);
    }
  }, [path]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  // Hide on doctor/admin dashboards and registration flows
  const hideOn = [
    '/doctor-dashboard', '/admin',
    '/register', '/doctor-register',
  ];
  if (hideOn.some(p => path.startsWith(p))) return null;

  const isActive = (href) => path === href || path.startsWith(href + '/');

  // Avatar: initials from name
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <nav className="global-navbar">
      <Link to="/" className="global-logo">
        <img src="/logo.png" alt="HealthMandala" />
        <span>HealthMandala</span>
      </Link>

      <ul className="global-nav-links">
        <li><Link to="/find-doctors" className={isActive('/find-doctors') ? 'active' : ''}>Find Doctors</Link></li>
        <li><Link to="/hospitals" className={isActive('/hospitals') ? 'active' : ''}>Book Hospital Appointment</Link></li>
        <li><a href="/#how-it-works">How It Works</a></li>
        <li><a href="/#about">About</a></li>
      </ul>

      {user ? (
        /* ── Logged-in patient UI ── */
        <div className="gnav-user-area" ref={dropdownRef}>
          {/* Bell */}
          <button className="gnav-bell" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="gnav-bell-badge">0</span>
          </button>

          {/* Avatar + name + chevron */}
          <button className="gnav-profile-btn" onClick={() => setShowDropdown(v => !v)}>
            {user.profilePhoto ? (
              <img
                src={`http://localhost:5001/${user.profilePhoto}`}
                alt={user.firstName}
                className="gnav-avatar-img"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="gnav-avatar-initials"
              style={{ display: user.profilePhoto ? 'none' : 'flex' }}
            >
              {initials}
            </div>
            <span className="gnav-username">{user.firstName}</span>
            <svg className={`gnav-chevron ${showDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="gnav-dropdown">
              <div className="gnav-dropdown-header">
                <div className="gnav-dd-avatar">
                  {user.profilePhoto ? (
                    <img src={`http://localhost:5001/${user.profilePhoto}`} alt="" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div>
                  <div className="gnav-dd-name">{user.firstName} {user.lastName}</div>
                  <div className="gnav-dd-email">{user.email}</div>
                </div>
              </div>
              <div className="gnav-dropdown-divider" />
              <Link to="/my-appointments" className="gnav-dd-item" onClick={() => setShowDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Appointments
              </Link>
              <Link to="/medical-records" className="gnav-dd-item" onClick={() => setShowDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Medical Records
              </Link>
              <Link to="/profile" className="gnav-dd-item" onClick={() => setShowDropdown(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </Link>
              <div className="gnav-dropdown-divider" />
              <button className="gnav-dd-item gnav-dd-logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Guest buttons ── */
        <div className="global-nav-buttons">
          <Link to="/login?role=patient" className="btn btn-outline">Login</Link>
          <Link to="/signup?role=patient&mode=signup" className="btn btn-primary">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
