import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, Users, Clock, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { conferenceApiClient } from '@/lib/conference-api-client'; // Import the new API client
import './SpeakersPage.css';

// This helper function now correctly handles URL encoding for filenames with spaces
const getImageUrl = (imageName: string) => {
    // encodeURIComponent is used to safely encode special characters like spaces
    const encodedName = encodeURIComponent(imageName);
    return `/images/speakers/${encodedName}`;
};

// Interface to match the API response for speakers
interface Speaker {
  id: number;
  name: string;
  title: string;
  country: string;
  photo_url: string; // The database stores the filename, this maps to a URL
  bio: string;
  linkedin_url: string;
  twitter_url: string;
}

// This is the new component for the speaker detail view
const SpeakerDetailView = ({ speaker, onBack }) => (
  <div className="speaker-detail-view">
    <Button onClick={onBack} variant="ghost" size="icon" className="speakers-page-back-button">
      <ArrowLeft />
    </Button>
    <h1 className="speaker-detail-title">About the Speaker</h1>
    {/* Use getImageUrl helper to construct the full URL */}
    <img src={getImageUrl(speaker.photo_url)} alt={speaker.name} className="speaker-detail-photo" />
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

  // You will likely have a way to get the conference ID, e.g., from a URL parameter or global state
  const conferenceId = '1'; // Placeholder conference ID

  useEffect(() => {
    fetchSpeakers(conferenceId);
  }, [conferenceId]);

  const fetchSpeakers = async (confId: string) => {
    setLoading(true);
    try {
        const data = await conferenceApiClient.getSpeakersByConferenceId(confId);
        setSpeakers(data);
    } catch (error) {
        console.error("Failed to fetch speakers:", error);
        toast.error("Failed to load speakers.");
    } finally {
        setLoading(false);
    }
  };

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
            <button className="menu-button" onClick={() => handleNavAndClose('/')}>
                                      Challenges
                        </button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="speakers-page-header">
        {/* Back button stays absolute on the left */}


        {/* Real logo, same as other pages */}
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
          <SpeakerDetailView speaker={selectedSpeaker} onBack={() => setSelectedSpeaker(null)} />
        ) : (
          <>
            <h1 className="speakers-title">Workshops</h1>
            <div className="speakers-list">
              {speakers.map((speaker) => (
                <button
                  key={speaker.id}
                  className="speaker-card"
                  onClick={() => setSelectedSpeaker(speaker)}
                >
                  <img src={getImageUrl(speaker.photo_url)} alt={speaker.name} className="speaker-photo" />
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

export default SpeakersPage;
