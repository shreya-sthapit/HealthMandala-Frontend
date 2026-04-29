import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SPECS = [
  'Ayurveda Physician','Cardiologist','Dental Surgeon','Dermatologist',
  'Endocrinologist','Gastroenterologist','General Physician','General Practitioner',
  'General Surgeon','Gynecologist & Obstetrician','Nephrologist','Neurologist',
  'Neurosurgeon','Oncologist','Ophthalmologist','Orthopedic Surgeon',
  'Otolaryngologist','Pediatrician','Physiotherapist','Psychiatrist',
  'Pulmonologist','Radiologist','Rheumatologist','Urologist','Other'
];
const defaultSchedule = DAYS.map(day => ({ day, start: '09:00', end: '17:00', active: day !== 'Saturday' && day !== 'Sunday' }));

// Time options in 1-hour increments (12h format)
// Time options removed (unused)

const QUALIFICATIONS = ['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'DM', 'MCh', 'DNB', 'FCPS', 'PhD', 'Other'];

const EditSVG = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const CalSVG = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const UserSVG = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [confirmed, setConfirmed] = useState(!!value);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
      setConfirmed(true);
    } else {
      setConfirmed(false);
    }
  }, [value]); // re-draw whenever value changes (e.g. after async fetch)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    if (confirmed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || confirmed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a2e35';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setConfirmed(false);
    onChange('');
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL();
    onChange(data);
    setConfirmed(true);
  };

  const btnStyle = (primary) => ({
    marginTop: '0.4rem',
    fontSize: '0.75rem',
    padding: '0.28rem 0.85rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    border: primary ? 'none' : '1px solid #d1d5db',
    background: primary ? '#00a896' : '#f0f4f5',
    color: primary ? '#fff' : '#6b8f95',
  });

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={560}
        height={120}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          width: '100%', height: '120px',
          border: `1.5px solid ${confirmed ? '#00a896' : '#d1d5db'}`,
          borderRadius: '8px', background: '#ffffff',
          cursor: confirmed ? 'default' : 'crosshair',
          display: 'block', touchAction: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
        <button type="button" style={btnStyle(false)} onClick={handleClear}>Clear</button>
        {!confirmed && <button type="button" style={btnStyle(true)} onClick={handleConfirm}>Confirm</button>}
        {confirmed && <span style={{ fontSize: '0.75rem', color: '#00a896', display: 'flex', alignItems: 'center', gap: '0.25rem' }}></span>}
      </div>
    </div>
  );
}

