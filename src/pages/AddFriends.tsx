import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import UserSearch from '@/components/UserSearch';
import './AddFriends.css';

const AddFriends = () => {
  const navigate = useNavigate();

  return (
    <div className="add-friends-container">
      {/* Header */}
      <div className="add-friends-header">
        {/* This is the new back button */}
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="add-friends-back-button">
          <ArrowLeft />
        </Button>
        <h1 className="add-friends-title">Add Friends</h1>
      </div>

      {/* Main Content with User Search */}
      <div className="add-friends-content">
        <UserSearch />
      </div>

      {/* Bottom Navigation */}
      <div className="add-friends-bottom-nav">
        <div className="add-friends-nav-container">
          <button className="add-friends-nav-button add-friends-nav-button-inactive" onClick={() => { /* TODO */ }}>
            <Home className="add-friends-nav-icon" />
          </button>
          {/* The middle button is now the active one on this page */}
          <button className="add-friends-nav-button add-friends-nav-button-active"  onClick={() => navigate('/')}>
            <Plus className="add-friends-nav-icon" />
          </button>
          <button className="add-friends-nav-button add-friends-nav-button-inactive" onClick={() => navigate('/profile')}>
            <User className="add-friends-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriends;
