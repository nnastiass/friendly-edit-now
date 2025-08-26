import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, Users, Clock, X, ArrowLeft } from 'lucide-react';
import './SpeakersPage.css';

// Placeholder data that matches your 'Speakers' database table
const speakersData = [
  { id: 1, name: 'Tariq King', title: 'CEO and Head of Test IO', country: 'Germany', photo_url: 'https://placehold.co/200x200/808080/FFFFFF?text=', bio: 'Tariq King is a recognized thought-leader in software quality engineering...' },
  { id: 2, name: 'Jane Doe', title: 'Lead QA Engineer', country: 'USA', photo_url: 'https://placehold.co/200x200/808080/FFFFFF?text=', bio: 'Jane Doe is an expert in test automation and agile methodologies...' },
  { id: 3, name: 'John Smith', title: 'Security Specialist', country: 'Canada', photo_url: 'https://placehold.co/200x200/808080/FFFFFF?text=', bio: 'John Smith focuses on penetration testing and application security...' },
  { id: 4, name: 'Emily Jones', title: 'Performance Engineer', country: 'UK', photo_url: 'https://placehold.co/200x200/808080/FFFFFF?text=', bio: 'Emily Jones specializes in load testing and performance optimization...' },
];

// This is the new component for the speaker detail view
// This is the new component for the speaker detail view
const SpeakerDetailView = ({ speaker, onBack }) => (
  <div className="speaker-detail-view">

    {/* ADD THIS WRAPPER FOR THE TITLE AND NEW BUTTON */}
    <div className="speaker-detail-header">
<Button onClick={onBack} variant="ghost" size="icon" className="speaker-detail-back-button">
    <ArrowLeft strokeWidth={3} size={36} />
</Button>
      <h1 className="speaker-detail-title">About the Speaker</h1>
    </div>

    <img src={speaker.photo_url} alt={speaker.name} className="speaker-detail-photo" />
    <h2 className="speaker-detail-name">{speaker.name}</h2>
    <p className="speaker-detail-job-title">{speaker.title}</p>
    <p className="speaker-detail-bio">{speaker.bio}</p>
  </div>
);


const SpeakersPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  const handleMenuClose = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
    }, 400);
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
  };

  const handleBack = () => {
      if (selectedSpeaker) {
          setSelectedSpeaker(null);
      } else {
          navigate(-1);
      }
  }

  return (
    <div className="speakers-page-container">
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={`speakers-page-mobile-menu ${isMenuClosing ? 'closing' : ''}`}>
          <nav className="menu-nav">
            <button className="menu-button" onClick={() => handleNavAndClose('/info')}>Home</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/program')}>Program</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/speakers')}>Speakers</button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="speakers-page-header">

        <div className="logo-placeholder">
          <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="20" fontFamily="Arial, sans-serif" fontSize="16" fill="white">Your Logo</text>
          </svg>
        </div>
<Button variant="ghost" size="icon" onClick={handleMenuToggle} className="menu-toggle-button">
    <div className={`menu-icon-wrapper ${isMenuOpen ? 'open' : ''}`}>
        <Menu className="menu-hamburger-icon" strokeWidth={3} />
        <X className="menu-close-icon" strokeWidth={3} />
    </div>
</Button>
      </header>

      {/* Main Content */}
      <div className="speakers-page-main-content">
        {selectedSpeaker ? (
          <SpeakerDetailView speaker={selectedSpeaker} onBack={() => setSelectedSpeaker(null)} />
        ) : (
          <>
            <h1 className="speakers-title">Workshops</h1>
            <div className="speakers-list">
              {speakersData.map((speaker) => (
                <button
                  key={speaker.id}
                  className="speaker-card"
                  onClick={() => setSelectedSpeaker(speaker)}
                >
                  <img src={speaker.photo_url} alt={speaker.name} className="speaker-photo" />
                  <div className="speaker-info">
                    <div className="speaker-name-card">{speaker.name}</div>
                    <div className="speaker-country-card">{speaker.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="speakers-page-bottom-nav">
        <div className="speakers-page-nav-container">
          <button className="speakers-page-nav-button" onClick={() => navigate('/info')}>
            <Home className="speakers-page-nav-icon" />
          </button>
          <button className="speakers-page-nav-button speakers-page-nav-button-active">
            <Info className="speakers-page-nav-icon" />
          </button>
          <button className="speakers-page-nav-button" onClick={() => navigate('/')}>
            <Plus className="speakers-page-nav-icon" />
          </button>
          <button className="speakers-page-nav-button" onClick={() => navigate('/profile')}>
            <User className="speakers-page-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakersPage;
