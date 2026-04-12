import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const { pathname } = useLocation();

  // Hide on dashboard and registration pages
  const hideOn = [
    '/home', '/doctor-dashboard', '/admin',
    '/register', '/doctor-register',
    '/booking-confirmed',
  ];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  return (
    <footer className="global-footer">
      <div className="gf-content">
        <div className="gf-section">
          <h4>HealthMandala</h4>
          <p>Making healthcare accessible and convenient for everyone in Nepal.</p>
        </div>
        <div className="gf-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><Link to="/find-doctors">Find Doctors</Link></li>
            <li><a href="/#about">About Us</a></li>
          </ul>
        </div>
        <div className="gf-section">
          <h4>Support</h4>
          <ul>
            <li><a href="mailto:support@healthmandala.com">Help Center</a></li>
            <li><a href="mailto:support@healthmandala.com">Contact Us</a></li>
            <li><a href="/#features">FAQs</a></li>
            <li><a href="/#about">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="gf-section">
          <h4>Contact</h4>
          <ul>
            <li>healthmandala@gmail.com</li>
            <li>1-800-HEALTH</li>
            <li>Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>
      <div className="gf-bottom">
        <p>&copy; {new Date().getFullYear()} HealthMandala. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
