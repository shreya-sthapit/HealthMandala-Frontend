import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Booking.css';

const BookingConfirmed = () => {
  const location = useLocation();
  const booking = location.state?.booking;
  const appointmentId = location.state?.appointmentId;
  const paymentStatus = location.state?.paymentStatus || 'pending';
  const bookingId = `HM${Date.now().toString().slice(-6)}`;

  const [patient, setPatient] = useState({
    name: 'Loading...',
    id: 'PT-2025-001234'
  });

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.id) {
        // Try to fetch patient profile
        const response = await fetch(`http://localhost:5001/api/patient/profile/${userData.id}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
          setPatient({
            name: `${data.profile.firstName} ${data.profile.lastName}`,
            id: `PT-${new Date().getFullYear()}-${userData.id.slice(-6).toUpperCase()}`
          });
        } else {
          // Fallback to user data from localStorage
          setPatient({
            name: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}` 
              : 'Patient',
            id: `PT-${new Date().getFullYear()}-${userData.id?.slice(-6).toUpperCase() || '000000'}`
          });
        }
      } else {
        // Use data from localStorage if no ID
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setPatient({
          name: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : 'Patient',
          id: 'PT-2025-000000'
        });
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      // Fallback to localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setPatient({
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : 'Patient',
        id: `PT-${new Date().getFullYear()}-000000`
      });
    }
  };

  return (
    <div className="booking-container">
      <nav className="top-navbar">
        <Link to="/home" className="logo">
          <img src="/logo.png" alt="HealthMandala" />
          <span>HealthMandala</span>
        </Link>
      </nav>

      <div className="booking-content">
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h2>
            {paymentStatus === 'paid' ? 'Payment Successful!' : 'Appointment Booked!'}
          </h2>
          <p>
            {paymentStatus === 'paid' 
              ? 'Your payment has been processed and appointment confirmed' 
              : 'Your appointment has been successfully scheduled'
            }
          </p>

          {booking && (
            <div className="confirmation-details">
              <div className="detail-row">
                <span className="label">Booking ID</span>
                <span className="value">#{bookingId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Doctor</span>
                <span className="value">{booking.doctor?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Specialty</span>
                <span className="value">{booking.doctor?.specialty}</span>
              </div>
              {booking.doctor?.hospital && (
                <div className="detail-row">
                  <span className="label">Hospital</span>
                  <span className="value">{booking.doctor.hospital}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Date</span>
                <span className="value">{booking.date?.day}, {booking.date?.date} {booking.date?.month}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time</span>
                <span className="value">{booking.time}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount Paid</span>
                <span className="value">Rs. {booking.doctor?.fee}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method</span>
                <span className="value">
                  {booking.paymentMethod === 'esewa' ? 'eSewa' : booking.paymentMethod}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Status</span>
                <span className={`value payment-status ${paymentStatus}`}>
                  {paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Patient Card */}
        {booking && (
          <div className="patient-card-section">
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-dark)' }}>
              Your Appointment Card
            </h3>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Show this card at the clinic reception
            </p>
            
            <div className="patient-card">
              <div className="patient-card-header">
                <div className="patient-card-logo">
                  <img src="/logo.png" alt="HealthMandala" />
                  <span>HealthMandala</span>
                </div>
                <span className="card-type">APPOINTMENT</span>
              </div>

              <div className="patient-card-body">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-id">Patient ID: {patient.id}</div>

                <div className="card-details">
                  <div className="card-detail">
                    <div className="label">Doctor</div>
                    <div className="value">{booking.doctor?.name}</div>
                  </div>
                  <div className="card-detail">
                    <div className="label">Specialty</div>
                    <div className="value">{booking.doctor?.specialty}</div>
                  </div>
                  {booking.doctor?.hospital && (
                    <div className="card-detail" style={{ gridColumn: '1 / -1' }}>
                      <div className="label">Hospital</div>
                      <div className="value">🏥 {booking.doctor.hospital}</div>
                    </div>
                  )}
                  <div className="card-detail">
                    <div className="label">Date</div>
                    <div className="value">{booking.date?.date} {booking.date?.month}</div>
                  </div>
                  <div className="card-detail">
                    <div className="label">Time</div>
                    <div className="value">{booking.time}</div>
                  </div>
                </div>

                <div className="card-qr">
                  <div className="qr-placeholder">
                    QR Code<br/>#{bookingId}
                  </div>
                  <div className="card-validity">
                    <div>Booking ID</div>
                    <div className="date">#{bookingId}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="card-action-btn download">
                Download Card
              </button>
              <button className="card-action-btn share">
                Share
              </button>
            </div>
          </div>
        )}

        <div className="confirmation-actions" style={{ marginTop: '2rem' }}>
          <Link to="/home" className="btn btn-outline">Back to Home</Link>
          <Link to="/my-appointments" className="btn btn-primary">View Appointments</Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmed;
