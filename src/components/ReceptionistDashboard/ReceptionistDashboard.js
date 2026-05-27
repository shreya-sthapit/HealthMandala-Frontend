import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../HospitalDashboard/HospitalDashboard.css';

const API = 'http://localhost:5001/api';
const ALLOWED = ['receptionist', 'staff', 'hospital_admin', 'admin'];

// ── Week helpers ──────────────────────────────────────────────────────────────
const toYMD = (d) => d.toISOString().split('T')[0];

const getWeekDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7)); // Mon of this week
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

const TODAY = toYMD(new Date());

/* ── Icons ── */
const DashIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const QueueIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const WalkIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7l-2 5h4l-2 5"/><path d="M10 12l-2 5"/><path d="M14 12l2 5"/></svg>;
const CalIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PatIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UserIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV = [
  { section: 'Overview' },
  { id: 'overview',     label: 'Dashboard',        icon: <DashIcon /> },
  { section: 'Appointments' },
  { id: 'queue',        label: "Today's Queue",    icon: <QueueIcon /> },
  { id: 'walkin',       label: 'Walk-in Entry',    icon: <WalkIcon /> },
  { id: 'appointments', label: 'All Appointments', icon: <CalIcon /> },
  { section: 'Patients' },
  { id: 'patients',     label: 'Patient Registry', icon: <PatIcon /> },
  { section: 'Account' },
  { id: 'profile',      label: 'My Profile',       icon: <UserIcon /> },
];

const STATUS_LABEL = {
  pending: 'Booked', confirmed: 'Booked', checked_in: 'Checked In',
  prescribed: 'Prescribed', completed: 'Completed',
  cancelled: 'Cancelled', 'no-show': 'No Show',
};
const STATUS_CSS = {
  pending: 'hd-badge-pending', confirmed: 'hd-badge-pending',
  checked_in: 'hd-badge-confirmed', prescribed: 'hd-badge-confirmed',
  completed: 'hd-badge-completed', cancelled: 'hd-badge-cancelled', 'no-show': 'hd-badge-cancelled',
};
function statusBadge(s) {
  return <span className={`hd-badge ${STATUS_CSS[s] || 'hd-badge-pending'}`}>{STATUS_LABEL[s] || s}</span>;
}

