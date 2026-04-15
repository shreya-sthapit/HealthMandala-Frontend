import { Link } from 'react-router-dom';
import '../AuthPage.css';
import './DoctorRegLayout.css';

const STEPS = [
  { num: 1, label: 'Personal Info' },
  { num: 2, label: 'Professional' },
  { num: 3, label: 'Documents' },
  { num: 4, label: 'NID' },
];

const LEFT_CONTENT = {
  1: { emoji: '👤', title: 'Personal\nDetails', desc: 'Tell us a bit about yourself to get started.' },
  2: { emoji: '🩺', title: 'Professional\nInfo', desc: 'Share your medical credentials and specialization.' },
  3: { emoji: '📄', title: 'Documents\n& Bio', desc: 'Upload your NMC certificate and degree.' },
  4: { emoji: '🪪', title: 'NID\nVerification', desc: 'Verify your identity with your National ID.' },
};

const DoctorRegLayout = ({ step, title, subtitle, children }) => {
  const left = LEFT_CONTENT[step] || LEFT_CONTENT[1];

  return (
    <>
      <div className="drl-page">
        <div className="drl-card">

          {/* ── Teal left panel ── */}
          <div className="drl-left-panel">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem' }}>
              {/* Logo */}
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '2rem' }}>
                <img src="/logo.png" alt="HealthMandala" style={{ height: 32, width: 'auto' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>HealthMandala</span>
              </Link>

              {/* Step icon */}
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{left.emoji}</div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                {left.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, maxWidth: 200, marginBottom: '2rem' }}>
                {left.desc}
              </p>

              {/* Step progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {STEPS.map((s, i) => (
                  <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: s.num < step ? '#10b981' : s.num === step ? '#fff' : 'rgba(255,255,255,0.25)',
                      color: s.num === step ? '#6dbc95' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.82rem',
                      border: s.num === step ? '2px solid #fff' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {s.num < step ? '✓' : s.num}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 28, height: 3, background: s.num < step ? '#10b981' : 'rgba(255,255,255,0.25)', transition: 'background 0.3s' }} />
                    )}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.6rem' }}>
                Step {step} of {STEPS.length}
              </p>
            </div>
          </div>

          {/* ── White right panel ── */}
          <div className="drl-right-panel">
            <div className="drl-form-wrapper">
              <h2 className="drl-title">{title}</h2>
              {subtitle && <p className="drl-subtitle">{subtitle}</p>}
              {children}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DoctorRegLayout;
