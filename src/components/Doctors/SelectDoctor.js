import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SelectDoctor.css';

const SelectDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [specialties, setSpecialties] = useState(['All']);

  // Check if user is logged in
  const isLoggedIn = () => !!localStorage.getItem('token');

  const requireAuth = (callback) => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    callback();
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/doctor/approved');
      const data = await response.json();
      if (data.success && data.doctors) {
        setDoctors(data.doctors);
        const specs = ['All', ...new Set(data.doctors.map(d => d.specialty))];
        setSpecialties(specs);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(doc => {
    const matchSpec = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSpec && matchSearch;
  });

  const getAvailableDays = (doc) => {
    if (doc.schedule && doc.schedule.length > 0) {
      return doc.schedule.filter(s => s.active).map(s => s.day);
    }
    return doc.availableDays || [];
  };

  const getNextDates = (doc) => {
    const days = getAvailableDays(doc);
    if (!days.length) return [];
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const results = [];
    for (let i = 0; i < 14 && results.length < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (days.includes(dayNames[d.getDay()])) {
        results.push(d);
      }
    }
    return results;
  };

  const getTimeSlots = (doc, date) => {
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
    let start = doc.availableTimeStart || '09:00';
    let end = doc.availableTimeEnd || '17:00';
    if (doc.schedule) {
      const s = doc.schedule.find(s => s.day === dayName && s.active);
      if (s) { start = s.start; end = s.end; }
    }
    const slots = [];
    const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    const toStr = m => { const h = Math.floor(m/60); const mn = m%60; return `${String(h).padStart(2,'0')}:${String(mn).padStart(2,'0')}`; };
    const dur = doc.consultationDuration || 30;
    for (let m = toMin(start); m < toMin(end); m += dur) slots.push(toStr(m));
    return slots.slice(0, 4);
  };

  const handleBookSlot = (doc, date, time) => {
    requireAuth(() => {
      const photoPath = doc.profilePhoto
        ? doc.profilePhoto.replace(/\\/g, '/').replace(/^backend\//, '')
        : null;
      navigate('/book-appointment', {
        state: {
          preSelectedDoctor: {
            id: doc.id, name: doc.name, specialty: doc.specialty,
            specialtyId: doc.specialtyId, rating: doc.rating,
            patients: doc.patients, experience: doc.experience,
            fee: doc.fee, hospital: doc.hospital, profilePhoto: photoPath,
            schedule: doc.schedule, lunchBreak: doc.lunchBreak,
            leaves: doc.leaves, availableDays: doc.availableDays,
            availableTimeStart: doc.availableTimeStart,
            availableTimeEnd: doc.availableTimeEnd,
            consultationDuration: doc.consultationDuration,
          },
          preSelectedDate: date.toISOString().split('T')[0],
          preSelectedTime: time,
        }
      });
    });
  };

  return (
    <div className="select-doctor-page">
      <div className="select-doctor-content">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-left">
            <label>Find By Speciality:</label>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Find Doctor"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="loading-state">Loading doctors...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No doctors found. Try a different specialty or search term.</p>
          </div>
        ) : (
          <div className="doctor-list">
            {filtered.map(doc => {
              const photoPath = doc.profilePhoto
                ? doc.profilePhoto.replace(/\\/g, '/').replace(/^backend\//, '')
                : null;
              const dates = getNextDates(doc);
              const days = getAvailableDays(doc);

              return (
                <div key={doc.id} className="doctor-row">
                  {/* Left: Doctor Info */}
                  <div className="doctor-info-col">
                    <div className="doctor-photo">
                      {photoPath ? (
                        <img src={`http://localhost:5001/${photoPath}`} alt={doc.name}
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                        />
                      ) : null}
                      <div className="photo-fallback" style={{ display: photoPath ? 'none' : 'flex' }}>
                        {doc.name.split(' ')[1]?.[0] || 'D'}
                      </div>
                    </div>
                    <div className="doctor-details">
                      <h3>{doc.name}</h3>
                      <p className="spec-tag">
                        <span className="dot"></span>{doc.specialty}
                      </p>
                      <p className="exp-tag">
                        <span className="dot"></span>Experience: {doc.experience}
                      </p>
                      {days.length > 0 && (
                        <p className="avail-tag">
                          <span className="dot green"></span>
                          Available: {days.slice(0, 3).join(', ')}{days.length > 3 ? '...' : ''}
                        </p>
                      )}
                      <p className="fee-tag">Consultation Fee: Rs. {doc.fee}</p>
                      <Link to={isLoggedIn() ? `/doctor/${doc.id}` : '/signup'} className="view-profile-btn">
                        View Profile &rsaquo;
                      </Link>
                    </div>
                  </div>

                  {/* Right: Schedule */}
                  <div className="doctor-schedule-col">
                    {dates.length === 0 ? (
                      <div className="no-schedule">No availability set. Contact clinic directly.</div>
                    ) : (
                      <>
                        <div className="schedule-header">
                          <span>Date</span>
                          <span>Dr. Available Time</span>
                          <span>Available Slots</span>
                        </div>
                        {dates.map((date, di) => {
                          const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
                          let timeRange = `${doc.availableTimeStart || '09:00'} - ${doc.availableTimeEnd || '17:00'}`;
                          if (doc.schedule) {
                            const s = doc.schedule.find(s => s.day === dayName && s.active);
                            if (s) timeRange = `${s.start} - ${s.end}`;
                          }
                          const slots = getTimeSlots(doc, date);
                          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                          return (
                            <div key={di} className="schedule-row">
                              <span className="sched-date">{dateStr}</span>
                              <span className="sched-range">{timeRange}</span>
                              <div className="sched-slots">
                                {slots.map(slot => (
                                  <button
                                    key={slot}
                                    className="slot-btn"
                                    onClick={() => handleBookSlot(doc, date, slot)}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        <button
                          className="check-schedule-btn"
                          onClick={() => requireAuth(() => navigate('/book-appointment', {
                            state: {
                              preSelectedDoctor: {
                                id: doc.id, name: doc.name, specialty: doc.specialty,
                                specialtyId: doc.specialtyId, rating: doc.rating,
                                patients: doc.patients, experience: doc.experience,
                                fee: doc.fee, hospital: doc.hospital,
                                profilePhoto: doc.profilePhoto?.replace(/\\/g, '/').replace(/^backend\//, ''),
                                schedule: doc.schedule, lunchBreak: doc.lunchBreak,
                                leaves: doc.leaves, availableDays: doc.availableDays,
                                availableTimeStart: doc.availableTimeStart,
                                availableTimeEnd: doc.availableTimeEnd,
                                consultationDuration: doc.consultationDuration,
                              }
                            }
                          }))}
                        >
                          Check Other Schedule Time to take appointment →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDoctor;
