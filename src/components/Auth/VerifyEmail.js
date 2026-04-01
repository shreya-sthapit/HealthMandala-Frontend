import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase.ts';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import './Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const firstName = location.state?.firstName || '';
  const lastName = location.state?.lastName || '';
  const password = location.state?.password || '';
  const role = location.state?.role || 'patient';

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Listen for auth state changes to check if email is verified
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Reload user to get latest emailVerified status
        await user.reload();
        if (user.emailVerified) {
          // Register user in MongoDB
          await registerUserInDB(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const registerUserInDB = async (firebaseUid) => {
    setIsRegistering(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/register/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          firebaseUid
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        const redirectPath = role === 'doctor' ? '/doctor-register/personal' : '/register/personal';
        navigate(redirectPath, { 
          state: { 
            role,
            userId: data.user.id,
            firstName,
            lastName,
            email
          } 
        });
      } else {
        setResendMessage(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setResendMessage('Failed to complete registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsResending(true);
    setResendMessage('');

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setResendMessage('Verification email sent successfully!');
        setCountdown(60);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResendMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        await registerUserInDB(user.uid);
      } else {
        setResendMessage('Email not verified yet. Please check your inbox.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>HealthMandala</span>
          </Link>
          <div className="verify-icon">
            <div className="email-icon">@</div>
          </div>
          <h2>Verify Your Email</h2>
          <p>
            {firstName ? `Hi ${firstName}! ` : ''}We've sent a verification link to
          </p>
          <p className="email-highlight">{email}</p>
        </div>

        <div className="verify-content">
          <div className="verify-steps">
            <div className="verify-step">
              <div className="step-number">1</div>
              <p>Check your email inbox</p>
            </div>
            <div className="verify-step">
              <div className="step-number">2</div>
              <p>Click the verification link</p>
            </div>
            <div className="verify-step">
              <div className="step-number">3</div>
              <p>Come back and continue</p>
            </div>
          </div>

          {resendMessage && (
            <p className={`verify-message ${resendMessage.includes('success') ? 'success' : 'error'}`}>
              {resendMessage}
            </p>
          )}

          <button 
            className="auth-submit" 
            onClick={handleCheckVerification}
            disabled={isRegistering}
          >
            {isRegistering ? 'Completing Registration...' : "I've Verified My Email"}
          </button>

          <div className="resend-section">
            <p>Didn't receive the email?</p>
            {canResend ? (
              <button 
                className="resend-btn"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            ) : (
              <p className="countdown">Resend available in {countdown}s</p>
            )}
          </div>
        </div>

        <p className="auth-footer">
          Wrong email? <Link to="/signup">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
