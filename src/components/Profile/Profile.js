import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [userId, setUserId] = useState(null);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Get role from localStorage, fallback to user object role, then default to 'patient'
    const role = localStorage.getItem('userRole') || userData.role || 'patient';
    
    console.log('Profile loading for:', { userId: userData.id, role });
    
    setUserRole(role);
    setUserId(userData.id);

    if (userData.id) {
      fetchApprovedProfile(userData.id, role);
    } else {
      setLoading(false);
      setError('User not found. Please login again.');
    }
  }, []);

  const fetchApprovedProfile = async (userId, role) => {
    try {
      setLoading(true);
      
      // First check registration status
      const statusEndpoint = role === 'doctor' 
        ? `http://localhost:5001/api/doctor/status/${userId}`
        : `http://localhost:5001/api/patient/status/${userId}`;

      const statusResponse = await fetch(statusEndpoint);
      const statusData = await statusResponse.json();

      if (statusData.success && !statusData.hasRegistration) {
        // No registration found
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setProfile({
          firstName: userData.firstName || 'User',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: role,
          status: 'not-registered'
        });
        setError(`You haven't completed your ${role} registration yet. Please complete your registration to view your profile.`);
        return;
      }

      if (statusData.success && statusData.hasRegistration) {
        // Always load the profile regardless of status
        const profileEndpoint = role === 'doctor'
          ? `http://localhost:5001/api/doctor/profile/${userId}`
          : `http://localhost:5001/api/patient/profile/${userId}`;

        const profileResponse = await fetch(profileEndpoint);
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setProfile({ ...profileData.profile, role });
          setError('');
        } else {
          throw new Error('Failed to fetch profile');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile({
        firstName: userData.firstName || 'User',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        status: 'error'
      });
      setError('Unable to load profile data. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    console.log('Changing password');
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <div className="error-state">
            <p>Profile not found. Please complete your registration.</p>
            <Link to={userRole === 'doctor' ? '/doctor-register/personal' : '/register/personal'} className="btn-primary">
              Complete Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="page-header">
          <Link to={userRole === 'doctor' ? '/doctor-dashboard' : '/'} className="back-btn">
            ← Back to {userRole === 'doctor' ? 'Dashboard' : 'Home'}
          </Link>
          <h1>My Profile</h1>
        </div>

        {error && (
          <div className={`error-message ${error.includes('pending') ? 'warning' : error.includes('approved') ? 'success' : 'error'}`}>
            <p>{error}</p>
            {error.includes('haven\'t completed') && (
              <Link 
                to={userRole === 'doctor' ? '/doctor-register/personal' : '/register/personal'} 
                className="btn-primary"
                style={{ marginTop: '1rem', display: 'inline-block' }}
              >
                Complete Registration
              </Link>
            )}
            {error.includes('rejected') && (
              <div style={{ marginTop: '1rem' }}>
                <Link 
                  to={userRole === 'doctor' ? '/doctor-register/personal' : '/register/personal'} 
                  className="btn-primary"
                  style={{ marginRight: '1rem' }}
                >
                  Resubmit Registration
                </Link>
                <a href="mailto:support@healthmandala.com" className="btn-secondary">
                  Contact Support
                </a>
              </div>
            )}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-avatar-section">
            {profile.profilePhoto ? (
              <img 
                src={`http://localhost:5001/${profile.profilePhoto}`} 
                alt="Profile" 
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-large">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>
              {userRole === 'doctor' ? 'Dr. ' : ''}{profile.firstName} {profile.lastName}
            </h1>
            <p className="email">{profile.email}</p>
            <span className={`role-badge ${userRole}`}>
              {userRole === 'doctor' ? 'Doctor' : 'Patient'}
            </span>
            {profile.status && (
              <span className={`status-badge ${profile.status}`}>
                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{profile.phone || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <p>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <p>{profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not provided'}</p>
            </div>
            {profile.address && (
              <div className="info-item full-width">
                <label>Address</label>
                <p>
                  {profile.address.street && `${profile.address.street}, `}
                  {profile.address.city && `${profile.address.city}, `}
                  {profile.address.district && `${profile.address.district}, `}
                  {profile.address.province}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor-specific Information */}
        {userRole === 'doctor' && profile.specialization && (
          <div className="profile-section">
            <h2>Professional Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Specialization</label>
                <p>{profile.specialization}</p>
              </div>
              <div className="info-item">
                <label>NMC Number</label>
                <p>{profile.nmcNumber}</p>
              </div>
              <div className="info-item">
                <label>Qualification</label>
                <p>{profile.qualification}</p>
              </div>
              <div className="info-item">
                <label>Experience</label>
                <p>{profile.experienceYears} years</p>
              </div>
              <div className="info-item">
                <label>Current Hospital</label>
                <p>{profile.currentHospital}</p>
              </div>
              <div className="info-item">
                <label>Consultation Fee</label>
                <p>Rs. {profile.consultationFee}</p>
              </div>
              <div className="info-item">
                <label>Available Time</label>
                <p>{profile.availableTimeStart} - {profile.availableTimeEnd}</p>
              </div>
              {profile.bio && (
                <div className="info-item full-width">
                  <label>Bio</label>
                  <p>{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patient-specific Information */}
        {userRole === 'patient' && profile.bloodGroup && (
          <div className="profile-section">
            <h2>Medical Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Blood Group</label>
                <p>{profile.bloodGroup}</p>
              </div>
              {profile.emergencyContact && (
                <>
                  <div className="info-item">
                    <label>Emergency Contact Name</label>
                    <p>{profile.emergencyContact.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Emergency Contact Phone</label>
                    <p>{profile.emergencyContact.phone}</p>
                  </div>
                  <div className="info-item">
                    <label>Relationship</label>
                    <p>{profile.emergencyContact.relation}</p>
                  </div>
                </>
              )}
              {profile.medicalConditions && (
                <div className="info-item full-width">
                  <label>Medical Conditions</label>
                  <p>{profile.medicalConditions}</p>
                </div>
              )}
              {profile.allergies && (
                <div className="info-item full-width">
                  <label>Allergies</label>
                  <p>{profile.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="profile-section">
          <h2>Change Password</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Current Password</label>
              <input
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <p className="password-requirements">
            Password must be at least 8 characters with uppercase, lowercase, and numbers.
          </p>
          <div className="profile-actions">
            <button className="btn-save" onClick={handleChangePassword}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
