import { Activity } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartContainer from './ChartContainer';

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

export default function RepositoryActivityChart({ data }) {
  const isEmpty = !data?.length;
  const visibleData = data?.slice(-20) || [];

  return (
    <ChartContainer
      title="Repository Activity"
      icon={Activity}
      isEmpty={isEmpty}
      emptyMessage="No repository update activity found."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={visibleData} margin={{ top: 8, right: 12, left: -20, bottom: 36 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="updatedDate"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            angle={-30}
            textAnchor="end"
            height={58}
          />
          <YAxis hide dataKey="activity" />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name || 'Repository'}
            formatter={(_, __, item) => [
              new Date(item.payload.updatedAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              'Updated',
            ]}
          />
          <Line
            type="monotone"
            dataKey="activity"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
