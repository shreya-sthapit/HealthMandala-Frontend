import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './AuthPage.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SPECIALIZATIONS = [
  'General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic',
  'Pediatrician','Psychiatrist','Gynecologist','ENT Specialist','Ophthalmologist',
  'Dentist','Surgeon','Other'
];

const QUALIFICATIONS = ['MBBS','MD','MS','BDS','MDS','FCPS','MCh','DM','PhD','Other'];

const HOSPITALS = [
  'B&B Hospital','Bir Hospital','B.P. Koirala Lions Center',
  'Civil Service Hospital','Grande International Hospital',
  'Koshi Hospital','Manmohan Cardiothoracic Vascular and Transplant Center',
  'Patan Hospital','Tribhuvan University Teaching Hospital','Other'
];

const DoctorAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDir, setExitDir] = useState('');

  // Sign In
  const [loginData, setLoginData] = useState({ email: '', phone: '', password: '' });
  const [loginMethod, setLoginMethod] = useState('email');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up
  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    nmcNumber: '', experienceYears: '', specialization: '', qualification: '', currentHospital: []
  });
  const [signupMethod, setSignupMethod] = useState('email');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [hospitalDropdownOpen, setHospitalDropdownOpen] = useState(false);
  const hospitalRef = useRef(null);

  // Close hospital dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (hospitalRef.current && !hospitalRef.current.contains(e.target)) {
        setHospitalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Password hints
  const [pwdReqs, setPwdReqs] = useState({ length: 'unmet', number: 'unmet', special: 'unmet' });
  useEffect(() => {
    const p = signupData.password;
    const checks = {
      length: p.length >= 6,
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    };
    setPwdReqs(prev => {
      const next = { ...prev };
      Object.keys(checks).forEach(key => {
        if (checks[key] && prev[key] === 'unmet') {
          next[key] = 'met';
          setTimeout(() => setPwdReqs(r => ({ ...r, [key]: 'hidden' })), 800);
        } else if (!checks[key] && prev[key] === 'hidden') {
          next[key] = 'unmet';
        }
      });
      return next;
    });
  }, [signupData.password]); // eslint-disable-line

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
    if (!/[0-9]/.test(signupData.password)) { setSignupError('Password must contain at least one number'); return; }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupData.password)) { setSignupError('Password must contain at least one special character'); return; }
    if (!signupData.nmcNumber) { setSignupError('NMC Registration Number is required'); return; }
    if (!signupData.specialization) { setSignupError('Please select a specialization'); return; }
    if (!signupData.qualification) { setSignupError('Please select a qualification'); return; }

    setSignupLoading(true);
    try {
      if (signupMethod === 'email') {
        const res = await fetch('http://localhost:5001/api/auth/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            password: signupData.password,
            role: 'doctor',
            // Extra doctor fields stored for after OTP verification
            nmcNumber: signupData.nmcNumber,
            experienceYears: signupData.experienceYears,
            specialization: signupData.specialization,
            qualification: signupData.qualification,
            currentHospital: signupData.currentHospital,
          }),
        });
        const data = await res.json();
        if (data.success) {
          // Store extra fields in sessionStorage for after OTP
          sessionStorage.setItem('doctorExtraData', JSON.stringify({
            nmcNumber: signupData.nmcNumber,
            experienceYears: signupData.experienceYears,
            specialization: signupData.specialization,
            qualification: signupData.qualification,
            currentHospital: signupData.currentHospital,
          }));
          navigate('/verify-email', {
            state: { email: signupData.email, firstName: signupData.firstName, lastName: signupData.lastName, role: 'doctor' }
          });
        } else {
          setSignupError(data.error || 'Failed to send OTP.');
        }
      } else {
        const phone = `+977${signupData.phone}`;
        const res = await fetch('http://localhost:5001/api/otp/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: phone }),
        });
        const data = await res.json();
        if (data.success) navigate('/verify-otp', {
          state: { contact: phone, method: signupMethod, firstName: signupData.firstName, lastName: signupData.lastName, password: signupData.password, role: 'doctor',
            nmcNumber: signupData.nmcNumber, experienceYears: signupData.experienceYears, specialization: signupData.specialization, qualification: signupData.qualification, currentHospital: signupData.currentHospital }
        });
        else setSignupError(data.message || 'Failed to send OTP.');
      }
    } catch { setSignupError('Failed to create account. Please try again.'); }
    finally { setSignupLoading(false); }
  };

  const isSignup = mode === 'signup';
  const sd = signupData;
  const setSd = (field, val) => setSignupData(prev => ({ ...prev, [field]: val }));

  const toggleHospital = (hospital) => {
    setSd('currentHospital', sd.currentHospital.includes(hospital)
      ? sd.currentHospital.filter(h => h !== hospital)
      : [...sd.currentHospital, hospital]
    );
  };

  return (
    <div className="ap-page">
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

        {/* ── Sign In ── */}
        <div className="ap-form-panel ap-signin-panel">
          <h2>Doctor Sign In</h2>
          <div className="ap-method-toggle">
            <button className={loginMethod === 'email' ? 'active' : ''} onClick={() => setLoginMethod('email')}>Email</button>
            <button className={loginMethod === 'phone' ? 'active' : ''} onClick={() => setLoginMethod('phone')}>Phone</button>
          </div>
          <form onSubmit={handleLogin}>
            {loginMethod === 'email' ? (
              <div className="ap-float">
                <input type="email" placeholder=" " value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                <label>Email</label>
              </div>
            ) : (
              <div className="ap-phone-row">
                <span className="ap-cc">+977</span>
                <div className="ap-float" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="tel" placeholder=" " value={loginData.phone}
                    onChange={e => setLoginData({ ...loginData, phone: e.target.value.replace(/\D/g, '') })} required />
                  <label>Phone number</label>
                </div>
              </div>
            )}
            <div className="ap-float">
              <input type={showLoginPwd ? 'text' : 'password'} placeholder=" "
                value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required style={{ paddingRight: '3rem' }} />
              <label>Password</label>
              <button type="button" className="ap-eye" onClick={() => setShowLoginPwd(v => !v)}>
                {showLoginPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="ap-forgot"><Link to="/forgot-password">Forgot your password?</Link></div>
            {loginError && <p className="ap-error">{loginError}</p>}
            <button type="submit" className="ap-submit" disabled={loginLoading}>{loginLoading ? 'Signing in...' : 'SIGN IN'}</button>
            <p className="ap-role-link">Are you a Patient? <Link to="/login">Sign in here</Link></p>
          </form>
        </div>

        {/* ── Sign Up ── */}
        <div className="ap-form-panel ap-signup-panel">
          <h2>Doctor Sign Up</h2>
          <div className="ap-method-toggle">
            <button className={signupMethod === 'email' ? 'active' : ''} onClick={() => setSignupMethod('email')}>Email</button>
            <button className={signupMethod === 'phone' ? 'active' : ''} onClick={() => setSignupMethod('phone')}>Phone</button>
          </div>
          <form onSubmit={handleSignup} noValidate>
            {/* Name */}
            <div className="ap-row">
              <div className="ap-float">
                <input type="text" placeholder=" " value={sd.firstName} onChange={e => setSd('firstName', e.target.value)} required />
                <label>First Name</label>
              </div>
              <div className="ap-float">
                <input type="text" placeholder=" " value={sd.lastName} onChange={e => setSd('lastName', e.target.value)} required />
                <label>Last Name</label>
              </div>
            </div>

            {/* Email or Phone */}
            {signupMethod === 'email' ? (
              <div className="ap-float">
                <input type="email" placeholder=" " value={sd.email} onChange={e => setSd('email', e.target.value)} required />
                <label>Email</label>
              </div>
            ) : (
              <div className="ap-phone-row">
                <span className="ap-cc">+977</span>
                <div className="ap-float" style={{ flex: 1, marginBottom: 0 }}>
                  <input type="tel" placeholder=" " value={sd.phone} onChange={e => setSd('phone', e.target.value.replace(/\D/g, ''))} required />
                  <label>Phone number</label>
                </div>
              </div>
            )}

            {/* NMC Number */}
            <div className="ap-float">
              <input type="text" placeholder=" " value={sd.nmcNumber} onChange={e => setSd('nmcNumber', e.target.value.replace(/\D/g, ''))} inputMode="numeric" required />
              <label>NMC Registration Number</label>
            </div>

            {/* Specialization + Qualification */}
            <div className="ap-row">
              <div className={`ap-float ${sd.specialization ? 'has-value' : ''}`}>
                <select value={sd.specialization} onChange={e => setSd('specialization', e.target.value)} required onInvalid={e => e.preventDefault()} style={{ color: sd.specialization ? '#1e293b' : 'transparent' }}>
                  <option value="" disabled hidden> </option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label>Specialization</label>
              </div>
              <div className={`ap-float ${sd.qualification ? 'has-value' : ''}`}>
                <select value={sd.qualification} onChange={e => setSd('qualification', e.target.value)} required onInvalid={e => e.preventDefault()} style={{ color: sd.qualification ? '#1e293b' : 'transparent' }}>
                  <option value="" disabled hidden> </option>
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <label>Qualification</label>
              </div>
            </div>

            {/* Experience */}
            <div className="ap-float">
              <input type="text" placeholder=" " value={sd.experienceYears} onChange={e => setSd('experienceYears', e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
              <label>Years of Experience</label>
            </div>

            {/* Hospital */}
            <div className="ap-multiselect-wrap" ref={hospitalRef}>
              <div
                className={`ap-multiselect-trigger ${sd.currentHospital.length > 0 ? 'has-value' : ''}`}
                onClick={(e) => { e.preventDefault(); setHospitalDropdownOpen(v => !v); }}
              >
                {sd.currentHospital.length > 0 && (
                  <div className="ap-multiselect-tags">
                    {sd.currentHospital.map(h => (
                      <span key={h} className="ap-multiselect-tag">{h}</span>
                    ))}
                  </div>
                )}
              </div>
              <label>Currently Working At</label>
              {hospitalDropdownOpen && (
                <div className="ap-multiselect-dropdown">
                  {HOSPITALS.map(h => (
                    <label key={h} className="ap-multiselect-option">
                      <input
                        type="checkbox"
                        checked={sd.currentHospital.includes(h)}
                        onChange={() => toggleHospital(h)}
                      />
                      <span>{h}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="ap-float">
              <input type={showSignupPwd ? 'text' : 'password'} placeholder=" " value={sd.password} onChange={e => setSd('password', e.target.value)} required style={{ paddingRight: '3rem' }} />
              <label>Password</label>
              <button type="button" className="ap-eye" onClick={() => setShowSignupPwd(v => !v)}>
                {showSignupPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Live password hints */}
            {sd.password && (pwdReqs.length !== 'hidden' || pwdReqs.number !== 'hidden' || pwdReqs.special !== 'hidden') && (
              <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {pwdReqs.length !== 'hidden' && (
                  <span style={{ color: pwdReqs.length === 'met' ? '#059669' : '#dc2626', transition: 'opacity 0.3s', opacity: pwdReqs.length === 'met' ? 0.7 : 1 }}>
                    {pwdReqs.length === 'met' ? '✓' : '✗'} At least 6 characters
                  </span>
                )}
                {pwdReqs.number !== 'hidden' && (
                  <span style={{ color: pwdReqs.number === 'met' ? '#059669' : '#dc2626', transition: 'opacity 0.3s', opacity: pwdReqs.number === 'met' ? 0.7 : 1 }}>
                    {pwdReqs.number === 'met' ? '✓' : '✗'} At least one number
                  </span>
                )}
                {pwdReqs.special !== 'hidden' && (
                  <span style={{ color: pwdReqs.special === 'met' ? '#059669' : '#dc2626', transition: 'opacity 0.3s', opacity: pwdReqs.special === 'met' ? 0.7 : 1 }}>
                    {pwdReqs.special === 'met' ? '✓' : '✗'} At least one special character
                  </span>
                )}
              </div>
            )}

            {/* Confirm Password */}
            <div className="ap-float">
              <input type={showConfirmPwd ? 'text' : 'password'} placeholder=" " value={sd.confirmPassword} onChange={e => setSd('confirmPassword', e.target.value)} required style={{ paddingRight: '3rem' }} />
              <label>Confirm Password</label>
              <button type="button" className="ap-eye" onClick={() => setShowConfirmPwd(v => !v)}>
                {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {signupError && <p className="ap-error">{signupError}</p>}
            <button type="submit" className="ap-submit" disabled={signupLoading}>{signupLoading ? 'Creating...' : 'SIGN UP'}</button>
            <p className="ap-role-link">Are you a Patient? <Link to="/auth?mode=signup">Sign up here</Link></p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default DoctorAuth;
