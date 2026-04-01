import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    countryCode: '+977',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginData = {
        password: formData.password
      };

      if (authMethod === 'email') {
        loginData.email = formData.email;
      } else {
        loginData.phone = `+977${formData.phone}`;
      }

      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role); // Store role for profile access

        // Redirect based on role (ignore pending status)
        if (data.user.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h2>Welcome Back</h2>
          <p>Login to manage your appointments</p>
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
                placeholder="Enter your password"
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

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
