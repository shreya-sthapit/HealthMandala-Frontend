import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedDoctor = location.state?.preSelectedDoctor;
  
  const [step, setStep] = useState(preSelectedDoctor ? 2 : 1); // Skip to step 2 if doctor is pre-selected
  const [searchMode, setSearchMode] = useState('specialty'); // 'specialty' or 'browse'
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    specialty: preSelectedDoctor?.specialtyId || '',
    doctor: preSelectedDoctor || null,
    date: null,
    time: '',
    reason: '',
    paymentMethod: 'esewa' // Default to eSewa
  });

  const specialties = [
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'ophthalmology', name: 'Ophthalmology' },
    { id: 'dental', name: 'Dental' },
    { id: 'general', name: 'General' }
  ];

  // Mock data as fallback
  const mockDoctors = [
    { id: 1, name: 'Dr. Anita Sharma', specialty: 'Cardiologist', specialtyId: 'cardiology', rating: 4.9, patients: '1.2k', experience: '15 yrs', fee: 1500, available: true },
    { id: 2, name: 'Dr. Rajesh Patel', specialty: 'Cardiologist', specialtyId: 'cardiology', rating: 4.8, patients: '980', experience: '12 yrs', fee: 1200, available: true },
    { id: 3, name: 'Dr. Priya Thapa', specialty: 'Pediatrician', specialtyId: 'pediatrics', rating: 4.9, patients: '1.5k', experience: '10 yrs', fee: 1000, available: true },
    { id: 4, name: 'Dr. Suman Gurung', specialty: 'Orthopedic', specialtyId: 'orthopedics', rating: 4.7, patients: '850', experience: '8 yrs', fee: 1100, available: true },
    { id: 5, name: 'Dr. Maya Shrestha', specialty: 'Dermatologist', specialtyId: 'dermatology', rating: 4.8, patients: '1.1k', experience: '11 yrs', fee: 1300, available: true },
    { id: 6, name: 'Dr. Bikash Adhikari', specialty: 'Neurologist', specialtyId: 'neurology', rating: 4.6, patients: '720', experience: '7 yrs', fee: 900, available: true },
    { id: 7, name: 'Dr. Gita Devi', specialty: 'Ophthalmologist', specialtyId: 'ophthalmology', rating: 4.7, patients: '890', experience: '9 yrs', fee: 1000, available: true },
    { id: 8, name: 'Dr. Hari Prasad', specialty: 'Dentist', specialtyId: 'dental', rating: 4.8, patients: '1.3k', experience: '14 yrs', fee: 800, available: true },
    { id: 9, name: 'Dr. Ram Sharma', specialty: 'General Physician', specialtyId: 'general', rating: 4.5, patients: '2k', experience: '20 yrs', fee: 600, available: true }
  ];

  // Fetch approved doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/doctor/approved');
        const data = await response.json();
        
        if (data.success && data.doctors && data.doctors.length > 0) {
          console.log('Fetched real doctors:', data.doctors.length);
          setDoctors(data.doctors);
        } else {
          console.log('No approved doctors found, using mock data');
          setDoctors(mockDoctors);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        console.log('Using mock data due to error');
        setDoctors(mockDoctors);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const getFilteredDoctors = () => {
    if (searchMode === 'browse') {
      return doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return doctors.filter(doc => doc.specialtyId === booking.specialty);
  };

  const getAvailableDates = () => {
    if (!booking.doctor) {
      return [];
    }

    const dates = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get doctor's available days from schedule array (new format) or availableDays (old format)
    let doctorAvailableDays = [];
    
    if (booking.doctor.schedule && booking.doctor.schedule.length > 0) {
      // New format: use schedule array
      doctorAvailableDays = booking.doctor.schedule
        .filter(s => s.active)
        .map(s => s.day);
      console.log('Using schedule array:', doctorAvailableDays);
    } else if (booking.doctor.availableDays && booking.doctor.availableDays.length > 0) {
      // Old format: use availableDays array
      doctorAvailableDays = booking.doctor.availableDays;
      console.log('Using availableDays array:', doctorAvailableDays);
    }
    
    if (doctorAvailableDays.length === 0) {
      console.log('No available days found for doctor:', booking.doctor);
      return [];
    }
    
    // Look ahead for the next 30 days to find available dates
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayName = dayNames[date.getDay()];
      
      // Check if this day is in doctor's available days
      if (doctorAvailableDays.includes(dayName)) {
        dates.push({
          day: shortDayNames[date.getDay()],
          date: date.getDate(),
          month: monthNames[date.getMonth()],
          full: date.toISOString().split('T')[0],
          dayName: dayName
        });
        
        // Limit to next 10 available dates for better UX
        if (dates.length >= 10) {
          break;
        }
      }
    }
    
    console.log('Generated available dates:', dates.length);
    return dates;
  };

  const getNextAvailableDate = () => {
    if (!booking.doctor) {
      return null;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get doctor's available days from schedule array (new format) or availableDays (old format)
    let doctorAvailableDays = [];
    
    if (booking.doctor.schedule && booking.doctor.schedule.length > 0) {
      doctorAvailableDays = booking.doctor.schedule
        .filter(s => s.active)
        .map(s => s.day);
    } else if (booking.doctor.availableDays && booking.doctor.availableDays.length > 0) {
      doctorAvailableDays = booking.doctor.availableDays;
    }
    
    if (doctorAvailableDays.length === 0) {
      return null;
    }
    
    // Look for the next available date within the next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayName = dayNames[date.getDay()];
      
      if (doctorAvailableDays.includes(dayName)) {
        const options = { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        };
        return {
          formatted: date.toLocaleDateString('en-US', options),
          isToday: i === 0,
          isTomorrow: i === 1
        };
      }
    }
    
    return null;
  };

  const generateTimeSlots = () => {
    if (!booking.doctor) {
      // Default time slots if no doctor
      return [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];
    }

    // Get the selected date's day name
    const selectedDayName = booking.date?.dayName;
    
    let startTime, endTime;
    
    // Try to get times from schedule array (new format)
    if (booking.doctor.schedule && booking.doctor.schedule.length > 0 && selectedDayName) {
      const daySchedule = booking.doctor.schedule.find(s => s.day === selectedDayName && s.active);
      if (daySchedule) {
        startTime = daySchedule.start;
        endTime = daySchedule.end;
      }
    }
    
    // Fallback to old format
    if (!startTime && booking.doctor.availableTimeStart) {
      startTime = booking.doctor.availableTimeStart;
      endTime = booking.doctor.availableTimeEnd;
    }
    
    // If still no times, return default slots
    if (!startTime || !endTime) {
      return [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];
    }

    const slots = [];
    
    // Get lunch break times if available
    const lunchStart = booking.doctor.lunchBreak?.start || '13:00';
    const lunchEnd = booking.doctor.lunchBreak?.end || '14:00';
    
    // Convert time strings to minutes for easier calculation
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const lunchStartMinutes = timeToMinutes(lunchStart);
    const lunchEndMinutes = timeToMinutes(lunchEnd);
    
    // Get consultation duration (default 30 minutes)
    const slotDuration = booking.doctor.consultationDuration || 30;
    
    // Generate slots with lunch break exclusion
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      // Skip lunch break slots
      if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) {
        continue;
      }
      slots.push(minutesToTime(minutes));
    }
    
    return slots;
  };

  const isDateOnLeave = (dateStr) => {
    if (!booking.doctor || !booking.doctor.leaves || booking.doctor.leaves.length === 0) {
      return false;
    }

    const checkDate = new Date(dateStr);
    
    for (const leave of booking.doctor.leaves) {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      
      if (checkDate >= leaveStart && checkDate <= leaveEnd) {
        return true;
      }
    }
    
    return false;
  };

  const unavailableSlots = ['10:00 AM', '02:30 PM', '04:00 PM'];

  const handleBooking = async () => {
    try {
      // Simulate eSewa payment process
      if (booking.paymentMethod === 'esewa') {
        const confirmPayment = window.confirm(
          `You will be redirected to eSewa to pay Rs. ${booking.doctor.fee}. Continue?`
        );
        
        if (!confirmPayment) {
          return;
        }

        // Simulate payment processing
        const paymentSuccess = await simulateEsewaPayment(booking.doctor.fee);
        
        if (!paymentSuccess) {
          alert('Payment failed. Please try again.');
          return;
        }
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const appointmentData = {
        patientId: userData.id || null,
        doctorId: booking.doctor.id || null,
        patientName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'Patient Name',
        patientPhone: userData.phone || '',
        patientEmail: userData.email || '',
        doctorName: booking.doctor.name,
        doctorSpecialization: booking.doctor.specialty,
        hospital: booking.doctor.hospital || '',
        appointmentDate: booking.date.full,
        appointmentTime: booking.time,
        appointmentType: 'consultation',
        reasonForVisit: booking.reason || 'General consultation',
        consultationFee: booking.doctor.fee,
        patientNotes: booking.reason || '',
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentMethod === 'esewa' ? 'paid' : 'pending'
      };

      console.log('Booking appointment:', appointmentData);

      const response = await fetch('http://localhost:5001/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/booking-confirmed', { 
          state: { 
            booking,
            appointmentId: data.appointment.id,
            paymentStatus: appointmentData.paymentStatus
          } 
        });
      } else {
        alert(data.error || 'Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book appointment. Please check your connection and try again.');
    }
  };

  const simulateEsewaPayment = async (amount) => {
    return new Promise((resolve) => {
      // Simulate payment processing delay
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        if (success) {
          alert(`Payment of Rs. ${amount} successful via eSewa!`);
        }
        resolve(success);
      }, 2000);
    });
  };

  const canProceed = () => {
    if (step === 1) return booking.doctor;
    if (step === 2) return booking.date && booking.time;
    return true;
  };

  const filteredDoctors = getFilteredDoctors();

  return (
    <div className="booking-container">
      <nav className="top-navbar">
        <Link to="/home" className="logo">
          <img src="/logo.png" alt="HealthMandala" />
          <span>HealthMandala</span>
        </Link>
      </nav>

      <div className="booking-content">
        <div className="page-header">
          <Link to={preSelectedDoctor ? "/find-doctors" : "/home"} className="back-btn">
            ← Back to {preSelectedDoctor ? "Find Doctors" : "Home"}
          </Link>
          <h1>Book an Appointment</h1>
          {preSelectedDoctor && (
            <p className="booking-subtitle">Complete your booking with {preSelectedDoctor.name}</p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="booking-progress">
          <div className="progress-step">
            <div className={`step-circle ${step >= 1 ? 'active' : ''} ${preSelectedDoctor ? 'completed' : ''}`}>1</div>
            <span className={`step-label ${step >= 1 ? 'active' : ''}`}>Select Doctor</span>
          </div>
          <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
          <div className="progress-step">
            <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
            <span className={`step-label ${step >= 2 ? 'active' : ''}`}>Date & Time</span>
          </div>
          <div className={`step-line ${step > 2 ? 'completed' : ''}`}></div>
          <div className="progress-step">
            <div className={`step-circle ${step >= 3 ? 'active' : ''}`}>3</div>
            <span className={`step-label ${step >= 3 ? 'active' : ''}`}>Confirm</span>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-main">
            {/* Pre-selected Doctor Info */}
            {preSelectedDoctor && (
              <div className="pre-selected-doctor">
                <div className="pre-selected-header">
                  <h2>Booking Appointment with</h2>
                  <Link to="/find-doctors" className="change-doctor-btn">Change Doctor</Link>
                </div>
                <div className="selected-doctor-card">
                  <div className="avatar">
                    {preSelectedDoctor.profilePhoto ? (
                      <img 
                        src={`http://localhost:5001/${preSelectedDoctor.profilePhoto}`} 
                        alt={preSelectedDoctor.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-fallback" style={{ display: preSelectedDoctor.profilePhoto ? 'none' : 'flex' }}>
                      {preSelectedDoctor.name.split(' ')[1][0]}
                    </div>
                  </div>
                  <div className="info">
                    <h3>{preSelectedDoctor.name}</h3>
                    <p>{preSelectedDoctor.specialty} • {preSelectedDoctor.experience} experience</p>
                    <div className="stats">
                      <span className="rating">{preSelectedDoctor.rating.toFixed(1)} rating</span>
                      <span>{preSelectedDoctor.patients} patients</span>
                      <span>Rs. {preSelectedDoctor.fee}</span>
                    </div>
                    {(() => {
                      const nextDate = getNextAvailableDate();
                      return nextDate ? (
                        <div className="next-appointment">
                          Next available: {nextDate.isToday ? 'Today' : nextDate.isTomorrow ? 'Tomorrow' : nextDate.formatted}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Select Specialty & Doctor */}
            {step === 1 && (
              <>
                {/* Search Mode Toggle */}
                <div className="search-mode-toggle">
                  <button 
                    className={`mode-btn ${searchMode === 'specialty' ? 'active' : ''}`}
                    onClick={() => { setSearchMode('specialty'); setSearchTerm(''); }}
                  >
                    By Specialty
                  </button>
                  <button 
                    className={`mode-btn ${searchMode === 'browse' ? 'active' : ''}`}
                    onClick={() => { setSearchMode('browse'); setBooking({ ...booking, specialty: '' }); }}
                  >
                    Browse All Doctors
                  </button>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading doctors...</p>
                  </div>
                ) : (
                  <>
                    {searchMode === 'specialty' ? (
                      <>
                        <div className="specialty-select">
                          <h2>Select Specialty</h2>
                          <div className="specialty-options">
                            {specialties.map((spec) => (
                              <div
                                key={spec.id}
                                className={`specialty-option ${booking.specialty === spec.id ? 'selected' : ''}`}
                                onClick={() => setBooking({ ...booking, specialty: spec.id, doctor: null })}
                              >
                                <div className="icon">{spec.name[0]}</div>
                                <span>{spec.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {booking.specialty && (
                          <div className="doctor-select">
                            <h2>Select Doctor</h2>
                            {filteredDoctors.length > 0 ? (
                              <div className="doctors-list">
                                {filteredDoctors.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className={`doctor-option ${booking.doctor?.id === doc.id ? 'selected' : ''}`}
                                    onClick={() => setBooking({ ...booking, doctor: doc })}
                                  >
                                    <div className="avatar">
                                      {doc.profilePhoto ? (
                                        <img 
                                          src={`http://localhost:5001/${doc.profilePhoto}`} 
                                          alt={doc.name}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className="avatar-fallback" style={{ display: doc.profilePhoto ? 'none' : 'flex' }}>
                                        {doc.name.split(' ')[1][0]}
                                      </div>
                                    </div>
                                    <div className="info">
                                      <h3>{doc.name}</h3>
                                      <p>{doc.specialty} • {doc.experience} experience</p>
                                      <div className="stats">
                                        <span className="rating">{doc.rating.toFixed(1)} rating</span>
                                        <span>{doc.patients} patients</span>
                                        <span>Rs. {doc.fee}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-results">
                                <p>No doctors available for {specialties.find(s => s.id === booking.specialty)?.name}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="doctor-browse">
                        <h2>Browse Doctors</h2>
                        <div className="doctor-search-bar">
                          <span className="search-icon">S</span>
                          <input
                            type="text"
                            placeholder="Search by doctor name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>X</button>
                          )}
                        </div>
                        
                        <div className="doctors-list browse-list">
                          {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doc) => (
                              <div
                                key={doc.id}
                                className={`doctor-option ${booking.doctor?.id === doc.id ? 'selected' : ''}`}
                                onClick={() => setBooking({ ...booking, doctor: doc, specialty: doc.specialtyId })}
                              >
                                <div className="avatar">
                                  {doc.profilePhoto ? (
                                    <img 
                                      src={`http://localhost:5001/${doc.profilePhoto}`} 
                                      alt={doc.name}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className="avatar-fallback" style={{ display: doc.profilePhoto ? 'none' : 'flex' }}>
                                    {doc.name.split(' ')[1][0]}
                                  </div>
                                </div>
                                <div className="info">
                                  <h3>{doc.name}</h3>
                                  <p>{doc.specialty} • {doc.experience} experience</p>
                                  <div className="stats">
                                    <span className="rating">{doc.rating.toFixed(1)} rating</span>
                                    <span>{doc.patients} patients</span>
                                    <span>Rs. {doc.fee}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-results">
                              <p>No doctors found matching "{searchTerm}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <>
                <div className="date-select">
                  <h2>Select Date</h2>
                  {booking.doctor ? (
                    <>
                      <p className="availability-info">
                        {(() => {
                          // Get available days from schedule or availableDays
                          let availableDays = [];
                          let timeRange = '';
                          
                          if (booking.doctor.schedule && booking.doctor.schedule.length > 0) {
                            const activeDays = booking.doctor.schedule.filter(s => s.active);
                            availableDays = activeDays.map(s => s.day);
                            
                            // Show time range (use first active day as example)
                            if (activeDays.length > 0) {
                              timeRange = `${activeDays[0].start} - ${activeDays[0].end}`;
                            }
                          } else if (booking.doctor.availableDays && booking.doctor.availableDays.length > 0) {
                            availableDays = booking.doctor.availableDays;
                            timeRange = `${booking.doctor.availableTimeStart || ''} - ${booking.doctor.availableTimeEnd || ''}`;
                          }
                          
                          return availableDays.length > 0 
                            ? `Available on: ${availableDays.join(', ')} ${timeRange ? `(${timeRange})` : ''}`
                            : 'No availability information';
                        })()}
                      </p>
                      <div className="date-picker">
                        {getAvailableDates().map((d, index) => {
                          const onLeave = isDateOnLeave(d.full);
                          return (
                            <div
                              key={index}
                              className={`date-option ${booking.date?.full === d.full ? 'selected' : ''} ${onLeave ? 'on-leave' : ''}`}
                              onClick={() => !onLeave && setBooking({ ...booking, date: d })}
                              title={onLeave ? 'Doctor is on leave' : ''}
                            >
                              <div className="day">{d.day}</div>
                              <div className="date">{d.date}</div>
                              <div className="month">{d.month}</div>
                              {onLeave && <div className="leave-badge">On Leave</div>}
                            </div>
                          );
                        })}
                      </div>
                      {getAvailableDates().length === 0 && (
                        <div className="no-availability">
                          <p>No available dates found for this doctor.</p>
                          <p>Please contact the clinic directly or choose another doctor.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-doctor-selected">
                      <p>Please select a doctor first to see available dates.</p>
                    </div>
                  )}
                </div>

                <div className="time-select">
                  <h2>Select Time</h2>
                  {booking.doctor ? (
                    <div className="time-slots">
                      {generateTimeSlots().map((time) => (
                        <div
                          key={time}
                          className={`time-slot ${booking.time === time ? 'selected' : ''} ${unavailableSlots.includes(time) ? 'unavailable' : ''}`}
                          onClick={() => !unavailableSlots.includes(time) && setBooking({ ...booking, time })}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-doctor-selected">
                      <p>Please select a doctor first to see available times.</p>
                    </div>
                  )}
                </div>

                <div className="reason-input">
                  <h2>Reason for Visit (Optional)</h2>
                  <textarea
                    placeholder="Briefly describe your symptoms or reason for the appointment..."
                    value={booking.reason}
                    onChange={(e) => setBooking({ ...booking, reason: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="confirmation-card">
                <div className="confirmation-icon">✓</div>
                <h2>Confirm Your Appointment</h2>
                <p>Please review your booking details and select payment method</p>
                
                <div className="confirmation-details">
                  <div className="detail-row">
                    <span className="label">Doctor</span>
                    <span className="value">{booking.doctor?.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Specialty</span>
                    <span className="value">{booking.doctor?.specialty}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date</span>
                    <span className="value">{booking.date?.day}, {booking.date?.date} {booking.date?.month}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time</span>
                    <span className="value">{booking.time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Consultation Fee</span>
                    <span className="value">Rs. {booking.doctor?.fee}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="payment-section">
                  <h3>Select Payment Method</h3>
                  <div className="payment-methods">
                    <div 
                      className={`payment-option ${booking.paymentMethod === 'esewa' ? 'selected' : ''}`}
                      onClick={() => setBooking({ ...booking, paymentMethod: 'esewa' })}
                    >
                      <div className="payment-logo">
                        <div className="esewa-logo">eSewa</div>
                      </div>
                      <div className="payment-info">
                        <h4>eSewa</h4>
                        <p>Pay securely with eSewa digital wallet</p>
                      </div>
                      <div className="payment-radio">
                        <div className={`radio ${booking.paymentMethod === 'esewa' ? 'checked' : ''}`}></div>
                      </div>
                    </div>
                    
                    <div className="payment-option disabled">
                      <div className="payment-logo">
                        <div className="khalti-logo">Khalti</div>
                      </div>
                      <div className="payment-info">
                        <h4>Khalti</h4>
                        <p>Coming soon</p>
                      </div>
                      <div className="payment-radio">
                        <div className="radio disabled"></div>
                      </div>
                    </div>

                    <div className="payment-option disabled">
                      <div className="payment-logo">
                        <div className="card-logo">💳</div>
                      </div>
                      <div className="payment-info">
                        <h4>Credit/Debit Card</h4>
                        <p>Coming soon</p>
                      </div>
                      <div className="payment-radio">
                        <div className="radio disabled"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Consultation Fee</span>
                    <span>Rs. {booking.doctor?.fee}</span>
                  </div>
                  <div className="summary-row">
                    <span>Service Charge</span>
                    <span>Rs. 0</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>Rs. {booking.doctor?.fee}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            
            {booking.doctor && (
              <div className="summary-doctor">
                <div className="avatar">
                  {booking.doctor.profilePhoto ? (
                    <img 
                      src={`http://localhost:5001/${booking.doctor.profilePhoto}`} 
                      alt={booking.doctor.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="avatar-fallback" style={{ display: booking.doctor.profilePhoto ? 'none' : 'flex' }}>
                    {booking.doctor.name.split(' ')[1][0]}
                  </div>
                </div>
                <div className="info">
                  <h4>{booking.doctor.name}</h4>
                  <p>{booking.doctor.specialty}</p>
                </div>
              </div>
            )}

            <div className="summary-item">
              <span className="label">Date</span>
              <span className="value">
                {booking.date ? `${booking.date.day}, ${booking.date.date} ${booking.date.month}` : 'Not selected'}
              </span>
            </div>

            <div className="summary-item">
              <span className="label">Time</span>
              <span className="value">{booking.time || 'Not selected'}</span>
            </div>

            {step === 3 && booking.paymentMethod && (
              <div className="summary-item">
                <span className="label">Payment</span>
                <span className="value">
                  {booking.paymentMethod === 'esewa' ? 'eSewa' : booking.paymentMethod}
                </span>
              </div>
            )}

            <div className="summary-total">
              <span>Total</span>
              <span className="amount">Rs. {booking.doctor?.fee || 0}</span>
            </div>

            {step < 3 ? (
              <button
                className="book-btn"
                disabled={!canProceed()}
                onClick={() => setStep(step + 1)}
              >
                Continue
              </button>
            ) : (
              <button className="book-btn" onClick={handleBooking}>
                Pay Rs. {booking.doctor?.fee || 0} & Confirm
              </button>
            )}

            {step > (preSelectedDoctor ? 2 : 1) && (
              <button
                className="book-btn"
                style={{ background: 'transparent', color: 'var(--text-dark)', marginTop: '0.5rem' }}
                onClick={() => setStep(step - 1)}
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
