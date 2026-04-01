import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './Registration.css';

const MedicalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [formData, setFormData] = useState({
    medicalConditions: existingData.medicalConditions || '',
    allergies: existingData.allergies || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/register/nid', {
      state: { ...existingData, ...formData }
    });
  };

  const handleBack = () => {
    navigate('/register/emergency', { state: existingData });
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
            <div className="step active">4</div>
            <div className="step-line"></div>
            <div className="step">5</div>
          </div>
          <h2>Medical Information</h2>
          <p>Help us understand your health better</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="form-group">
            <label>Known Medical Conditions</label>
            <textarea
              name="medicalConditions"
              placeholder="e.g. Diabetes, Hypertension, Heart Disease, Asthma..."
              value={formData.medicalConditions}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Allergies</label>
            <textarea
              name="allergies"
              placeholder="e.g. Penicillin, Peanuts, Dust, Latex..."
              value={formData.allergies}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="info-box">
            <div className="info-icon">i</div>
            <p>This information helps doctors provide better care. You can update it later from your profile.</p>
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

export default MedicalInfo;
