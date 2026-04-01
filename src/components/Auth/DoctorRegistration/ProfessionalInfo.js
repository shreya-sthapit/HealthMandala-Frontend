import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../Auth.css';
import './DoctorRegistration.css';

const ProfessionalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [formData, setFormData] = useState({
    specialization: existingData.specialization || '',
    nmcNumber: existingData.nmcNumber || '',
    qualification: existingData.qualification || '',
    experienceYears: existingData.experienceYears || '',
    currentHospital: existingData.currentHospital || '',
    consultationFee: existingData.consultationFee || ''
  });
  const [error, setError] = useState('');

  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
    'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Gynecologist',
    'ENT Specialist', 'Ophthalmologist', 'Dentist', 'Surgeon', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.specialization || !formData.nmcNumber || !formData.qualification) {
      setError('Please fill in required fields');
      return;
    }
    navigate('/doctor-register/documents', { state: { ...existingData, ...formData } });
  };

  const handleBack = () => {
    navigate('/doctor-register/personal', { state: existingData });
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
          <h2>Professional Information</h2>
          <p>Your medical credentials</p>
        </div>

        <form className="reg-form" onSubmit={handleNext}>
          <div className="form-group">
            <label>Specialization *</label>
            <select name="specialization" value={formData.specialization} onChange={handleChange} required>
              <option value="">Select Specialization</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>NMC Registration Number *</label>
            <input type="text" name="nmcNumber" placeholder="Nepal Medical Council Number" value={formData.nmcNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Qualification *</label>
            <input type="text" name="qualification" placeholder="e.g. MBBS, MD, MS" value={formData.qualification} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input type="number" name="experienceYears" placeholder="Years" min="0" value={formData.experienceYears} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Current Hospital/Clinic</label>
            <input type="text" name="currentHospital" placeholder="Hospital or clinic name" value={formData.currentHospital} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Consultation Fee (NPR)</label>
            <input type="number" name="consultationFee" placeholder="Fee in Nepali Rupees" min="0" value={formData.consultationFee} onChange={handleChange} />
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

export default ProfessionalInfo;
