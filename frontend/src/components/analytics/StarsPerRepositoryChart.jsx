import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Star } from 'lucide-react';
import ChartContainer from './ChartContainer';

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

export default function StarsPerRepositoryChart({ data }) {
  const isEmpty = !data?.length || data.every((repo) => repo.stars === 0);

  return (
    <ChartContainer
      title="Stars Per Repository"
      icon={Star}
      isEmpty={isEmpty}
      emptyMessage="No starred repositories yet."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 40 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={70}
          />
          <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(129,140,248,0.08)' }} />
          <Bar dataKey="stars" fill="#818cf8" radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
