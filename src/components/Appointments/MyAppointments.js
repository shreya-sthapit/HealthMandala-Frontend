import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentCard from './AppointmentCard';
import PrescriptionModal from './PrescriptionModal';
import './Appointments.css';
import { requireApproval } from '../../utils/approvalCheck';

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      let response;

      if (userData.id && userData.id !== 'null' && userData.id !== 'undefined') {
        // Try to fetch by patient ID first
        response = await fetch(`http://localhost:5001/api/appointments/patient/${userData.id}`);
      } else if (userData.firstName && userData.lastName) {
        // Fallback to fetch by patient name and phone
        const patientName = `${userData.firstName} ${userData.lastName}`;
        const patientPhone = userData.phone || 'undefined';
        response = await fetch(`http://localhost:5001/api/appointments/patient-by-info/${encodeURIComponent(patientName)}/${encodeURIComponent(patientPhone)}`);
      } else {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return {
      day: date.getDate(),
      month: monthNames[date.getMonth()],
      weekday: dayNames[date.getDay()],
      year: date.getFullYear()
    };
  };

  const getStatusFromDate = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointment.status === 'cancelled' || appointment.status === 'rejected') return 'cancelled';
    if (appointment.status === 'completed') return 'completed';
    // Past date with no explicit status = completed
    if (appointmentDate < today) return 'completed';
    // Future/today date — show as upcoming regardless of approval status
    return 'upcoming';
  };

  const filteredAppointments = appointments.filter(apt => getStatusFromDate(apt) === activeTab);

  const cancelAppointment = async (appointmentId) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const approved = await requireApproval(userData.id, 'patient');
    if (!approved) return;

    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/appointments/cancel/${appointmentId}`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (data.success) {
        fetchAppointments(); // Refresh the list
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel appointment');
    }
  };

  const handleProtectedAction = async (action) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const approved = await requireApproval(userData.id, 'patient');
    if (approved) {
      action();
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-content">
        <div className="page-header">
          <Link to="/" className="back-btn">← Back to Home</Link>
          <h1>My Appointments</h1>
        </div>

        <div className="appointments-tabs">
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="appointments-list-page">
            {filteredAppointments.map((apt) => {
              const formattedDate = formatDate(apt.appointmentDate);
              const status = getStatusFromDate(apt);
              
              return (
                <div key={apt._id} className="appointment-card-full">
                  <div className="appointment-left">
                    <div className="appointment-date-box">
                      <div className="month">{formattedDate.month}</div>
                      <div className="day">{formattedDate.day}</div>
                      <div className="weekday">{formattedDate.weekday}</div>
                    </div>
                    <div className="appointment-info-full">
                      <h3>{apt.doctorName}</h3>
                      <p className="specialty">{apt.doctorSpecialization}</p>
                      <div className="appointment-meta-full">
                        <span>{apt.appointmentTime}</span>
                        <span>Rs. {apt.consultationFee}</span>
                      </div>
                      {apt.reasonForVisit && (
                        <p className="reason">Reason: {apt.reasonForVisit}</p>
                      )}
                    </div>
                  </div>
                  <div className="appointment-right">
                    <span className={`status-badge ${apt.status === 'pending-admin' ? 'pending' : apt.status}`}>
                      {apt.status === 'pending-admin' ? 'Awaiting Approval' :
                       apt.status === 'pending' ? 'Awaiting Doctor' :
                       apt.status === 'approved' ? 'Awaiting Doctor' :
                       apt.status === 'confirmed' ? 'Confirmed' :
                       apt.status === 'completed' ? 'Completed' :
                       apt.status === 'cancelled' ? 'Cancelled' :
                       apt.status === 'rejected' ? 'Rejected' :
                       apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    <div className="appointment-actions-full">
                      {status === 'upcoming' && (
                        <>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleProtectedAction(() => {
                              setSelectedAppointment(apt);
                              setShowCard(true);
                            })}
                          >
                            View Card
                          </button>
                          <button 
                            className="action-btn danger"
                            onClick={() => cancelAppointment(apt._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {status === 'completed' && (
                        <>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleProtectedAction(() => {
                              setSelectedAppointment(apt);
                              setShowCard(true);
                            })}
                          >
                            View Card
                          </button>
                          <button
                            className="action-btn secondary"
                            onClick={() => handleProtectedAction(() => {
                              setSelectedAppointment(apt);
                              setShowPrescription(true);
                            })}
                          >
                            View Details
                          </button>
                        </>
                      )}
                      {status === 'cancelled' && (
                        <Link to="/book-appointment" className="action-btn primary">Book Again</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">—</div>
            <h3>No {activeTab} appointments</h3>
            <p>
              {activeTab === 'upcoming' && "You don't have any upcoming appointments scheduled."}
              {activeTab === 'completed' && "You haven't completed any appointments yet."}
              {activeTab === 'cancelled' && "You don't have any cancelled appointments."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/book-appointment" className="btn btn-primary">Book Appointment</Link>
            )}
          </div>
        )}
      </div>

      {/* Appointment Card Modal */}
      {showCard && selectedAppointment && (
        <AppointmentCard 
          appointment={selectedAppointment}
          onClose={() => { setShowCard(false); setSelectedAppointment(null); }}
        />
      )}

      {/* Prescription Modal */}
      {showPrescription && selectedAppointment && (
        <PrescriptionModal
          appointment={selectedAppointment}
          onClose={() => { setShowPrescription(false); setSelectedAppointment(null); }}
        />
      )}
    </div>
  );
};

export default MyAppointments;
