import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, X } from 'lucide-react';
import './InfoPage.css';

const InfoPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
      }, 400);
    } else {
      setIsMenuOpen(true);
    }
  };

  const handleNavAndClose = (path: string) => {
    navigate(path);
    handleMenuToggle();
  };

  return (
    <div className="info-page-container">
      {/* Header */}
      <header className="info-page-header">
        <div className="logo-placeholder">
          <img
            src="/images/logo/testing united.webp"
            alt="Testing United Logo"
            className="info-page-logo"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuToggle}
          className="menu-toggle-button"
        >
          <div className={`menu-icon-wrapper ${isMenuOpen ? 'open' : ''}`}>
            <Menu className="menu-hamburger-icon" />
            <X className="menu-close-icon" />
          </div>
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className={`info-page-mobile-menu ${isMenuClosing ? 'closing' : ''}`}
        >
          <nav className="menu-nav">
            <button className="menu-button" onClick={() => handleNavAndClose('/info')}>
              Home
            </button>
            <button className="menu-button" onClick={() => handleNavAndClose('/program')}>
              Program
            </button>
            <button className="menu-button" onClick={() => handleNavAndClose('/speakers')}>
              Speakers
            </button>
            <button className="menu-button" onClick={() => handleNavAndClose('/')}>
                          Challenges
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="info-page-main-content">
        <div className="info-hero-section">
          <img
            src="/images/banner/banner.png"
            alt="Conference Banner"
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1 className="hero-title">TESTING UNITED CONFERENCE 2025</h1>
          </div>
        </div>
        <div className="info-about-section">
          <h2 className="about-title">About Testing United</h2>
          <p className="about-text">
            Testing United is a premier conference, organized by Krone Consulting,
            designed for professionals across all levels of the software testing field—
            from testers and test managers to consultants and IT staff who collaborate
            with testing teams daily. This event brings together experts from the wider
            Central European region to share insights and strategies.
            <br /><br />
            This year’s theme, <b>“Getting value from testing beyond 2025”</b> will explore
            the critical changes reshaping the testing community. Renowned speakers will
            guide attendees through the latest trends, ensuring organizations stay competitive
            and efficient.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="info-page-bottom-nav">
        <div className="info-page-nav-container">
          <button
            className="info-page-nav-button info-page-nav-button-inactive"
            onClick={() => navigate('/feed')}
          >
            <Home className="info-page-nav-icon" />
          </button>
          <button className="info-page-nav-button info-page-nav-button-active">
            <Info className="info-page-nav-icon" />
          </button>
          <button
            className="info-page-nav-button info-page-nav-button-inactive"
            onClick={() => navigate('/')}
          >
            <Plus className="info-page-nav-icon" />
          </button>
          <button
            className="info-page-nav-button info-page-nav-button-inactive"
            onClick={() => navigate('/profile')}
          >
            <User className="info-page-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
