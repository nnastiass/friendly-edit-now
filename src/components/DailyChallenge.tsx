import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Keep import as it might be used elsewhere, or remove if truly unused
import StreakCounter from './StreakCounter';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // Using the centralized API client
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import './DailyChallenge.css';

// *** IMPORTANT: REMOVED API_BASE_URL - NOW USES apiClient DIRECTLY ***

const challenges = [
  { id: 1, title: 'Say hi to a stranger', description: 'Greet someone you don’t know with a smile and a friendly hello', points: 10, emoji: '👋' },
  { id: 2, title: 'Compliment someone', description: 'Give someone a genuine compliment today', points: 10, emoji: '😊' },
  { id: 3, title: 'Start a conversation', description: 'Initiate a conversation with someone new', points: 15, emoji: '💬' },
  { id: 4, title: 'Call a friend', description: 'Give a friend a quick call just to catch up', points: 12, emoji: '📞' },
  { id: 5, title: 'Ask someone how they’re doing', description: 'Check in on someone and really listen to their answer', points: 10, emoji: '👂' },
  { id: 6, title: 'Eat lunch with someone', description: 'Have lunch with a friend, coworker, or classmate', points: 15, emoji: '🍽️' },
  { id: 7, title: 'Join a group activity', description: 'Participate in a group event, club, or class', points: 20, emoji: '🤝' },
  { id: 8, title: 'Text someone you miss', description: 'Reach out to someone you haven’t spoken to in a while', points: 12, emoji: '📱' },
  { id: 9, title: 'Help someone out', description: 'Offer help to someone in need today', points: 15, emoji: '🤲' },
  { id: 10, title: 'Ask someone about their day', description: 'Engage in a conversation by showing interest in someone’s day', points: 10, emoji: '☀️' },
  { id: 11, title: 'Reconnect with an old friend', description: 'Message or call an old friend to catch up', points: 18, emoji: '👥' },
  { id: 12, title: 'Join a group chat', description: 'Join and contribute to a new or existing group chat today', points: 10, emoji: '📱' },
  { id: 13, title: 'Invite someone to hang out', description: 'Make plans with someone to do something together', points: 20, emoji: '🎉' },
  { id: 14, title: 'Talk to a neighbor', description: 'Say hello or start a quick conversation with a neighbor', points: 10, emoji: '🏡' },
  { id: 15, title: 'Ask someone about their interests', description: 'Learn something new about someone by asking what they’re into', points: 12, emoji: '🤔' },
  { id: 16, title: 'Play a game with others', description: 'Play a board game, video game, or card game with at least one other person', points: 15, emoji: '🎲' },
  { id: 17, title: 'Join a public event', description: 'Attend a local event like a meetup, fair, or class', points: 20, emoji: '🗓️' },
  { id: 18, title: 'Talk to someone during a break', description: 'Strike up a casual conversation during a work or school break', points: 10, emoji: '☕' },
  { id: 19, title: 'Learn someone’s name', description: 'Make an effort to learn and remember the name of someone new', points: 8, emoji: '🏷️' },
  { id: 20, title: 'Share a funny story', description: 'Make someone laugh by telling a funny story', points: 12, emoji: '😂' },
  { id: 21, title: 'Introduce yourself to someone', description: 'Take the first step and introduce yourself to someone you don’t know', points: 15, emoji: '👋' },
  { id: 22, title: 'Give someone a small gift', description: 'Surprise someone with a snack, note, or small gift', points: 20, emoji: '🎁' },
  { id: 23, title: 'Talk to a classmate or coworker', description: 'Start a conversation with someone you see often but haven’t really talked to', points: 12, emoji: '🧑‍🤝‍🧑' },
  { id: 24, title: 'Invite someone to sit with you', description: 'Make space for someone to join you during a meal or break', points: 10, emoji: '🛋️' },
  { id: 25, title: 'Say thank you', description: 'Thank someone sincerely for something they did today', points: 8, emoji: '🙏' },
  { id: 26, title: 'Ask someone for advice', description: 'Reach out to someone for their thoughts or help with a decision', points: 10, emoji: '💡' },
  { id: 27, title: 'Celebrate someone’s achievement', description: 'Congratulate someone on something they accomplished', points: 12, emoji: '🥳' },
  { id: 28, title: 'Offer someone a compliment in public', description: 'Say something nice to someone while you’re out and about', points: 15, emoji: '💖' },
  { id: 29, title: 'Invite someone to join you for a walk', description: 'Take a walk with someone and chat while you’re out', points: 15, emoji: '🚶' },
  { id: 30, title: 'Talk to someone who seems lonely', description: 'Make an effort to talk to someone who looks like they need company', points: 18, emoji: '🫂' },
  { id: 31, title: 'Share something about yourself', description: 'Tell someone a personal story or something meaningful to you', points: 10, emoji: '🗣️' },
  { id: 32, title: 'Join a social media challenge', description: 'Participate in an online social challenge or trend (no upload needed)', points: 12, emoji: '💻' },
  { id: 33, title: 'Ask someone about their hobbies', description: 'Learn about what someone loves to do in their free time', points: 10, emoji: '🎨' },
  { id: 34, title: 'Give someone your full attention', description: 'Have a conversation without checking your phone or getting distracted', points: 15, emoji: ' 집중' },
  { id: 35, title: 'Leave a positive note', description: 'Leave a kind note for someone to find', points: 10, emoji: '📝' },
  { id: 36, title: 'Talk to someone you disagree with', description: 'Have a respectful conversation with someone who thinks differently than you', points: 20, emoji: '🤝' },
  { id: 37, title: 'Ask for someone’s opinion', description: 'Make someone feel heard by asking for their thoughts on something', points: 10, emoji: '💬' },
  { id: 38, title: 'Share a recommendation', description: 'Tell someone about a movie, book, or place you love', points: 10, emoji: '👍' },
  { id: 39, title: 'Ask someone about their goals', description: 'Have a deeper conversation about dreams and plans', points: 15, emoji: '🎯' },
  { id: 40, title: 'Include someone who’s left out', description: 'Invite someone who’s alone to join your group or activity', points: 20, emoji: '🫂' },
  { id: 41, title: 'Make plans for the weekend', description: 'Start planning a social activity for the weekend with someone', points: 15, emoji: '🗓️' },
  { id: 42, title: 'Be vulnerable', description: 'Open up about something personal in a safe conversation', points: 18, emoji: '❤️' },
  { id: 43, title: 'Make a new friend', description: 'Talk to someone new and find common ground', points: 20, emoji: '🤝' },
  { id: 44, title: 'Ask someone about their favorite memory', description: 'Get to know someone better by asking about a special moment', points: 12, emoji: '💭' },
  { id: 45, title: 'Host a mini gathering', description: 'Invite a few friends to hang out, even if it’s casual', points: 20, emoji: '🥳' },
  { id: 46, title: 'Talk about something meaningful', description: 'Go beyond small talk and dive into a real topic', points: 15, emoji: '🗣️' },
  { id: 47, title: 'Make eye contact during a convo', description: 'Be present and engaged while talking with someone', points: 10, emoji: '👀' },
  { id: 48, title: 'Say something kind to yourself out loud', description: 'Be your own friend today and say something positive aloud', points: 8, emoji: '😊' },
  { id: 49, title: 'Talk to someone new at work/school', description: 'Reach out to someone you haven’t interacted with before', points: 15, emoji: '🧑‍💻' },
  { id: 50, title: 'Reflect on today’s social moment', description: 'Think about a positive social interaction you had today', points: 8, emoji: '🧠' }
];

