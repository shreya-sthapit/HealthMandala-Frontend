import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Passed via navigate state (from signup popup)
  const email = location.state?.email || '';
  const firstName = location.state?.firstName || '';

  // Full registration data stored in sessionStorage for resend
  const pendingData = JSON.parse(sessionStorage.getItem('pendingVerification') || '{}');

  // Status from backend redirect after clicking link
  const status = searchParams.get('status'); // 'invalid' | 'expired' | 'error' | 'already-verified'

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Show status messages from backend redirect
  useEffect(() => {
    if (status === 'expired') {
      setMessage('Verification link has expired. Please request a new one.');
      setMessageType('error');
    } else if (status === 'invalid') {
      setMessage('Invalid verification link. Please request a new one.');
      setMessageType('error');
    } else if (status === 'error') {
      setMessage('Something went wrong. Please try again.');
      setMessageType('error');
    } else if (status === 'already-verified') {
      setMessage('Email already verified. You can sign in.');
      setMessageType('success');
    }
  }, [status]);

  const handleResend = async () => {
    if (!canResend) return;
    const data = pendingData;
    if (!data.email) {
      setMessage('Cannot resend — registration data not found. Please sign up again.');
      setMessageType('error');
      return;
    }
    setIsResending(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Verification email resent! Check your inbox.');
        setMessageType('success');
        setCountdown(60);
        setCanResend(false);
      } else {
        setMessage(result.error || 'Failed to resend. Please try again.');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to resend. Please check your connection.');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <img src="/logo.png" alt="HealthMandala" className="auth-brand-logo" />
            <span>HealthMandala</span>
          </div>
          <div className="auth-left-content">
            <h1>Almost<br/>There!</h1>
            <p>Just one more step — verify your email to activate your account.</p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <svg className="auth-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Secure email verification</span>
              </div>
              <div className="auth-feature-item">
                <svg className="auth-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Link expires in 24 hours</span>
              </div>
            </div>
          </div>
          <div className="auth-illustration">
            <img src="/Middle Image.png" alt="Healthcare" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <div className="email-icon">✉</div>
              <h2>Verify Your Email</h2>
              {firstName && <p>Hi {firstName}! We've sent a verification link to</p>}
              {email && <p className="email-highlight">{email}</p>}
              {!email && <p>Check your inbox for the verification link.</p>}
            </div>

            <div className="verify-steps">
              <div className="verify-step">
                <div className="step-number">1</div>
                <p>Check your email inbox (and spam folder)</p>
              </div>
              <div className="verify-step">
                <div className="step-number">2</div>
                <p>Click the "Verify Email" button in the email</p>
              </div>
              <div className="verify-step">
                <div className="step-number">3</div>
                <p>You'll be redirected to complete your profile</p>
              </div>
            </div>

            {message && (
              <div className={`verify-message ${messageType}`}>
                {message}
              </div>
            )}

            {email && (
              <div className="resend-section">
                <p>Didn't receive the email?</p>
                {canResend ? (
                  <button className="resend-btn" onClick={handleResend} disabled={isResending}>
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                ) : (
                  <p className="countdown">Resend available in <span>{countdown}s</span></p>
                )}
              </div>
            )}

            <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
              Wrong email? <Link to="/login">Go back</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
