import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './Registration.css';

const AddressInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [formData, setFormData] = useState({
    address: existingData.address || '',
    city: existingData.city || '',
    district: existingData.district || '',
    province: existingData.province || ''
  });

  const provinces = [
    'Province 1 (Koshi)',
    'Province 2 (Madhesh)',
    'Province 3 (Bagmati)',
    'Province 4 (Gandaki)',
    'Province 5 (Lumbini)',
    'Province 6 (Karnali)',
    'Province 7 (Sudurpashchim)'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/register/emergency', {
      state: { ...existingData, ...formData }
    });
  };

  const handleBack = () => {
    navigate('/register/personal', { state: existingData });
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
            <div className="step active">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
            <div className="step-line"></div>
            <div className="step">4</div>
            <div className="step-line"></div>
            <div className="step">5</div>
          </div>
          <h2>Address Information</h2>
          <p>Where do you live?</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              placeholder="Street address, ward no."
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>City/Municipality</label>
            <input
              type="text"
              name="city"
              placeholder="e.g. Kathmandu"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              type="text"
              name="district"
              placeholder="e.g. Kathmandu"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Province</label>
            <select name="province" value={formData.province} onChange={handleChange}>
              <option value="">Select Province</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
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

export default AddressInfo;
