import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import AuthPage from './components/Auth/AuthPage';
import RoleSelect from './components/Auth/RoleSelect';
import Home from './components/Home/Home';
import BookAppointment from './components/Booking/BookAppointment';
import BookingConfirmed from './components/Booking/BookingConfirmed';
import MyAppointments from './components/Appointments/MyAppointments';
import SelectDoctor from './components/Doctors/SelectDoctor';
import HospitalAppointments from './components/Hospitals/HospitalAppointments';
import DoctorProfile from './components/Doctors/DoctorProfile';
import MedicalRecords from './components/MedicalRecords/MedicalRecords';
import DoctorDashboard from './components/DoctorDashboard/DoctorDashboard';
import DoctorAppointments from './components/DoctorDashboard/DoctorAppointments';
import DoctorPatients from './components/DoctorDashboard/DoctorPatients';
import DoctorSchedule from './components/DoctorDashboard/DoctorSchedule';
import Profile from './components/Profile/Profile';
import ForgotPassword from './components/Auth/ForgotPassword';
import VerifyOTP from './components/Auth/VerifyOTP';
import VerifyEmail from './components/Auth/VerifyEmail';
import NIDRegistration from './components/Auth/NIDRegistration';
import AccountPending from './components/Auth/AccountPending';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import PersonalInfo from './components/Auth/PatientRegistration/PersonalInfo';
import AddressInfo from './components/Auth/PatientRegistration/AddressInfo';
import EmergencyContact from './components/Auth/PatientRegistration/EmergencyContact';
import MedicalInfo from './components/Auth/PatientRegistration/MedicalInfo';
import NIDVerification from './components/Auth/PatientRegistration/NIDVerification';
import DoctorPersonalInfo from './components/Auth/DoctorRegistration/PersonalInfo';
import ProfessionalInfo from './components/Auth/DoctorRegistration/ProfessionalInfo';
import Documents from './components/Auth/DoctorRegistration/Documents';
import DoctorNIDVerification from './components/Auth/DoctorRegistration/NIDVerification';
import Navbar from './components/Navbar/Navbar';
import DoctorAuth from './components/Auth/DoctorAuth';
import Footer from './components/Footer/Footer';
import './App.css';

// ── Guards ──────────────────────────────────────────
const isLoggedIn = () => !!localStorage.getItem('token');
const getRole = () => localStorage.getItem('userRole');

/** Redirect to login, preserving the intended URL */
const PatientRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (!token || role !== 'patient') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
};

/** Doctor-only routes */
const DoctorRoute = ({ children }) => {
  if (!isLoggedIn() || getRole() !== 'doctor') {
    return <Navigate to="/doctor-auth" replace />;
  }
  return children;
};

/** Admin-only routes */
const AdminRoute = ({ children }) => {
  if (!isLoggedIn() || getRole() !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/doctor-auth" element={<DoctorAuth />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/select-role" element={<RoleSelect />} />
          <Route path="/nid-registration" element={<NIDRegistration />} />
          <Route path="/account-pending" element={<AccountPending />} />
          {/* Patient Registration Steps */}
          <Route path="/register/personal" element={<PersonalInfo />} />
          <Route path="/register/address" element={<AddressInfo />} />
          <Route path="/register/emergency" element={<EmergencyContact />} />
          <Route path="/register/medical" element={<MedicalInfo />} />
          <Route path="/register/nid" element={<NIDVerification />} />
          {/* Doctor Registration Steps */}
          <Route path="/doctor-register/personal" element={<DoctorPersonalInfo />} />
          <Route path="/doctor-register/professional" element={<ProfessionalInfo />} />
          <Route path="/doctor-register/documents" element={<Documents />} />
          <Route path="/doctor-register/nid" element={<DoctorNIDVerification />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/book-appointment" element={<PatientRoute><BookAppointment /></PatientRoute>} />
          <Route path="/booking-confirmed" element={<PatientRoute><BookingConfirmed /></PatientRoute>} />
          <Route path="/my-appointments" element={<PatientRoute><MyAppointments /></PatientRoute>} />
          <Route path="/find-doctors" element={<SelectDoctor />} />
          <Route path="/hospitals" element={<HospitalAppointments />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/medical-records" element={<PatientRoute><MedicalRecords /></PatientRoute>} />
          <Route path="/doctor-dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
          <Route path="/doctor-appointments" element={<DoctorRoute><DoctorAppointments /></DoctorRoute>} />
          <Route path="/doctor-patients" element={<DoctorRoute><DoctorPatients /></DoctorRoute>} />
          <Route path="/doctor-schedule" element={<DoctorRoute><DoctorSchedule /></DoctorRoute>} />
          <Route path="/profile" element={<PatientRoute><Profile /></PatientRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
