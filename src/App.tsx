import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { App as CapacitorApp } from "@capacitor/app";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FriendProfile from "./pages/FriendProfile";
import NotFound from "./pages/NotFound";
import AddFriends from "./pages/AddFriends";
import FriendsList from "./pages/FriendsList";
import FriendRequests from "./pages/FriendRequests";
import Feed from "./pages/Feed";
import InfoPage from "./pages/InfoPage";
import ProgramPage from "./pages/ProgramPage";
import SpeakersPage from "./pages/SpeakersPage";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

// --- ProtectedRoute wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

// --- Global Android back button handler using manual history stack ---
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const historyStack = useRef<string[]>([]);

  // Track navigation
  useEffect(() => {
    historyStack.current.push(location.pathname);
  }, [location]);

  // Handle Android back button
  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", () => {
      if (historyStack.current.length > 1) {
        historyStack.current.pop(); // Remove current page
        const previous = historyStack.current[historyStack.current.length - 1];
        navigate(previous, { replace: true }); // Go back to previous page
      } else {
        CapacitorApp.exitApp(); // Exit if at root
      }
    });

    return () => handler.remove();
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BackButtonHandler /> {/* Global back button listener */}
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/signup" element={<Auth />} /> {/* Sign Up page */}
              <Route path="/info" element={<InfoPage />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/speakers" element={<SpeakersPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:friendId"
                element={
                  <ProtectedRoute>
                    <FriendProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-friends"
                element={
                  <ProtectedRoute>
                    <AddFriends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <FriendsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friend-requests"
                element={
                  <ProtectedRoute>
                    <FriendRequests />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
