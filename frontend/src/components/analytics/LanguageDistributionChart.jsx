import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Code2 } from 'lucide-react';
import ChartContainer from './ChartContainer';

const COLORS = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f472b6', '#84cc16'];

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
};

export default function LanguageDistributionChart({ data }) {
  const isEmpty = !data?.length;

  return (
    <ChartContainer
      title="Language Distribution"
      icon={Code2}
      isEmpty={isEmpty}
      emptyMessage="No language data found across public repositories."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name, item) => [`${value}% (${item.payload.bytes.toLocaleString()} bytes)`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
