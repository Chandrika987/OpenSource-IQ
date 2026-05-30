export default function ChartContainer({ title, icon: Icon, children, emptyMessage, isEmpty }) {
  return (
    <section className="glass-panel border-white/5 p-5 sm:p-6 min-h-96">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
          {Icon && <Icon size={20} className="text-primary-400" />}
          {title}
        </h3>
      </div>

      {isEmpty ? (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="h-72 sm:h-80">{children}</div>
      )}
    </section>
  );
}
