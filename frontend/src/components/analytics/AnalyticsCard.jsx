import { motion } from 'framer-motion';

export default function AnalyticsCard({ title, value, icon: Icon, accent = 'text-primary-400', helper }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-panel p-5 sm:p-6 border-white/5 min-h-36 flex flex-col justify-between overflow-hidden relative"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white break-words">{value}</p>
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 ${accent}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {helper && <p className="relative mt-4 text-xs text-gray-500">{helper}</p>}
    </motion.div>
  );
}
