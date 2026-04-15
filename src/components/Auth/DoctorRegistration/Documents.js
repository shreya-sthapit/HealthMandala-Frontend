import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorRegLayout from './DoctorRegLayout';
import './DoctorRegLayout.css';

const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state || {};

  const [nmcPreview, setNmcPreview] = useState(null);
  const [degreePreview, setDegreePreview] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ nmcCertificate: null, degreeCertificate: null, bio: existingData.bio || '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File size should be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'nmc') { setFormData(f => ({ ...f, nmcCertificate: file })); setNmcPreview(reader.result); }
      else { setFormData(f => ({ ...f, degreeCertificate: file })); setDegreePreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/doctor-register/nid', { state: { ...existingData, ...formData, nmcCertificateImage: nmcPreview, degreeCertificateImage: degreePreview } });
  };

  const UploadBox = ({ preview, onClear, onChange, label }) => (
    <div className="form-group">
      <label>{label}</label>
      {preview ? (
        <div className="image-preview" style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
          <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" className="remove-btn" onClick={onClear}>✕</button>
        </div>
      ) : (
        <label className="upload-area" style={{ display: 'block', cursor: 'pointer' }}>
          <input type="file" accept="image/*,.pdf" onChange={onChange} hidden />
          <div className="upload-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '1rem' }}>
            <div className="upload-icon">+</div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Click to upload</span>
          </div>
        </label>
      )}
    </div>
  );

  return (
    <DoctorRegLayout step={3} title="Documents & Bio" subtitle="Upload your certificates">
      <form className="reg-form" onSubmit={handleNext}>
        <UploadBox preview={nmcPreview} label="NMC Certificate" onChange={e => handleImageChange(e, 'nmc')} onClear={() => { setNmcPreview(null); setFormData(f => ({ ...f, nmcCertificate: null })); }} />
        <UploadBox preview={degreePreview} label="Degree Certificate" onChange={e => handleImageChange(e, 'degree')} onClear={() => { setDegreePreview(null); setFormData(f => ({ ...f, degreeCertificate: null })); }} />
        <div className="form-group">
          <label>Professional Bio</label>
          <textarea name="bio" placeholder="Brief introduction about yourself, experience, and expertise..." value={formData.bio} onChange={handleChange} rows={3} />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="btn-group">
          <button type="button" className="reg-btn secondary" onClick={() => navigate('/doctor-register/professional', { state: existingData })}>← Back</button>
          <button type="submit" className="reg-btn">Continue →</button>
        </div>
      </form>
    </DoctorRegLayout>
  );
};

export default Documents;
