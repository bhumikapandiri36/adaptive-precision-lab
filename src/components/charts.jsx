import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AXIS = { stroke: '#2A3A75', tick: { fill: '#8A97C4', fontSize: 12 } };
export const GRID = 'rgba(255,255,255,0.06)';
export const TOOLTIP = {
  contentStyle: { background: '#0C1330', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#E2E8F0', fontSize: 12 },
  labelStyle: { color: '#fff', fontWeight: 600 },
  itemStyle: { color: '#CBD5E1' },
};

/** data: [{ name, value, color }] */
export function MetricBarChart({ data, unit = '', decimals = 2, height = 230, domain }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" {...AXIS} tickLine={false} />
          <YAxis {...AXIS} tickLine={false} axisLine={false} width={50} domain={domain} />
          <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`${Number(v).toFixed(decimals)} ${unit}`.trim(), '']} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
