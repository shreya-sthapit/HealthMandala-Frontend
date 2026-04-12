import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedDoctor = location.state?.preSelectedDoctor;
  
  const [step, setStep] = useState(preSelectedDoctor ? 2 : 1);
  const [searchMode, setSearchMode] = useState('specialty');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientStatus] = useState('approved'); // approval gate removed
  const [booking, setBooking] = useState({
    specialty: preSelectedDoctor?.specialtyId || '',
    doctor: preSelectedDoctor || null,
    date: null,
    tokenNumber: null,
    availableTokens: 0,
    totalTokens: 0,
    workingHours: '',
    reason: '',
    paymentMethod: 'esewa'
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

  const getAvailableDates = async () => {
    console.log('=== GET AVAILABLE DATES FUNCTION ===');
    
    if (!booking.doctor) {
      console.log('✗ No doctor selected');
      return [];
    }

    console.log('✓ Doctor selected:', booking.doctor.name);
    console.log('Doctor object:', JSON.stringify(booking.doctor, null, 2));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get doctor's available days from schedule array (new format) or availableDays (old format)
    let doctorAvailableDays = [];
    
    console.log('Checking schedule format...');
    console.log('  - schedule:', booking.doctor.schedule);
    console.log('  - availableDays:', booking.doctor.availableDays);
    
    if (booking.doctor.schedule && booking.doctor.schedule.length > 0) {
      // New format: use schedule array
      doctorAvailableDays = booking.doctor.schedule
        .filter(s => s.active)
        .map(s => s.day);
      console.log('✓ Using schedule array:', doctorAvailableDays);
    } else if (booking.doctor.availableDays && booking.doctor.availableDays.length > 0) {
      // Old format: use availableDays array
      doctorAvailableDays = booking.doctor.availableDays;
      console.log('✓ Using availableDays array:', doctorAvailableDays);
    }
    
    if (doctorAvailableDays.length === 0) {
      console.log('✗ ERROR: No available days found for doctor!');
      console.log('Doctor needs to set their schedule in "My Schedule" page');
      console.log('Full doctor object:', booking.doctor);
      return [];
    }
    
    console.log('✓ Doctor available days:', doctorAvailableDays);
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today:', today.toDateString());
    console.log('Doctor available days:', doctorAvailableDays);
    
    // Look ahead for the next 60 days to find available dates
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dayName = dayNames[date.getDay()];
      
      console.log(`Checking day ${i}: ${date.toDateString()} (${dayName})`);
      
      // Check if this day is in doctor's available days
      if (doctorAvailableDays.includes(dayName)) {
        const dateObj = {
          day: shortDayNames[date.getDay()],
          date: date.getDate(),
          month: monthNames[date.getMonth()],
          full: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
          dayName: dayName
        };
        
        console.log('Found matching day:', dateObj);
        dates.push(dateObj);
        
        // Limit to next 10 potential dates for checking
        if (dates.length >= 10) {
          break;
        }
      }
    }
    
    console.log('Generated potential dates:', dates.length, dates);
    
    if (dates.length === 0) {
      console.log('No dates generated - check doctor schedule configuration');
      return [];
    }
    
    // Now filter dates based on token availability
    // Only show dates progressively - next date only shows when current is fully booked
    const availableDates = [];
    
    for (const dateObj of dates) {
      try {
        console.log('Fetching tokens for:', dateObj.full);
        const response = await fetch(
          `http://localhost:5001/api/appointments/available-tokens/${booking.doctor.id}/${dateObj.full}`
        );
        const data = await response.json();
        
        console.log('Token response for', dateObj.full, ':', data);
        
        if (data.success) {
          // Add token info to date object
          dateObj.availableTokens = data.availableTokens;
          dateObj.totalTokens = data.totalTokens;
          dateObj.workingHours = data.workingHours;
          
          // If this is the first date OR previous date is fully booked, add it
          if (availableDates.length === 0) {
            // Always show the first available date (even if 0 tokens - user needs to see the issue)
            console.log('Adding first date:', dateObj);
            availableDates.push(dateObj);
          } else {
            // Only show next date if previous date has 0 tokens available
            const previousDate = availableDates[availableDates.length - 1];
            console.log('Previous date tokens:', previousDate.availableTokens);
            if (previousDate.availableTokens === 0) {
              console.log('Previous date full, adding next date:', dateObj);
              availableDates.push(dateObj);
            } else {
              console.log('Previous date still has tokens, not showing this date yet');
            }
          }
          
          // Stop after finding 2 dates (current + next if current is full)
          if (availableDates.length >= 2) {
            break;
          }
        } else {
          console.log('Token fetch failed for', dateObj.full, ':', data);
        }
      } catch (error) {
        console.error('Error fetching tokens for date:', dateObj.full, error);
      }
    }
    
    console.log('Final available dates to show:', availableDates);
    return availableDates;
  };

  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  // Pure function — takes doctor explicitly, no closure dependency on booking state
  const fetchAvailableDatesForDoctor = async (doctor) => {
    if (!doctor) return [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Resolve active days from schedule (new) or availableDays (old)
    let activeDays = [];
    if (doctor.schedule && doctor.schedule.length > 0) {
      activeDays = doctor.schedule.filter(s => s.active).map(s => s.day);
    } else if (doctor.availableDays && doctor.availableDays.length > 0) {
      activeDays = doctor.availableDays;
    }

    if (activeDays.length === 0) return [];

    // Collect next 10 matching dates within 60 days
    const candidates = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      const dayName = dayNames[d.getDay()];
      if (activeDays.includes(dayName)) {
        candidates.push({
          day: shortDayNames[d.getDay()],
          date: d.getDate(),
          month: monthNames[d.getMonth()],
          full: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          dayName
        });
        if (candidates.length >= 10) break;
      }
    }

    if (candidates.length === 0) return [];

    // Progressive filter: show first date; show next only when previous is fully booked
    const result = [];
    for (const dateObj of candidates) {
      try {
        const res = await fetch(
          `http://localhost:5001/api/appointments/available-tokens/${doctor.id}/${dateObj.full}`
        );
        const data = await res.json();
        if (!data.success) continue;

        dateObj.availableTokens = data.availableTokens;
        dateObj.totalTokens = data.totalTokens;
        dateObj.workingHours = data.workingHours;

        if (result.length === 0) {
          result.push(dateObj); // always show the first upcoming date
        } else if (result[result.length - 1].availableTokens === 0) {
          result.push(dateObj); // show next only when previous is full
        } else {
          break; // previous still has tokens — stop here
        }

        if (result.length >= 2) break;
      } catch (e) {
        console.error('Token fetch error for', dateObj.full, e);
      }
    }

    return result;
  };

  // Reload dates whenever doctor changes or we arrive at step 2
  useEffect(() => {
    if (!booking.doctor || step !== 2) return;
    const doctor = booking.doctor; // capture current value
    setLoadingDates(true);
    fetchAvailableDatesForDoctor(doctor)
      .then(dates => setAvailableDates(dates))
      .catch(() => setAvailableDates([]))
      .finally(() => setLoadingDates(false));
  }, [booking.doctor?.id, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = async (dateObj) => {
    setBooking({ 
      ...booking, 
      date: dateObj, 
      tokenNumber: null,
      availableTokens: dateObj.availableTokens,
      totalTokens: dateObj.totalTokens
    });
    
    if (booking.doctor && booking.doctor.id) {
      await fetchAvailableTokens(booking.doctor.id, dateObj.full);
    }
  };

  // Refresh dates after booking to show next date if current is full
  const refreshAvailableDates = async () => {
    setLoadingDates(true);
    const dates = await getAvailableDates();
    setAvailableDates(dates);
    setLoadingDates(false);
  };

  const fetchAvailableTokens = async (doctorId, date) => {
    try {
      const response = await fetch(`http://localhost:5001/api/appointments/available-tokens/${doctorId}/${date}`);
      const data = await response.json();
      
      if (data.success) {
        setBooking(prev => ({
          ...prev,
          availableTokens: data.availableTokens,
          totalTokens: data.totalTokens,
          workingHours: data.workingHours,
          lunchBreak: data.lunchBreak
        }));
      }
    } catch (error) {
      console.error('Error fetching available tokens:', error);
    }
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

  const handleBooking = async () => {
    // Validate token selection
    if (!booking.tokenNumber) {
      alert('Please confirm your token number before proceeding.');
      return;
    }

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
        tokenNumber: booking.tokenNumber,
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
    if (step === 2) return booking.date && booking.tokenNumber;
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

            {/* Step 2: Select Date */}
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
                      {loadingDates ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>Loading available dates...</p>
                        </div>
                      ) : (
                        <>
                          <div className="date-picker">
                            {availableDates.map((d, index) => {
                              const onLeave = isDateOnLeave(d.full);
                              return (
                                <div
                                  key={index}
                                  className={`date-option ${booking.date?.full === d.full ? 'selected' : ''} ${onLeave ? 'on-leave' : ''}`}
                                  onClick={() => !onLeave && handleDateSelect(d)}
                                  title={onLeave ? 'Doctor is on leave' : ''}
                                >
                                  <div className="day">{d.day}</div>
                                  <div className="date">{d.date}</div>
                                  <div className="month">{d.month}</div>
                                  {d.availableTokens !== undefined && (
                                    <div className="token-badge" style={{
                                      fontSize: '0.7rem',
                                      marginTop: '0.25rem',
                                      color: d.availableTokens === 0 ? '#dc2626' : '#10b981'
                                    }}>
                                      {d.availableTokens}/{d.totalTokens}
                                    </div>
                                  )}
                                  {onLeave && <div className="leave-badge">On Leave</div>}
                                </div>
                              );
                            })}
                          </div>
                          {availableDates.length === 0 && (
                            <div className="no-availability">
                              <p>No available dates found for this doctor.</p>
                              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#6b7280' }}>
                                This could mean:
                              </p>
                              <ul style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'left', marginTop: '0.5rem' }}>
                                <li>The doctor hasn't set up their schedule yet</li>
                                <li>All available dates are fully booked</li>
                                <li>The doctor is on leave</li>
                              </ul>
                              <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                                Please contact the clinic directly or choose another doctor.
                              </p>
                            </div>
                          )}
                          {availableDates.length > 0 && availableDates[0].availableTokens === 0 && availableDates.length === 1 && (
                            <div className="info-note" style={{ marginTop: '1rem' }}>
                              <p>The next available date is fully booked. Please check back later or contact the clinic.</p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="no-doctor-selected">
                      <p>Please select a doctor first to see available dates.</p>
                    </div>
                  )}
                </div>

                {booking.date && (
                  <div className="token-info-section">
                    <h2>Appointment Information</h2>
                    <div className="token-info-card">
                      <div className="info-row">
                        <span className="label">Doctor's Working Hours:</span>
                        <span className="value">{booking.workingHours || 'Not available'}</span>
                      </div>
                      {booking.lunchBreak && (
                        <div className="info-row">
                          <span className="label">Lunch Break:</span>
                          <span className="value">{booking.lunchBreak}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="label">Available Tokens:</span>
                        <span className="value highlight">{booking.availableTokens} / {booking.totalTokens}</span>
                      </div>
                      <div className="info-note">
                        <p>Each token represents a 30-minute consultation slot.</p>
                        <p>Your specific appointment time will be assigned based on your token number.</p>
                      </div>
                      
                      {booking.availableTokens > 0 ? (
                        <div className="token-confirmation">
                          <p className="confirm-text">You will receive Token #{booking.totalTokens - booking.availableTokens + 1}</p>
                          <button 
                            className="confirm-token-btn"
                            onClick={() => {
                              const nextToken = booking.totalTokens - booking.availableTokens + 1;
                              setBooking({ ...booking, tokenNumber: nextToken });
                            }}
                          >
                            {booking.tokenNumber ? '✓ Token Confirmed' : 'Confirm Token'}
                          </button>
                        </div>
                      ) : (
                        <div className="no-tokens">
                          <p>No tokens available for this date.</p>
                          {availableDates.length > 1 && (
                            <p>Please select the next available date.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                    <span className="label">Token Number</span>
                    <span className="value">#{booking.tokenNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Working Hours</span>
                    <span className="value">{booking.workingHours}</span>
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
              <span className="label">Token</span>
              <span className="value">{booking.tokenNumber ? `#${booking.tokenNumber}` : 'Not confirmed'}</span>
            </div>

            {booking.workingHours && (
              <div className="summary-item">
                <span className="label">Working Hours</span>
                <span className="value">{booking.workingHours}</span>
              </div>
            )}

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
