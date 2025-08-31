import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ConferenceProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // While auth is still loading, you could show a spinner
  if (loading) return null;

  // If not logged in, kick to login page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If logged in but not a participant, kick to home page
  if (!user.isConferenceParticipant && !user.is_conference_participant) {
    return <Navigate to="/" replace />;
  }

  // Otherwise render the protected page
  return <>{children}</>;
};

export default ConferenceProtectedRoute;