export default function HDDoctors({ userId, hospital, API }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDoctor, setLeaveDoctor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', nmcNumber: '', specialization: '', consultationFee: '', schedule: defaultSchedule });
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [viewDoctor, setViewDoctor] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/doctors?userId=${userId}`);
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId, API]);

  const fetchDepartments = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/departments?userId=${userId}`);
      const data = await res.json();
      if (data.success) setDepartments(data.departments);
    } catch (e) { console.error(e); }
  }, [userId, API]);

  useEffect(() => { fetchDoctors(); fetchDepartments(); }, [fetchDoctors, fetchDepartments]);

  const openAdd = () => { setEditDoctor(null); setForm({ firstName: '', lastName: '', phone: '', email: '', nmcNumber: '', specialization: '', consultationFee: '', qualification: '', yearsOfExperience: '', schedule: defaultSchedule, signature: '' }); setShowModal(true); };
  const openEdit = async (doc) => {
    setEditDoctor(doc);
    // Fetch fresh doctor data from backend to ensure we have latest fields
    try {
      const res = await fetch(`${API}/doctors?userId=${userId}`);
      const data = await res.json();
      const fresh = data.success ? data.doctors.find(d => d._id === doc._id) : doc;
      const d = fresh || doc;
      const hospitalName = hospital?.hospitalName || '';
      const hs = (d.hospitalSchedules || []).find(
        s => s.hospital?.trim().toLowerCase() === hospitalName.trim().toLowerCase()
      );
      setForm({
        firstName: d.firstName || '',
        lastName: d.lastName || '',
        phone: d.phone || '',
        email: d.email || '',
        nmcNumber: d.nmcNumber || '',
        specialization: d.specialization || '',
        consultationFee: d.consultationFee || '',
        qualification: d.qualification || '',
        yearsOfExperience: d.experienceYears != null ? String(d.experienceYears) : '',
        schedule: hs?.schedule?.length ? hs.schedule : defaultSchedule,
        signature: d.signature || '',
      });
    } catch {
      const hs = (doc.hospitalSchedules || []).find(
        s => s.hospital?.trim().toLowerCase() === (hospital?.hospitalName || '').trim().toLowerCase()
      );
      setForm({
        firstName: doc.firstName || '',
        lastName: doc.lastName || '',
        phone: doc.phone || '',
        email: doc.email || '',
        nmcNumber: doc.nmcNumber || '',
        specialization: doc.specialization || '',
        consultationFee: doc.consultationFee || '',
        qualification: doc.qualification || '',
        yearsOfExperience: doc.experienceYears != null ? String(doc.experienceYears) : '',
        schedule: hs?.schedule?.length ? hs.schedule : defaultSchedule,
        signature: doc.signature || '',
      });
    }
    setShowModal(true);
  };

  const saveDoctor = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editDoctor ? `${API}/doctors/${editDoctor._id}` : `${API}/doctors/add`;
      const method = editDoctor ? 'PUT' : 'POST';
      const body = editDoctor
        ? { consultationFee: parseFloat(form.consultationFee), schedule: form.schedule, hospitalName: hospital?.hospitalName || '', firstName: form.firstName, lastName: form.lastName, phone: form.phone, email: form.email, specialization: form.specialization, qualification: form.qualification, yearsOfExperience: form.yearsOfExperience, signature: form.signature }
        : { ...form, userId, consultationFee: parseFloat(form.consultationFee) };
      console.log('Saving doctor body:', body);
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        // Link doctor to new department on add (backend handles edit case)
        if (!editDoctor && form.departmentId && data.doctor?._id) {
          await fetch(`${API}/departments/${form.departmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ $addToSet: { doctors: data.doctor._id } })
          });
        }
        setShowModal(false); fetchDoctors();
      } else alert(data.error || 'Failed to save');
    } catch (e) { alert('Error saving doctor'); }
    finally { setSaving(false); }
  };

  const saveLeave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const leaves = [...(leaveDoctor.leaves || []), leaveForm];
      const res = await fetch(`${API}/doctors/${leaveDoctor._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leaves, hospitalName: hospital?.hospitalName }) });
      const data = await res.json();
      if (data.success) { setShowLeaveModal(false); fetchDoctors(); }
    } catch (e) { alert('Error saving leave'); }
    finally { setSaving(false); }
  };

  const removeDoctor = async (doc) => {
    if (!window.confirm(`Remove Dr. ${doc.firstName} ${doc.lastName} from this hospital?`)) return;
    try {
      await fetch(`${API}/doctors/${doc._id}?userId=${userId}`, { method: 'DELETE' });
      fetchDoctors();
    } catch (e) { alert('Error removing doctor'); }
  };
  const updateDayTime = (idx, field, val) => setForm(p => { const s = [...p.schedule]; s[idx] = { ...s[idx], [field]: val }; return { ...p, schedule: s }; });
  const toggleDay = (idx) => setForm(p => { const s = [...p.schedule]; s[idx] = { ...s[idx], active: !s[idx].active }; return { ...p, schedule: s }; });
  const isOnLeave = (doc) => { const today = new Date(); return (doc.leaves || []).some(l => today >= new Date(l.startDate) && today <= new Date(l.endDate)); };
  const isOnDuty = (doc) => { const dayName = DAYS[new Date().getDay()]; const hs = (doc.hospitalSchedules || []).find(s => s.hospital === hospital?.hospitalName); return (hs?.schedule || doc.schedule || []).some(s => s.day === dayName && s.active); };

  return (
    <div>
      {/* Toolbar */}
      <div className="hd-card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a8c5c9', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="hd-search" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: '100%', margin: 0 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#a8c5c9', fontWeight: 500, background: '#f0f4f5', padding: '0.25rem 0.75rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
          </span>
          <button className="hd-btn hd-btn-primary" onClick={openAdd}>+ Add Doctor</button>
        </div>
      </div>

      {loading ? <div className="hd-loading">Loading doctors...</div> : doctors.length === 0 ? (
        <div className="hd-card"><div className="hd-empty"><div className="hd-empty-icon"><UserSVG /></div><p>No doctors added yet.</p></div></div>
      ) : (
        <div className="hd-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fdfc', borderBottom: '1.5px solid #e2f0ef' }}>
                {['Doctor', 'Phone', 'Fee', 'Availability', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '0.65rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#a8c5c9', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors
                .filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()))
                .map((doc, idx, arr) => {
                  const onLeave = isOnLeave(doc);
                  const onDuty  = isOnDuty(doc);
                  const initials = `${doc.firstName?.[0] || ''}${doc.lastName?.[0] || ''}`.toUpperCase() || 'D';
                  return (
                    <tr key={doc._id}
                      style={{ borderBottom: idx < arr.length - 1 ? '1px solid #f0f4f5' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fdfc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #00c9b1, #0284c7)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1a2e35' }}>Dr. {doc.firstName} {doc.lastName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#a8c5c9', marginTop: '0.1rem' }}>{doc.specialization}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center', fontSize: '0.82rem', color: '#6b8f95' }}>{doc.phone || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, color: '#00a896' }}>NPR {doc.consultationFee || 0}</td>
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '20px', ...(onLeave ? { background: '#fef2f2', color: '#ef4444' } : onDuty ? { background: '#f0fdf4', color: '#10b981' } : { background: '#f1f5f9', color: '#94a3b8' }) }}>
                          {onLeave ? 'On Leave' : onDuty ? 'On Duty' : 'Off Today'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button className="hd-btn hd-btn-secondary hd-btn-sm" onClick={() => setViewDoctor(doc)}>View</button>
                          <button className="hd-btn hd-btn-secondary hd-btn-sm" onClick={() => openEdit(doc)}><EditSVG /> Edit</button>
                          <button className="hd-btn hd-btn-secondary hd-btn-sm" onClick={() => { setLeaveDoctor(doc); setLeaveForm({ startDate: '', endDate: '', reason: '' }); setShowLeaveModal(true); }}><CalSVG /> Leave</button>
                          <button className="hd-btn hd-btn-sm" style={{ background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fecaca' }} onClick={() => removeDoctor(doc)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="hd-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="hd-modal" style={{ maxWidth: '580px', borderRadius: '20px' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '1.5rem 1.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e35', margin: 0 }}>{editDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                <p style={{ fontSize: '0.78rem', color: '#a8c5c9', margin: '0.2rem 0 0' }}>{editDoctor ? 'Update doctor details and schedule' : 'Fill in the details to register a new doctor'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f0f4f5', border: 'none', borderRadius: '10px', width: 32, height: 32, cursor: 'pointer', fontSize: '1.1rem', color: '#6b8f95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <form onSubmit={saveDoctor}>
              <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>

                {/* Personal info — only on add */}
                {/* Personal info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>First Name *</label>
                    <input required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Rajesh" />
                  </div>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Last Name *</label>
                    <input required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Sharma" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Phone *</label>
                    <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="98XXXXXXXX" />
                  </div>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="doctor@email.com" />
                  </div>
                </div>

                {/* Professional info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>NMC Registration Number *</label>
                    <input required={!editDoctor} value={form.nmcNumber} onChange={e => setForm(p => ({ ...p, nmcNumber: e.target.value }))} placeholder="e.g. 12345" disabled={!!editDoctor} />
                  </div>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Consultation Fee (NPR) *</label>
                    <input required type="number" value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))} placeholder="500" />
                  </div>
                </div>

                <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Specialization *</label>
                    <select className="hd-select" style={{ width: '100%' }} required value={form.specialization || ''} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}>
                      <option value="">Select specialization</option>
                      {departments.length === 0
                        ? <option disabled>No departments added yet</option>
                        : departments.map(d => {
                            const main = d.name.split('(')[0].trim();
                            return <option key={d._id} value={main}>{d.name}</option>;
                          })
                      }
                    </select>
                  </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Qualification *</label>
                    <select className="hd-select" style={{ width: '100%' }} required value={form.qualification || ''} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}>
                      <option value="">Select qualification</option>
                      {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div className="hd-form-group" style={{ margin: 0 }}>
                    <label>Years of Experience *</label>
                    <input required type="number" min="0" value={form.yearsOfExperience || ''} onChange={e => setForm(p => ({ ...p, yearsOfExperience: e.target.value }))} placeholder="e.g. 5" />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2e35', marginBottom: '0.5rem' }}>
                    Weekly Schedule — {hospital?.hospitalName}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {form.schedule.map((s, i) => (
                      <div key={s.day} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.55rem 0', borderBottom: '1px solid #f5f5f5' }}>
                        {/* Toggle switch */}
                        <div onClick={() => toggleDay(i)} style={{ position: 'relative', width: 36, height: 20, borderRadius: 20, background: s.active ? '#00a896' : '#d1d5db', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
                          <div style={{ position: 'absolute', top: 2, left: s.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </div>
                        {/* Day label */}
                        <span style={{ width: 32, fontSize: '0.82rem', fontWeight: 600, color: s.active ? '#1a2e35' : '#a8c5c9', userSelect: 'none' }}>{s.day.slice(0,3)}</span>
                        {/* Times */}
                        {s.active ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                            <div style={{ display: 'flex', border: '1.5px solid #e2e8ef', borderRadius: '7px', overflow: 'hidden' }}>
                              <input type="time" value={(() => { const h = parseInt(s.start); const h12 = h % 12 || 12; return `${String(h12).padStart(2,'0')}:00`; })()} onChange={e => { const h12 = parseInt(e.target.value); const ampm = parseInt(s.start) >= 12 ? 'PM' : 'AM'; const h24 = ampm === 'AM' ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12); updateDayTime(i, 'start', `${String(h24).padStart(2,'0')}:00`); }} style={{ border: 'none', padding: '0.22rem 0.4rem', fontSize: '0.8rem', outline: 'none', color: '#1a2e35', background: '#fff' }} />
                              <select value={parseInt(s.start) >= 12 ? 'PM' : 'AM'} onChange={e => { const h = parseInt(s.start); const cur = h >= 12 ? 'PM' : 'AM'; if (e.target.value !== cur) { const newH = e.target.value === 'PM' ? (h === 0 ? 12 : h + 12) : (h === 12 ? 0 : h - 12); updateDayTime(i, 'start', `${String(newH).padStart(2,'0')}:00`); } }} style={{ border: 'none', borderLeft: '1px solid #e2e8ef', padding: '0.22rem 0.3rem', fontSize: '0.75rem', outline: 'none', color: '#6b8f95', background: '#f9f9f9', cursor: 'pointer' }}>
                                <option>AM</option><option>PM</option>
                              </select>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#a8c5c9' }}>–</span>
                            <div style={{ display: 'flex', border: '1.5px solid #e2e8ef', borderRadius: '7px', overflow: 'hidden' }}>
                              <input type="time" value={(() => { const h = parseInt(s.end); const h12 = h % 12 || 12; return `${String(h12).padStart(2,'0')}:00`; })()} onChange={e => { const h12 = parseInt(e.target.value); const ampm = parseInt(s.end) >= 12 ? 'PM' : 'AM'; const h24 = ampm === 'AM' ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12); updateDayTime(i, 'end', `${String(h24).padStart(2,'0')}:00`); }} style={{ border: 'none', padding: '0.22rem 0.4rem', fontSize: '0.8rem', outline: 'none', color: '#1a2e35', background: '#fff' }} />
                              <select value={parseInt(s.end) >= 12 ? 'PM' : 'AM'} onChange={e => { const h = parseInt(s.end); const cur = h >= 12 ? 'PM' : 'AM'; if (e.target.value !== cur) { const newH = e.target.value === 'PM' ? (h === 0 ? 12 : h + 12) : (h === 12 ? 0 : h - 12); updateDayTime(i, 'end', `${String(newH).padStart(2,'0')}:00`); } }} style={{ border: 'none', borderLeft: '1px solid #e2e8ef', padding: '0.22rem 0.3rem', fontSize: '0.75rem', outline: 'none', color: '#6b8f95', background: '#f9f9f9', cursor: 'pointer' }}>
                                <option>AM</option><option>PM</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#a8c5c9' }}>Day off</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="hd-form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2e35', marginBottom: '0.4rem', display: 'block' }}>
                    Digital Signature (for prescriptions)
                  </label>
                  {editDoctor && form.signature && !true && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#a8c5c9', marginBottom: '0.25rem' }}>Current signature:</div>
                      <img src={form.signature} alt="Saved signature" style={{ maxWidth: '100%', height: '60px', border: '1px solid #e2e8ef', borderRadius: '6px', background: '#fff', objectFit: 'contain' }} />
                    </div>
                  )}
                  <SignaturePad
                    value={form.signature}
                    onChange={sig => setForm(p => ({ ...p, signature: sig }))}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.75rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid #f0f4f5' }}>
                <button type="button" className="hd-btn hd-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="hd-btn hd-btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
                  {saving ? 'Saving...' : editDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewDoctor && (
        <div className="hd-modal-overlay" onClick={() => setViewDoctor(null)}>
          <div className="hd-modal" style={{ maxWidth: '480px', borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem 1.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e35', margin: 0 }}>Dr. {viewDoctor.firstName} {viewDoctor.lastName}</h3>
                <p style={{ fontSize: '0.78rem', color: '#a8c5c9', margin: '0.2rem 0 0' }}>{viewDoctor.specialization}</p>
              </div>
              <button onClick={() => setViewDoctor(null)} style={{ background: '#f0f4f5', border: 'none', borderRadius: '10px', width: 32, height: 32, cursor: 'pointer', fontSize: '1.1rem', color: '#6b8f95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ padding: '1.25rem 1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Phone', viewDoctor.phone],
                ['Email', viewDoctor.email],
                ['NMC Registration Number', viewDoctor.nmcNumber],
                ['Qualification', viewDoctor.qualification],
                ['Experience', viewDoctor.experienceYears ? `${viewDoctor.experienceYears} years` : '—'],
                ['Consultation Fee', viewDoctor.consultationFee ? `NPR ${viewDoctor.consultationFee}` : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #f5f5f5', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#a8c5c9', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: '#1a2e35', fontWeight: 600 }}>{val || '—'}</span>
                </div>
              ))}
              {(() => {
                const hospitalName = hospital?.hospitalName || '';
                const hs = (viewDoctor.hospitalSchedules || []).find(
                  s => s.hospital?.trim().toLowerCase() === hospitalName.trim().toLowerCase()
                );
                const schedule = hs?.schedule?.filter(s => s.active) || [];
                if (!schedule.length) return null;
                const fmt = (t) => { const h = parseInt(t); const h12 = h % 12 || 12; return `${String(h12).padStart(2,'0')}:00 ${h >= 12 ? 'PM' : 'AM'}`; };
                return (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#a8c5c9', fontWeight: 500, marginBottom: '0.4rem' }}>Weekly Schedule</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {schedule.map((s, i) => (
                        <div key={s.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: i < schedule.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                          <span style={{ color: '#1a2e35', fontWeight: 600, width: 40 }}>{s.day.slice(0,3)}</span>
                          <span style={{ color: '#6b8f95' }}>{fmt(s.start)} – {fmt(s.end)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {viewDoctor.signature && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#a8c5c9', fontWeight: 500, marginBottom: '0.4rem' }}>Digital Signature</div>
                  <img src={viewDoctor.signature} alt="Signature" style={{ width: '100%', height: '80px', border: '1.5px solid #e2e8ef', borderRadius: '8px', background: '#fff', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && leaveDoctor && (
        <div className="hd-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="hd-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="hd-modal-header"><h3>Block Leave — Dr. {leaveDoctor.firstName}</h3><button className="hd-modal-close" onClick={() => setShowLeaveModal(false)}>×</button></div>
            <form onSubmit={saveLeave}>
              <div className="hd-modal-body">
                <div className="hd-form-row"><div className="hd-form-group"><label>From *</label><input required type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value }))} /></div><div className="hd-form-group"><label>To *</label><input required type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))} /></div></div>
                <div className="hd-form-group"><label>Reason</label><input value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Annual leave, Emergency" /></div>
              </div>
              <div className="hd-modal-footer"><button type="button" className="hd-btn hd-btn-secondary" onClick={() => setShowLeaveModal(false)}>Cancel</button><button type="submit" className="hd-btn hd-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Block Leave'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
