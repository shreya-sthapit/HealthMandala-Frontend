import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [specialtyCounts, setSpecialtyCounts] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    fetchDoctorsAndSpecialties();
  }, []);

  const fetchDoctorsAndSpecialties = async () => {
    try {
      const [doctorsRes, countsRes] = await Promise.all([
        fetch('http://localhost:5001/api/doctor/approved'),
        fetch('http://localhost:5001/api/doctor/specialty-counts')
      ]);

      const doctorsData = await doctorsRes.json();
      const countsData = await countsRes.json();

      if (doctorsData.success && doctorsData.doctors) {
        setDoctors(doctorsData.doctors.slice(0, 5));
      }

      if (countsData.success) {
        setSpecialtyCounts(countsData.counts);
        // Build specialties list from actual DB data (sorted by count desc)
        setSpecialties(Object.keys(countsData.counts).slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const mockHospitals = [
    { id: 1, name: 'B&B Hospital', location: 'Dwarika, Lalitpur', image: '/Hospitals/B&B Hospital.jpg' },
    { id: 2, name: 'Bir Hospital', location: 'Karti Path, Kathmandu', image: '/Hospitals/Bir Hospital.png' },
    { id: 3, name: 'B.P. Koirala Lions Center', location: 'Kathmandu', image: '/Hospitals/B. P. Koirala Lions Center.jpg' }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Your Health, <span>Your Schedule</span>
            </h1>
            <p>
              Book appointments with top doctors in just a few clicks. 
              HealthMandala makes healthcare accessible, simple, and convenient.
            </p>
            <div className="hero-buttons">
              <Link to={isLoggedIn ? '/find-doctors' : '/auth?role=patient&mode=signup'} className="btn btn-primary">Consult Now</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration"> 
              <img src="/Doctor.png" alt="Doctor" className="hero-doctor-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-title">
          <h2>Why Choose HealthMandala?</h2>
          <p>Experience healthcare booking like never before</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #e0f7f4, #b2ece6)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>Easy Scheduling</h3>
            <p>Book appointments 24/7 with just a few taps. No more waiting on hold.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #e8f4fd, #bde0f9)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>Verified Doctors</h3>
            <p>All our doctors are verified professionals with proven track records.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #fef9e7, #fde68a)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <h3>Smart Reminders</h3>
            <p>Never miss an appointment with our automated reminder system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #fce7f3, #f9a8d4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>Secure & Private</h3>
            <p>Your health data is encrypted and protected with industry standards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #ede9fe, #c4b5fd)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>24/7 Support</h3>
            <p>Our support team is always ready to help you with any queries.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Book your appointment in 3 simple steps</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div className="step-badge">1</div>
            </div>
            <div className="step-connector">
              <svg width="80" height="20" viewBox="0 0 80 20"><path d="M0 10 Q40 0 80 10" stroke="#00a896" strokeWidth="2" strokeDasharray="6 4" fill="none"/><polygon points="76,6 80,10 76,14" fill="#00a896"/></svg>
            </div>
            <h3>Search Doctor</h3>
            <p>Find doctors by specialty, location, or name</p>
          </div>
          <div className="step">
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div className="step-badge">2</div>
            </div>
            <div className="step-connector">
              <svg width="80" height="20" viewBox="0 0 80 20"><path d="M0 10 Q40 0 80 10" stroke="#00a896" strokeWidth="2" strokeDasharray="6 4" fill="none"/><polygon points="76,6 80,10 76,14" fill="#00a896"/></svg>
            </div>
            <h3>Choose Time</h3>
            <p>Select a convenient time slot from available options</p>
          </div>
          <div className="step">
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <div className="step-badge">3</div>
            </div>
            <div className="step-connector" style={{ visibility: 'hidden' }}>
              <svg width="80" height="20" viewBox="0 0 80 20"><path d="M0 10 Q40 0 80 10" stroke="#00a896" strokeWidth="2" strokeDasharray="6 4" fill="none"/></svg>
            </div>
            <h3>Confirm Booking</h3>
            <p>Confirm your appointment and receive instant confirmation</p>
          </div>
        </div>
      </section>

      {/* Stats Section removed */}

      {/* Browse Doctors Section */}
      <section className="browse-doctors">
        <div className="section-title">
          <h2>Appointments with Top Doctors</h2>
          <p>Experienced medical practitioners available to schedule appointments</p>
        </div>
        
        {loadingDoctors ? (
          <div className="loading-state">Loading doctors...</div>
        ) : (
          <>
            <div className="doctors-carousel">
              {doctors.map((doctor) => {
                // Fix path: strip "backend/" prefix since server serves /uploads directly
                const photoPath = doctor.profilePhoto
                  ? doctor.profilePhoto.replace(/\\/g, '/').replace(/^backend\//, '')
                  : null;
                return (
                <div key={doctor.id} className="doctor-card-browse">
                  <div className="doctor-image">
                    {photoPath ? (
                      <img
                        src={`http://localhost:5001/${photoPath}`}
                        alt={doctor.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="doctor-avatar"
                      style={{ display: photoPath ? 'none' : 'flex' }}
                    >
                      {doctor.name.split(' ')[1]?.[0] || 'D'}
                    </div>
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialty}</p>
                  <p className="availability">Next available time: {doctor.availableTimeStart || 'N/A'}</p>
                  {isLoggedIn ? (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => navigate('/book-appointment', { state: { preSelectedDoctor: doctor } })}
                    >
                      Book Appointment
                    </button>
                  ) : (
                    <Link to={`/login?redirect=/book-appointment`} className="btn btn-primary btn-small">
                      Book Appointment
                    </Link>
                  )}
                </div>
                );
              })}
            </div>
            <div className="browse-footer">
              <Link to="/signup" className="view-all-link">View all Doctors →</Link>
            </div>
          </>
        )}
      </section>

      {/* Browse Specialties Section */}
      <section className="browse-specialties">
        <div className="specialties-header">
          <div className="specialties-header-left">
            <h2>Easy Appointment with 15+ area of specialities</h2>
            <p>More than 200 Doctors on HealthMandala providing easy appointment</p>
          </div>
          <Link to="/signup" className="view-all-btn">View All Specialists →</Link>
        </div>
        <div className="specialties-scroll-wrapper">
          <div className="specialties-track">
            {[
              { name: 'Cardiology', icon: '🫀', sub: 'Heart & Vascular' },
              { name: 'Neurology', icon: '🧠', sub: 'Brain & Nerves' },
              { name: 'Orthopedic', icon: '🦴', sub: 'Bones & Joints' },
              { name: 'Gynaecology', icon: '🩺', sub: "Women's Health" },
              { name: 'Dermatology', icon: '🧬', sub: 'Skin & Hair' },
              { name: 'Paediatrics', icon: '👶', sub: 'Child Health' },
              { name: 'Gastroenterology', icon: '🫁', sub: 'Digestive System' },
              { name: 'Endocrinology', icon: '⚗️', sub: 'Hormones & Glands' },
              { name: 'Ophthalmology', icon: '👁️', sub: 'Eye Care' },
              { name: 'Urology', icon: '🔬', sub: 'Urinary System' },
              { name: 'Dentist', icon: '🦷', sub: 'Dental Care' },
              { name: 'Surgeon', icon: '🏥', sub: 'General Surgery' },
              // Also include any specialties from DB not in the list above
              ...specialties
                .filter(s => !['Cardiology','Neurology','Orthopedic','Gynaecology','Dermatology','Paediatrics','Gastroenterology','Endocrinology','Ophthalmology','Urology','Dentist','Surgeon','Cardiologist'].includes(s))
                .map(s => ({ name: s, icon: '🏥', sub: 'Specialist' }))
            ].map((spec, idx) => (
              <div key={idx} className="specialty-card-new">
                <div className="specialty-icon-box">
                  <span>{spec.icon}</span>
                </div>
                <h4>{spec.name.toUpperCase()}</h4>
                <p className="spec-sub">{spec.sub}</p>
                <p className="spec-count">
                  {(() => {
                    // Exact match first, then case-insensitive partial match
                    const exact = specialtyCounts[spec.name];
                    if (exact !== undefined) return exact;
                    const key = Object.keys(specialtyCounts).find(k =>
                      k.toLowerCase().includes(spec.name.toLowerCase()) ||
                      spec.name.toLowerCase().includes(k.toLowerCase())
                    );
                    return key ? specialtyCounts[key] : 0;
                  })()} Doctors
                </p>
                <Link to="/find-doctors" className="consult-btn">Consult Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Hospitals Section */}
      <section className="browse-hospitals">
        <div className="section-title">
          <h2>Book Appointment at Hospital</h2>
          <p>For easy appointments from any place at top hospitals in Nepal</p>
        </div>
        
        <div className="hospitals-carousel">
          {mockHospitals.map((hospital) => (
            <div key={hospital.id} className="hospital-card-browse">
              <div className="hospital-image">
                <img src={hospital.image} alt={hospital.name} />
              </div>
              <h3>{hospital.name}</h3>
              <p className="location">{hospital.location}</p>
              <Link to="/signup" className="btn btn-primary btn-small">Book an Appointment</Link>
            </div>
          ))}
        </div>

        <div className="browse-footer">
          <Link to="/hospitals" className="view-all-link">View all Hospitals →</Link>
        </div>
      </section>

      {/* CTA Section removed */}

      {/* Doctor CTA Section */}
      <section className="doctor-cta-section">
        <div className="doctor-cta-inner">
          <div className="doctor-cta-left">
            <img src="/Text.png" alt="Are you a Doctor?" className="doctor-cta-img" />
          </div>
          <div className="doctor-cta-right">
            <h2>Join our growing network of<br/>healthcare professionals <span>NOW!</span></h2>
            <p>Register as a doctor on HealthMandala and connect with thousands of patients. Manage your schedule, and appointments all in one place.</p>
            <div className="doctor-cta-actions">
              <Link to="/doctor-auth" className="btn btn-primary doctor-signup-btn">
                Apply Now
              </Link>
            </div>
            <div className="doctor-cta-perks">
              <div className="perk">
                <span className="perk-icon">✓</span>
                <span>Flexible scheduling</span>
              </div>
              <div className="perk">
                <span className="perk-icon">✓</span>
                <span>Streamlined workflow</span>
              </div>
              <div className="perk">
                <span className="perk-icon">✓</span>
                <span>Automated reminders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is rendered globally in App.js */}
    </>
  );
};

export default LandingPage;
