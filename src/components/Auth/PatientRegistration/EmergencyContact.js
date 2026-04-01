import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './Registration.css';

const EmergencyContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [formData, setFormData] = useState({
    emergencyContactName: existingData.emergencyContactName || '',
    emergencyContactPhone: existingData.emergencyContactPhone || '',
    emergencyContactRelation: existingData.emergencyContactRelation || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/register/medical', {
      state: { ...existingData, ...formData }
    });
  };

  const handleBack = () => {
    navigate('/register/address', { state: existingData });
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
            <div className="step-line"></div>
            <div className="step">5</div>
          </div>
          <h2>Emergency Contact</h2>
          <p>Who should we contact in case of emergency?</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="form-group">
            <label>Contact Name</label>
            <input
              type="text"
              name="emergencyContactName"
              placeholder="Full name"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <select name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange}>
              <option value="">Select Relation</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <div className="phone-input-group">
              <span className="country-code">+977</span>
              <input
                type="tel"
                name="emergencyContactPhone"
                placeholder="98XXXXXXXX"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="info-box">
            <div className="info-icon">i</div>
            <p>This information is optional but recommended for your safety.</p>
          </div>

          <div className="btn-group">
            <button type="button" className="reg-btn secondary" onClick={handleBack}>Back</button>
            <button type="submit" className="reg-btn">Next</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyContact;
