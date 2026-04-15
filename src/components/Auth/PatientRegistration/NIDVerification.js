import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientRegLayout from './PatientRegLayout';
import './PatientRegLayout.css';

const NIDVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ nidNumber: existingData.nidNumber || '', nidFront: null, nidBack: null });

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File size should be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') { setFormData(f => ({ ...f, nidFront: file })); setFrontPreview(reader.result); }
      else { setFormData(f => ({ ...f, nidBack: file })); setBackPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (side) => {
    if (side === 'front') { setFormData(f => ({ ...f, nidFront: null })); setFrontPreview(null); }
    else { setFormData(f => ({ ...f, nidBack: null })); setBackPreview(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nidNumber.trim()) { setError('Please enter your NID number'); return; }
    if (!formData.nidFront || !formData.nidBack) { setError('Please upload both front and back images of your NID'); return; }
    setIsSubmitting(true); setError('');
    try {
      const fd = new FormData();
      ['userId','firstName','lastName','email','phone','dateOfBirth','gender','bloodGroup',
       'address','city','district','province','emergencyContactName','emergencyContactPhone',
       'emergencyContactRelation','medicalConditions','allergies'].forEach(k => fd.append(k, existingData[k] || ''));
      fd.append('nidNumber', formData.nidNumber);
      if (existingData.profilePhoto) fd.append('profilePhoto', existingData.profilePhoto);
      fd.append('nidFront', formData.nidFront);
      fd.append('nidBack', formData.nidBack);

      const response = await fetch('http://localhost:5001/api/patient/register', { method: 'POST', body: fd });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ id: data.registration.id, firstName: existingData.firstName, lastName: existingData.lastName, email: existingData.email, role: 'patient' }));
        localStorage.setItem('userRole', 'patient');
        navigate('/');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch { setError('Failed to submit registration. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const UploadBox = ({ preview, label, side }) => (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem', display: 'block' }}>{label}</label>
      {preview ? (
        <div className="image-preview">
          <img src={preview} alt={label} />
          <button type="button" className="remove-btn" onClick={() => removeImage(side)}>✕</button>
        </div>
      ) : (
        <label className="upload-area">
          <input type="file" accept="image/*" onChange={e => handleImageChange(e, side)} hidden />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.75rem' }}>
            <div style={{ width: 32, height: 32, background: '#6dbc95', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>+</div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Click to upload</span>
          </div>
        </label>
      )}
    </div>
  );

  return (
    <PatientRegLayout step={5} title="NID Verification" subtitle="Upload your National ID card">
      <form onSubmit={handleSubmit}>
        <div className="prl-float">
          <input type="text" name="nidNumber" placeholder=" " value={formData.nidNumber} onChange={handleChange} required />
          <label>NID Number *</label>
        </div>

        <div className="upload-grid" style={{ marginBottom: '0.75rem' }}>
          <UploadBox preview={frontPreview} label="Front Side *" side="front" />
          <UploadBox preview={backPreview} label="Back Side *" side="back" />
        </div>

        <div className="info-box">
          <span>ℹ️</span>
          <p>Your NID will be used for identity verification and kept secure.</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="btn-group">
          <button type="button" className="reg-btn secondary" onClick={() => navigate('/register/medical', { state: existingData })}>← Back</button>
          <button type="submit" className="reg-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </PatientRegLayout>
  );
};

export default NIDVerification;
