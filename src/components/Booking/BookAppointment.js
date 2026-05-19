import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedDoctor = location.state?.preSelectedDoctor;
  const preSelectedDate = location.state?.preSelectedDate;
  const preSelectedTime = location.state?.preSelectedTime;
  const hospitalFilter = location.state?.hospitalFilter || null; // from hospital page
  const specialtyFilter = location.state?.specialtyFilter || null; // from specialty card
  
  const [step, setStep] = useState(preSelectedDoctor ? 2 : 1);
  const [searchMode, setSearchMode] = useState(hospitalFilter ? 'browse' : 'specialty');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientStatus] = useState('approved'); // approval gate removed
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [dependentSearch, setDependentSearch] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);
  const [showAddDependentModal, setShowAddDependentModal] = useState(false);
  const [newDependent, setNewDependent] = useState({
    firstName: '',
    lastName: '',
    age: '',
    ageType: 'Year',
    dobAD: '',
    dobBS: '',
    isRealDOB: false,
    phone: '',
    email: '',
    gender: '',
    relationship: '',
    district: '',
    vdcMunicipality: '',
    ward: '',
    address: ''
  });
  const [booking, setBooking] = useState({
    specialty: preSelectedDoctor?.specialtyId || specialtyFilter || '',
    doctor: preSelectedDoctor || null,
    date: null,
    tokenNumber: null,
    availableTokens: 0,
    totalTokens: 0,
    workingHours: '',
    reason: '',
    paymentMethod: 'esewa',
    appointmentTime: null
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
          console.log('=== FETCHED DOCTORS FROM API ===');
          console.log('Total doctors:', data.doctors.length);
          console.log('First doctor sample:', {
            name: data.doctors[0].name,
            nmcNumber: data.doctors[0].nmcNumber,
            qualification: data.doctors[0].qualification,
            hospital: data.doctors[0].hospital,
            currentHospital: data.doctors[0].currentHospital,
            hasHospitalSchedules: 'hospitalSchedules' in data.doctors[0],
            hospitalSchedulesCount: data.doctors[0].hospitalSchedules?.length || 0,
            hasSchedule: 'schedule' in data.doctors[0],
            scheduleLength: data.doctors[0].schedule?.length || 0,
            availableDays: data.doctors[0].availableDays,
            allFields: Object.keys(data.doctors[0])
          });
          
          // Find Aayush for debugging
          const aayush = data.doctors.find(d => d.name.includes('Aayush'));
          if (aayush) {
            console.log('=== AAYUSH MAHARJAN DATA ===');
            console.log('Full object:', aayush);
            console.log('hospitalSchedules:', aayush.hospitalSchedules);
          }
          
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

  // Enrich preSelectedDoctor with missing fields from API
  useEffect(() => {
    if (preSelectedDoctor && doctors.length > 0) {
      const fullDoctorData = doctors.find(d => d.id === preSelectedDoctor.id);
      if (fullDoctorData && (!preSelectedDoctor.nmcNumber || !preSelectedDoctor.qualification)) {
        console.log('Enriching preSelectedDoctor with API data');
        setBooking(prev => ({
          ...prev,
          doctor: {
            ...prev.doctor,
            nmcNumber: fullDoctorData.nmcNumber,
            qualification: fullDoctorData.qualification
          }
        }));
      }
    }
  }, [doctors, preSelectedDoctor]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!booking.doctor || !booking.date) {
        console.log('Slots fetch skipped - missing doctor or date:', { 
          hasDoctor: !!booking.doctor, 
          hasDate: !!booking.date 
        });
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }

      setLoadingSlots(true);
      try {
        const hospitalName = (Array.isArray(booking.doctor.hospital) 
          ? booking.doctor.hospital[0] 
          : booking.doctor.hospital) || 
          (Array.isArray(booking.doctor.currentHospital) 
            ? booking.doctor.currentHospital[0] 
            : booking.doctor.currentHospital) || '';
        const formattedDate = booking.date.full; // Already in YYYY-MM-DD format
        const doctorId = booking.doctor._id || booking.doctor.id; // Support both _id and id
        
        console.log('=== FETCHING SLOTS ===');
        console.log('Fetching slots with params:', {
          doctorId,
          date: formattedDate,
          hospitalName,
          doctorSchedule: booking.doctor.schedule,
          doctorHospitalSchedules: booking.doctor.hospitalSchedules
        });
        
        const url = `http://localhost:5001/api/doctor/slots/${doctorId}?date=${formattedDate}&hospitalName=${encodeURIComponent(hospitalName)}`;
        console.log('Slots API URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Slots API response:', data);
        
        if (data.success) {
          console.log('Setting available slots:', data.slots);
          setAvailableSlots(data.slots || []);
        } else {
          console.error('Failed to fetch slots:', data.error);
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [booking.doctor, booking.date]);

  // Debug: Log doctor object when step 2 is reached
  useEffect(() => {
    if (step === 2 && booking.doctor) {
      console.log('=== STEP 2 DOCTOR OBJECT ===');
      console.log('Doctor Name:', booking.doctor.name);
      console.log('NMC Number:', booking.doctor.nmcNumber);
      console.log('Qualification:', booking.doctor.qualification);
      console.log('Hospital:', booking.doctor.hospital);
      console.log('Current Hospital:', booking.doctor.currentHospital);
      console.log('Hospital Schedules:', booking.doctor.hospitalSchedules);
      console.log('Schedule:', booking.doctor.schedule);
      console.log('Available Days:', booking.doctor.availableDays);
      console.log('Full doctor object:', booking.doctor);
    }
  }, [step, booking.doctor]);

  // Fetch patient information when reaching step 4
  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (step !== 4) return;

      // Auto-select self immediately
      setSelectedDependent('self');

      try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.id;
        
        if (!userId) {
          console.error('No user ID found');
          return;
        }

        const response = await fetch(`http://localhost:5001/api/patient/profile/${userId}`);
        const data = await response.json();
        
        console.log('Patient profile response:', data);
        
        // The API returns 'profile' not 'patient'
        if (data.success && data.profile) {
          setPatientInfo(data.profile);
        } else {
          console.log('No patient profile found or not approved yet');
        }
      } catch (error) {
        console.error('Error fetching patient info:', error);
      }
    };

    fetchPatientInfo();
  }, [step]);

  // Restore pending booking after login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendingBookingStr = sessionStorage.getItem('pendingBooking');
    
    if (token && pendingBookingStr) {
      try {
        const pendingBooking = JSON.parse(pendingBookingStr);
        console.log('=== RESTORING PENDING BOOKING ===');
        console.log('Pending booking:', pendingBooking);
        
        // Restore the booking state
        setBooking(prev => ({
          ...prev,
          doctor: pendingBooking.doctor,
          date: pendingBooking.date,
          appointmentTime: pendingBooking.slot,
          tokenNumber: pendingBooking.tokenNumber
        }));
        
        setSelectedSlot(pendingBooking.slot);
        setStep(2); // Go to step 2
        
        // Clear the pending booking
        sessionStorage.removeItem('pendingBooking');
      } catch (error) {
        console.error('Error restoring pending booking:', error);
        sessionStorage.removeItem('pendingBooking');
      }
    }
  }, []); // Run once on mount

  // Handle preselected date and time from SelectDoctor page
  useEffect(() => {
    const handlePreselectedSlot = async () => {
      if (preSelectedDate && preSelectedTime && preSelectedDoctor) {
        console.log('=== PRESELECTED DATE/TIME DETECTED ===');
        console.log('Date:', preSelectedDate);
        console.log('Time:', preSelectedTime);
        
        // Parse the date string (YYYY-MM-DD format)
        const dateObj = new Date(preSelectedDate);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const formattedDate = {
          day: shortDayNames[dateObj.getDay()],
          date: dateObj.getDate(),
          month: monthNames[dateObj.getMonth()],
          full: preSelectedDate,
          dayName: dayNames[dateObj.getDay()]
        };
        
        // Calculate token number by generating the same slots as SelectDoctor
        let tokenNumber = 1; // Default
        
        try {
          // Generate slots using the same logic as SelectDoctor
          const dayName = dayNames[dateObj.getDay()];
          let start = preSelectedDoctor.availableTimeStart || '09:00';
          let end = preSelectedDoctor.availableTimeEnd || '17:00';
          let breakStart = null;
          let breakEnd = null;
          let hasBreak = false;
          
          // Get schedule for this specific day - check hospitalSchedules first
          let daySchedule = null;
          if (preSelectedDoctor.hospitalSchedules && preSelectedDoctor.hospitalSchedules.length > 0) {
            const hospitalSchedule = preSelectedDoctor.hospitalSchedules[0];
            if (hospitalSchedule.schedule) {
              daySchedule = hospitalSchedule.schedule.find(s => s.day === dayName && s.active);
            }
          }
          // Fallback to flat schedule
          if (!daySchedule && preSelectedDoctor.schedule) {
            daySchedule = preSelectedDoctor.schedule.find(s => s.day === dayName && s.active);
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
          
          // Generate all slots for the day (same logic as SelectDoctor)
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
          
          console.log('=== GENERATED SLOTS (CLIENT-SIDE) ===');
          console.log('All slots for the day:', slots);
          console.log('Looking for slot:', preSelectedTime);
          
          // Find the index of the selected time slot
          const slotIndex = slots.findIndex(slot => slot === preSelectedTime);
          tokenNumber = slotIndex !== -1 ? slotIndex + 1 : 1;
          
          console.log('Found slot at index:', slotIndex);
          console.log('Calculated token number:', tokenNumber);
          
          if (slotIndex === -1) {
            console.warn('⚠️ WARNING: Slot not found in generated slots! Using default token 1');
          }
        } catch (error) {
          console.error('Error calculating token number:', error);
        }
        
        // Set the booking state with date, time, and correct token number
        setBooking(prev => ({
          ...prev,
          date: formattedDate,
          appointmentTime: preSelectedTime,
          tokenNumber: tokenNumber
        }));
        
        setSelectedSlot(preSelectedTime);
        
        // Navigate directly to Step 4
        setStep(4);
        
        console.log('Navigated to Step 4 with preselected data and token:', tokenNumber);
      }
    };
    
    handlePreselectedSlot();
  }, [preSelectedDate, preSelectedTime, preSelectedDoctor]);


  const getFilteredDoctors = () => {
    let filtered = doctors;

    // Hospital filter — from hospital booking page
    if (hospitalFilter) {
      filtered = filtered.filter(doc =>
        doc.hospital && typeof doc.hospital === 'string' && doc.hospital.toLowerCase().includes(hospitalFilter.toLowerCase())
      );
      // In hospital mode, show all filtered doctors (browse mode)
      if (searchTerm) {
        filtered = filtered.filter(doc =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return filtered;
    }

    if (searchMode === 'browse') {
      return filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty mode — match by specialtyId or by specialty name
    return filtered.filter(doc => {
      if (doc.specialtyId === booking.specialty) return true;
      // Also match by specialty name for doctors registered via new signup
      if (booking.specialty && doc.specialty) {
        return doc.specialty.toLowerCase().includes(booking.specialty.toLowerCase()) ||
               booking.specialty.toLowerCase().includes(doc.specialty.toLowerCase());
      }
      return false;
    });
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
    console.log('=== DATE SELECTED ===');
    console.log('Selected date object:', dateObj);
    
    setBooking(prev => ({ 
      ...prev, 
      date: dateObj, 
      tokenNumber: null,
      appointmentTime: null,
      availableTokens: dateObj.availableTokens,
      totalTokens: dateObj.totalTokens
    }));
    
    // Reset selected slot when date changes
    setSelectedSlot(null);
    
    if (booking.doctor && (booking.doctor.id || booking.doctor._id)) {
      const doctorId = booking.doctor._id || booking.doctor.id;
      await fetchAvailableTokens(doctorId, dateObj.full);
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

  const getNextAvailableTime = (doctor) => {
    if (!doctor) return null;
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let doctorAvailableDays = [];
    
    // Check hospitalSchedules first (correct structure)
    if (doctor.hospitalSchedules && doctor.hospitalSchedules.length > 0) {
      const currentHospitalSchedule = doctor.hospitalSchedules[0]; // Get first hospital schedule
      if (currentHospitalSchedule.schedule && currentHospitalSchedule.schedule.length > 0) {
        doctorAvailableDays = currentHospitalSchedule.schedule.filter(s => s.active);
      }
    } else if (doctor.schedule && doctor.schedule.length > 0) {
      doctorAvailableDays = doctor.schedule.filter(s => s.active);
    } else if (doctor.availableDays && doctor.availableDays.length > 0) {
      doctorAvailableDays = doctor.availableDays.map(day => ({ day, start: doctor.availableTimeStart, end: doctor.availableTimeEnd }));
    }
    
    if (doctorAvailableDays.length === 0) return null;
    
    // Find next available day starting from today
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = dayNames[date.getDay()];
      
      const daySchedule = doctorAvailableDays.find(d => d.day === dayName);
      if (daySchedule) {
        const [startHours, startMinutes] = (daySchedule.start || '09:00').split(':');
        const startHour = parseInt(startHours);
        const startMin = parseInt(startMinutes);
        
        // If it's today, check if the start time hasn't passed yet
        if (i === 0) {
          if (currentHour > startHour || (currentHour === startHour && currentMinute >= startMin)) {
            // Start time has passed today, continue to next day
            continue;
          }
        }
        
        const timeLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const ampm = startHour >= 12 ? 'PM' : 'AM';
        const hour12 = startHour % 12 || 12;
        return `${timeLabel} at ${hour12}:${startMinutes} ${ampm}`;
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
    // Validate slot selection
    if (!selectedSlot) {
      alert('Please select an appointment time slot before proceeding.');
      return;
    }

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
        doctorId: booking.doctor.id || booking.doctor._id || null,
        patientName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 'Patient Name',
        patientPhone: userData.phone || '',
        patientEmail: userData.email || '',
        doctorName: booking.doctor.name || `Dr. ${booking.doctor.firstName} ${booking.doctor.lastName}`,
        doctorSpecialization: booking.doctor.specialty || booking.doctor.specialization,
        hospital: booking.doctor.hospital || booking.doctor.currentHospital?.[0] || '',
        appointmentDate: booking.date.full,
        appointmentTime: selectedSlot, // Include selected slot time
        tokenNumber: booking.tokenNumber,
        appointmentType: 'consultation',
        reasonForVisit: booking.reason || 'General consultation',
        consultationFee: booking.doctor.fee || booking.doctor.consultationFee,
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
            booking: { ...booking, appointmentTime: selectedSlot },
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
    if (step === 2) return booking.date && selectedSlot;
    if (step === 3) return selectedDependent; // Must select a dependent
    return true;
  };

  const filteredDoctors = getFilteredDoctors();

  return (
    <div className="booking-container">
      <div className="booking-content">
        {/* Progress Stepper - Matching SelectDoctor */}
        <div className="booking-stepper">
          <div className={`stepper-step ${step === 1 ? 'active' : ''}`}>
            <div className="step-label">
              <div className="step-title">STEP 1</div>
              <div className="step-desc">Select Department</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step === 1 ? 'active' : ''}`}>
            <div className="step-label">
              <div className="step-title">STEP 2</div>
              <div className="step-desc">Select the doctor</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step === 2 ? 'active' : ''}`}>
            <div className="step-label">
              <div className="step-title">STEP 3</div>
              <div className="step-desc">Select Appointment time</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step === 4 ? 'active' : ''}`}>
            <div className="step-label">
              <div className="step-title">STEP 4</div>
              <div className="step-desc">Verify Patient</div>
            </div>
          </div>
          <div className="stepper-line"></div>
          <div className={`stepper-step ${step === 5 ? 'active' : ''}`}>
            <div className="step-label">
              <div className="step-title">STEP 5</div>
              <div className="step-desc">Payments</div>
            </div>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-main">
            {/* Step 1: Select Specialty & Doctor */}
            {step === 1 && (
              <>
                {/* Hospital filter banner */}
                {hospitalFilter && (
                  <div style={{ background: '#f0fdfa', border: '1px solid #d1faf4', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#065f46' }}>
                    Showing doctors available at <strong>{hospitalFilter}</strong>
                  </div>
                )}

                {/* Search Mode Toggle — hide when hospital filter is active */}
                {!hospitalFilter && (
                <div className="search-mode-toggle">
                  <button 
                    className={`mode-btn ${searchMode === 'specialty' ? 'active' : ''}`}
                    onClick={() => { setSearchMode('specialty'); setSearchTerm(''); }}
                  >
                    By Specialty
                  </button>
                  <button 
                    className={`mode-btn ${searchMode === 'browse' ? 'active' : ''}`}
                    onClick={() => { setSearchMode('browse'); setBooking(prev => ({ ...prev, specialty: '' })); }}
                  >
                    Browse All Doctors
                  </button>
                </div>
                )}

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading doctors...</p>
                  </div>
                ) : (
                  <>
                    {/* Hospital filter mode — show doctors directly */}
                    {hospitalFilter ? (
                      <div className="doctor-browse">
                        <h2>Available Doctors</h2>
                        <div className="doctor-search-bar">
                          <span className="search-icon">S</span>
                          <input
                            type="text"
                            placeholder="Search by name or specialty..."
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
                                onClick={() => setBooking(prev => ({ ...prev, doctor: doc, specialty: doc.specialtyId }))}
                              >
                                <div className="avatar">
                                  {doc.profilePhoto ? (
                                    <img src={`http://localhost:5001/${doc.profilePhoto}`} alt={doc.name}
                                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                  ) : null}
                                  <div className="avatar-fallback" style={{ display: doc.profilePhoto ? 'none' : 'flex' }}>
                                    {doc.name.split(' ')[1]?.[0] || 'D'}
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
                              <p>No doctors found at {hospitalFilter}.</p>
                              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Doctors appear here once they register and select this hospital.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : searchMode === 'specialty' ? (
                      <>
                        <div className="specialty-select">
                          <h2>Select Specialty</h2>
                          <div className="specialty-options">
                            {specialties.map((spec) => (
                              <div
                                key={spec.id}
                                className={`specialty-option ${booking.specialty === spec.id ? 'selected' : ''}`}
                                onClick={() => setBooking(prev => ({ ...prev, specialty: spec.id, doctor: null }))}
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
                                    onClick={() => setBooking(prev => ({ ...prev, doctor: doc }))}
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
                                onClick={() => setBooking(prev => ({ ...prev, doctor: doc, specialty: doc.specialtyId }))}
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

                {/* Action Buttons */}
                <div className="booking-actions">
                  <button
                    className="action-btn primary-btn"
                    disabled={!canProceed()}
                    onClick={() => setStep(step + 1)}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Select Date & Time - Side by Side Layout */}
            {step === 2 && (
              <>
                {/* Header */}
                <div className="booking-page-header">
                  <h2>Book Appointment With</h2>
                </div>

                {/* Doctor Info & Slots Container */}
                <div className="booking-content-wrapper">
                  {/* Left Side - Doctor Details */}
                  <div className="doctor-details-panel">
                    {/* Doctor Information Card - Vertical Layout */}
                    <div className="step4-doctor-card">
                      {/* Avatar at top */}
                      <div className="step4-doctor-avatar" style={{ margin: '0 auto 1rem auto' }}>
                        {booking.doctor?.profilePhoto ? (
                          <img 
                            src={`http://localhost:5001/${booking.doctor.profilePhoto.replace(/\\/g, '/').replace(/^backend\//, '')}`}
                            alt={booking.doctor.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="step4-avatar-fallback"
                          style={{ display: booking.doctor?.profilePhoto ? 'none' : 'flex' }}
                        >
                          {booking.doctor?.name?.split(' ')[1]?.[0] || 'D'}
                        </div>
                      </div>
                      
                      {/* Doctor name */}
                      <h3 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#1a2e35' }}>
                        {booking.doctor?.name}
                      </h3>
                      
                      {/* Specialization */}
                      <p style={{ textAlign: 'center', color: '#00a896', fontWeight: 600, margin: '0 0 1rem 0' }}>
                        {booking.doctor?.specialty}
                      </p>
                      
                      {/* Horizontal line */}
                      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
                      
                      {/* Details List with improved styling */}
                      <div className="step3-details-list">
                        <div className="step3-detail-row">
                          <span className="step3-detail-label">Experience</span>
                          <span className="step3-detail-value">{booking.doctor?.experience || 'N/A'}</span>
                        </div>
                        
                        <div className="step3-detail-row">
                          <span className="step3-detail-label">NMC Number</span>
                          <span className="step3-detail-value">{booking.doctor?.nmcNumber || 'N/A'}</span>
                        </div>
                        
                        <div className="step3-detail-row">
                          <span className="step3-detail-label">Qualification</span>
                          <span className="step3-detail-value">{booking.doctor?.qualification || 'N/A'}</span>
                        </div>
                        
                        <div className="step3-detail-row">
                          <span className="step3-detail-label">Currently Practice at</span>
                          <span className="step3-detail-value">
                            {(Array.isArray(booking.doctor?.hospital) 
                              ? booking.doctor.hospital[0] 
                              : booking.doctor?.hospital) || 
                            (Array.isArray(booking.doctor?.currentHospital) 
                              ? booking.doctor.currentHospital[0] 
                              : booking.doctor?.currentHospital) || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="step3-detail-row">
                          <span className="step3-detail-label">Consultation Fee</span>
                          <span className="step3-detail-value step3-fee">Rs. {booking.doctor?.fee || booking.doctor?.consultationFee || 0}</span>
                        </div>
                        
                        <div className="step3-detail-row step3-highlight">
                          <span className="step3-detail-label">Next available time</span>
                          <span className="step3-detail-value">{getNextAvailableTime(booking.doctor) || 'Contact clinic'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Date & Time Selection */}
                  <div className="slots-selection-panel">
                    {/* Date Selection */}
                    <div className="selection-section">
                      <h3>Select Date</h3>
                      <div className="week-calendar">
                        {(() => {
                          const today = new Date();
                          const currentDay = today.getDay();
                          const weekDates = [];
                          const startOfWeek = new Date(today);
                          startOfWeek.setDate(today.getDate() - currentDay);
                          
                          for (let i = 0; i < 7; i++) {
                            const date = new Date(startOfWeek);
                            date.setDate(startOfWeek.getDate() + i);
                            weekDates.push(date);
                          }
                          
                          return weekDates.map((date, index) => {
                            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                            const dateNum = date.getDate();
                            const dayName = dayNames[date.getDay()];
                            const fullDayName = fullDayNames[date.getDay()];
                            const dateStr = date.toISOString().split('T')[0];
                            const isToday = date.toDateString() === today.toDateString();
                            const isSelected = booking.date?.full === dateStr;
                            
                            const doctorAvailableDays = (() => {
                              console.log('=== DATE AVAILABILITY CHECK (DETAILED) ===');
                              console.log('Full booking.doctor object:', booking.doctor);
                              console.log('Keys in doctor object:', Object.keys(booking.doctor || {}));
                              
                              // Try hospital-specific schedule first
                              const hospitalName = (Array.isArray(booking.doctor?.hospital) 
                                ? booking.doctor.hospital[0] 
                                : booking.doctor?.hospital) || 
                                (Array.isArray(booking.doctor?.currentHospital) 
                                  ? booking.doctor.currentHospital[0] 
                                  : booking.doctor?.currentHospital) || '';
                              
                              console.log('Hospital name for matching:', hospitalName);
                              console.log('Doctor hospital field:', booking.doctor?.hospital);
                              console.log('Doctor currentHospital field:', booking.doctor?.currentHospital);
                              console.log('Doctor hospitalSchedules field:', booking.doctor?.hospitalSchedules);
                              console.log('Type of hospitalSchedules:', typeof booking.doctor?.hospitalSchedules);
                              console.log('Is array:', Array.isArray(booking.doctor?.hospitalSchedules));
                              
                              if (booking.doctor?.hospitalSchedules && Array.isArray(booking.doctor.hospitalSchedules)) {
                                console.log('hospitalSchedules length:', booking.doctor.hospitalSchedules.length);
                                booking.doctor.hospitalSchedules.forEach((hs, idx) => {
                                  console.log(`  Schedule ${idx}:`, {
                                    hospital: hs.hospital,
                                    scheduleLength: hs.schedule?.length || 0,
                                    matches: hs.hospital?.trim().toLowerCase() === hospitalName?.trim().toLowerCase()
                                  });
                                });
                              }
                              
                              const hospitalSchedule = booking.doctor?.hospitalSchedules?.find(
                                hs => hs.hospital?.trim().toLowerCase() === hospitalName?.trim().toLowerCase()
                              );
                              console.log('Found hospital schedule:', hospitalSchedule);
                              
                              if (hospitalSchedule?.schedule) {
                                const activeDays = hospitalSchedule.schedule.filter(s => s.active).map(s => s.day);
                                console.log('Active days from hospital schedule:', activeDays);
                                return activeDays;
                              }
                              
                              // Fall back to general schedule or availableDays
                              console.log('Falling back to schedule or availableDays');
                              console.log('Doctor schedule:', booking.doctor?.schedule);
                              console.log('Doctor availableDays:', booking.doctor?.availableDays);
                              
                              const fallback = booking.doctor?.schedule?.filter(s => s.active).map(s => s.day) || 
                                     booking.doctor?.availableDays || [];
                              console.log('Using fallback days:', fallback);
                              return fallback;
                            })();
                            console.log('Doctor available days:', doctorAvailableDays);
                            console.log('Checking if', fullDayName, 'is available');
                            
                            // Check if date is in the past (before today)
                            const isPastDate = date < today && !isToday;
                            console.log('Is past date:', isPastDate);
                            
                            // Check if doctor works on this day
                            const doctorWorksThisDay = doctorAvailableDays.includes(fullDayName);
                            
                            // Date is clickable if it's not in the past (even if doctor doesn't work)
                            const isClickable = !isPastDate;
                            
                            // Date is "available" (has slots) only if doctor works AND not past
                            const isAvailable = doctorWorksThisDay && !isPastDate;
                            console.log('Is available:', isAvailable);
                            console.log('Is clickable:', isClickable);
                            
                            return (
                              <div
                                key={index}
                                className={`date-box ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => {
                                  if (isClickable) {
                                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    handleDateSelect({
                                      day: dayName,
                                      date: dateNum,
                                      month: monthNames[date.getMonth()],
                                      full: dateStr,
                                      dayName: fullDayName
                                    });
                                  }
                                }}
                              >
                                <span className="date-day">{dayName}</span>
                                <span className="date-num">{dateNum}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="selection-section">
                      <h3>Select Time</h3>
                      {!booking.date ? (
                        <div className="empty-state">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          <p>Please select a date first</p>
                        </div>
                      ) : loadingSlots ? (
                        <div className="loading-state">
                          <div className="spinner"></div>
                          <p>Loading available times...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="empty-state">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <p>Doctor not available on this date</p>
                          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                            Please select another date
                          </p>
                        </div>
                      ) : (
                          <div className="time-slots-grouped">
                            {(() => {
                              // Group slots by time of day
                              const morning = []; // 5 AM - 11:59 AM
                              const afternoon = []; // 12 PM - 4:59 PM
                              const evening = []; // 5 PM onwards
                              
                              availableSlots.forEach((slot, originalIndex) => {
                                const [hours] = slot.split(':');
                                const hour = parseInt(hours);
                                
                                if (hour >= 5 && hour < 12) {
                                  morning.push({ slot, originalIndex });
                                } else if (hour >= 12 && hour < 17) {
                                  afternoon.push({ slot, originalIndex });
                                } else {
                                  evening.push({ slot, originalIndex });
                                }
                              });
                              
                              return (
                                <>
                                  {morning.length > 0 && (
                                    <div className="time-slot-group">
                                      <h4 className="time-group-heading">Morning</h4>
                                      <div className="time-slots">
                                        {morning.map(({ slot, originalIndex }) => {
                                          const [hours, minutes] = slot.split(':');
                                          const hour = parseInt(hours);
                                          const ampm = hour >= 12 ? 'PM' : 'AM';
                                          const hour12 = hour % 12 || 12;
                                          const formattedTime = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
                                          const tokenNumber = originalIndex + 1;
                                          
                                          return (
                                            <button
                                              key={slot}
                                              type="button"
                                              className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                                              onClick={() => {
                                                // Check if user is logged in
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                  // Save current booking state to resume after login
                                                  const bookingState = {
                                                    doctor: booking.doctor,
                                                    date: booking.date,
                                                    slot: slot,
                                                    tokenNumber: originalIndex + 1
                                                  };
                                                  sessionStorage.setItem('pendingBooking', JSON.stringify(bookingState));
                                                  
                                                  // Redirect to login with return URL
                                                  navigate('/login?redirect=/book-appointment');
                                                  return;
                                                }
                                                
                                                // User is logged in, proceed with slot selection
                                                setSelectedSlot(slot);
                                                setBooking(prev => ({ 
                                                  ...prev, 
                                                  appointmentTime: slot,
                                                  tokenNumber: tokenNumber
                                                }));
                                                // Automatically advance to Step 4
                                                setStep(4);
                                              }}
                                            >
                                              {formattedTime}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {afternoon.length > 0 && (
                                    <div className="time-slot-group">
                                      <h4 className="time-group-heading">Afternoon</h4>
                                      <div className="time-slots">
                                        {afternoon.map(({ slot, originalIndex }) => {
                                          const [hours, minutes] = slot.split(':');
                                          const hour = parseInt(hours);
                                          const ampm = hour >= 12 ? 'PM' : 'AM';
                                          const hour12 = hour % 12 || 12;
                                          const formattedTime = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
                                          const tokenNumber = originalIndex + 1;
                                          
                                          return (
                                            <button
                                              key={slot}
                                              type="button"
                                              className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                                              onClick={() => {
                                                // Check if user is logged in
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                  // Save current booking state to resume after login
                                                  const bookingState = {
                                                    doctor: booking.doctor,
                                                    date: booking.date,
                                                    slot: slot,
                                                    tokenNumber: originalIndex + 1
                                                  };
                                                  sessionStorage.setItem('pendingBooking', JSON.stringify(bookingState));
                                                  
                                                  // Redirect to login with return URL
                                                  navigate('/login?redirect=/book-appointment');
                                                  return;
                                                }
                                                
                                                // User is logged in, proceed with slot selection
                                                setSelectedSlot(slot);
                                                setBooking(prev => ({ 
                                                  ...prev, 
                                                  appointmentTime: slot,
                                                  tokenNumber: tokenNumber
                                                }));
                                                // Automatically advance to Step 4
                                                setStep(4);
                                              }}
                                            >
                                              {formattedTime}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {evening.length > 0 && (
                                    <div className="time-slot-group">
                                      <h4 className="time-group-heading">Evening</h4>
                                      <div className="time-slots">
                                        {evening.map(({ slot, originalIndex }) => {
                                          const [hours, minutes] = slot.split(':');
                                          const hour = parseInt(hours);
                                          const ampm = hour >= 12 ? 'PM' : 'AM';
                                          const hour12 = hour % 12 || 12;
                                          const formattedTime = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
                                          const tokenNumber = originalIndex + 1;
                                          
                                          return (
                                            <button
                                              key={slot}
                                              type="button"
                                              className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                                              onClick={() => {
                                                // Check if user is logged in
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                  // Save current booking state to resume after login
                                                  const bookingState = {
                                                    doctor: booking.doctor,
                                                    date: booking.date,
                                                    slot: slot,
                                                    tokenNumber: originalIndex + 1
                                                  };
                                                  sessionStorage.setItem('pendingBooking', JSON.stringify(bookingState));
                                                  
                                                  // Redirect to login with return URL
                                                  navigate('/login?redirect=/book-appointment');
                                                  return;
                                                }
                                                
                                                // User is logged in, proceed with slot selection
                                                setSelectedSlot(slot);
                                                setBooking(prev => ({ 
                                                  ...prev, 
                                                  appointmentTime: slot,
                                                  tokenNumber: tokenNumber
                                                }));
                                                // Automatically advance to Step 4
                                                setStep(4);
                                              }}
                                            >
                                              {formattedTime}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Hide for Step 2 */}
                {step !== 2 && (
                  <div className="booking-actions">
                    {step > (preSelectedDoctor ? 2 : 1) && (
                      <button
                        className="action-btn secondary-btn"
                        onClick={() => setStep(step - 1)}
                      >
                        Go Back
                      </button>
                    )}
                    {step < 4 ? (
                      <button
                        className="action-btn primary-btn"
                        disabled={!canProceed()}
                        onClick={() => setStep(step + 1)}
                      >
                        Continue
                      </button>
                    ) : step === 5 ? (
                      <button className="action-btn primary-btn" onClick={handleBooking}>
                        Pay Rs. {booking.doctor?.fee || 0} & Confirm
                      </button>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {/* Step 4: Verify Patient / Select Dependent */}
            {step === 4 && (
              <div className="step4-container">
                <div className="step4-layout">
                  {/* LEFT COLUMN */}
                  <div className="step4-left">
                    {/* Doctor Information Card */}
                    <div className="step4-doctor-card">
                      <div className="step4-doctor-header">
                        <div className="step4-doctor-avatar">
                          {booking.doctor?.profilePhoto ? (
                            <img 
                              src={`http://localhost:5001/${booking.doctor.profilePhoto.replace(/\\/g, '/').replace(/^backend\//, '')}`}
                              alt={booking.doctor.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="step4-avatar-fallback"
                            style={{ display: booking.doctor?.profilePhoto ? 'none' : 'flex' }}
                          >
                            {booking.doctor?.name?.split(' ')[1]?.[0] || 'D'}
                          </div>
                        </div>
                        <div className="step4-doctor-info">
                          <h3>{booking.doctor?.name}</h3>
                          <p className="step4-specialty">{booking.doctor?.specialty}</p>
                          <p className="step4-detail">Experience: {booking.doctor?.experience || 'N/A'}</p>
                          <p className="step4-detail">NMC Number: {booking.doctor?.nmcNumber || 'N/A'}</p>
                          <p className="step4-detail">Qualification: {booking.doctor?.qualification || 'N/A'}</p>
                        </div>
                      </div>
                      <p className="step4-hospital">
                        Currently Practice at: {
                          (Array.isArray(booking.doctor?.hospital) 
                            ? booking.doctor.hospital[0] 
                            : booking.doctor?.hospital) || 
                          (Array.isArray(booking.doctor?.currentHospital) 
                            ? booking.doctor.currentHospital[0] 
                            : booking.doctor?.currentHospital) || 'Not specified'
                        }
                      </p>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="step4-booking-grid">
                      <div className="step4-grid-item">
                        <div className="step4-grid-label">Date</div>
                        <div className="step4-grid-value">
                          {booking.date ? 
                            `${booking.date.month} ${booking.date.date}, ${new Date().getFullYear()}` : 
                            'Not selected'
                          }
                        </div>
                        <div className="step4-grid-subvalue">
                          {booking.date?.dayName || ''}
                        </div>
                      </div>
                      
                      <div className="step4-grid-item">
                        <div className="step4-grid-label">Consultation Time</div>
                        <div className="step4-grid-value">
                          {selectedSlot ? (() => {
                            const [hours, minutes] = selectedSlot.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const hour12 = hour % 12 || 12;
                            return `${hour12}:${minutes} ${ampm}`;
                          })() : 'Not selected'}
                        </div>
                      </div>
                      
                      <div className="step4-grid-item">
                        <div className="step4-grid-label">Consultation Fee</div>
                        <div className="step4-grid-value">Rs. {booking.doctor?.fee || booking.doctor?.consultationFee || 0}</div>
                      </div>
                      
                      <div className="step4-grid-item">
                        <div className="step4-grid-label">Token No:</div>
                        <div className="step4-grid-value">#{booking.tokenNumber || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="step4-right">
                    <div className="step4-dependent-section">
                      <div className="step4-dependent-header">
                        <div>
                          <h2>Who will be seeing the doctor?</h2>
                          <p>Select the Dependent</p>
                        </div>
                        <input
                          type="text"
                          placeholder="Search Dependents"
                          value={dependentSearch}
                          onChange={(e) => setDependentSearch(e.target.value)}
                          className="step4-search-input"
                        />
                      </div>

                      {/* Self Card */}
                      {patientInfo ? (
                        <div 
                          className={`step4-dependent-card ${selectedDependent === 'self' ? 'selected' : ''}`}
                          onClick={() => setSelectedDependent('self')}
                        >
                          <div className="step4-dependent-avatar">
                            {patientInfo.firstName?.[0] || 'P'}
                          </div>
                          <div className="step4-dependent-info">
                            <h4>{patientInfo.firstName} {patientInfo.lastName}</h4>
                            <p>{patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                            <span className="step4-self-badge">Self</span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`step4-dependent-card ${selectedDependent === 'self' ? 'selected' : ''}`}
                          onClick={() => setSelectedDependent('self')}
                        >
                          <div className="step4-dependent-avatar">
                            {(() => {
                              const userData = JSON.parse(localStorage.getItem('user') || '{}');
                              return userData.firstName?.[0] || 'P';
                            })()}
                          </div>
                          <div className="step4-dependent-info">
                            <h4>
                              {(() => {
                                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Patient';
                              })()}
                            </h4>
                            <p>Loading...</p>
                            <span className="step4-self-badge">Self</span>
                          </div>
                        </div>
                      )}

                      {/* Add New Dependent Button */}
                      <button 
                        className="step4-add-dependent-btn"
                        onClick={() => setShowAddDependentModal(true)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add new Dependent
                      </button>
                    </div>

                    {/* Continue Button */}
                    <button 
                      className="step4-continue-btn"
                      disabled={!selectedDependent}
                      onClick={() => setStep(5)}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
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
                    <span className="label">Appointment Time</span>
                    <span className="value">
                      {selectedSlot ? (() => {
                        const [hours, minutes] = selectedSlot.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${minutes} ${ampm}`;
                      })() : 'Not selected'}
                    </span>
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
                      onClick={() => setBooking(prev => ({ ...prev, paymentMethod: 'esewa' }))}
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

                {/* Action Buttons */}
                <div className="booking-actions">
                  <button
                    className="action-btn secondary-btn"
                    onClick={() => setStep(step - 1)}
                  >
                    Go Back
                  </button>
                  <button className="action-btn primary-btn" onClick={handleBooking}>
                    Pay Rs. {booking.doctor?.fee || 0} & Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Dependent Modal */}
      {showAddDependentModal && (
        <div className="modal-overlay" onClick={() => setShowAddDependentModal(false)}>
          <div className="add-dependent-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Patient</h2>
            
            <form className="dependent-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    value={newDependent.firstName}
                    onChange={(e) => setNewDependent({...newDependent, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={newDependent.lastName}
                    onChange={(e) => setNewDependent({...newDependent, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age <span className="required">*</span></label>
                  <input
                    type="number"
                    placeholder="Enter Age"
                    value={newDependent.age}
                    onChange={(e) => setNewDependent({...newDependent, age: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Age Type</label>
                  <select
                    value={newDependent.ageType}
                    onChange={(e) => setNewDependent({...newDependent, ageType: e.target.value})}
                  >
                    <option value="Year">Year</option>
                    <option value="Month">Month</option>
                    <option value="Day">Day</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth (AD)</label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={newDependent.dobAD}
                    onChange={(e) => setNewDependent({...newDependent, dobAD: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth (BS)</label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={newDependent.dobBS}
                    onChange={(e) => setNewDependent({...newDependent, dobBS: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newDependent.isRealDOB}
                    onChange={(e) => setNewDependent({...newDependent, isRealDOB: e.target.checked})}
                  />
                  Is real DOB?
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your Phone Number"
                    value={newDependent.phone}
                    onChange={(e) => setNewDependent({...newDependent, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your Email Address"
                    value={newDependent.email}
                    onChange={(e) => setNewDependent({...newDependent, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender <span className="required">*</span></label>
                  <select
                    value={newDependent.gender}
                    onChange={(e) => setNewDependent({...newDependent, gender: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Relationship <span className="required">*</span></label>
                  <select
                    value={newDependent.relationship}
                    onChange={(e) => setNewDependent({...newDependent, relationship: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Select District <span className="required">*</span></label>
                  <select
                    value={newDependent.district}
                    onChange={(e) => setNewDependent({...newDependent, district: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select VDC/Municipality <span className="required">*</span></label>
                  <select
                    value={newDependent.vdcMunicipality}
                    onChange={(e) => setNewDependent({...newDependent, vdcMunicipality: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Municipality 1">Municipality 1</option>
                    <option value="Municipality 2">Municipality 2</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ward</label>
                  <input
                    type="text"
                    placeholder="Enter Ward"
                    value={newDependent.ward}
                    onChange={(e) => setNewDependent({...newDependent, ward: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    value={newDependent.address}
                    onChange={(e) => setNewDependent({...newDependent, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddDependentModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn-add-dependent"
                  onClick={() => {
                    // Handle add dependent logic here
                    console.log('Adding dependent:', newDependent);
                    setShowAddDependentModal(false);
                  }}
                >
                  Add Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
