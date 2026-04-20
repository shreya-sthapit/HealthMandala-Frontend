import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './DoctorDashboard.css';
import { requireApproval } from '../../utils/approvalCheck';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState({ name: 'Dr. User', specialty: 'Doctor', id: null });  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalPatients: 0,
    weekCount: 0,
    rating: 0
  });
  const [schedule, setSchedule] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, consultations: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user data from localStorage and fetch dashboard data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.firstName) {
      setDoctor({
        name: `Dr. ${userData.firstName} ${userData.lastName || ''}`.trim(),
        specialty: 'Doctor',
        id: userData.id
      });
    }

    // Check approval status and fetch dashboard data
    if (userData.id) {
      fetchDashboardData(userData.id);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch doctor profile and appointments in parallel
      const [profileRes, appointmentsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/doctor/profile/${userId}`),
        fetch(`http://localhost:5001/api/appointments/doctor/${userId}`)
      ]);

      const profileData = await profileRes.json();
      const appointmentsData = await appointmentsRes.json();

      // Update doctor profile
      if (profileData.success) {
        setDoctor(prev => ({
          ...prev,
          name: `Dr. ${profileData.profile.firstName} ${profileData.profile.lastName}`,
          specialty: profileData.profile.specialization,
          id: userId
        }));

        // Set schedule from profile
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const availableDays = profileData.profile.availableDays || [];
        const scheduleData = daysOfWeek.map(day => ({
          day,
          hours: availableDays.includes(day) 
            ? `${profileData.profile.availableTimeStart} - ${profileData.profile.availableTimeEnd}`
            : 'Off'
        }));
        setSchedule(scheduleData);
      }

      // Process appointments
      if (appointmentsData.success) {
        const appointments = appointmentsData.appointments || [];
        
        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayApts = appointments
          .filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() === today.getTime() && apt.status !== 'cancelled';
          })
          .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
          .map(apt => ({
            id: apt._id,
            patient: apt.patientName,
            age: calculateAge(apt.patientId),
            reason: apt.reasonForVisit,
            time: apt.appointmentTime,
            status: apt.status
          }));

        setTodayAppointments(todayApts);

        // Calculate stats
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        
        const weekApts = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= thisWeekStart && apt.status !== 'cancelled';
        });

        // Get unique patients
        const uniquePatients = new Set(appointments.map(apt => apt.patientId).filter(id => id));

        // Calculate this month's earnings
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthApts = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= thisMonthStart && apt.paymentStatus === 'paid';
        });

        const totalEarnings = thisMonthApts.reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
        const avgEarnings = thisMonthApts.length > 0 ? Math.round(totalEarnings / thisMonthApts.length) : 0;

        setStats({
          todayCount: todayApts.length,
          totalPatients: uniquePatients.size,
          weekCount: weekApts.length,
          rating: 4.9 // This could be calculated from reviews
        });

        setEarnings({
          total: totalEarnings,
          consultations: thisMonthApts.length,
          average: avgEarnings
        });

        // Get recent patients (last 3 unique patients)
        const recentApts = appointments
          .filter(apt => apt.status === 'completed')
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
          .slice(0, 10);

        const seenPatients = new Set();
        const recentPatientsData = [];
        
        for (const apt of recentApts) {
          if (!seenPatients.has(apt.patientName) && recentPatientsData.length < 3) {
            seenPatients.add(apt.patientName);
            recentPatientsData.push({
              id: apt._id,
              name: apt.patientName,
              condition: apt.reasonForVisit,
              lastVisit: formatRelativeDate(apt.appointmentDate)
            });
          }
        }

        setRecentPatients(recentPatientsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (patientId) => {
    // This would need patient data - for now return placeholder
    return Math.floor(Math.random() * 50) + 20;
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const handleProtectedAction = async (e, action) => {
    e.preventDefault();
    const approved = await requireApproval(doctor.id, 'doctor');
    if (approved) {
      action();
    }
  };
  
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Good Morning, {doctor.name}</h1>
            <p>You have {stats.todayCount} appointment{stats.todayCount !== 1 ? 's' : ''} scheduled for today</p>
          </div>
          <div className="welcome-date">
            <div className="day">{today.getDate()}</div>
            <div className="month">{dayNames[today.getDay()]}, {monthNames[today.getMonth()]}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon blue">T</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.todayCount}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">P</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">W</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.weekCount}</h3>
              <p>This Week</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">R</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.rating.toFixed(1)}</h3>
              <p>Rating</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="main-column">
            {/* Today's Appointments */}
            <div className="section-card">
              <h2>
                Today's Appointments
                <a 
                  href="/doctor-appointments"
                  onClick={(e) => handleProtectedAction(e, () => navigate('/doctor-appointments'))}
                >
                  View All
                </a>
              </h2>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading appointments...</p>
                </div>
              ) : todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-patient">
                      <div className="patient-avatar">{apt.patient[0]}</div>
                      <div className="patient-info">
                        <h4>{apt.patient}</h4>
                        <p>{apt.age} yrs • {apt.reason}</p>
                      </div>
                    </div>
                    <div className="appointment-time">
                      <div className="time">{apt.time}</div>
                      <span className={`status ${apt.status}`}>
                        {apt.status === 'in-progress' ? 'In Progress' : 
                         apt.status === 'pending' ? 'Upcoming' :
                         apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div className="side-column">
            {/* Quick Actions */}
            <div className="section-card">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <a 
                  href="/doctor-schedule" 
                  className="quick-action"
                  onClick={(e) => handleProtectedAction(e, () => navigate('/doctor-schedule'))}
                >
                  <div className="icon">S</div>
                  <span>My Schedule</span>
                </a>
                <a 
                  href="/doctor-patients" 
                  className="quick-action"
                  onClick={(e) => handleProtectedAction(e, () => navigate('/doctor-patients'))}
                >
                  <div className="icon">P</div>
                  <span>Patients</span>
                </a>
                <a 
                  href="/doctor-appointments" 
                  className="quick-action"
                  onClick={(e) => handleProtectedAction(e, () => navigate('/doctor-appointments'))}
                >
                  <div className="icon">E</div>
                  <span>Appointments</span>
                </a>
                <Link to="/profile" className="quick-action">
                  <div className="icon">Pr</div>
                  <span>Profile</span>
                </Link>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="section-card">
              <h2>Weekly Schedule</h2>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="schedule-list">
                  {schedule.map((item, index) => (
                    <div key={index} className="schedule-item">
                      <span className="day">{item.day}</span>
                      <span className={`hours ${item.hours === 'Off' ? 'off' : ''}`}>{item.hours}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="section-card">
              <h2>Recent Patients</h2>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="patient-list">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="patient-item">
                      <div className="patient-avatar">{patient.name[0]}</div>
                      <div className="patient-details">
                        <h4>{patient.name}</h4>
                        <p>{patient.condition}</p>
                      </div>
                      <span className="last-visit">{patient.lastVisit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No recent patients</p>
                </div>
              )}
            </div>

            {/* Earnings */}
            <div className="section-card">
              <h2>This Month</h2>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="earnings-summary">
                  <div className="earnings-amount">Rs. {earnings.total.toLocaleString()}</div>
                  <div className="earnings-label">Total Earnings</div>
                  <div className="earnings-breakdown">
                    <div className="breakdown-item">
                      <div className="value">{earnings.consultations}</div>
                      <div className="label">Consultations</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="value">Rs. {earnings.average.toLocaleString()}</div>
                      <div className="label">Avg/Patient</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
