import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="HealthMandala" className="logo-img" />
          <span>HealthMandala</span>
        </Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-buttons">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

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
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
              <a href="#how-it-works" className="btn btn-outline">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration"> 
              <img src="/logo.png" alt="HealthMandala" style={{ width: '280px', height: 'auto' }} />
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
            <div className="feature-icon">1</div>
            <h3>Easy Scheduling</h3>
            <p>Book appointments 24/7 with just a few taps. No more waiting on hold.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">2</div>
            <h3>Verified Doctors</h3>
            <p>All our doctors are verified professionals with proven track records.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">3</div>
            <h3>Smart Reminders</h3>
            <p>Never miss an appointment with our automated reminder system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">4</div>
            <h3>Mobile Friendly</h3>
            <p>Access your health dashboard from any device, anywhere.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">5</div>
            <h3>Secure & Private</h3>
            <p>Your health data is encrypted and protected with industry standards.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">6</div>
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
            <div className="step-number">1</div>
            <h3>Search Doctor</h3>
            <p>Find doctors by specialty, location, or name</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose Time</h3>
            <p>Select a convenient time slot from available options</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Confirm Booking</h3>
            <p>Confirm your appointment and receive instant confirmation</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Verified Doctors</p>
          </div>
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Happy Patients</p>
          </div>
          <div className="stat-item">
            <h3>100+</h3>
            <p>Specialties</p>
          </div>
          <div className="stat-item">
            <h3>4.9</h3>
            <p>User Rating</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Take Control of Your Health?</h2>
        <p>Join thousands of patients who trust HealthMandala for their healthcare needs</p>
        <Link to="/signup" className="btn btn-primary">Book Your First Appointment</Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>HealthMandala</h4>
            <p>Making healthcare accessible and convenient for everyone.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link to="/login">Find Doctors</Link></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@healthmandala.com">Help Center</a></li>
              <li><a href="mailto:support@healthmandala.com">Contact Us</a></li>
              <li><a href="#features">FAQs</a></li>
              <li><a href="#about">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>support@healthmandala.com</li>
              <li>1-800-HEALTH</li>
              <li>Healthcare City, HC 12345</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 HealthMandala. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
