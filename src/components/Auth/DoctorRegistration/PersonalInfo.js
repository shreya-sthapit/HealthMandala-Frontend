import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './DoctorRegistration.css';

const DoctorPersonalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [profilePreview, setProfilePreview] = useState(existingData.profilePreview || null);
  const [formData, setFormData] = useState({
    profilePhoto: existingData.profilePhoto || null,
    dateOfBirth: existingData.dateOfBirth || '',
    gender: existingData.gender || ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: file });
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.dateOfBirth || !formData.gender) {
      setError('Please fill in Date of Birth and Gender');
      return;
    }
    navigate('/doctor-register/professional', {
      state: { ...existingData, ...formData, profilePreview }
    });
  };

  return (
    <div className="reg-container">
      <div className="reg-card">
        <div className="reg-header">
          <Link to="/" className="reg-logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>HealthMandala</span>
          </Link>
          <div className="step-indicator">
            <div className="step active">1</div>
            <div className="step-line"></div>
            <div className="step">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
            <div className="step-line"></div>
            <div className="step">4</div>
            <div className="step-line"></div>
            <div className="step">5</div>
          </div>
          <h2>Personal Information</h2>
          <p>Tell us about yourself</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="profile-photo-section">
            <label>Profile Photo</label>
            <div className="profile-upload-wrapper">
              {profilePreview ? (
                <div className="profile-preview">
                  <img src={profilePreview} alt="Profile" />
                  <button type="button" className="remove-btn" onClick={() => { setProfilePreview(null); setFormData({...formData, profilePhoto: null}); }}>X</button>
                </div>
              ) : (
                <label className="profile-upload-area">
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  <div className="profile-upload-content">
                    <div className="profile-icon">+</div>
                    <span>Upload</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Date of Birth *</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="reg-btn">Next</button>
        </form>
      </div>
    </div>
  );
};

export default DoctorPersonalInfo;
