import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RoleSelect.css';

const RoleSelect = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/nid-registration', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="role-container">
      <div className="role-card">
        <div className="role-header">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="HealthMandala" />
            <span>HealthMandala</span>
          </Link>
          <h2>How will you use HealthMandala?</h2>
          <p>Select your role to continue</p>
        </div>

        <div className="role-options">
          <div
            className={`role-option patient ${selectedRole === 'patient' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('patient')}
          >
            <div className="role-icon">P</div>
            <h3>Patient</h3>
            <p>Book appointments, view medical records, and manage your health</p>
          </div>

          <div
            className={`role-option doctor ${selectedRole === 'doctor' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('doctor')}
          >
            <div className="role-icon">D</div>
            <h3>Doctor</h3>
            <p>Manage appointments, view patient records, and grow your practice</p>
          </div>
        </div>

        <button
          className="role-submit"
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelect;
