import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './DoctorRegistration.css';

const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [nmcPreview, setNmcPreview] = useState(null);
  const [degreePreview, setDegreePreview] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nmcCertificate: null,
    degreeCertificate: null,
    bio: existingData.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'nmc') {
          setFormData({ ...formData, nmcCertificate: file });
          setNmcPreview(reader.result);
        } else {
          setFormData({ ...formData, degreeCertificate: file });
          setDegreePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/doctor-register/nid', {
      state: { ...existingData, ...formData, nmcCertificateImage: nmcPreview, degreeCertificateImage: degreePreview }
    });
  };

  const handleBack = () => {
    navigate('/doctor-register/professional', { state: existingData });
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
            <div className="step active">3</div>
            <div className="step-line"></div>
            <div className="step">4</div>
          </div>
          <h2>Documents & Bio</h2>
          <p>Upload your certificates</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="upload-section">
            <label>NMC Certificate</label>
            <div className="upload-grid">
              <div className="upload-box full-width">
                {nmcPreview ? (
                  <div className="image-preview">
                    <img src={nmcPreview} alt="NMC Certificate" />
                    <button type="button" className="remove-btn" onClick={() => { setNmcPreview(null); setFormData({...formData, nmcCertificate: null}); }}>X</button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleImageChange(e, 'nmc')} hidden />
                    <div className="upload-content">
                      <div className="upload-icon">+</div>
                      <span>Upload NMC Certificate</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="upload-section">
            <label>Degree Certificate</label>
            <div className="upload-grid">
              <div className="upload-box full-width">
                {degreePreview ? (
                  <div className="image-preview">
                    <img src={degreePreview} alt="Degree Certificate" />
                    <button type="button" className="remove-btn" onClick={() => { setDegreePreview(null); setFormData({...formData, degreeCertificate: null}); }}>X</button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleImageChange(e, 'degree')} hidden />
                    <div className="upload-content">
                      <div className="upload-icon">+</div>
                      <span>Upload Degree Certificate</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Professional Bio</label>
            <textarea
              name="bio"
              placeholder="Write a brief introduction about yourself, your experience, and expertise..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          <div className="btn-group">
            <button type="button" className="reg-btn secondary" onClick={handleBack}>Back</button>
            <button type="submit" className="reg-btn">Next</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Documents;
