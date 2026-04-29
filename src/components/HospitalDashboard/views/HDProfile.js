import { useState, useEffect } from 'react';

const SaveSVG  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
const CheckSVG = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);

const FACILITY_CATEGORIES = [
  'Private Hospital', 'Teaching Hospital', 'Government Hospital',
  'Community / Non-Profit Hospital', 'Specialized Clinic',
  'Diagnostic & Lab Center', 'Polyclinic',
  'Ayurveda and Alternative Medicine Center', 'Other',
];

const EMPTY = {
  // Facility & Legal
  hospitalName: '', facilityCategory: '', dohsLicenseNumber: '', panVatNumber: '',
  // Contact
  hospitalPhone: '', officialEmail: '',
  // Admin Contact
  adminName: '', adminPhone: '',
  // Location
  province: '', district: '', palika: '',
  // Basic
  estimatedDoctors: '',
  // Extended
  website: '', googleMapsUrl: '',
  opdTimings: { open: '08:00', close: '17:00' },
  // Payment
  khaltiMerchantId: '', esewaId: '',
};

export default function HDProfile({ userId, hospital, API, onRefresh }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (!hospital) return;
    setForm({
      hospitalName:      hospital.hospitalName      || '',
      facilityCategory:  hospital.facilityCategory  || '',
      dohsLicenseNumber: hospital.dohsLicenseNumber || '',
      panVatNumber:      hospital.panVatNumber      || '',
      hospitalPhone:     hospital.hospitalPhone     || '',
      officialEmail:     hospital.officialEmail     || '',
      adminName:         hospital.adminName         || '',
      adminPhone:        hospital.adminPhone        || '',
      province:          hospital.province          || '',
      district:          hospital.district          || '',
      palika:            hospital.palika            || '',
      estimatedDoctors:  hospital.estimatedDoctors  || '',
      website:           hospital.website           || '',
      googleMapsUrl:     hospital.googleMapsUrl     || '',
      opdTimings:        hospital.opdTimings        || { open: '08:00', close: '17:00' },
      khaltiMerchantId:  hospital.khaltiMerchantId  || '',
      esewaId:           hospital.esewaId           || '',
    });
  }, [hospital]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await fetch(`${API}/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, userId }) });
      const data = await res.json();
      if (data.success) { setSaved(true); onRefresh(); setTimeout(() => setSaved(false), 3000); }
      else alert(data.error || 'Failed to save');
    } catch { alert('Error saving profile'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <form onSubmit={save}>
        <div className="hd-two-col" style={{ alignItems: 'start' }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Facility & Legal */}
            <div className="hd-card">
              <div className="hd-card-header"><h3>Facility &amp; Legal Identity</h3></div>
              <div className="hd-card-body">
                <div className="hd-form-group">
                  <label>Hospital Name</label>
                  <input value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} placeholder="e.g. Kathmandu Medical Center" />
                </div>
                <div className="hd-form-group">
                  <label>Facility Category</label>
                  <select className="hd-select" style={{ width: '100%' }} value={form.facilityCategory} onChange={e => set('facilityCategory', e.target.value)}>
                    <option value="">Select category</option>
                    {FACILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="hd-form-row">
                  <div className="hd-form-group">
                    <label>DOHS License Number</label>
                    <input value={form.dohsLicenseNumber} onChange={e => set('dohsLicenseNumber', e.target.value)} placeholder="DOHS-XXXX-XXXX" />
                  </div>
                  <div className="hd-form-group">
                    <label>PAN / VAT Number</label>
                    <input value={form.panVatNumber} onChange={e => set('panVatNumber', e.target.value)} placeholder="XXXXXXXXX" />
                  </div>
                </div>
                <div className="hd-form-group">
                  <label>Estimated Doctors</label>
                  <input type="number" min="1" value={form.estimatedDoctors} onChange={e => set('estimatedDoctors', e.target.value)} placeholder="e.g. 25" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="hd-card">
              <div className="hd-card-header"><h3>Contact Information</h3></div>
              <div className="hd-card-body">
                <div className="hd-form-group">
                  <label>Hospital Phone</label>
                  <input value={form.hospitalPhone} onChange={e => set('hospitalPhone', e.target.value)} placeholder="+977-1-XXXXXXX" />
                </div>
                <div className="hd-form-group">
                  <label>Official Email</label>
                  <input type="email" value={form.officialEmail} onChange={e => set('officialEmail', e.target.value)} placeholder="info@hospital.com.np" />
                </div>
                <div className="hd-form-group">
                  <label>Website</label>
                  <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://hospital.com.np" />
                </div>
                <div className="hd-form-row">
                  <div className="hd-form-group"><label>OPD Opens</label><input type="time" value={form.opdTimings.open}  onChange={e => setForm(p => ({ ...p, opdTimings: { ...p.opdTimings, open:  e.target.value } }))} /></div>
                  <div className="hd-form-group"><label>OPD Closes</label><input type="time" value={form.opdTimings.close} onChange={e => setForm(p => ({ ...p, opdTimings: { ...p.opdTimings, close: e.target.value } }))} /></div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Admin Contact */}
            <div className="hd-card">
              <div className="hd-card-header"><h3>Administrative Contact</h3></div>
              <div className="hd-card-body">
                <div className="hd-form-group">
                  <label>Admin Name</label>
                  <input value={form.adminName} onChange={e => set('adminName', e.target.value)} placeholder="Full name" />
                </div>
                <div className="hd-form-group">
                  <label>Admin Phone</label>
                  <input value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} placeholder="98XXXXXXXX" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="hd-card">
              <div className="hd-card-header"><h3>Location</h3></div>
              <div className="hd-card-body">
                <div className="hd-form-group">
                  <label>Province</label>
                  <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="Bagmati Province" />
                </div>
                <div className="hd-form-row">
                  <div className="hd-form-group">
                    <label>District</label>
                    <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="Kathmandu" />
                  </div>
                  <div className="hd-form-group">
                    <label>Palika / Municipality</label>
                    <input value={form.palika} onChange={e => set('palika', e.target.value)} placeholder="Kathmandu Metropolitan" />
                  </div>
                </div>
                <div className="hd-form-group">
                  <label>Google Maps URL</label>
                  <input value={form.googleMapsUrl} onChange={e => set('googleMapsUrl', e.target.value)} placeholder="https://maps.google.com/..." />
                </div>
                {form.googleMapsUrl && (
                  <a href={form.googleMapsUrl} target="_blank" rel="noreferrer" className="hd-btn hd-btn-secondary hd-btn-sm" style={{ display: 'inline-flex', marginTop: '0.25rem' }}>Preview Map</a>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="hd-card">
              <div className="hd-card-header"><h3>Payment Settings</h3></div>
              <div className="hd-card-body">
                <div className="hd-form-group">
                  <label>Khalti Merchant ID</label>
                  <input value={form.khaltiMerchantId} onChange={e => set('khaltiMerchantId', e.target.value)} placeholder="Khalti merchant key" />
                </div>
                <div className="hd-form-group">
                  <label>eSewa Merchant ID</label>
                  <input value={form.esewaId} onChange={e => set('esewaId', e.target.value)} placeholder="eSewa merchant ID" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6b8f95', marginTop: '0.25rem' }}>Used to receive direct payouts from patient payments.</div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '0.75rem', alignItems: 'center' }}>
          {saved && <span style={{ color: '#00a896', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckSVG /> Saved successfully!</span>}
          <button type="submit" className="hd-btn hd-btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SaveSVG /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
