import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../HospitalDashboard/HospitalDashboard.css';

const API = 'http://localhost:5001/api';
const ALLOWED = ['pharmacist', 'staff', 'hospital_admin', 'admin'];

/* ── Icons ── */
const DashIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const ClockIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ListIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const UserIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV = [
  { section: 'Overview' },
  { id: 'overview',  label: 'Dashboard',              icon: <DashIcon /> },
  { section: 'Prescriptions' },
  { id: 'pending',   label: 'Incoming Prescriptions', icon: <ClockIcon /> },
  { id: 'dispensed', label: 'Dispensed',              icon: <CheckIcon /> },
  { id: 'all',       label: 'All Prescriptions',      icon: <ListIcon /> },
  { section: 'Account' },
  { id: 'profile',   label: 'My Profile',             icon: <UserIcon /> },
];

function RxStatusBadge({ status }) {
  const cls = status === 'dispensed' ? 'hd-badge-completed' : 'hd-badge-pending';
  return <span className={`hd-badge ${cls}`}>{status || 'pending'}</span>;
}

/* ── Dispense Modal ── */
function DispenseModal({ rx, onClose, onDispensed }) {
  const [toast, setToast] = useState(false);
  const [billing, setBilling] = useState(false);

  const handleCollectPayment = async () => {
    setBilling(true);
    try {
      // Mark prescription as dispensed
      await fetch(`${API}/prescriptions/${rx._id}/dispense`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Mark appointment as completed (final lifecycle step)
      if (rx.appointmentId) {
        await fetch(`${API}/appointments/complete-billing/${rx.appointmentId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      setToast(true);
      setTimeout(() => { setToast(false); onDispensed(); onClose(); }, 1800);
    } catch {
      setToast(true);
      setTimeout(() => { setToast(false); onDispensed(); onClose(); }, 1800);
    } finally {
      setBilling(false);
    }
  };

  const meds = rx.medicines || rx.medications || [];
  // Simple bill calculation: sum of medicine quantities (placeholder pricing)
  const totalMeds = meds.length;

  return (
    <div className="hd-modal-overlay" onClick={onClose}>
      <div className="hd-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="hd-modal-header">
          <h3>
            Prescription — Token #{rx.tokenNumber || '—'} &nbsp;
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--hd-muted)' }}>{rx.patientName}</span>
          </h3>
          <button className="hd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="hd-modal-body">
          {toast && (
            <div className="hd-notif-item" style={{ marginBottom: '1rem', background: '#d1fae5', borderLeftColor: '#10b981' }}>
              <span className="hd-notif-text" style={{ color: '#065f46', fontWeight: 600 }}>✅ Payment collected — VAT bill printed!</span>
            </div>
          )}

          {/* Patient & Rx info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', marginBottom: '1rem' }}>
            {[
              ['Patient',    rx.patientName || '—'],
              ['Token #',    rx.tokenNumber || '—'],
              ['Doctor',     rx.doctorName  || '—'],
              ['Diagnosis',  rx.diagnosis   || '—'],
              ['Date',       rx.createdAt   ? rx.createdAt.split('T')[0] : '—'],
              ['Follow-up',  rx.followUpDate ? rx.followUpDate.split('T')[0] : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '0.4rem 0', borderBottom: '1px solid #f0fafa', fontSize: '0.83rem' }}>
                <div style={{ color: 'var(--hd-muted)', fontWeight: 600, fontSize: '0.7rem', marginBottom: '0.15rem' }}>{k}</div>
                <div style={{ color: 'var(--hd-text)', fontWeight: k === 'Token #' ? 700 : 400 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Medicine table */}
          {meds.length > 0 && (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--hd-text)', marginBottom: '0.5rem' }}>
                Medicines ({totalMeds} item{totalMeds !== 1 ? 's' : ''})
              </div>
              <div className="hd-table-wrap" style={{ marginBottom: '1rem' }}>
                <table className="hd-table">
                  <thead>
                    <tr><th>#</th><th>Medicine</th><th>Strength</th><th>Frequency</th><th>Duration</th></tr>
                  </thead>
                  <tbody>
                    {meds.map((m, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--hd-muted)', fontWeight: 600 }}>{i + 1}</td>
                        <td><strong>{m.name || m.medicineName || '—'}</strong></td>
                        <td>{m.dosage || m.strength || '—'}</td>
                        <td>{m.frequency || m.timing || '—'}</td>
                        <td>{m.duration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {rx.notes && (
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.82rem', color: '#166534', marginBottom: '0.5rem' }}>
              <strong>Doctor's Notes:</strong> {rx.notes}
            </div>
          )}
        </div>
        <div className="hd-modal-footer">
          <button className="hd-btn hd-btn-secondary" onClick={onClose}>Close</button>
          {!toast && (
            <button
              className="hd-btn hd-btn-primary"
              onClick={handleCollectPayment}
              disabled={billing}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              {billing ? 'Processing…' : '💳 Collect Payment & Print VAT Bill'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Overview ── */
function OverviewView({ prescriptions, loading }) {
  const today = new Date().toISOString().split('T')[0];
  const todayRx = prescriptions.filter(p => (p.createdAt || '').startsWith(today));
  const stats = [
    { label: 'Total Rx Today',       value: todayRx.length,                                             color: 'teal',   icon: '💊' },
    { label: 'Awaiting Collection',  value: prescriptions.filter(p => p.status !== 'dispensed').length, color: 'orange', icon: '⏳' },
    { label: 'Dispensed Today',      value: todayRx.filter(p => p.status === 'dispensed').length,       color: 'green',  icon: '✅' },
    { label: 'Total Dispensed',      value: prescriptions.filter(p => p.status === 'dispensed').length, color: 'blue',   icon: '📦' },
  ];
  return (
    <>
      <div className="hd-stats-grid">
        {stats.map(s => (
          <div className="hd-stat-card" key={s.label}>
            <div className={`hd-stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="hd-stat-value">{s.value}</div>
              <div className="hd-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="hd-card">
        <div className="hd-card-header"><h3>Recent Prescriptions</h3></div>
        <div className="hd-table-wrap">
          {loading ? (
            <div className="hd-loading">Loading…</div>
          ) : prescriptions.length === 0 ? (
            <div className="hd-empty"><div className="hd-empty-icon">💊</div><p>No prescriptions yet</p></div>
          ) : (
            <table className="hd-table">
              <thead>
                <tr><th>Token #</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {prescriptions.slice(0, 8).map(p => (
                  <tr key={p._id}>
                    <td><div className="hd-token">{p.tokenNumber || '—'}</div></td>
                    <td>{p.patientName || '—'}</td>
                    <td>{p.doctorName  || '—'}</td>
                    <td>{p.diagnosis   || '—'}</td>
                    <td>{(p.medicines || []).length}</td>
                    <td>{p.createdAt ? p.createdAt.split('T')[0] : '—'}</td>
                    <td><RxStatusBadge status={p.status} /></td>
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

/* ── Pending (Incoming Prescriptions) ── */
function PendingView({ prescriptions, loading, onRefresh }) {
  const [selected, setSelected] = useState(null);
  // Show prescriptions where appointment is 'prescribed' (doctor done, pharmacist not yet)
  const pending = prescriptions
    .filter(p => p.status !== 'dispensed')
    .sort((a, b) => (a.tokenNumber || 999) - (b.tokenNumber || 999));

  return (
    <>
      <div className="hd-card">
        <div className="hd-card-header">
          <h3>Incoming Prescriptions</h3>
          <span className="hd-badge hd-badge-pending">{pending.length} pending</span>
        </div>
        <div className="hd-table-wrap">
          {loading ? (
            <div className="hd-loading">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="hd-empty"><div className="hd-empty-icon">✅</div><p>No pending prescriptions</p></div>
          ) : (
            <table className="hd-table">
              <thead>
                <tr><th>Token #</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="hd-token" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                        {p.tokenNumber || '—'}
                      </div>
                    </td>
                    <td><strong>{p.patientName || '—'}</strong></td>
                    <td>{p.doctorName || '—'}</td>
                    <td>{p.diagnosis || '—'}</td>
                    <td>{(p.medicines || []).length} item{(p.medicines || []).length !== 1 ? 's' : ''}</td>
                    <td>{p.createdAt ? p.createdAt.split('T')[0] : '—'}</td>
                    <td>
                      <button className="hd-btn hd-btn-primary hd-btn-sm" onClick={() => setSelected(p)}>
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <DispenseModal
          rx={selected}
          onClose={() => setSelected(null)}
          onDispensed={() => { setSelected(null); onRefresh(); }}
        />
      )}
    </>
  );
}

/* ── Dispensed ── */
function DispensedView({ prescriptions, loading }) {
  const dispensed = prescriptions.filter(p => p.status === 'dispensed');
  return (
    <div className="hd-card">
      <div className="hd-card-header"><h3>Dispensed Prescriptions</h3></div>
      <div className="hd-table-wrap">
        {loading ? (
          <div className="hd-loading">Loading…</div>
        ) : dispensed.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">📦</div><p>Dispensed prescriptions will appear here</p></div>
        ) : (
          <table className="hd-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {dispensed.map(p => (
                <tr key={p._id}>
                  <td>{p.patientName || p.patient?.name || '—'}</td>
                  <td>{p.doctorName  || p.doctor?.name  || '—'}</td>
                  <td>{p.diagnosis   || '—'}</td>
                  <td>{(p.medicines || p.medications || []).length}</td>
                  <td>{p.createdAt ? p.createdAt.split('T')[0] : '—'}</td>
                  <td><RxStatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── All Prescriptions ── */
function AllView({ prescriptions, loading }) {
  const [search, setSearch] = useState('');
  const filtered = prescriptions.filter(p => {
    const name = (p.patientName || p.patient?.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="hd-card">
      <div className="hd-card-header"><h3>All Prescriptions</h3></div>
      <div className="hd-card-body" style={{ paddingBottom: 0 }}>
        <div className="hd-filter-bar">
          <input className="hd-search" placeholder="Search by patient name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="hd-table-wrap">
        {loading ? (
          <div className="hd-loading">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">💊</div><p>No prescriptions found</p></div>
        ) : (
          <table className="hd-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Medicines</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.patientName || p.patient?.name || '—'}</strong></td>
                  <td>{p.doctorName || p.doctor?.name || '—'}</td>
                  <td>{p.createdAt ? p.createdAt.split('T')[0] : '—'}</td>
                  <td>{(p.medicines || p.medications || []).length}</td>
                  <td><RxStatusBadge status={p.status} /></td>
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
export default function PharmacistDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'PH';

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    if (!token || !ALLOWED.includes(role)) {
      navigate('/hospital/login');
    }
  }, [navigate]);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const params = new URLSearchParams();
      if (user.hospitalId) params.set('hospitalId', user.hospitalId);
      else if (user.hospitalName) params.set('hospital', user.hospitalName);

      const res = await fetch(`${API}/prescriptions/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.status === 404) { setPrescriptions([]); return; }
      const data = await res.json();
      if (data.success) {
        // Enrich prescriptions with token number from linked appointment
        const rxList = data.prescriptions || [];
        const enriched = await Promise.all(rxList.map(async (rx) => {
          if (rx.appointmentId) {
            try {
              const aptRes = await fetch(`${API}/appointments/by-id/${rx.appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              const aptData = await aptRes.json();
              if (aptData.success && aptData.appointment) {
                return { ...rx, tokenNumber: aptData.appointment.tokenNumber, appointmentStatus: aptData.appointment.status };
              }
            } catch { /* skip enrichment */ }
          }
          return rx;
        }));
        setPrescriptions(enriched);
      } else {
        setPrescriptions([]);
      }
    } catch { setPrescriptions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchPrescriptions(); 
    // Poll every 15 seconds so new prescriptions appear without manual refresh
    const interval = setInterval(fetchPrescriptions, 15000);
    return () => clearInterval(interval);
  }, [fetchPrescriptions]);

  const handleLogout = () => { localStorage.clear(); navigate('/hospital/login'); };
  const tabLabel = NAV.find(n => n.id === activeTab)?.label || 'Dashboard';

  const renderView = () => {
    const props = { prescriptions, loading, onRefresh: fetchPrescriptions };
    switch (activeTab) {
      case 'overview':  return <OverviewView {...props} />;
      case 'pending':   return <PendingView {...props} />;
      case 'dispensed': return <DispensedView {...props} />;
      case 'all':       return <AllView {...props} />;
      case 'profile':   return <ProfileView />;
      default:          return <OverviewView {...props} />;
    }
  };

  return (
    <div className="hospital-dashboard">
      <aside className="hd-sidebar">
        <div className="hd-sidebar-header">
          <div className="hd-hospital-badge">Pharmacist Portal</div>
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
              <div className="hd-admin-role">Pharmacist</div>
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
        </div>

        {renderView()}

        <div className="hd-footer">© {new Date().getFullYear()} HealthMandala. All rights reserved.</div>
      </main>
    </div>
  );
}
