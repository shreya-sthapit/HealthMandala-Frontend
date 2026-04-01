import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import RoleSelect from './components/Auth/RoleSelect';
import Home from './components/Home/Home';
import BookAppointment from './components/Booking/BookAppointment';
import BookingConfirmed from './components/Booking/BookingConfirmed';
import MyAppointments from './components/Appointments/MyAppointments';
import FindDoctors from './components/Doctors/FindDoctors';
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
import Availability from './components/Auth/DoctorRegistration/Availability';
import Documents from './components/Auth/DoctorRegistration/Documents';
import DoctorNIDVerification from './components/Auth/DoctorRegistration/NIDVerification';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
          <Route path="/home" element={<Home />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/booking-confirmed" element={<BookingConfirmed />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-patients" element={<DoctorPatients />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
