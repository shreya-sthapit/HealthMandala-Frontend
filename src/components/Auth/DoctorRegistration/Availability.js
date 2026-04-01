import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './DoctorRegistration.css';

const Availability = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [formData, setFormData] = useState({
    availableDays: existingData.availableDays || [],
    availableTimeStart: existingData.availableTimeStart || '09:00',
    availableTimeEnd: existingData.availableTimeEnd || '17:00',
    address: existingData.address || '',
    city: existingData.city || '',
    district: existingData.district || '',
    province: existingData.province || ''
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const provinces = [
    'Province 1 (Koshi)', 'Province 2 (Madhesh)', 'Province 3 (Bagmati)',
    'Province 4 (Gandaki)', 'Province 5 (Lumbini)', 'Province 6 (Karnali)', 'Province 7 (Sudurpashchim)'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    const newDays = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    setFormData({ ...formData, availableDays: newDays });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/doctor-register/documents', { state: { ...existingData, ...formData } });
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
            <div className="step-line"></div>
            <div className="step">5</div>
          </div>
          <h2>Availability & Location</h2>
          <p>When and where can patients find you?</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="form-group">
            <label>Available Days</label>
            <div className="days-grid">
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${formData.availableDays.includes(day) ? 'selected' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="availableTimeStart" value={formData.availableTimeStart} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="availableTimeEnd" value={formData.availableTimeEnd} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Clinic/Hospital Address</label>
            <input type="text" name="address" placeholder="Street address" value={formData.address} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>District</label>
              <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} />
            </div>
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

export default Availability;
