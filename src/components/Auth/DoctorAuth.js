import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './AuthPage.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const DoctorAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDir, setExitDir] = useState('');

  const [loginData, setLoginData] = useState({ email: '', phone: '', password: '' });
  const [loginMethod, setLoginMethod] = useState('email');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [signupData, setSignupData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [signupMethod, setSignupMethod] = useState('email');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState('');

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);

  const switchMode = (newMode) => {
    if (newMode === mode || isAnimating) return;
    setExitDir(newMode === 'signup' ? 'to-signup' : 'to-signin');
    setIsAnimating(true);
    setLoginError(''); setSignupError('');
    setTimeout(() => { setMode(newMode); setExitDir(''); setIsAnimating(false); }, 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError(''); setLoginLoading(true);
    try {
      const body = { password: loginData.password };
      if (loginMethod === 'email') body.email = loginData.email;
      else body.phone = `+977${loginData.phone}`;
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role);
        if (data.user.role === 'doctor') navigate('/doctor-dashboard');
        else if (data.user.role === 'admin') navigate('/admin');
        else setLoginError('This account is not registered as a doctor.');
      } else { setLoginError(data.error || 'Login failed. Please try again.'); }
    } catch { setLoginError('Unable to connect to server.'); }
    finally { setLoginLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setSignupError('');
    if (signupData.password !== signupData.confirmPassword) { setSignupError('Passwords do not match'); return; }
    if (signupData.password.length < 6) { setSignupError('Password must be at least 6 characters'); return; }
    setSignupLoading(true);
    try {
      if (signupMethod === 'email') {
        const res = await fetch('http://localhost:5001/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            password: signupData.password,
            role: 'doctor',
          }),
        });
        const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('pendingVerification', JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
          role: 'doctor',
        }));
        setPopupEmail(signupData.email); setShowPopup(true);
      } else {
        setSignupError(data.error || 'Failed to send verification email.');
      }
      } else {
        const phone = `+977${signupData.phone}`;
        const res = await fetch('http://localhost:5001/api/otp/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: phone }),
        });
        const data = await res.json();
        if (data.success) navigate('/verify-otp', { state: { contact: phone, method: signupMethod, firstName: signupData.firstName, lastName: signupData.lastName, password: signupData.password, role: 'doctor' } });
        else setSignupError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setSignupError('Email already registered. Please sign in.');
      else if (err.code === 'auth/invalid-email') setSignupError('Invalid email address.');
      else setSignupError('Failed to create account. Please try again.');
    } finally { setSignupLoading(false); }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/verify-email', {
      state: { email: popupEmail, firstName: signupData.firstName, role: 'doctor' }
    });
  };

  const isSignup = mode === 'signup';

  return (
    <div className="ap-page">
      {showPopup && (
        <div className="ap-popup-overlay">
          <div className="ap-popup">
            <div className="ap-popup-icon">✓</div>
            <h3>Verification Email Sent!</h3>
            <p>We've sent a link to <strong>{popupEmail}</strong></p>
            <p className="ap-popup-note">Check your inbox and click the link to verify your email.</p>
            <button className="ap-popup-btn" onClick={handlePopupClose}>Continue</button>
          </div>
        </div>
      )}

      <div className={`ap-card ${isSignup ? 'ap-signup-active' : ''} ${exitDir ? `ap-exit-${exitDir}` : ''}`}>

        <div className="ap-overlay-panel">
          <div className="ap-overlay-left">
            <h2>Welcome Back, Doctor!</h2>
            <p>Sign in to manage your appointments and patients</p>
            <button className="ap-overlay-btn" onClick={() => switchMode('signin')}>SIGN IN</button>
          </div>
          <div className="ap-overlay-right">
            <h2>Join as a Doctor!</h2>
            <p>Register to connect with patients and grow your practice</p>
            <button className="ap-overlay-btn" onClick={() => switchMode('signup')}>APPLY NOW</button>
          </div>
        </div>

        {/* Sign In */}
        <div className="ap-form-panel ap-signin-panel">
          <h2>Doctor Sign In</h2>
          <div className="ap-method-toggle">
            <button className={loginMethod === 'email' ? 'active' : ''} onClick={() => setLoginMethod('email')}>Email</button>
            <button className={loginMethod === 'phone' ? 'active' : ''} onClick={() => setLoginMethod('phone')}>Phone</button>
          </div>
          <form onSubmit={handleLogin}>
            {loginMethod === 'email' ? (
              <input className="ap-input" type="email" placeholder="Email" value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
            ) : (
              <div className="ap-phone-row">
                <span className="ap-cc">+977</span>
                <input className="ap-input" type="tel" placeholder="Phone number" value={loginData.phone}
                  onChange={e => setLoginData({ ...loginData, phone: e.target.value })} required />
              </div>
            )}
            <div className="ap-pwd-wrap">
              <input className="ap-input" type={showLoginPwd ? 'text' : 'password'} placeholder="Password"
                value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
              <button type="button" className="ap-eye" onClick={() => setShowLoginPwd(v => !v)}>
                {showLoginPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="ap-forgot"><Link to="/forgot-password">Forgot your password?</Link></div>
            {loginError && <p className="ap-error">{loginError}</p>}
            <button type="submit" className="ap-submit" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'SIGN IN'}
            </button>
            <p className="ap-role-link">Are you a Patient? <Link to="/login">Sign in here</Link></p>
          </form>
        </div>

        {/* Sign Up */}
        <div className="ap-form-panel ap-signup-panel">
          <h2>Doctor Sign Up</h2>
          <div className="ap-method-toggle">
            <button className={signupMethod === 'email' ? 'active' : ''} onClick={() => setSignupMethod('email')}>Email</button>
            <button className={signupMethod === 'phone' ? 'active' : ''} onClick={() => setSignupMethod('phone')}>Phone</button>
          </div>
          <form onSubmit={handleSignup}>
            <div className="ap-row">
              <input className="ap-input" type="text" placeholder="First Name" value={signupData.firstName}
                onChange={e => setSignupData({ ...signupData, firstName: e.target.value })} required />
              <input className="ap-input" type="text" placeholder="Last Name" value={signupData.lastName}
                onChange={e => setSignupData({ ...signupData, lastName: e.target.value })} required />
            </div>
            {signupMethod === 'email' ? (
              <input className="ap-input" type="email" placeholder="Email" value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value })} required />
            ) : (
              <div className="ap-phone-row">
                <span className="ap-cc">+977</span>
                <input className="ap-input" type="tel" placeholder="Phone number" value={signupData.phone}
                  onChange={e => setSignupData({ ...signupData, phone: e.target.value })} required />
              </div>
            )}
            <div className="ap-pwd-wrap">
              <input className="ap-input" type={showSignupPwd ? 'text' : 'password'} placeholder="Password"
                value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required />
              <button type="button" className="ap-eye" onClick={() => setShowSignupPwd(v => !v)}>
                {showSignupPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="ap-pwd-wrap">
              <input className="ap-input" type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirm Password"
                value={signupData.confirmPassword} onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })} required />
              <button type="button" className="ap-eye" onClick={() => setShowConfirmPwd(v => !v)}>
                {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {signupError && <p className="ap-error">{signupError}</p>}
            <button type="submit" className="ap-submit" disabled={signupLoading}>
              {signupLoading ? 'Creating...' : 'SIGN UP'}
            </button>
            <p className="ap-role-link">Are you a Patient? <Link to="/auth?mode=signup">Sign up here</Link></p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default DoctorAuth;
