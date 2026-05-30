import { motion } from 'framer-motion';
import { LayoutDashboard, FolderGit, GitPullRequest, CircleDot, Activity, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Analytics', path: '/analytics' },
  { icon: FolderGit, label: 'Repositories', path: '/repositories' },
  { icon: GitPullRequest, label: 'Pull Requests', path: '/pull-requests' },
  { icon: CircleDot, label: 'Issues', path: '/issues' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-white flex overflow-hidden selection:bg-primary-500/30">
      {/* Background Orbs for Premium feel */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col z-10 border-white/5 relative overflow-hidden hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center font-bold text-lg shadow-lg">
            IQ
          </div>
          <span className="font-bold text-xl tracking-tight">OpenSource<span className="text-primary-400">IQ</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20 shadow-inner' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-primary-400' : ''} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 border border-transparent">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-background/50 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-surface">
              {/* Avatar placeholder */}
              <img src="https://avatars.githubusercontent.com/u/9919?s=40&v=4" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
