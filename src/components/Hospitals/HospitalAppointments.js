import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HospitalAppointments.css';

const hospitals = [
  { id: 1, name: 'B&B Hospital', location: 'Gwarko, Lalitpur', type: 'Private', specialties: ['Cardiology', 'Neurology', 'Orthopedics'], image: '/Hospitals/B&B Hospital.jpg' },
  { id: 2, name: 'Bir Hospital', location: 'Kanti Path, Kathmandu', type: 'Government', specialties: ['General Medicine', 'Surgery', 'Pediatrics'], image: '/Hospitals/Bir Hospital.png' },
  { id: 3, name: 'B.P. Koirala Lions Center For Ophthalmic Studies', location: 'Kathmandu', type: 'Specialized', specialties: ['Ophthalmology'], image: '/Hospitals/B. P. Koirala Lions Center.jpg' },
  { id: 4, name: 'Civil Service Hospital', location: 'Minbhawan, Kathmandu', type: 'Government', specialties: ['General Medicine', 'Dermatology'], image: '/Hospitals/Civil Service Hospital.jpeg' },
  { id: 5, name: 'Koshi Hospital', location: 'Biratnagar', type: 'Government', specialties: ['General Medicine', 'Surgery', 'Gynecology'], image: '/Hospitals/Koshi Hospital.jpg' },
  { id: 6, name: 'Manmohan Cardiothoracic Vascular and Transplant Center', location: 'Maharajgunj, Kathmandu', type: 'Specialized', specialties: ['Cardiology', 'Cardiac Surgery'], image: '/Hospitals/Manmohan Cardiothoracic Vascular and Transplant Center.webp' },
  { id: 7, name: 'Patan Hospital', location: 'Lagankhel, Lalitpur', type: 'Private', specialties: ['General Medicine', 'Pediatrics', 'Gynecology'], image: '/Hospitals/Patan Hospital.png' },
  { id: 8, name: 'Tribhuvan University Teaching Hospital', location: 'Maharajgunj, Kathmandu', type: 'Government', specialties: ['All Specialties'], image: '/Hospitals/Tribhuvan University Teaching Hospital.jpg' },
  { id: 9, name: 'Grande International Hospital', location: 'Tokha, Kathmandu', type: 'Private', specialties: ['Cardiology', 'Neurology', 'Oncology'], image: '/Hospitals/Grande International Hospital.webp' },
];

const HospitalAppointments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = hospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || h.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="hospital-page">
      <div className="hospital-content">
        {/* Page Header */}
        <div className="hospital-page-header">
          <h1>Book An Appointment at Hospitals</h1>
          <div className="hospital-controls">
            <div className="hospital-search-box">
              <input
                type="text"
                placeholder="Find Hospital"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
            <div className="type-filters">
              {['All', 'Government', 'Private', 'Specialized'].map(t => (
                <button
                  key={t}
                  className={`type-btn ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital Grid */}
        <div className="hospital-grid">
          {filtered.map(hospital => (
            <div key={hospital.id} className="hospital-card">
              <div className="hospital-card-image">
                <img src={hospital.image} alt={hospital.name} />
                <span className={`hospital-type-badge ${hospital.type.toLowerCase()}`}>
                  {hospital.type}
                </span>
                <button className="hospital-arrow-btn">›</button>
              </div>
              <div className="hospital-card-body">
                <h3>{hospital.name}</h3>
                <p className="hospital-location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {hospital.location}
                </p>
                <div className="hospital-specialties">
                  {hospital.specialties.slice(0, 3).map(s => (
                    <span key={s} className="spec-pill">{s}</span>
                  ))}
                </div>
                <button
                  className="book-hospital-btn"
                  onClick={() => navigate('/signup')}
                >
                  Book an Appointment →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No hospitals found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalAppointments;
