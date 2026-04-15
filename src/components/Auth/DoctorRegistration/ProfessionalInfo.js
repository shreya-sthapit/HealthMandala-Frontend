import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorRegLayout from './DoctorRegLayout';
import './DoctorRegLayout.css';

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

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.specialization || !formData.nmcNumber || !formData.qualification) {
      setError('Please fill in required fields'); return;
    }
    navigate('/doctor-register/documents', { state: { ...existingData, ...formData } });
  };

  return (
    <DoctorRegLayout step={2} title="Professional Information" subtitle="Your medical credentials">
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
        <div className="form-row">
          <div className="form-group">
            <label>Years of Experience</label>
            <input type="number" name="experienceYears" placeholder="Years" min="0" value={formData.experienceYears} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Consultation Fee (NPR)</label>
            <input type="number" name="consultationFee" placeholder="Fee" min="0" value={formData.consultationFee} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Current Hospital/Clinic</label>
          <input type="text" name="currentHospital" placeholder="Hospital or clinic name" value={formData.currentHospital} onChange={handleChange} />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="btn-group">
          <button type="button" className="reg-btn secondary" onClick={() => navigate('/doctor-register/personal', { state: existingData })}>← Back</button>
          <button type="submit" className="reg-btn">Continue →</button>
        </div>
      </form>
    </DoctorRegLayout>
  );
};

export default ProfessionalInfo;
