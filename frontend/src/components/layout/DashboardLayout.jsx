import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit,
  GitPullRequest,
  CircleDot,
  Activity,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', protected: true },
  { icon: Activity, label: 'Analytics', path: '/analytics', protected: true },
  { icon: FolderGit, label: 'Repositories', path: '/repositories', protected: true },
  { icon: GitPullRequest, label: 'Pull Requests', path: '/pull-requests', protected: true },
  { icon: CircleDot, label: 'Issues', path: '/issues', protected: true },
  { icon: User, label: 'Profile', path: '/profile', protected: true },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { avatarUrl, username, isAuthenticated, signOut } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = navItems.filter(
    (item) => !item.protected || isAuthenticated
  );

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const pageTitle = location.pathname.split('/')[1] || 'Dashboard';

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center font-bold text-lg shadow-lg">
            IQ
          </div>
          <span className="font-bold text-xl tracking-tight">
            OpenSource<span className="text-primary-400">IQ</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
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

      {isAuthenticated && (
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 border border-transparent"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background text-white flex overflow-hidden selection:bg-primary-500/30">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <aside className="w-64 glass-panel m-4 flex-col z-10 border-white/5 relative overflow-hidden hidden md:flex">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-64 h-full glass-panel flex flex-col border-white/5"
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col z-10 h-screen overflow-y-auto custom-scrollbar">
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 bg-background/50 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-xl font-semibold capitalize">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="hidden sm:block text-sm text-gray-400">@{username}</span>
            )}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-white/10 bg-surface flex items-center justify-center text-gray-500">
                <User size={18} />
              </div>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg bg-surface text-gray-400"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
