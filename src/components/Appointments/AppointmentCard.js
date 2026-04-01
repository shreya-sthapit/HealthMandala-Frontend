import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentCard.css';

const AppointmentCard = ({ appointment, onClose }) => {
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const generateQRCode = (text) => {
    // Using a simple QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const appointmentId = appointment._id || appointment.id || 'HM' + Date.now();
  const qrData = `HealthMandala Appointment\nID: ${appointmentId}\nPatient: ${appointment.patientName}\nDoctor: ${appointment.doctorName}\nDate: ${new Date(appointment.appointmentDate).toLocaleDateString()}\nTime: ${appointment.appointmentTime}`;

  const handleDownload = () => {
    // Create a canvas to draw the card
    const card = document.querySelector('.appointment-card-modal');
    if (card) {
      // Simple download approach - in production, use html2canvas or similar
      alert('Card download feature - In production, this would generate a PDF or image of the card');
    }
  };

  const handleShare = (method) => {
    const shareText = `My appointment with ${appointment.doctorName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`;
    
    switch(method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Appointment Details&body=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText);
        alert('Appointment details copied to clipboard!');
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="appointment-card-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(5px)'
    }}>
      <div className="appointment-card-modal" onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        <button className="card-close-btn" onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0, 0, 0, 0.1)',
          color: '#1f2937',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>×</button>
        
        <div className="card-header" style={{
          textAlign: 'center',
          padding: '2rem 2rem 1.5rem',
          background: 'linear-gradient(135deg, #00a896 0%, #0d9488 100%)',
          color: 'white',
          borderRadius: '24px 24px 0 0'
        }}>
          <div className="card-logo" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <img src="/logo.png" alt="HealthMandala" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>HealthMandala</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem', fontWeight: 700 }}>Your Appointment Card</h2>
          <p className="card-subtitle" style={{ fontSize: '0.95rem', opacity: 0.9, margin: 0 }}>Show this card at the clinic reception</p>
        </div>

        <div className="card-body" style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '2rem'
        }}>
          <div className="card-main-content" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Patient Info */}
            <div className="card-section patient-section" style={{
              display: 'flex',
              gap: '1rem',
              padding: '1.25rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div className="section-icon" style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>👤</div>
              <div className="section-content" style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.25rem',
                  fontWeight: 600
                }}>Patient Name</label>
                <h3 style={{
                  fontSize: '1.25rem',
                  color: '#1f2937',
                  margin: 0,
                  fontWeight: 600
                }}>{appointment.patientName}</h3>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="card-section doctor-section" style={{
              display: 'flex',
              gap: '1rem',
              padding: '1.25rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div className="section-icon" style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>👨‍⚕️</div>
              <div className="section-content" style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.25rem',
                  fontWeight: 600
                }}>Doctor</label>
                <h3 style={{
                  fontSize: '1.25rem',
                  color: '#1f2937',
                  margin: 0,
                  fontWeight: 600
                }}>{appointment.doctorName}</h3>
                <p className="specialization" style={{
                  fontSize: '0.9rem',
                  color: '#00a896',
                  margin: '0.25rem 0 0',
                  fontWeight: 500
                }}>{appointment.doctorSpecialization}</p>
                {appointment.hospital && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>🏥</span> {appointment.hospital}
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="card-details-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div className="detail-item">
                <div className="detail-icon">📅</div>
                <div>
                  <label>Date</label>
                  <p>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">🕐</div>
                <div>
                  <label>Time</label>
                  <p>{appointment.appointmentTime}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">💰</div>
                <div>
                  <label>Consultation Fee</label>
                  <p>Rs. {appointment.consultationFee}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">💳</div>
                <div>
                  <label>Payment Status</label>
                  <p className={`payment-status ${appointment.paymentStatus}`}>
                    {appointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="status-badge" style={{ backgroundColor: getStatusColor(appointment.status) }}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="card-qr-section">
            <div className="qr-code-container">
              <img 
                src={generateQRCode(qrData)} 
                alt="Appointment QR Code"
                className="qr-code"
              />
            </div>
            <div className="qr-info">
              <p className="qr-label">QR Code</p>
              <p className="qr-id">#{appointmentId.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button className="action-btn download-btn" onClick={handleDownload}>
            <span className="btn-icon">⬇</span>
            Download Card
          </button>
          
          <div className="share-container">
            <button 
              className="action-btn share-btn" 
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <span className="btn-icon">📤</span>
              Share
            </button>
            
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare('whatsapp')}>
                  <span>💬</span> WhatsApp
                </button>
                <button onClick={() => handleShare('email')}>
                  <span>📧</span> Email
                </button>
                <button onClick={() => handleShare('copy')}>
                  <span>📋</span> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="card-footer">
          <p>Please arrive 10 minutes before your appointment time</p>
          <p className="footer-note">For any changes, contact the clinic or reschedule through the app</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
