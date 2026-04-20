import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PartnerWithUs.css';

const FACILITY_CATEGORIES = [
  'Private Hospital', 'Teaching Hospital', 'Government Hospital',
  'Specialized Clinic', 'Diagnostic Center', 'Polyclinic',
  'Ayurveda and Alternative Medicine Center', 'Nursing Home', 'Other'
];

const PROVINCES = [
  'Koshi Province', 'Madhesh Province', 'Bagmati Province',
  'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'
];

const statusMeta = {
  under_review: { label: 'Under Review', color: '#f59e0b', bg: '#fef3c7', icon: '🔍' },
  approved:     { label: 'Approved',      color: '#059669', bg: '#d1fae5', icon: '✅' },
  rejected:     { label: 'Rejected',      color: '#dc2626', bg: '#fee2e2', icon: '❌' },
};

export default function PartnerWithUs() {
  const [step, setStep] = useState('form');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [form, setForm] = useState({
    hospitalName: '', facilityCategory: '', dohsLicenseNumber: '', panVatNumber: '',
    hospitalPhone: '', officialEmail: '',
    adminName: '', adminPhone: '',
    province: '', district: '',
    estimatedDoctors: '',
  });

  const [opLic, setOpLic]     = useState(null);
  const [regCert, setRegCert] = useState(null);
  const [taxCert, setTaxCert] = useState(null);
  const opLicRef   = useRef(null);
  const regCertRef = useRef(null);
  const taxRef     = useRef(null);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const phoneRe = /^[+]?[\d\s\-().]{7,20}$/;

  const validate = () => {
    const e = {};
    if (!form.hospitalName.trim())      e.hospitalName = 'Required';
    if (!form.facilityCategory)         e.facilityCategory = 'Required';
    if (!form.dohsLicenseNumber.trim()) e.dohsLicenseNumber = 'Required';
    if (!form.panVatNumber.trim())      e.panVatNumber = 'Required';
    if (!form.hospitalPhone.trim())     e.hospitalPhone = 'Required';
    else if (!phoneRe.test(form.hospitalPhone)) e.hospitalPhone = 'Invalid phone format';
    if (!form.officialEmail.trim())     e.officialEmail = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.officialEmail)) e.officialEmail = 'Invalid email';
    if (!form.adminName.trim())         e.adminName = 'Required';
    if (!form.adminPhone.trim())        e.adminPhone = 'Required';
    else if (!phoneRe.test(form.adminPhone)) e.adminPhone = 'Invalid phone format';
    if (!form.province)                 e.province = 'Required';
    if (!form.district.trim())          e.district = 'Required';
    if (!form.estimatedDoctors)         e.estimatedDoctors = 'Required';
    else if (isNaN(form.estimatedDoctors) || parseInt(form.estimatedDoctors) < 1) e.estimatedDoctors = 'Must be a positive number';
    if (!opLic)   e.opLic = 'Required';
    if (!regCert) e.regCert = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append('operatingLicense', opLic);
      fd.append('companyRegCert', regCert);
      if (taxCert) fd.append('taxClearance', taxCert);
      const res = await fetch('http://localhost:5001/api/partner/apply', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setSubmitError(data.error || 'Submission failed.');
    } catch { setSubmitError('Unable to connect to server.'); }
    finally { setSubmitting(false); }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setStatusLoading(true); setStatusResult(null);
    try {
      const res = await fetch(`http://localhost:5001/api/partner/status/${encodeURIComponent(statusEmail)}`);
      const data = await res.json();
      setStatusResult(data.success ? data.application : { error: data.error });
    } catch { setStatusResult({ error: 'Unable to connect.' }); }
    finally { setStatusLoading(false); }
  };

  if (submitted) return (
    <div className="pw-page">
      <div className="pw-hero">
        <div className="pw-hero-inner">
          <h1>Partner With HealthMandala</h1>
          <p>Join Nepal's growing network of verified healthcare facilities.</p>
        </div>
      </div>
      <div className="pw-container">
        <div className="pw-success">
          <div className="pw-success-icon">✅</div>
          <h2>Application Submitted Successfully!</h2>
          <p>Thank you for applying to partner with HealthMandala. Your application has been received and is now being reviewed by our team.</p>

          <div className="pw-status-pill">
            <span className="pw-status-dot" />
            Under Review
          </div>

          <div className="pw-success-info">
            <div className="pw-info-row">
              <span className="pw-info-icon">📋</span>
              <span>Our admin team will verify your documents and license details</span>
            </div>
            <div className="pw-info-row">
              <span className="pw-info-icon">⏱️</span>
              <span>Typical review time: <strong>3–5 business days</strong></span>
            </div>
            <div className="pw-info-row">
              <span className="pw-info-icon">📧</span>
              <span>You'll be notified at your official email once a decision is made</span>
            </div>
          </div>

          <p className="pw-success-hint">You can track your application status anytime using the "Check Status" tab.</p>

          <div className="pw-success-actions">
            <button className="pw-btn-primary" onClick={() => { setSubmitted(false); setStep('status'); }}>
              Track Status
            </button>
            <Link to="/" className="pw-btn-outline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pw-page">

      {/* Hero */}
      <div className="pw-hero">
        <div className="pw-hero-inner">
          <h1>Partner With HealthMandala</h1>
          <p>Join Nepal's growing network of verified healthcare facilities and connect with thousands of patients.</p>
          <div className="pw-tabs">
            <button className={`pw-tab ${step === 'form' ? 'active' : ''}`} onClick={() => setStep('form')}>Apply Now</button>
            <button className={`pw-tab ${step === 'status' ? 'active' : ''}`} onClick={() => setStep('status')}>Check Status</button>
          </div>
        </div>
      </div>

      <div className="pw-container">

        {step === 'status' ? (
          <div className="pw-status-card">
            <h2>Check Application Status</h2>
            <p>Enter the official email address you used when applying.</p>
            <form onSubmit={handleCheckStatus} className="pw-status-form">
              <input type="email" placeholder="admin@yourhospital.gov.np"
                value={statusEmail} onChange={e => setStatusEmail(e.target.value)} required />
              <button type="submit" disabled={statusLoading}>{statusLoading ? 'Checking...' : 'Check Status'}</button>
            </form>
            {statusResult && (statusResult.error ? (
              <p className="pw-err-msg">{statusResult.error}</p>
            ) : (
              <div className="pw-status-result">
                <div className="pw-status-name">{statusResult.hospitalName}</div>
                <span className="pw-status-badge" style={{ background: statusMeta[statusResult.status]?.bg, color: statusMeta[statusResult.status]?.color }}>
                  {statusMeta[statusResult.status]?.icon} {statusMeta[statusResult.status]?.label}
                </span>
                <div className="pw-status-date">Submitted: {new Date(statusResult.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                {statusResult.adminNote && <div className="pw-status-note"><strong>Note:</strong> {statusResult.adminNote}</div>}
              </div>
            ))}
          </div>
        ) : (
          <form className="pw-form" onSubmit={handleSubmit} noValidate>

            {/* Section 1 — Facility & Legal Identity */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">1</span>
                <div>
                  <h3>Facility &amp; Legal Identity</h3>
                  <p>As registered with the Office of the Company Registrar (OCR)</p>
                </div>
              </div>
              <div className="pw-fields">
                <div className="pw-field pw-full">
                  <label>Official Hospital Name <span className="pw-req">*</span></label>
                  <input type="text" placeholder="As registered with OCR" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} />
                  {errors.hospitalName && <span className="pw-err">{errors.hospitalName}</span>}
                </div>
                <div className="pw-field">
                  <label>Facility Category <span className="pw-req">*</span></label>
                  <select value={form.facilityCategory} onChange={e => set('facilityCategory', e.target.value)}>
                    <option value="">Select category</option>
                    {FACILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.facilityCategory && <span className="pw-err">{errors.facilityCategory}</span>}
                </div>
                <div className="pw-field">
                  <label>MoHP / DoHS License Number <span className="pw-req">*</span></label>
                  <input type="text" placeholder="e.g., DoHS-2024-001234" value={form.dohsLicenseNumber} onChange={e => set('dohsLicenseNumber', e.target.value)} />
                  {errors.dohsLicenseNumber && <span className="pw-err">{errors.dohsLicenseNumber}</span>}
                </div>
                <div className="pw-field">
                  <label>PAN / VAT Number <span className="pw-req">*</span></label>
                  <input type="text" placeholder="e.g., 123456789" value={form.panVatNumber} onChange={e => set('panVatNumber', e.target.value)} />
                  {errors.panVatNumber && <span className="pw-err">{errors.panVatNumber}</span>}
                </div>
              </div>
            </div>

            {/* Section 2 — Contact Information */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">2</span>
                <div>
                  <h3>Contact Information</h3>
                  <p>Official hospital contact details</p>
                </div>
              </div>
              <div className="pw-fields">
                <div className="pw-field">
                  <label>Hospital Phone Number <span className="pw-req">*</span></label>
                  <input type="tel" placeholder="+977 01-XXXXXXX" value={form.hospitalPhone} onChange={e => set('hospitalPhone', e.target.value)} />
                  {errors.hospitalPhone && <span className="pw-err">{errors.hospitalPhone}</span>}
                </div>
                <div className="pw-field">
                  <label>Official Designate Email <span className="pw-req">*</span></label>
                  <input type="email" placeholder="admin@yourhospital.gov.np" value={form.officialEmail} onChange={e => set('officialEmail', e.target.value)} />
                  {errors.officialEmail && <span className="pw-err">{errors.officialEmail}</span>}
                </div>
              </div>
            </div>

            {/* Section 3 — Administrative Contact */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">3</span>
                <div>
                  <h3>Administrative Contact</h3>
                  <p>Person responsible for managing the hospital account</p>
                </div>
              </div>
              <div className="pw-fields">
                <div className="pw-field">
                  <label>Admin / Contact Person Name <span className="pw-req">*</span></label>
                  <input type="text" placeholder="Full name" value={form.adminName} onChange={e => set('adminName', e.target.value)} />
                  {errors.adminName && <span className="pw-err">{errors.adminName}</span>}
                </div>
                <div className="pw-field">
                  <label>Contact Person Phone Number <span className="pw-req">*</span></label>
                  <input type="tel" placeholder="+977 98XXXXXXXX" value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} />
                  {errors.adminPhone && <span className="pw-err">{errors.adminPhone}</span>}
                </div>
              </div>
            </div>

            {/* Section 4 — Location Details */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">4</span>
                <div>
                  <h3>Location Details</h3>
                  <p>Helps patients find hospitals by province or local government</p>
                </div>
              </div>
              <div className="pw-fields">
                <div className="pw-field">
                  <label>Province <span className="pw-req">*</span></label>
                  <select value={form.province} onChange={e => set('province', e.target.value)}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <span className="pw-err">{errors.province}</span>}
                </div>
                <div className="pw-field">
                  <label>District / City / Local Level (Palika) <span className="pw-req">*</span></label>
                  <input type="text" placeholder="e.g., Kathmandu Metropolitan City" value={form.district} onChange={e => set('district', e.target.value)} />
                  {errors.district && <span className="pw-err">{errors.district}</span>}
                </div>
              </div>
            </div>

            {/* Section 5 — Basic Information */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">5</span>
                <div>
                  <h3>Basic Information</h3>
                  <p>Helps with analytics and doctor matching</p>
                </div>
              </div>
              <div className="pw-fields">
                <div className="pw-field">
                  <label>Estimated Number of Doctors <span className="pw-req">*</span></label>
                  <input type="number" placeholder="e.g., 45" min="1" value={form.estimatedDoctors} onChange={e => set('estimatedDoctors', e.target.value)} />
                  {errors.estimatedDoctors && <span className="pw-err">{errors.estimatedDoctors}</span>}
                </div>
              </div>
            </div>

            {/* Section 6 — Documents */}
            <div className="pw-section">
              <div className="pw-section-header">
                <span className="pw-section-num">6</span>
                <div>
                  <h3>Required Document Uploads (KYC)</h3>
                  <p>Digital copies required for Super Admin verification</p>
                </div>
              </div>
              <div className="pw-uploads">
                {[
                  { label: 'Health Facility Operating License', req: true,  ref: opLicRef,   file: opLic,   setFile: setOpLic,   errKey: 'opLic' },
                  { label: 'Company Registration Certificate',  req: true,  ref: regCertRef, file: regCert, setFile: setRegCert, errKey: 'regCert' },
                  { label: 'Tax Clearance Certificate',         req: false, ref: taxRef,     file: taxCert, setFile: setTaxCert, errKey: null },
                ].map(({ label, req, ref, file, setFile, errKey }) => (
                  <div key={label} className="pw-field">
                    <label>{label} {req ? <span className="pw-req">*</span> : <span className="pw-opt">(Optional)</span>}</label>
                    <div
                      className={`pw-upload ${file ? 'has-file' : ''} ${errKey && errors[errKey] ? 'has-error' : ''}`}
                      onClick={() => ref.current.click()}
                    >
                      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => { setFile(e.target.files[0]); if (errKey) setErrors(p => ({ ...p, [errKey]: '' })); }}
                        style={{ display: 'none' }} />
                      {file ? (
                        <div className="pw-upload-file">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="pw-upload-name">{file.name}</span>
                          <button type="button" className="pw-upload-remove" onClick={ev => { ev.stopPropagation(); setFile(null); }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                          </svg>
                          <span>Click to upload</span>
                          <span className="pw-upload-hint">PDF, JPG, PNG · Max 10MB</span>
                        </>
                      )}
                    </div>
                    {errKey && errors[errKey] && <span className="pw-err">{errors[errKey]}</span>}
                  </div>
                ))}
              </div>
            </div>

            {submitError && <div className="pw-submit-error">{submitError}</div>}
            <button type="submit" className="pw-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
