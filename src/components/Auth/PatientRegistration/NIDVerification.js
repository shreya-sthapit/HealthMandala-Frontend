import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './Registration.css';

const NIDVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nidNumber: existingData.nidNumber || '',
    nidFront: null,
    nidBack: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFormData({ ...formData, nidFront: file });
          setFrontPreview(reader.result);
        } else {
          setFormData({ ...formData, nidBack: file });
          setBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (side) => {
    if (side === 'front') {
      setFormData({ ...formData, nidFront: null });
      setFrontPreview(null);
    } else {
      setFormData({ ...formData, nidBack: null });
      setBackPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nidNumber.trim()) {
      setError('Please enter your NID number');
      return;
    }
    
    if (!formData.nidFront || !formData.nidBack) {
      setError('Please upload both front and back images of your NID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('userId', existingData.userId || '');
      formDataToSend.append('firstName', existingData.firstName || '');
      formDataToSend.append('lastName', existingData.lastName || '');
      formDataToSend.append('email', existingData.email || '');
      formDataToSend.append('phone', existingData.phone || '');
      formDataToSend.append('dateOfBirth', existingData.dateOfBirth || '');
      formDataToSend.append('gender', existingData.gender || '');
      formDataToSend.append('bloodGroup', existingData.bloodGroup || '');
      formDataToSend.append('address', existingData.address || '');
      formDataToSend.append('city', existingData.city || '');
      formDataToSend.append('district', existingData.district || '');
      formDataToSend.append('province', existingData.province || '');
      formDataToSend.append('emergencyContactName', existingData.emergencyContactName || '');
      formDataToSend.append('emergencyContactPhone', existingData.emergencyContactPhone || '');
      formDataToSend.append('emergencyContactRelation', existingData.emergencyContactRelation || '');
      formDataToSend.append('medicalConditions', existingData.medicalConditions || '');
      formDataToSend.append('allergies', existingData.allergies || '');
      formDataToSend.append('nidNumber', formData.nidNumber);
      
      // Add files
      if (existingData.profilePhoto) {
        formDataToSend.append('profilePhoto', existingData.profilePhoto);
      }
      formDataToSend.append('nidFront', formData.nidFront);
      formDataToSend.append('nidBack', formData.nidBack);

      console.log('Submitting registration with files...');

      const response = await fetch('http://localhost:5001/api/patient/register', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header, let browser set it with boundary
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage for dashboard access
        localStorage.setItem('user', JSON.stringify({
          id: data.registration.id,
          firstName: existingData.firstName,
          lastName: existingData.lastName,
          email: existingData.email,
          role: 'patient'
        }));
        localStorage.setItem('userRole', 'patient');
        
        // Redirect to patient dashboard
        navigate('/home');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/register/medical', { state: existingData });
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
            <div className="step completed">1</div>
            <div className="step-line completed"></div>
            <div className="step completed">2</div>
            <div className="step-line completed"></div>
            <div className="step completed">3</div>
            <div className="step-line completed"></div>
            <div className="step completed">4</div>
            <div className="step-line completed"></div>
            <div className="step active">5</div>
          </div>
          <h2>NID Verification</h2>
          <p>Upload your National ID for verification</p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NID Number *</label>
            <input
              type="text"
              name="nidNumber"
              placeholder="Enter your NID number"
              value={formData.nidNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="upload-section">
            <label>Upload NID Photos *</label>
            <div className="upload-grid">
              <div className="upload-box">
                <p className="upload-label">Front Side</p>
                {frontPreview ? (
                  <div className="image-preview">
                    <img src={frontPreview} alt="NID Front" />
                    <button type="button" className="remove-btn" onClick={() => removeImage('front')}>X</button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} hidden />
                    <div className="upload-content">
                      <div className="upload-icon">+</div>
                      <span>Upload</span>
                    </div>
                  </label>
                )}
              </div>

              <div className="upload-box">
                <p className="upload-label">Back Side</p>
                {backPreview ? (
                  <div className="image-preview">
                    <img src={backPreview} alt="NID Back" />
                    <button type="button" className="remove-btn" onClick={() => removeImage('back')}>X</button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} hidden />
                    <div className="upload-content">
                      <div className="upload-icon">+</div>
                      <span>Upload</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="info-box">
            <div className="info-icon">i</div>
            <p>Your NID will be used for identity verification and kept secure.</p>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="btn-group">
            <button type="button" className="reg-btn secondary" onClick={handleBack}>Back</button>
            <button type="submit" className="reg-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NIDVerification;
