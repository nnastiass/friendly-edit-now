import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Info, Menu, Users, Clock, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { conferenceApiClient } from '@/lib/conference-api-client';
import './ProgramPage.css';


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
  speaker_name: string;
}

const ProgramPage = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // You will likely have a way to get the conference ID, e.g., from a URL parameter or global state
  const conferenceId = '123'; // Placeholder conference ID

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

  // Helper function to format time string to hours and minutes
  const formatTime = (timeString: string): string => {
    try {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10) + (period === 'PM' ? 12 : 0));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Failed to parse time string:", timeString, e);
      return timeString;
    }
  };

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
          <img
            src="/images/logo/testing united.webp"
            alt="Testing United Logo"
            className="program-page-logo"
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
                  <span className="schedule-time">{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
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

export default ProgramPage;