/* ── Overview ── */
function OverviewView({ appointments, loading, onStatusUpdate }) {
  const today = appointments.filter(a => (a.appointmentDate || '').startsWith(TODAY));
  const stats = [
    { label: "Today's Total",   value: today.length,                                                                         color: 'teal',   icon: '📋' },
    { label: 'Not Yet Arrived', value: today.filter(a => a.status === 'pending' || a.status === 'confirmed').length,        color: 'orange', icon: '⏳' },
    { label: 'Checked In',      value: today.filter(a => a.status === 'checked_in').length,                                 color: 'green',  icon: '✅' },
    { label: 'Completed',       value: today.filter(a => a.status === 'completed' || a.status === 'prescribed').length,     color: 'blue',   icon: '🏁' },
  ];
  return (
    <>
      <div className="hd-stats-grid">
        {stats.map(s => (
          <div className="hd-stat-card" key={s.label}>
            <div className={`hd-stat-icon ${s.color}`}>{s.icon}</div>
            <div><div className="hd-stat-value">{s.value}</div><div className="hd-stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="hd-card">
        <div className="hd-card-header"><h3>Today's Appointments — sorted by token</h3></div>
        <div className="hd-table-wrap">
          {loading ? <div className="hd-loading">Loading…</div>
          : today.length === 0 ? <div className="hd-empty"><div className="hd-empty-icon">📅</div><p>No appointments today</p></div>
          : (
            <table className="hd-table">
              <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {[...today].sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0)).map(a => (
                  <tr key={a._id}>
                    <td><div className="hd-token">{a.tokenNumber || '—'}</div></td>
                    <td>{a.patientName || '—'}</td>
                    <td>{a.doctorName || '—'}</td>
                    <td>{a.appointmentTime || '—'}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td>
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button className="hd-btn hd-btn-primary hd-btn-sm" onClick={() => onStatusUpdate(a._id, 'checked_in')}>
                          Check-In Patient
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Queue (week view with day tabs) ── */
function QueueView({ appointments, loading, onStatusUpdate }) {
  const weekDays = getWeekDays();
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [search, setSearch] = useState('');

  // Only show today and future days of this week
  const visibleDays = weekDays.filter(d => toYMD(d) >= TODAY);

  const dayApts = appointments
    .filter(a => (a.appointmentDate || '').startsWith(selectedDay))
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  const filtered = search.trim()
    ? dayApts.filter(a => (a.patientName || '').toLowerCase().includes(search.toLowerCase()))
    : dayApts;

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="hd-card">
      {/* Week day tabs */}
      <div className="hd-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <h3>Appointment Queue</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {visibleDays.map(d => {
            const ymd = toYMD(d);
            const isToday = ymd === TODAY;
            const isSelected = ymd === selectedDay;
            return (
              <button
                key={ymd}
                onClick={() => setSelectedDay(ymd)}
                className={`hd-btn hd-btn-sm ${isSelected ? 'hd-btn-primary' : 'hd-btn-secondary'}`}
                style={{ minWidth: 64 }}
              >
                {isToday ? 'Today' : DAY_NAMES[d.getDay()]} {d.getDate()}
              </button>
            );
          })}
        </div>
        {/* Search */}
        <input
          className="hd-search"
          placeholder="Search patient name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>
      <div className="hd-table-wrap">
        {loading ? <div className="hd-loading">Loading…</div>
        : filtered.length === 0 ? <div className="hd-empty"><div className="hd-empty-icon">🏥</div><p>No appointments for this day</p></div>
        : (
          <table className="hd-table">
            <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id}>
                  <td><div className="hd-token" style={{ width: 44, height: 44, fontSize: '1rem' }}>{a.tokenNumber || '—'}</div></td>
                  <td><strong>{a.patientName || '—'}</strong><br /><span style={{ fontSize: '0.75rem', color: '#718096' }}>{a.patientPhone || ''}</span></td>
                  <td>{a.doctorName || '—'}</td>
                  <td>{a.appointmentTime || '—'}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {(a.status === 'pending' || a.status === 'confirmed') && (
                      <>
                        <button className="hd-btn hd-btn-primary hd-btn-sm" onClick={() => onStatusUpdate(a._id, 'checked_in')}>
                          Check-In Patient
                        </button>
                        <button className="hd-btn hd-btn-danger hd-btn-sm" onClick={() => onStatusUpdate(a._id, 'no-show')}>No Show</button>
                      </>
                    )}
                    {a.status === 'checked_in' && (
                      <span className="hd-badge hd-badge-confirmed">At Desk ✓</span>
                    )}
                    {a.status === 'prescribed' && (
                      <span className="hd-badge hd-badge-confirmed">With Pharmacist</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Walk-in ── */
function WalkinView({ appointments, onRefresh }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    patientName: '', phone: '', doctorName: '', reason: '', appointmentDate: TODAY,
  });
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      // Auto-assign next token: count today's appointments for this doctor + 1
      const todayApts = appointments.filter(a =>
        (a.appointmentDate || '').startsWith(form.appointmentDate) &&
        a.doctorName?.toLowerCase() === form.doctorName.toLowerCase()
      );
      const nextToken = todayApts.length + 1;

      const res = await fetch(`${API}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          patientName: form.patientName,
          patientPhone: form.phone,
          doctorName: form.doctorName,
          reasonForVisit: form.reason,
          appointmentDate: form.appointmentDate,
          tokenNumber: nextToken,
          hospital: user.hospitalName || '',
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          appointmentType: 'consultation',
        }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setMsg({ type: 'success', text: `Walk-in registered! Token #${nextToken} assigned.` });
        setForm({ patientName: '', phone: '', doctorName: '', reason: '', appointmentDate: TODAY });
        onRefresh();
      } else {
        setMsg({ type: 'error', text: data.error || data.message || 'Failed to register walk-in.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hd-card" style={{ maxWidth: 560 }}>
      <div className="hd-card-header"><h3>Register Walk-in Patient</h3></div>
      <div className="hd-card-body">
        {msg && (
          <div className={`hd-notif-item ${msg.type === 'error' ? 'error' : ''}`} style={{ marginBottom: '1rem' }}>
            <span className="hd-notif-text">{msg.text}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="hd-form-row">
            <div className="hd-form-group">
              <label>Patient Name *</label>
              <input required value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="hd-form-group">
              <label>Phone *</label>
              <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" />
            </div>
          </div>
          <div className="hd-form-row">
            <div className="hd-form-group">
              <label>Doctor Name *</label>
              <input required value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} placeholder="Attending doctor" />
            </div>
            <div className="hd-form-group">
              <label>Appointment Date</label>
              <input type="date" value={form.appointmentDate} onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))} />
            </div>
          </div>
          <div className="hd-form-group">
            <label>Reason for Visit</label>
            <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief description…" />
          </div>
          <button type="submit" className="hd-btn hd-btn-primary" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register Walk-in'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── All Appointments ── */
function AppointmentsView({ appointments, loading }) {
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = appointments.filter(a => {
    const dateOk = !dateFilter || (a.appointmentDate || '').startsWith(dateFilter);
    const statusOk = !statusFilter || a.status === statusFilter;
    return dateOk && statusOk;
  });

  return (
    <>
      <div className="hd-card">
        <div className="hd-card-header"><h3>All Appointments</h3></div>
        <div className="hd-card-body" style={{ paddingBottom: 0 }}>
          <div className="hd-filter-bar">
            <input type="date" className="hd-search" style={{ flex: '0 0 auto', width: 'auto' }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            <select className="hd-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Booked</option>
              <option value="confirmed">Booked (Paid)</option>
              <option value="checked_in">Checked In</option>
              <option value="prescribed">Prescribed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            {(dateFilter || statusFilter) && (
              <button className="hd-btn hd-btn-secondary hd-btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); }}>Clear</button>
            )}
          </div>
        </div>
        <div className="hd-table-wrap">
          {loading ? (
            <div className="hd-loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="hd-empty"><div className="hd-empty-icon">📋</div><p>No appointments found</p></div>
          ) : (
            <table className="hd-table">
              <thead>
                <tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td><div className="hd-token">{a.tokenNumber || '—'}</div></td>
                    <td>{a.patientName || a.patient?.name || '—'}</td>
                    <td>{a.doctorName || a.doctor?.name || '—'}</td>
                    <td>{a.appointmentDate ? a.appointmentDate.split('T')[0] : '—'}</td>
                    <td>{a.appointmentTime || '—'}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td><button className="hd-btn hd-btn-secondary hd-btn-sm" onClick={() => setSelected(a)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="hd-modal-overlay" onClick={() => setSelected(null)}>
          <div className="hd-modal" onClick={e => e.stopPropagation()}>
            <div className="hd-modal-header">
              <h3>Appointment Details</h3>
              <button className="hd-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="hd-modal-body">
              {[
                ['Token',   selected.tokenNumber || '—'],
                ['Patient', selected.patientName || selected.patient?.name || '—'],
                ['Doctor',  selected.doctorName  || selected.doctor?.name  || '—'],
                ['Date',    selected.appointmentDate ? selected.appointmentDate.split('T')[0] : '—'],
                ['Time',    selected.appointmentTime || '—'],
                ['Status',  selected.status],
                ['Payment', selected.paymentStatus || '—'],
                ['Reason',  selected.reason || selected.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0fafa', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--hd-muted)', fontWeight: 600 }}>{k}</span>
                  <span style={{ color: 'var(--hd-text)' }}>{k === 'Status' ? statusBadge(v) : v}</span>
                </div>
              ))}
            </div>
            <div className="hd-modal-footer">
              <button className="hd-btn hd-btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Patients ── */
function PatientsView({ appointments, loading }) {
  const [search, setSearch] = useState('');
  const patients = Object.values(
    appointments.reduce((acc, a) => {
      const name = a.patientName || a.patient?.name || 'Unknown';
      if (!acc[name]) acc[name] = { name, count: 0, last: a };
      acc[name].count++;
      if (new Date(a.appointmentDate) > new Date(acc[name].last.appointmentDate)) acc[name].last = a;
      return acc;
    }, {})
  ).filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="hd-card">
      <div className="hd-card-header"><h3>Patient Registry</h3></div>
      <div className="hd-card-body" style={{ paddingBottom: 0 }}>
        <div className="hd-filter-bar">
          <input className="hd-search" placeholder="Search by patient name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="hd-table-wrap">
        {loading ? (
          <div className="hd-loading">Loading…</div>
        ) : patients.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">👥</div><p>No patients found</p></div>
        ) : (
          <table className="hd-table">
            <thead>
              <tr><th>Patient Name</th><th>Total Visits</th><th>Last Doctor</th><th>Last Date</th><th>Last Status</th></tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.name}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.count}</td>
                  <td>{p.last.doctorName || p.last.doctor?.name || '—'}</td>
                  <td>{p.last.appointmentDate ? p.last.appointmentDate.split('T')[0] : '—'}</td>
                  <td>{statusBadge(p.last.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Profile ── */
function ProfileView() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fields = [
    ['Name',     `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'],
    ['Email',    user.email    || '—'],
    ['Role',     localStorage.getItem('userRole') || '—'],
    ['Phone',    user.phone    || '—'],
    ['Hospital', user.hospitalName || '—'],
  ];
  return (
    <div className="hd-card" style={{ maxWidth: 480 }}>
      <div className="hd-card-header"><h3>My Profile</h3></div>
      <div className="hd-card-body">
        {fields.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f0fafa', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--hd-muted)', fontWeight: 600 }}>{k}</span>
            <span style={{ color: 'var(--hd-text)', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'RC';

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    if (!token || !ALLOWED.includes(role)) {
      navigate('/hospital/login');
    }
  }, [navigate]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Build query params — filter by hospital if available
      const params = new URLSearchParams();
      if (user.hospitalId) params.set('hospitalId', user.hospitalId);
      else if (user.hospitalName) params.set('hospital', user.hospitalName);

      const res = await fetch(`${API}/appointments/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`${API}/appointments/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch { /* graceful */ }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/hospital/login'); };
  const tabLabel = NAV.find(n => n.id === activeTab)?.label || 'Dashboard';

  const renderView = () => {
    const props = { appointments, loading, onStatusUpdate: handleStatusUpdate, onRefresh: fetchAppointments };
    switch (activeTab) {
      case 'overview':     return <OverviewView {...props} />;
      case 'queue':        return <QueueView {...props} />;
      case 'walkin':       return <WalkinView appointments={appointments} onRefresh={fetchAppointments} />;
      case 'appointments': return <AppointmentsView {...props} />;
      case 'patients':     return <PatientsView {...props} />;
      case 'profile':      return <ProfileView />;
      default:             return <OverviewView {...props} />;
    }
  };

  return (
    <div className="hospital-dashboard">
      <aside className="hd-sidebar">
        <div className="hd-sidebar-header">
          <div className="hd-hospital-badge">Receptionist Portal</div>
        </div>
        <nav className="hd-nav">
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="hd-nav-section">{item.section}</div>
            ) : (
              <button
                key={item.id}
                className={`hd-nav-item${activeTab === item.id ? ' active' : ''}`}
                style={activeTab === item.id ? { background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, borderRadius: 10, width: '100%', marginRight: 0 } : {}}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="hd-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </nav>
        <div className="hd-sidebar-footer">
          <div className="hd-admin-info">
            <div className="hd-admin-avatar">{initials}</div>
            <div>
              <div className="hd-admin-name">{user.firstName} {user.lastName}</div>
              <div className="hd-admin-role">Receptionist</div>
            </div>
          </div>
          <button className="hd-logout-btn" onClick={handleLogout}><LogoutIcon /> Sign Out</button>
        </div>
      </aside>

      <main className="hd-main">
        <div className="hd-topbar">
          <div className="hd-topbar-title">
            <h2>{tabLabel}</h2>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="hd-topbar-actions">
            {activeTab !== 'walkin' && (
              <button className="hd-btn hd-btn-primary hd-btn-sm" onClick={() => setActiveTab('walkin')}>+ Walk-in</button>
            )}
          </div>
        </div>

        {renderView()}

        <div className="hd-footer">© {new Date().getFullYear()} HealthMandala. All rights reserved.</div>
      </main>
    </div>
  );
}
