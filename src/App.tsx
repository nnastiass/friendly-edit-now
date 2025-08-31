import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
// import PrivateRoute from "@/components/PrivateRoute"; // (optional) not used below
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AddFriends from "./pages/AddFriends";
import FriendsList from "./pages/FriendsList";
import FriendRequests from "./pages/FriendRequests";
import InfoPage from "./pages/InfoPage";        // ✅ keep ONE InfoPage import
import ProgramPage from "./pages/ProgramPage";
import SpeakersPage from "./pages/SpeakersPage";
import ConferenceProtectedRoute from "@/components/auth/ConferenceProtectedRoute"; // ✅

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-friends" element={<AddFriends />} />
            <Route path="/friends" element={<FriendsList />} />
            <Route path="/friend-requests" element={<FriendRequests />} />

            {/* 🔒 Protect the Info page */}
            <Route
              path="/info"
              element={
                <ConferenceProtectedRoute>
                  <InfoPage />
                </ConferenceProtectedRoute>
              }
            />

            {/* Public (or protect these similarly if needed) */}
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/speakers" element={<SpeakersPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
