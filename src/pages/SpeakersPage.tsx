import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, X, ArrowLeft } from 'lucide-react';
import { conferenceApiClient } from '@/lib/conference-api-client';
import './SpeakersPage.css';

// DELETED: The getImageUrl helper function is no longer needed because the API now provides a full URL.

// Interface to match the API response for speakers
interface Speaker {
  id: number;
  name: string;
  title: string;
  country: string;
  photo_url: string; // This now holds the full URL from MinIO
  bio: string;
  linkedin_url: string;
  twitter_url: string;
}

// This is the component for the speaker detail view
// NOTE: This component was commented out in your original file, but if you use it, it should also be updated.
const SpeakerDetailView: React.FC<{ speaker: Speaker; onBack: () => void }> = ({ speaker, onBack }) => (
  <div className="speaker-detail-view">
    <Button onClick={onBack} variant="ghost" size="icon" className="speakers-page-back-button">
      <ArrowLeft />
    </Button>
    <h1 className="speaker-detail-title">About the Speaker</h1>
    {/* CHANGED: Use speaker.photo_url directly */}
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
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  const conferenceId = '1'; // Placeholder conference ID

  useEffect(() => {
    const fetchSpeakers = async (confId: string) => {
      setLoading(true);
      try {
        const data = await conferenceApiClient.getSpeakersByConferenceId(confId);
        setSpeakers(data);
      } catch (error) {
        console.error('Failed to fetch speakers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers(conferenceId);
  }, [conferenceId]);

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
  };

  const handleNavAndClose = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <div className="speakers-page-container">
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={`speakers-page-mobile-menu ${isMenuClosing ? 'closing' : ''}`}>
          <nav className="menu-nav">
            <button className="menu-button" onClick={() => handleNavAndClose('/info')}>Home</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/program')}>Program</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/speakers')}>Speakers</button>
            <button className="menu-button" onClick={() => handleNavAndClose('/')}>
              Challenges
            </button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="speakers-page-header">
        <div className="logo-placeholder">
          <img
            src="/images/logo/testing united.webp"
            alt="Testing United Logo"
            className="speakers-page-logo"
          />
        </div>

        <Button variant="ghost" size="icon" onClick={handleMenuToggle} className="menu-toggle-button">
          <div className={`menu-icon-wrapper ${isMenuOpen ? 'open' : ''}`}>
            <Menu className="menu-hamburger-icon" />
            <X className="menu-close-icon" />
          </div>
        </Button>
      </header>

      {/* Main Content */}
      <div className="speakers-page-main-content">
        {loading ? (
          <p className="loading-text">Loading speakers...</p>
        ) : selectedSpeaker ? (
          <div className="speaker-detail-view relative">
            <Button onClick={() => setSelectedSpeaker(null)} variant="ghost" size="icon" className="speaker-detail-back-button">
              <ArrowLeft />
            </Button>
            <h1 className="speaker-detail-title">About the Speaker</h1>
            {/* CHANGED: Use selectedSpeaker.photo_url directly */}
            <img src={selectedSpeaker.photo_url} alt={selectedSpeaker.name} className="speaker-detail-photo" />
            <h2 className="speaker-detail-name">{selectedSpeaker.name}</h2>
            <p className="speaker-detail-job-title">{selectedSpeaker.title}</p>
            <p className="speaker-detail-bio">{selectedSpeaker.bio}</p>
          </div>
        ) : (
          <>
            <div className="speakers-list">
              {speakers.map((speaker) => (
                <button
                  key={speaker.id}
                  className="speaker-card"
                  onClick={() => setSelectedSpeaker(speaker)}
                >
                  {/* CHANGED: Use speaker.photo_url directly */}
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
      <div className="info-page-bottom-nav">
        <div className="info-page-nav-container">
          <button
            className="info-page-nav-button info-page-nav-button-inactive"
            onClick={() => navigate('/feed')}
          >
            <Home className="info-page-nav-icon" />
          </button>
          <button
            className="info-page-nav-button info-page-nav-button-active"
            onClick={() => navigate('/info')}
          >
            <span className="index-nav-text">TU</span>
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

export default SpeakersPage;