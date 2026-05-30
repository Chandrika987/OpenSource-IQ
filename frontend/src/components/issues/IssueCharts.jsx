import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

const ChartPanel = ({ title, icon: Icon, children, emptyMessage, isEmpty }) => (
  <section className="glass-panel min-h-96 border-white/5 p-5 sm:p-6">
    <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
      <Icon size={20} className="text-primary-400" />
      {title}
    </h3>
    {isEmpty ? (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    ) : (
      <div className="h-72 sm:h-80">{children}</div>
    )}
  </section>
);

export default function IssueCharts({ statusData, repositoryData }) {
  const hasStatusData = statusData.some((item) => item.value > 0);
  const hasRepositoryData = repositoryData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ChartPanel
        title="Open vs Closed Issues"
        icon={PieChartIcon}
        isEmpty={!hasStatusData}
        emptyMessage="No issue status data available."
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={3}
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Top Repositories By Issue Count"
        icon={BarChart3}
        isEmpty={!hasRepositoryData}
        emptyMessage="No repository issue counts available."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={repositoryData} margin={{ top: 8, right: 8, left: -20, bottom: 48 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="repository"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={78}
            />
            <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(129,140,248,0.08)' }} />
            <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
