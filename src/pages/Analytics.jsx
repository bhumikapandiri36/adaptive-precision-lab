import { Link } from 'react-router-dom';
import { BarChart3, Trash2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useLab } from '../context/LabContext.jsx';
import { Button, EmptyState, PageHeader, Panel } from '../components/ui.jsx';
import { AXIS, GRID, MetricBarChart, TOOLTIP } from '../components/charts.jsx';
import Recommendation from '../components/Recommendation.jsx';
import RunTable from '../components/RunTable.jsx';
import { OPERATIONS, PRECISIONS, PRECISION_BY_ID } from '../lib/precision';
import { averageByPrecision } from '../lib/stats';

export default function Analytics() {
  const { runs, clearRuns } = useLab();

  if (!runs.length) {
    return (
      <>
        <PageHeader title="Analytics" description="Trends across every run in this session." />
        <EmptyState
          icon={BarChart3}
          title="No data to analyse"
          description="Process an image in the lab, or run all precisions, and the charts will fill in from your real measurements."
          action={<Button as={Link} to="/lab">Go to the lab</Button>}
        />
      </>
    );
  }

  const avg = averageByPrecision(runs);
  const bars = (key) => avg.map((a) => ({ name: PRECISION_BY_ID[a.precision].label, value: a[key], color: PRECISION_BY_ID[a.precision].color }));

  // Mean PSNR per operation, one column per precision.
  const byOperation = OPERATIONS.map((op) => {
    const row = { name: op.label };
    PRECISIONS.forEach((p) => {
      const rs = runs.filter((r) => r.operation === op.id && r.precision === p.id);
      if (rs.length) row[p.id] = rs.reduce((s, r) => s + r.psnr, 0) / rs.length;
    });
    return row;
  }).filter((row) => Object.keys(row).length > 1);

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Averages and trade-offs across ${runs.length} run${runs.length === 1 ? '' : 's'} in this session.`}
        actions={
          <Button variant="secondary" onClick={clearRuns}>
            <Trash2 size={16} /> Clear session data
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Mean execution time" description="Lower is faster.">
          <MetricBarChart data={bars('timeMs')} unit="ms" />
        </Panel>
        <Panel title="Mean memory usage" description="Lower uses less memory.">
          <MetricBarChart data={bars('memoryKb')} unit="KB" decimals={1} />
        </Panel>

        <Panel title="Speed against quality" description="Each point is one run. Up and to the left is better.">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={GRID} />
                <XAxis type="number" dataKey="timeMs" name="Time" unit=" ms" {...AXIS} tickFormatter={(v) => Number(v).toFixed(0)} />
                <YAxis type="number" dataKey="psnr" name="PSNR" unit=" dB" domain={['auto', 'auto']} {...AXIS} width={52} />
                <Tooltip {...TOOLTIP} cursor={{ strokeDasharray: '3 3' }} formatter={(v) => Number(v).toFixed(2)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {PRECISIONS.map((p) => (
                  <Scatter key={p.id} name={p.label} data={runs.filter((r) => r.precision === p.id)} fill={p.color} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Mean PSNR by operation" description="How each precision holds up on each operation, in dB (99 means identical).">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byOperation} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" {...AXIS} tickLine={false} interval={0} tick={{ fill: '#8A97C4', fontSize: 11 }} />
                <YAxis {...AXIS} tickLine={false} axisLine={false} width={42} />
                <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => `${Number(v).toFixed(2)} dB`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {PRECISIONS.map((p) => (
                  <Bar key={p.id} dataKey={p.id} name={p.label} fill={p.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Recommendation results={avg} scope={`the average of all ${runs.length} runs in this session`} />
      </div>

      <Panel className="mt-6" title="All runs" padded={false}>
        <div className="p-5 pt-3">
          <RunTable runs={runs} />
        </div>
      </Panel>
    </>
  );
}