interface DailyChallengeProps {
  onComplete?: (points: number) => void;                  // legacy: immediate completion callback
  onChallengeLoaded?: (challengeTitle: string) => void;
  deferCompletion?: boolean;                              // NEW: let parent confirm after upload
  onCompleteRequested?: () => void;                       // NEW: fire when button is pressed
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onComplete,
  onChallengeLoaded,
  deferCompletion = false,
  onCompleteRequested,
}) => {


  const { user } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  // Removed 'progress' state as it's no longer needed for the progress bar
  // const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false); // New state to track profile loading

  console.log("DailyChallenge: Component rendering. User:", user ? user.id : "null", "hasLoadedProfile:", hasLoadedProfile);

  useEffect(() => {
    console.log("DailyChallenge: useEffect triggered. User:", user ? user.id : "null");
    if (user && !hasLoadedProfile) { // Only fetch profile if user exists and hasn't been loaded yet
      fetchUserProfile();
    }

    // Determine today's challenge based on date
    const today = new Date().toDateString();
    const storedChallengeId = localStorage.getItem(`daily-challenge-${today}`);

    if (storedChallengeId) {
      const found = challenges.find(c => c.id === Number(storedChallengeId));
      if (found) {
        setTodaysChallenge(found);
        if (onChallengeLoaded) {
          onChallengeLoaded(found.title);
        }
      } else {
        // Fallback if stored ID is invalid, pick a default/random
        const challengeIndex = new Date().getDate() % challenges.length;
        const selected = challenges[challengeIndex];
        setTodaysChallenge(selected);
        if (onChallengeLoaded) {
          onChallengeLoaded(selected.title);
        }
        localStorage.setItem(`daily-challenge-${today}`, selected.id.toString());
      }
    } else {
      const challengeIndex = new Date().getDate() % challenges.length;
      const selected = challenges[challengeIndex];
      setTodaysChallenge(selected);
      if (onChallengeLoaded) {
        onChallengeLoaded(selected.title);
      }
      localStorage.setItem(`daily-challenge-${today}`, selected.id.toString());
    }

    // Check if challenge was already completed today from localStorage
// Only mark completed from localStorage when NOT deferring
const completedToday = localStorage.getItem(`challenge-${today}`);
if (completedToday && !deferCompletion) {
  setIsCompleted(true);
}


    // Set up and update countdown timer to midnight
    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to midnight of next day

      const diff = tomorrow.getTime() - now.getTime(); // Difference in milliseconds
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimeLeft(); // Initial call
    const interval = setInterval(updateTimeLeft, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [user, hasLoadedProfile, onChallengeLoaded]); // Dependency array: re-run effect if 'user', 'hasLoadedProfile', or 'onChallengeLoaded' changes

  // Fetches the current user's profile data (specifically streak) from the API
  const fetchUserProfile = async () => {
    if (!user || !user.id) {
      console.warn("DailyChallenge: fetchUserProfile called without user or user ID.");
      return;
    }
    console.log("DailyChallenge: Attempting to fetch user profile for ID:", user.id);
    try {
      // Use apiClient to fetch profile data
      const data = await apiClient.getProfile(user.id);
      console.log("DailyChallenge: User profile fetched successfully:", data);
      setCurrentStreak(data?.streak || 0); // Update streak state
      setHasLoadedProfile(true); // Mark profile as loaded
    } catch (error) {
      console.error('DailyChallenge: Error fetching user profile:', error);
      toast.error("Failed to load user streak.");
      setHasLoadedProfile(true); // Still mark as loaded to prevent re-fetching endlessly on error
    }
  };

  // Updates the user's streak in the database via the API
  const updateStreak = async (newStreak: number) => {
    if (!user || !user.id) {
      console.warn("DailyChallenge: updateStreak called without user or user ID.");
      return;
    }
    console.log("DailyChallenge: Attempting to update streak to:", newStreak, "for user ID:", user.id);
    try {
      // Use apiClient to update profile with new streak
      await apiClient.updateProfile(user.id, { streak: newStreak });
      console.log("DailyChallenge: Streak updated successfully to:", newStreak);
      setCurrentStreak(newStreak); // Update local state
    } catch (error) {
       console.error('DailyChallenge: Error updating streak:', error);
       toast.error("Failed to update streak.");
    }
  };

  // Handles the completion of a daily challenge
  const handleCompleteChallenge = async () => {
    // 🔒 Defer mode: DO NOT mark as complete here. Just tell parent to open upload dialog.
    if (deferCompletion) {
      onCompleteRequested?.();
      return;
    }

    // Legacy / immediate mode:
    if (isCompleted) return;

    setIsCompleted(true);

    const today = new Date();
    localStorage.setItem(`challenge-${today.toDateString()}`, 'completed');

    const newStreak = currentStreak + 1;
    await updateStreak(newStreak);

    toast.success(`Challenge completed! Streak: ${newStreak} days`);
    onComplete?.(todaysChallenge.points);
  };


  // Development helper to reset/generate a new challenge
  const handleDevReset = () => {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    const newChallenge = challenges[randomIndex];
    setTodaysChallenge(newChallenge); // Set a new random challenge

    const today = new Date().toDateString();
    localStorage.setItem(`daily-challenge-${today}`, newChallenge.id.toString()); // Store new challenge ID
    localStorage.removeItem(`challenge-${today}`); // Clear completion status

    setIsCompleted(false); // Reset completion state
    // setProgress(0); // Removed as progress state is removed

    toast.success('New challenge generated!');
  };

  return (
    <div className="daily-challenge-container">

      {/* 1. Daily Challenge Card */}
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          {/* Display challenge emoji (if available) - Ensure emojis are rendered correctly */}
          {todaysChallenge.emoji && (
            <div className="daily-challenge-emoji" style={{ fontSize: '3em', lineHeight: '1' }}>
              {todaysChallenge.emoji}
            </div>
          )}

          {/* Challenge Title and Description */}
          <h3 className="daily-challenge-text">{todaysChallenge.title}</h3>
          <p className="daily-challenge-description">{todaysChallenge.description}</p>

          {/* Complete Challenge Button */}
          <Button
            onClick={handleCompleteChallenge}
            disabled={!deferCompletion && isCompleted}  // in deferred mode, allow clicking to open upload
            className={`daily-challenge-button px-10 py-7 ${(!deferCompletion && isCompleted) ? 'daily-challenge-complete' : ''}`}
          >
            {(!deferCompletion && isCompleted) ? 'Completed!' : 'Complete Challenge'}
          </Button>


          {/* Progress Bar (removed) */}
          {/* {isCompleted && (
            <div className="daily-challenge-progress">
              <Progress value={progress} className="w-full" />
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* 2. Timer Boxes */}
      <div className="daily-challenge-timer-boxes flex justify-center gap-1 mt-6"> {/* Changed gap-1 to gap-4 for more spacing */}
        {['Hours', 'Minutes', 'Seconds'].map((label, i) => {
          const value = i === 0 ? timeLeft.hours : i === 1 ? timeLeft.minutes : timeLeft.seconds;
          return (
            <div key={label} className="flex flex-col items-center">
              <div
                style={{ borderWidth: '3px' }}
                className="bg-black text-white rounded-xl px-6 py-4 text-2xl font-bold border-white border-solid"
              >
                {value}
              </div>
              <span className="text-sm text-gray-400 mt-1">{label}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Streak Counter */}
      <StreakCounter streak={currentStreak} />

      {/* Development Reset Button */}
      <div className="flex justify-center mt-4">
        <Button
          onClick={handleDevReset}
          variant="outline"
          size="sm"
          className="text-gray-400 border-gray-600 hover:bg-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Dev: New Challenge
        </Button>
      </div>
    </div>
  );
};

export default DailyChallenge;
