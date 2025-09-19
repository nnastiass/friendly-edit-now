import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, ArrowLeft } from 'lucide-react';
import UserSearch from '@/components/UserSearch'; // UserSearch has been updated
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
        <UserSearch /> {/* This component now uses your API */}
      </div>

      {/* Bottom Navigation */}

    </div>
  );
};

export default AddFriends;
