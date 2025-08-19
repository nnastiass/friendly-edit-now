import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, X } from 'lucide-react';
import './InfoPage.css';

const InfoPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false); // State to handle closing animation

  const handleMenuClose = () => {
    setIsMenuClosing(true);
    // Wait for the animation to finish before removing the menu
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
    }, 400); // This duration must match the CSS animation
  };

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const handleNavAndClose = (path: string) => {
      navigate(path);
      handleMenuClose();
  }

  return (
    <div className="info-page-container">
      {/* --- UPDATED MOBILE MENU OVERLAY --- */}
      {isMenuOpen && (
        <div className={`info-page-mobile-menu ${isMenuClosing ? 'closing' : ''}`}>
          <Button variant="ghost" size="icon" className="menu-close-button" onClick={handleMenuClose}>
            <X className="h-8 w-8 text-white" />
          </Button>
          <nav className="menu-nav">
            <button className="menu-button" onClick={() => handleNavAndClose('/info')}>Home</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/program')}>Program</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/speakers')}>Speakers</button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="info-page-header">
        <div className="logo-placeholder">
          <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="20" fontFamily="Arial, sans-serif" fontSize="16" fill="white">Your Logo</text>
          </svg>
        </div>
        <Button variant="ghost" size="icon" onClick={handleMenuOpen}>
          <Menu className="text-white" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="info-page-main-content">
        <div className="info-hero-section">
          <img
            src="https://placehold.co/600x400/000000/FFFFFF?text=Conference+Image"
            alt="Conference"
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1 className="hero-title">YOUR CONFERENCE 2025</h1>
          </div>
        </div>
        <div className="info-about-section">
          <h2 className="about-title">About Your Conference</h2>
          <p className="about-text">
            This is where the main content about your conference will go. You can describe the theme, the purpose, and what attendees can expect. This text is a placeholder.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="info-page-bottom-nav">
        <div className="info-page-nav-container">
          <button className="info-page-nav-button info-page-nav-button-inactive" onClick={() => { /* TODO */ }}>
            <Home className="info-page-nav-icon" />
          </button>
          <button className="info-page-nav-button info-page-nav-button-active">
            <Info className="info-page-nav-icon" />
          </button>
          <button className="info-page-nav-button info-page-nav-button-inactive" onClick={() => navigate('/')}>
            <Plus className="info-page-nav-icon" />
          </button>
          <button className="info-page-nav-button info-page-nav-button-inactive" onClick={() => navigate('/profile')}>
            <User className="info-page-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
