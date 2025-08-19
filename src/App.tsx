import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AddFriends from './pages/AddFriends';
import FriendsList from './pages/FriendsList';
import FriendRequests from './pages/FriendRequests';
import InfoPage from "./pages/InfoPage"; // 1. Import the new page
import ProgramPage from "./pages/ProgramPage"; // 1. Import the new page
import SpeakersPage from "./pages/SpeakersPage"; //

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
            {/* 2. Add the new route for the info page */}
            <Route path="/info" element={<InfoPage />} />
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
