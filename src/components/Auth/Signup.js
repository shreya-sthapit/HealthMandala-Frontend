import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase.ts';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+977',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/verify-email', {
      state: {
        email: popupEmail,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate role selection
    if (!formData.role) {
      setError('Please select whether you are a Patient or Doctor');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (authMethod === 'email') {
      setIsLoading(true);
      try {
        // Create user with Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Send email verification
        await sendEmailVerification(userCredential.user);

        console.log('User created:', userCredential.user.uid);
        console.log('Verification email sent to:', formData.email);

        // Show popup
        setPopupEmail(formData.email);
        setShowPopup(true);
      } catch (err) {
        console.error('Signup error:', err);
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('This email is already registered. Please login instead.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please use a stronger password.');
            break;
          default:
            setError('Failed to create account. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Phone authentication with Twilio
      setIsLoading(true);
      try {
        const phoneNumber = `+977${formData.phone}`;
        
        // Call backend to send OTP via Twilio
        const response = await fetch('http://localhost:5001/api/otp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();

        if (data.success) {
          // Navigate to OTP verification page
          navigate('/verify-otp', {
            state: {
              contact: phoneNumber,
              method: authMethod,
              firstName: formData.firstName,
              lastName: formData.lastName,
              password: formData.password,
              role: formData.role
            }
          });
        } else {
          setError(data.message || 'Failed to send OTP. Please try again.');
        }
      } catch (err) {
        console.error('Phone signup error:', err);
        setError('Failed to send OTP. Please check your phone number and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      {/* Email Sent Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <div className="popup-icon success">✓</div>
            <h3>Verification Email Sent!</h3>
            <p>We've sent a verification link to:</p>
            <p className="popup-email">{popupEmail}</p>
            <p className="popup-note">Please check your inbox and click the link to verify your email address.</p>
            <button className="popup-btn" onClick={handlePopupClose}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>HealthMandala</span>
          </Link>
          <h2>Create Account</h2>
          <p>Join us for better healthcare</p>
        </div>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
          >
            Email
          </button>
          <button
            className={`toggle-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setAuthMethod('phone')}
          >
            Phone
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selection">
            <div className="role-options">
              <div 
                className={`role-option ${formData.role === 'patient' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'patient' })}
              >
                <div className="role-icon">P</div>
                <span>Patient</span>
              </div>
              <div 
                className={`role-option ${formData.role === 'doctor' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'doctor' })}
              >
                <div className="role-icon">D</div>
                <span>Doctor</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {authMethod === 'email' ? (
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Phone Number</label>
              <div className="phone-input-group">
                <span className="country-code">+977</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="123-456-7890"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <p className="terms-text">
            By signing up, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>
          </p>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
