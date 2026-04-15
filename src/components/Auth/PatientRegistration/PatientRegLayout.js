import { Link } from 'react-router-dom';
import '../AuthPage.css';
import './PatientRegLayout.css';

const STEPS = [
  { num: 1, label: 'Personal' },
  { num: 2, label: 'Address' },
  { num: 3, label: 'Emergency' },
  { num: 4, label: 'Medical' },
  { num: 5, label: 'NID' },
];

const LEFT_CONTENT = {
  1: { emoji: '👤', title: 'Personal\nDetails', desc: 'Tell us a bit about yourself.' },
  2: { emoji: '📍', title: 'Your\nAddress', desc: 'Where are you located in Nepal?' },
  3: { emoji: '🆘', title: 'Emergency\nContact', desc: 'Who should we reach in an emergency?' },
  4: { emoji: '🩺', title: 'Medical\nHistory', desc: 'Help us understand your health background.' },
  5: { emoji: '🪪', title: 'NID\nVerification', desc: 'Verify your identity with your National ID.' },
};

const PatientRegLayout = ({ step, title, subtitle, children }) => {
  const left = LEFT_CONTENT[step] || LEFT_CONTENT[1];

  return (
    <div className="prl-page">
      <div className="prl-card">

        {/* ── Teal left panel ── */}
        <div className="prl-left">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="HealthMandala" style={{ height: 30, width: 'auto' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>HealthMandala</span>
          </Link>

          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{left.emoji}</div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
            {left.title}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: 200, marginBottom: '2rem' }}>
            {left.desc}
          </p>

          {/* Step dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: s.num < step ? '#10b981' : s.num === step ? '#fff' : 'rgba(255,255,255,0.25)',
                  color: s.num === step ? '#6dbc95' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.78rem',
                  border: s.num === step ? '2px solid #fff' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {s.num < step ? '✓' : s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 22, height: 3, background: s.num < step ? '#10b981' : 'rgba(255,255,255,0.25)', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Step {step} of {STEPS.length}
          </p>
        </div>

        {/* ── White right panel ── */}
        <div className="prl-right">
          <div className="prl-form-wrapper">
            <h2 className="prl-title">{title}</h2>
            {subtitle && <p className="prl-subtitle">{subtitle}</p>}
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientRegLayout;
