import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Repositories from './pages/Repositories';
import Issues from './pages/Issues';
import PullRequests from './pages/PullRequests';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import OAuthRedirect from './pages/OAuthRedirect';
import GitHubConnect from './components/github/GitHubConnect';

function LandingPage() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-4">
      <GitHubConnect isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="inline-block px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm font-medium mb-4">
          ✨ The AI-Powered Contribution Intelligence Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Level up your <span className="text-gradient">Open Source</span> journey.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          OpenSourceIQ analyzes GitHub activity to provide deep insights, AI-generated portfolio reviews, and actionable intelligence for developers and recruiters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => setIsConnectOpen(true)}
            className="px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors text-white font-semibold shadow-lg shadow-primary-500/25"
          >
            Connect GitHub
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-8 py-3 rounded-lg bg-surface hover:bg-surface/80 border border-white/10 transition-colors text-white font-semibold"
          >
            View Leaderboard
          </button>
          <a
            href="/oauth2/authorization/github"
            className="px-8 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white font-semibold"
          >
            Sign in with GitHub
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
        <Route path="/leaderboard" element={<DashboardLayout><Leaderboard /></DashboardLayout>} />
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
        <Route path="/repositories" element={<ProtectedLayout><Repositories /></ProtectedLayout>} />
        <Route path="/pull-requests" element={<ProtectedLayout><PullRequests /></ProtectedLayout>} />
        <Route path="/issues" element={<ProtectedLayout><Issues /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
