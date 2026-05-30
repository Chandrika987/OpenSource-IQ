import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Repositories from './pages/Repositories';
import Issues from './pages/Issues';
import PullRequests from './pages/PullRequests';
import GitHubConnect from './components/github/GitHubConnect';

function LandingPage() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);

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

        <div className="flex items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => setIsConnectOpen(true)}
            className="px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors text-white font-semibold shadow-lg shadow-primary-500/25">
            Connect GitHub
          </button>
          <button className="px-8 py-3 rounded-lg bg-surface hover:bg-surface/80 border border-white/10 transition-colors text-white font-semibold">
            View Leaderboard
          </button>
        </div>


      </motion.div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        {/* Fallback for other routes in layout for demo */}
        <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/repositories" element={<DashboardLayout><Repositories /></DashboardLayout>} />
        <Route path="/pull-requests" element={<DashboardLayout><PullRequests /></DashboardLayout>} />
        <Route path="/issues" element={<DashboardLayout><Issues /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><div className="text-xl">Profile Coming Soon</div></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
