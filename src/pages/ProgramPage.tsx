import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, Users, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { conferenceApiClient } from '@/lib/conference-api-client'; // Import the new API client
import './ProgramPage.css';

// Interface to match the API response for schedule entries
interface ScheduleEntry {
  id: number;
  day: number;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  session_type: string;
  speaker_id: number;
  conference_id: number;
  speaker_name: string; // The speaker's name from the JOIN in your API
}

const ProgramPage = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // You will likely have a way to get the conference ID, e.g., from a URL parameter or global state
  const conferenceId = '1'; // Placeholder conference ID

  useEffect(() => {
    fetchSchedule(conferenceId);
  }, [conferenceId]);

  const fetchSchedule = async (confId: string) => {
    setLoading(true);
    try {
        const data = await conferenceApiClient.getScheduleByConferenceId(confId);
        setSchedule(data);
    } catch (error) {
        console.error("Failed to fetch schedule:", error);
        toast.error("Failed to load schedule.");
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
  }

  // Filter schedule for the active day
  const filteredSchedule = schedule.filter(entry => entry.day === activeDay);

  return (
    <div className="program-page-container">
      {/* Mobile Menu Overlay */}
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
            className={`day-button ${activeDay === 1 ? 'active' : ''}`}
            onClick={() => setActiveDay(1)}
          >
            Day 1
          </Button>
          <Button
            className={`day-button ${activeDay === 2 ? 'active' : ''}`}
            onClick={() => setActiveDay(2)}
          >
            Day 2
          </Button>
        </div>

        {loading ? (
            <p className="loading-text">Loading schedule...</p>
        ) : filteredSchedule.length > 0 ? (
          <div className="schedule-list">
            {filteredSchedule.map((item) => (
              <div key={item.id} className="schedule-item-card">
                <div className="schedule-icon-container">
                  {/* Assuming you want a specific icon for a session type */}
                  {item.session_type === 'talk' ? <Clock /> : <Users />}
                  <span className="schedule-time">{item.start_time} - {item.end_time}</span>
                </div>
                <div className="schedule-title-container">
                  <p className="schedule-title">{item.title}</p>
                  <p className="schedule-speaker-name">with {item.speaker_name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-schedule-text">No schedule entries found for this day.</p>
        )}
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
