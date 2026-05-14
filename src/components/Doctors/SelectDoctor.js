import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './SelectDoctor.css';

const SelectDoctor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specializations');
  
  // Complete list of specializations
  const specialties = [
    'All Specializations',
    'Ayurveda Physician (Traditional Medicine Specialist)',
    'Cardiologist (Heart Specialist)',
    'Dental Surgeon (Teeth & Oral Specialist)',
    'Dermatologist (Skin & Hair Specialist)',
    'Endocrinologist (Diabetes & Hormone Specialist)',
    'Gastroenterologist (Stomach & Liver Specialist)',
    'General Physician (Internal Medicine & Fever)',
    'General Practitioner (Family Doctor)',
    'General Surgeon (General Operations)',
    'Gynecologist & Obstetrician (Women\'s Health & Pregnancy)',
    'Nephrologist (Kidney Specialist)',
    'Neurologist (Brain & Nerve Specialist)',
    'Neurosurgeon (Brain & Spine Surgeon)',
    'Oncologist (Cancer Specialist)',
    'Ophthalmologist (Eye Specialist)',
    'Orthopedic Surgeon (Bone & Joint Specialist)',
    'Otolaryngologist (ENT - Ear, Nose & Throat Specialist)',
    'Pediatrician (Child & Newborn Specialist)',
    'Physiotherapist (Physical Rehab Specialist)',
    'Psychiatrist (Mental Health & Counseling Specialist)',
    'Pulmonologist (Chest & Lung Specialist)',
    'Radiologist (X-Ray & Ultrasound Specialist)',
    'Rheumatologist (Arthritis & Joint Pain Specialist)',
    'Urologist (Urinary & Kidney Stone Specialist)'
  ];

  // Check if user is logged in
  const isLoggedIn = () => !!localStorage.getItem('token');

  const requireAuth = (callback) => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    callback();
  };

  useEffect(() => {
    fetchDoctors();
    // Check if a specialty was pre-selected from navigation
    if (location.state?.preSelectedSpecialty) {
      setSelectedSpecialty(location.state.preSelectedSpecialty);
    }
  }, [location.state]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/doctor/approved');
      const data = await response.json();
      if (data.success && data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(doc => {
    // Extract base specialty name (before parentheses) for matching
    const getBaseSpecialty = (spec) => {
      if (!spec) return '';
      return spec.split('(')[0].trim().toLowerCase();
    };
    
    const docBaseSpecialty = getBaseSpecialty(doc.specialty);
    const selectedBaseSpecialty = getBaseSpecialty(selectedSpecialty);
    
    const matchSpec = selectedSpecialty === 'All Specializations' || 
                      docBaseSpecialty === selectedBaseSpecialty ||
                      doc.specialty.toLowerCase().includes(selectedBaseSpecialty);
    
    const matchSearch = searchTerm === '' ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchSpec && matchSearch;
  });

  const getAvailableDays = (doc) => {
    // First check hospitalSchedules (new structure)
    if (doc.hospitalSchedules && doc.hospitalSchedules.length > 0) {
      const hospitalSchedule = doc.hospitalSchedules[0]; // Use first hospital's schedule
      if (hospitalSchedule.schedule && hospitalSchedule.schedule.length > 0) {
        return hospitalSchedule.schedule.filter(s => s.active).map(s => s.day);
      }
    }
    // Fallback to flat schedule (old structure)
    if (doc.schedule && doc.schedule.length > 0) {
      return doc.schedule.filter(s => s.active).map(s => s.day);
    }
    // Fallback to availableDays array
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

  const getNextAvailableTime = (doc) => {
    const dates = getNextDates(doc);
    if (dates.length === 0) return null;
    
    const firstDate = dates[0];
    const slots = getTimeSlots(doc, firstDate);
    if (slots.length === 0) return null;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[firstDate.getMonth()];
    const day = firstDate.getDate();
    
    // Convert 24h time to 12h format
    const [hours, minutes] = slots[0].split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    
    return `${month} ${day} at ${timeStr}`;
  };

  const getTimeSlots = (doc, date) => {
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
    let start = doc.availableTimeStart || '09:00';
    let end = doc.availableTimeEnd || '17:00';
    let breakStart = null;
    let breakEnd = null;
    let hasBreak = false;
    
    // Get schedule for this specific day - check hospitalSchedules first
    let daySchedule = null;
    if (doc.hospitalSchedules && doc.hospitalSchedules.length > 0) {
      const hospitalSchedule = doc.hospitalSchedules[0];
      if (hospitalSchedule.schedule) {
        daySchedule = hospitalSchedule.schedule.find(s => s.day === dayName && s.active);
      }
    }
    // Fallback to flat schedule
    if (!daySchedule && doc.schedule) {
      daySchedule = doc.schedule.find(s => s.day === dayName && s.active);
    }
    
    if (daySchedule) {
      start = daySchedule.start;
      end = daySchedule.end;
      // Check if this day has a break
      if (daySchedule.hasBreak && daySchedule.breakStart && daySchedule.breakEnd) {
        hasBreak = true;
        breakStart = daySchedule.breakStart;
        breakEnd = daySchedule.breakEnd;
      }
    }
    
    const slots = [];
    const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    const toStr = m => { const h = Math.floor(m/60); const mn = m%60; return `${String(h).padStart(2,'0')}:${String(mn).padStart(2,'0')}`; };
    
    const startMin = toMin(start);
    const endMin = toMin(end);
    const breakStartMin = hasBreak ? toMin(breakStart) : null;
    const breakEndMin = hasBreak ? toMin(breakEnd) : null;
    
    // Generate 10-minute slots, excluding break time
    for (let m = startMin; m < endMin; m += 10) {
      // Skip if this slot falls within break time
      if (hasBreak && m >= breakStartMin && m < breakEndMin) {
        continue;
      }
      slots.push(toStr(m));
    }
    
    return slots;
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
        {/* Progress Stepper */}
        <div className="booking-stepper">
          <div className="stepper-step">
            <div className="step-label">
              <div className="step-title">STEP 1</div>
              <div className="step-desc">Select Department</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className="stepper-step active">
            <div className="step-label">
              <div className="step-title">STEP 2</div>
              <div className="step-desc">Select the doctor</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className="stepper-step">
            <div className="step-label">
              <div className="step-title">STEP 3</div>
              <div className="step-desc">Select Appointment time</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className="stepper-step">
            <div className="step-label">
              <div className="step-title">STEP 4</div>
              <div className="step-desc">Verify Patient</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className="stepper-step">
            <div className="step-label">
              <div className="step-title">STEP 5</div>
              <div className="step-desc">Payments</div>
            </div>
          </div>
        </div>

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
              <svg className="search-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
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
              const nextAvailable = getNextAvailableTime(doc);

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
                      <p className="next-available-tag">
                        <span className="dot green"></span>
                        Next Available: {nextAvailable || 'Contact clinic directly'}
                      </p>
                      <Link to={isLoggedIn() ? `/doctor/${doc.id}` : '/signup'} className="view-profile-btn">
                        View Profile ›
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
                          
                          // Convert 24h time to 12h format with AM/PM
                          const formatTime12h = (time24) => {
                            const [hours, minutes] = time24.split(':').map(Number);
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const hours12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                            return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
                          };
                          
                          // Get schedule from hospitalSchedules or flat schedule
                          let daySchedule = null;
                          if (doc.hospitalSchedules && doc.hospitalSchedules.length > 0) {
                            const hospitalSchedule = doc.hospitalSchedules[0];
                            if (hospitalSchedule.schedule) {
                              daySchedule = hospitalSchedule.schedule.find(s => s.day === dayName && s.active);
                            }
                          }
                          if (!daySchedule && doc.schedule) {
                            daySchedule = doc.schedule.find(s => s.day === dayName && s.active);
                          }
                          if (daySchedule) {
                            timeRange = `${formatTime12h(daySchedule.start)} - ${formatTime12h(daySchedule.end)}`;
                          } else {
                            // Format default time range
                            const [start, end] = timeRange.split(' - ');
                            timeRange = `${formatTime12h(start)} - ${formatTime12h(end)}`;
                          }
                          
                          const slots = getTimeSlots(doc, date);
                          const displaySlots = slots.slice(0, 4); // Show first 4 slots
                          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                          return (
                            <div key={di} className="schedule-row">
                              <span className="sched-date">{dateStr}</span>
                              <span className="sched-range">{timeRange}</span>
                              <div className="sched-slots">
                                {displaySlots.map(slot => (
                                  <button
                                    key={slot}
                                    className="slot-btn"
                                    onClick={() => handleBookSlot(doc, date, slot)}
                                  >
                                    {formatTime12h(slot)}
                                  </button>
                                ))}
                                {slots.length > 4 && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>
                                    +{slots.length - 4} more
                                  </span>
                                )}
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
