import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DoctorAppointments.css';
import { requireApproval } from '../../utils/approvalCheck';

const DoctorAppointments = () => {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Fetching appointments for doctor:', userData);
      
      if (userData.id) {
        // Try fetching by doctorId first
        let response = await fetch(`http://localhost:5001/api/appointments/doctor/${userData.id}`);
        let data = await response.json();
        console.log('Appointments by ID response:', data);
        
        if (data.success && data.appointments && data.appointments.length > 0) {
          setAppointments(data.appointments);
        } else {
          // Fallback: Try fetching by doctor name
          const doctorName = `Dr. ${userData.firstName} ${userData.lastName}`;
          console.log('Trying to fetch by doctor name:', doctorName);
          
          response = await fetch(`http://localhost:5001/api/appointments/doctor-by-name/${encodeURIComponent(doctorName)}`);
          data = await response.json();
          console.log('Appointments by name response:', data);
          
          if (data.success) {
            setAppointments(data.appointments);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const approved = await requireApproval(userData.id, 'doctor');
    if (!approved) return;

    if (!window.confirm('Confirm this appointment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/appointments/doctor-confirm/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        alert('Appointment confirmed successfully!');
        fetchAppointments();
      } else {
        alert(data.error || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Confirm error:', error);
      alert('Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const approved = await requireApproval(userData.id, 'doctor');
    if (!approved) return;

    if (!window.confirm('Cancel this appointment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/appointments/cancel/${appointmentId}`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (data.success) {
        alert('Appointment cancelled successfully!');
        fetchAppointments();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return apt.status === 'pending' || apt.status === 'approved';
    if (activeFilter === 'confirmed') return apt.status === 'confirmed';
    if (activeFilter === 'completed') return apt.status === 'completed';
    if (activeFilter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  return (
    <div className="doctor-appointments">
      <nav className="top-navbar">
        <Link to="/doctor-dashboard" className="logo">
          <img src="/logo.png" alt="HealthMandala" />
          <span>HealthMandala</span>
        </Link>
        <div className="nav-right">
          <div className="nav-icons">
            <button className="nav-icon" title="Notifications">N</button>
            <Link to="/profile" className="user-menu">
              <div className="user-avatar">
                {JSON.parse(localStorage.getItem('user') || '{}').firstName?.[0] || 'U'}
                {JSON.parse(localStorage.getItem('user') || '{}').lastName?.[0] || ''}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="appointments-content">
        <div className="page-header">
          <Link to="/doctor-dashboard" className="back-btn">← Back to Dashboard</Link>
          <h1>Appointments</h1>
        </div>

        <div className="appointments-filters">
          <div className="filter-tabs">
            <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
            <button className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>Pending</button>
            <button className={`filter-tab ${activeFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveFilter('confirmed')}>Confirmed</button>
            <button className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`} onClick={() => setActiveFilter('completed')}>Completed</button>
            <button className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveFilter('cancelled')}>Cancelled</button>
          </div>
          <div className="date-filter">
            <span>Date:</span>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading appointments...</div>
        ) : (
          <div className="appointments-table">
            <div className="table-header">
              <span>Patient</span>
              <span>Date</span>
              <span>Time</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <div key={apt._id} className="table-row">
                  <div className="patient-cell">
                    <div className="avatar">{apt.patientName?.[0] || 'P'}</div>
                    <div className="details">
                      <h4>{apt.patientName}</h4>
                      <p>{apt.reasonForVisit}</p>
                    </div>
                  </div>
                  <div className="date-cell">
                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="time-cell">{apt.appointmentTime}</div>
                  <div className="status-cell">
                    <span className={`status-badge ${apt.status === 'approved' ? 'pending' : apt.status}`}>
                      {apt.status === 'approved' ? 'Pending' :
                       apt.status === 'pending' ? 'Pending' :
                       apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                  <div className="actions-cell">
                    {(apt.status === 'pending' || apt.status === 'approved') && (
                      <>
                        <button className="action-btn view" onClick={() => handleConfirm(apt._id)}>
                          Confirm
                        </button>
                        <button className="action-btn cancel" onClick={() => handleCancel(apt._id)}>
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <button className="action-btn view">View</button>
                    )}
                    {apt.status === 'pending-admin' && (
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Awaiting admin approval</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No {activeFilter !== 'all' ? activeFilter : ''} appointments found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
