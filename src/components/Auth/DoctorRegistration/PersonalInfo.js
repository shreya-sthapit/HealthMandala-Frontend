import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DoctorRegLayout from './DoctorRegLayout';
import './DoctorRegLayout.css';

const DoctorPersonalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const existingData = location.state || {};
  const userId = existingData.userId || searchParams.get('userId');
  const firstName = existingData.firstName || searchParams.get('firstName') || '';
  const lastName = existingData.lastName || searchParams.get('lastName') || '';
  const email = existingData.email || searchParams.get('email') || '';
  const role = existingData.role || searchParams.get('role') || 'doctor';

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
      state: { ...existingData, ...formData, profilePreview, userId, firstName, lastName, email, role }
    });
  };

  return (
    <DoctorRegLayout step={1} title="Personal Information" subtitle="Tell us about yourself">
      <form className="reg-form" onSubmit={handleNext}>
        <div className="profile-photo-section" style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>Profile Photo</label>
          <div className="profile-upload-wrapper">
            {profilePreview ? (
              <div className="profile-preview">
                <img src={profilePreview} alt="Profile" />
                <button type="button" className="remove-btn" onClick={() => { setProfilePreview(null); setFormData({...formData, profilePhoto: null}); }}>✕</button>
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
        <button type="submit" className="reg-btn">Continue →</button>
      </form>
    </DoctorRegLayout>
  );
};

export default DoctorPersonalInfo;
