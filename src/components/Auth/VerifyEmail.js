import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import './AuthPage.css';

const VerifyEmail = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const email = location.state?.email || '';
  const firstName = location.state?.firstName || '';
  const pendingData = JSON.parse(sessionStorage.getItem('pendingVerification') || '{}');

  const token = searchParams.get('token');
  const status = searchParams.get('status');

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Forward token to backend when user clicks email link
  useEffect(() => {
    if (token) {
      window.location.href = `http://localhost:5001/api/auth/verify-email?token=${token}`;
    }
  }, [token]);

  // Clear sessionStorage on success
  useEffect(() => {
    if (status && status !== 'error') {
      sessionStorage.removeItem('pendingVerification');
    }
  }, [status]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Status messages
  useEffect(() => {
    if (status === 'expired') { setMessage('Verification link has expired. Please request a new one.'); setMessageType('error'); }
    else if (status === 'invalid') { setMessage('Invalid verification link. Please request a new one.'); setMessageType('error'); }
    else if (status === 'error') { setMessage('Something went wrong. Please try again.'); setMessageType('error'); }
    else if (status === 'already-verified') { setMessage('Email already verified. You can sign in.'); setMessageType('success'); }
  }, [status]);

  const handleResend = async () => {
    if (!canResend) return;
    const data = pendingData;
    if (!data.email) { setMessage('Cannot resend — please sign up again.'); setMessageType('error'); return; }
    setIsResending(true); setMessage('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) { setMessage('Verification email resent!'); setMessageType('success'); setCountdown(60); setCanResend(false); }
      else { setMessage(result.error || 'Failed to resend.'); setMessageType('error'); }
    } catch { setMessage('Failed to resend. Check your connection.'); setMessageType('error'); }
    finally { setIsResending(false); }
  };

  // While forwarding token to backend
  if (token) {
    return (
      <div className="ap-page">
        <div className="ap-card" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#00a896', fontWeight: 600, fontSize: '1.1rem' }}>Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-page">
      <div className="ap-card">

        {/* ── Teal left panel ── */}
        <div className="ap-overlay-panel" style={{ position: 'relative', left: 0, width: '50%', borderRadius: '20px 0 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 2rem', textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Almost There!</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, maxWidth: 220, marginBottom: '1.5rem' }}>
            Just one more step — verify your email to activate your account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
            {['Secure email verification', 'Link expires in 24 hours', 'Check spam if not received'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.65rem 1rem', fontSize: '0.84rem', color: '#fff', backdropFilter: 'blur(4px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── White right panel ── */}
        <div className="ap-form-panel ap-signin-panel" style={{ opacity: 1, transform: 'none', pointerEvents: 'all', right: 0, left: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', textAlign: 'center' }}>
              Verify Your Email
            </h2>

            {firstName && (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                Hi {firstName}! We've sent a verification link to
              </p>
            )}
            {(email || pendingData.email) && (
              <p style={{ textAlign: 'center', color: '#00a896', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                {email || pendingData.email}
              </p>
            )}

            {/* Steps */}
            <div style={{ background: '#f0fdfa', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                'Check your email inbox (and spam folder)',
                'Click the "Verify Email" button in the email',
                "You'll be redirected to complete your profile"
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.65rem 0', borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#00a896', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.5, margin: 0, paddingTop: 3 }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Status message */}
            {message && (
              <div className={`ap-error`} style={{ background: messageType === 'success' ? '#d1fae5' : '#fef2f2', color: messageType === 'success' ? '#059669' : '#dc2626', marginBottom: '1rem' }}>
                {message}
              </div>
            )}

            {/* Resend */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '0.4rem' }}>Didn't receive the email?</p>
              {canResend ? (
                <button className="ap-submit" onClick={handleResend} disabled={isResending} style={{ width: 'auto', padding: '0.6rem 1.8rem', fontSize: '0.85rem' }}>
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              ) : (
                <p style={{ color: '#00a896', fontSize: '0.84rem', fontWeight: 600 }}>
                  Resend available in {countdown}s
                </p>
              )}
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
              Wrong email? <Link to="/login" style={{ color: '#00a896', fontWeight: 700, textDecoration: 'none' }}>Go back</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;
