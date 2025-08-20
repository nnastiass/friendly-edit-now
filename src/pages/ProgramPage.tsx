import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, Users, Clock, X } from 'lucide-react'; // Added Menu and X
import './ProgramPage.css';

// Placeholder data that matches your 'Schedule' database table
const scheduleData = {
  day1: [
    { time: '8:00 AM - 9:00 AM', title: 'REGISTRATION & BREAKFAST', icon: <Users /> },
    { time: '9:00 AM - 10:00 AM', title: 'OPENING KEYNOTE', icon: <Clock /> },
    { time: '10:00 AM - 11:00 AM', title: 'SESSION A: AI IN TESTING', icon: <Clock /> },
    { time: '11:00 AM - 12:00 PM', title: 'SESSION B: AUTOMATION', icon: <Clock /> },
  ],
  day2: [
    { time: '8:30 AM - 9:30 AM', title: 'MORNING COFFEE', icon: <Users /> },
    { time: '9:30 AM - 10:30 AM', title: 'SESSION C: SECURITY TESTING', icon: <Clock /> },
    { time: '10:30 AM - 11:30 AM', title: 'SESSION D: AGILE QA', icon: <Clock /> },
    { time: '11:30 AM - 12:30 PM', title: 'CLOSING REMARKS', icon: <Clock /> },
  ],
};

const ProgramPage = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false); // State to handle closing animation

  const handleMenuClose = () => {
    setIsMenuClosing(true);
    // Wait for the animation to finish before removing the menu from the DOM
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
    }, 400); // This should match the animation duration in the CSS
  };

  const handleMenuToggle = () => {
      if (isMenuOpen) {
          handleMenuClose();
      } else {
          setIsMenuOpen(true);
      }
  }

  const handleNavAndClose = (path: string) => {
      navigate(path);
      handleMenuClose();
  }

  return (
    <div className="program-page-container">
      {/* --- UPDATED MOBILE MENU OVERLAY --- */}
      {isMenuOpen && (
        <div className={`program-page-mobile-menu ${isMenuClosing ? 'closing' : ''}`}>
          <nav className="menu-nav">
            <button className="menu-button" onClick={() => handleNavAndClose('/info')}>Home</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/program')}>Program</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/speakers')}>Speakers</button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="program-page-header">
        <div className="logo-placeholder">
          <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="20" fontFamily="Arial, sans-serif" fontSize="16" fill="white">Your Logo</text>
          </svg>
        </div>
        <Button variant="ghost" size="icon" onClick={handleMenuToggle} className="menu-toggle-button">
            <div className={`menu-icon-wrapper ${isMenuOpen ? 'open' : ''}`}>
                <Menu className="menu-hamburger-icon" />
                <X className="menu-close-icon" />
            </div>
        </Button>
      </header>

      {/* Main Content */}
      <div className="program-page-main-content">
        <h1 className="program-title">Conference Program 2025</h1>
        <p className="program-subtitle">Conference Day</p>

        <div className="day-toggle-buttons">
          <Button
            className={`day-button ${activeDay === 'day1' ? 'active' : ''}`}
            onClick={() => setActiveDay('day1')}
          >
            Day 1
          </Button>
          <Button
            className={`day-button ${activeDay === 'day2' ? 'active' : ''}`}
            onClick={() => setActiveDay('day2')}
          >
            Day 2
          </Button>
        </div>

        <div className="schedule-list">
          {scheduleData[activeDay].map((item, index) => (
            <div key={index} className="schedule-item-card">
              <div className="schedule-icon-container">
                {item.icon}
                <span className="schedule-time">{item.time}</span>
              </div>
              <div className="schedule-title-container">
                <p className="schedule-title">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="program-page-bottom-nav">
        <div className="program-page-nav-container">
          <button className="program-page-nav-button" onClick={() => navigate('/info')}>
            <Home className="program-page-nav-icon" />
          </button>
          <button className="program-page-nav-button program-page-nav-button-active">
            <Info className="program-page-nav-icon" />
          </button>
          <button className="program-page-nav-button" onClick={() => navigate('/')}>
            <Plus className="program-page-nav-icon" />
          </button>
          <button className="program-page-nav-button" onClick={() => navigate('/profile')}>
            <User className="program-page-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramPage;
