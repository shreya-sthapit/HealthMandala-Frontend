import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingFilter, setPendingFilter] = useState('all');

  const stats = {
    totalUsers: 5420,
    totalDoctors: 156,
    totalPatients: 5264,
    pendingApprovals: 12,
    totalAppointments: 8945,
    todayAppointments: 47,
    revenue: 245000
  };

  const pendingApprovals = [
    { id: 1, name: 'Dr. Sanjay Kumar', email: 'sanjay.kumar@email.com', role: 'doctor', nidNumber: 'NID-2025-001234', submittedAt: '2 hours ago', specialty: 'Cardiologist' },
    { id: 2, name: 'Rita Sharma', email: 'rita.sharma@email.com', role: 'patient', nidNumber: 'NID-2025-001235', submittedAt: '3 hours ago' },
    { id: 3, name: 'Dr. Meena Thapa', email: 'meena.thapa@email.com', role: 'doctor', nidNumber: 'NID-2025-001236', submittedAt: '5 hours ago', specialty: 'Neurologist' },
    { id: 4, name: 'Bikash Gurung', email: 'bikash.gurung@email.com', role: 'patient', nidNumber: 'NID-2025-001237', submittedAt: '6 hours ago' },
    { id: 5, name: 'Dr. Hari Prasad', email: 'hari.prasad@email.com', role: 'doctor', nidNumber: 'NID-2025-001238', submittedAt: '1 day ago', specialty: 'Orthopedic' }
  ];

  const recentUsers = [
    { id: 1, name: 'Ram Sharma', email: 'ram.sharma@email.com', role: 'patient', status: 'active', joinedAt: 'Dec 30, 2025' },
    { id: 2, name: 'Dr. Anita Sharma', email: 'anita.sharma@email.com', role: 'doctor', status: 'active', joinedAt: 'Dec 29, 2025' },
    { id: 3, name: 'Sita Thapa', email: 'sita.thapa@email.com', role: 'patient', status: 'active', joinedAt: 'Dec 28, 2025' },
    { id: 4, name: 'Dr. Rajesh Patel', email: 'rajesh.patel@email.com', role: 'doctor', status: 'suspended', joinedAt: 'Dec 27, 2025' }
  ];

  const recentAppointments = [
    { id: 1, patient: 'Ram Sharma', doctor: 'Dr. Anita Sharma', date: 'Dec 31, 2025', time: '10:00 AM', status: 'confirmed' },
    { id: 2, patient: 'Sita Thapa', doctor: 'Dr. Rajesh Patel', date: 'Dec 31, 2025', time: '11:30 AM', status: 'completed' },
    { id: 3, patient: 'Hari Prasad', doctor: 'Dr. Priya Thapa', date: 'Dec 31, 2025', time: '02:00 PM', status: 'pending' },
    { id: 4, patient: 'Maya Gurung', doctor: 'Dr. Anita Sharma', date: 'Jan 1, 2026', time: '09:00 AM', status: 'confirmed' }
  ];

  const filteredPending = pendingFilter === 'all' 
    ? pendingApprovals 
    : pendingApprovals.filter(p => p.role === pendingFilter);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, selectedDate, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      let url = 'http://localhost:5001/api/appointments/all';
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (selectedDate) params.append('date', selectedDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    if (!window.confirm('Approve this appointment?')) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://localhost:5001/api/appointments/admin-approve/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: userData.id })
      });

      const data = await response.json();
      if (data.success) {
        alert('Appointment approved! Doctor can now confirm it.');
        fetchAppointments();
      } else {
        alert(data.error || 'Failed to approve appointment');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve appointment');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    if (!window.confirm('Reject this appointment?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/appointments/admin-reject/${appointmentId}`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (data.success) {
        alert('Appointment rejected successfully!');
        fetchAppointments();
      } else {
        alert('Failed to reject appointment');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject appointment');
    }
  };

  const handleApprove = (id) => {
    console.log('Approving user:', id);
    alert('User approved successfully!');
  };

  const handleReject = (id) => {
    console.log('Rejecting user:', id);
    alert('User rejected!');
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="admin-logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>Admin Panel</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">O</span>
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <span className="nav-icon">A</span>
            Pending Approvals
            {stats.pendingApprovals > 0 && (
              <span className="badge">{stats.pendingApprovals}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">U</span>
            Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <span className="nav-icon">D</span>
            Doctors
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span className="nav-icon">Ap</span>
            Appointments
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">S</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">AD</div>
            <div className="admin-info">
              <span className="name">Admin User</span>
              <span className="role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'approvals' && 'Pending Approvals'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'doctors' && 'Doctor Management'}
            {activeTab === 'appointments' && 'Appointments'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          <div className="header-actions">
            <button className="header-btn">N</button>
            <button className="header-btn">Logout</button>
          </div>
        </header>

        <div className="admin-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">U</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers.toLocaleString()}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">D</div>
                  <div className="stat-info">
                    <h3>{stats.totalDoctors}</h3>
                    <p>Doctors</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">P</div>
                  <div className="stat-info">
                    <h3>{stats.totalPatients.toLocaleString()}</h3>
                    <p>Patients</p>
                  </div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-icon orange">!</div>
                  <div className="stat-info">
                    <h3>{stats.pendingApprovals}</h3>
                    <p>Pending Approvals</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2>Recent Users</h2>
                    <button onClick={() => setActiveTab('users')}>View All</button>
                  </div>
                  <div className="users-list">
                    {recentUsers.map(user => (
                      <div key={user.id} className="user-item">
                        <div className="user-avatar">{user.name[0]}</div>
                        <div className="user-info">
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                        </div>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                        <span className={`status-badge ${user.status}`}>{user.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h2>Recent Appointments</h2>
                    <button onClick={() => setActiveTab('appointments')}>View All</button>
                  </div>
                  <div className="appointments-list">
                    {recentAppointments.map(apt => (
                      <div key={apt.id} className="appointment-item">
                        <div className="apt-info">
                          <h4>{apt.patient}</h4>
                          <p>{apt.doctor}</p>
                        </div>
                        <div className="apt-time">
                          <span>{apt.date}</span>
                          <span>{apt.time}</span>
                        </div>
                        <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dashboard-card full-width">
                <div className="card-header">
                  <h2>Quick Stats</h2>
                </div>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <div className="value">{stats.todayAppointments}</div>
                    <div className="label">Today's Appointments</div>
                  </div>
                  <div className="quick-stat">
                    <div className="value">{stats.totalAppointments.toLocaleString()}</div>
                    <div className="label">Total Appointments</div>
                  </div>
                  <div className="quick-stat">
                    <div className="value">Rs. {(stats.revenue / 1000).toFixed(0)}K</div>
                    <div className="label">This Month Revenue</div>
                  </div>
                  <div className="quick-stat">
                    <div className="value">4.8</div>
                    <div className="label">Avg. Rating</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'approvals' && (
            <>
              <div className="filter-bar">
                <button 
                  className={`filter-btn ${pendingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('all')}
                >
                  All ({pendingApprovals.length})
                </button>
                <button 
                  className={`filter-btn ${pendingFilter === 'doctor' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('doctor')}
                >
                  Doctors ({pendingApprovals.filter(p => p.role === 'doctor').length})
                </button>
                <button 
                  className={`filter-btn ${pendingFilter === 'patient' ? 'active' : ''}`}
                  onClick={() => setPendingFilter('patient')}
                >
                  Patients ({pendingApprovals.filter(p => p.role === 'patient').length})
                </button>
              </div>

              <div className="approvals-list">
                {filteredPending.map(user => (
                  <div key={user.id} className="approval-card">
                    <div className="approval-header">
                      <div className="user-avatar large">{user.name[0]}</div>
                      <div className="user-details">
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                        <div className="meta">
                          <span className={`role-badge ${user.role}`}>{user.role}</span>
                          {user.specialty && <span className="specialty">{user.specialty}</span>}
                          <span className="time">Submitted {user.submittedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="approval-body">
                      <div className="nid-info">
                        <span className="label">NID Number:</span>
                        <span className="value">{user.nidNumber}</span>
                      </div>
                      <div className="nid-preview">
                        <div className="nid-image">Front</div>
                        <div className="nid-image">Back</div>
                      </div>
                    </div>
                    <div className="approval-actions">
                      <button className="btn reject" onClick={() => handleReject(user.id)}>
                        Reject
                      </button>
                      <button className="btn approve" onClick={() => handleApprove(user.id)}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="dashboard-card full-width">
              <div className="card-header">
                <h2>All Users</h2>
                <input type="text" placeholder="Search users..." className="search-input" />
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="table-user">
                          <div className="user-avatar small">{user.name[0]}</div>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                      <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                      <td>{user.joinedAt}</td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="dashboard-card full-width">
              <div className="card-header">
                <h2>All Doctors</h2>
                <input type="text" placeholder="Search doctors..." className="search-input" />
              </div>
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                Doctor management table will be displayed here with specialty, rating, and verification status.
              </p>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="dashboard-card full-width">
              <div className="card-header">
                <h2>All Appointments</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending-admin">Pending Admin</option>
                    <option value="pending">Pending Doctor</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input 
                    type="date" 
                    className="date-input" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              {appointmentsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading appointments...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length > 0 ? (
                      appointments.map(apt => (
                        <tr key={apt._id}>
                          <td>{apt.patientName}</td>
                          <td>{apt.doctorName}</td>
                          <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                          <td>{apt.appointmentTime}</td>
                          <td>
                            <span className={`status-badge ${apt.status}`}>
                              {apt.status === 'pending-admin' ? 'Awaiting Admin' : 
                               apt.status === 'pending' ? 'Awaiting Doctor' :
                               apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {apt.status === 'pending-admin' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="action-btn" 
                                  style={{ background: '#10b981', color: 'white' }}
                                  onClick={() => handleApproveAppointment(apt._id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="action-btn" 
                                  style={{ background: '#ef4444', color: 'white' }}
                                  onClick={() => handleRejectAppointment(apt._id)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {apt.status !== 'pending-admin' && (
                              <button className="action-btn">View</button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          No appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="dashboard-card full-width">
              <div className="card-header">
                <h2>System Settings</h2>
              </div>
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                System settings and configuration options will be displayed here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
