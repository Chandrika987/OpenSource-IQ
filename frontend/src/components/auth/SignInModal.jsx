import { AnimatePresence, motion } from 'framer-motion';
import { Globe, ShieldCheck, X } from 'lucide-react';

export default function SignInModal({ isOpen, onClose }) {
  const startOAuth = (provider) => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
              aria-label="Close sign in" 
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Globe size={24} className="text-primary-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Continue with your account</h2>
              <p className="mt-2 text-sm text-gray-400">Choose a provider to sign in securely with GitHub or Google.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => startOAuth('github')}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
              >
                <ShieldCheck size={18} />
                Sign in with GitHub
              </button>

              <button
                onClick={() => startOAuth('google')}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
              >
                <Globe size={18} />
                Sign in with Google
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
