import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // AuthProvider + useAuth
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FriendProfile from "./pages/FriendProfile"; // Import the new component
import NotFound from "./pages/NotFound";
import AddFriends from "./pages/AddFriends";
import FriendsList from "./pages/FriendsList";
import FriendRequests from "./pages/FriendRequests";
import Feed from "./pages/Feed";
import InfoPage from "./pages/InfoPage";
import ProgramPage from "./pages/ProgramPage";
import SpeakersPage from "./pages/SpeakersPage";

const queryClient = new QueryClient();

// --- ProtectedRoute wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // you can replace this with a fancy spinner
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/speakers" element={<SpeakersPage />} />

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
            {/* NEW: Route for friend's profile page */}
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

export default App;
