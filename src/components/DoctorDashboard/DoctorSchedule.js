import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  
  const [schedule, setSchedule] = useState([
    { day: 'Monday', start: '09:00', end: '17:00', active: true },
    { day: 'Tuesday', start: '09:00', end: '17:00', active: true },
    { day: 'Wednesday', start: '09:00', end: '17:00', active: true },
    { day: 'Thursday', start: '09:00', end: '17:00', active: true },
    { day: 'Friday', start: '09:00', end: '17:00', active: true },
    { day: 'Saturday', start: '09:00', end: '17:00', active: true },
    { day: 'Sunday', start: '09:00', end: '17:00', active: false }
  ]);

  const [lunchBreak, setLunchBreak] = useState({ start: '13:00', end: '14:00' });
  const [consultationDuration, setConsultationDuration] = useState(30);
  const [consultationFee, setConsultationFee] = useState(1500);
  const [maxPatientsPerDay, setMaxPatientsPerDay] = useState(20);
  const [leaves, setLeaves] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserId(userData.id);
    
    if (userData.id) {
      fetchDoctorSchedule(userData.id);
    }
  }, []);

  const fetchDoctorSchedule = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/doctor/profile/${userId}`);
      const data = await response.json();

      if (data.success && data.profile) {
        const profile = data.profile;
        
        // Load schedule if exists
        if (profile.schedule && profile.schedule.length > 0) {
          setSchedule(profile.schedule);
        }
        
        // Load other settings
        if (profile.lunchBreak) {
          setLunchBreak(profile.lunchBreak);
        }
        if (profile.consultationDuration) {
          setConsultationDuration(profile.consultationDuration);
        }
        if (profile.consultationFee) {
          setConsultationFee(profile.consultationFee);
        }
        if (profile.maxPatientsPerDay) {
          setMaxPatientsPerDay(profile.maxPatientsPerDay);
        }
        if (profile.leaves) {
          setLeaves(profile.leaves);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setMessage('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (index) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const updateTime = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = async () => {
    if (!userId) {
      setMessage('User not found. Please login again.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await fetch(`http://localhost:5001/api/doctor/schedule/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule,
          lunchBreak,
          consultationDuration,
          consultationFee,
          maxPatientsPerDay
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Schedule saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setMessage('Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLeave = async () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Please fill all leave details');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/doctor/leave/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeave),
      });

      const data = await response.json();

      if (data.success) {
        setLeaves(data.leaves);
        setShowLeaveModal(false);
        setNewLeave({ startDate: '', endDate: '', reason: '' });
        setMessage('Leave added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(data.error || 'Failed to add leave');
      }
    } catch (error) {
      console.error('Error adding leave:', error);
      alert('Failed to add leave. Please try again.');
    }
  };

  const handleRemoveLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to remove this leave?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/doctor/leave/${userId}/${leaveId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setLeaves(data.leaves);
        setMessage('Leave removed successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(data.error || 'Failed to remove leave');
      }
    } catch (error) {
      console.error('Error removing leave:', error);
      alert('Failed to remove leave. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="doctor-schedule">
        <nav className="top-navbar">
          <Link to="/doctor-dashboard" className="logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>HealthMandala</span>
          </Link>
        </nav>
        <div className="schedule-content">
          <div className="loading-state">Loading schedule...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-schedule">
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

      <div className="schedule-content">
        <div className="page-header">
          <Link to="/doctor-dashboard" className="back-btn">← Back to Dashboard</Link>
          <h1>My Schedule</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="schedule-grid">
          <div className="schedule-card">
            <h2>Working Hours</h2>
            <div className="hours-list">
              {schedule.map((item, index) => (
                <div key={item.day} className="hours-item">
                  <span className="day">{item.day}</span>
                  <div className="time">
                    {item.active && (
                      <>
                        <input 
                          type="time" 
                          value={item.start} 
                          onChange={(e) => updateTime(index, 'start', e.target.value)}
                        />
                        <span>to</span>
                        <input 
                          type="time" 
                          value={item.end}
                          onChange={(e) => updateTime(index, 'end', e.target.value)}
                        />
                      </>
                    )}
                    {!item.active && <span style={{ color: '#dc2626' }}>Off</span>}
                  </div>
                  <div 
                    className={`toggle ${item.active ? 'active' : ''}`}
                    onClick={() => toggleDay(index)}
                  />
                </div>
              ))}
            </div>

            <div className="break-settings">
              <h3>Lunch Break</h3>
              <div className="break-inputs">
                <input 
                  type="time" 
                  value={lunchBreak.start}
                  onChange={(e) => setLunchBreak({ ...lunchBreak, start: e.target.value })}
                />
                <span>to</span>
                <input 
                  type="time" 
                  value={lunchBreak.end}
                  onChange={(e) => setLunchBreak({ ...lunchBreak, end: e.target.value })}
                />
              </div>
            </div>

            <button 
              className="save-btn" 
              onClick={handleSaveSchedule}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div>
            <div className="schedule-card">
              <h2>Consultation Settings</h2>
              <div className="consultation-settings">
                <div className="setting-item">
                  <span className="label">Duration per patient</span>
                  <input 
                    type="number" 
                    value={consultationDuration} 
                    onChange={(e) => setConsultationDuration(parseInt(e.target.value))}
                  /> min
                </div>
                <div className="setting-item">
                  <span className="label">Consultation Fee</span>
                  Rs. <input 
                    type="number" 
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <span className="label">Max patients per day</span>
                  <input 
                    type="number" 
                    value={maxPatientsPerDay}
                    onChange={(e) => setMaxPatientsPerDay(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="schedule-card" style={{ marginTop: '1.5rem' }}>
              <h2>Upcoming Leaves</h2>
              <div className="leave-list">
                {leaves.length === 0 ? (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
                    No upcoming leaves
                  </p>
                ) : (
                  leaves.map((leave) => (
                    <div key={leave._id} className="leave-item">
                      <div>
                        <div className="dates">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        <div className="reason">{leave.reason}</div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveLeave(leave._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button 
                className="add-leave-btn"
                onClick={() => setShowLeaveModal(true)}
              >
                + Add Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Leave</h2>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={newLeave.startDate}
                onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={newLeave.endDate}
                onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input
                type="text"
                placeholder="e.g., Vacation, Conference, etc."
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAddLeave}>
                Add Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
