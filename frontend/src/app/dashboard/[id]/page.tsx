'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList, ComposedChart
} from 'recharts';
import { Activity, Share2, Layers, Type, FileText } from 'lucide-react';

const GET_PUBLIC_DASHBOARD = gql`
  query GetPublicDashboard($id: ID!) {
    publicDashboard(id: $id) {
      dashboardDoc {
        id
        title
        config
      }
      sourceDocContent
    }
  }
`;

export default function PublicDashboardPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PUBLIC_DASHBOARD, { 
    variables: { id },
    pollInterval: 10000 // Live updates every 10 seconds!
  });

  const [toggles, setToggles] = useState<Record<string, Record<string, boolean>>>({});

  const gridData = useMemo(() => {
    if (!data?.publicDashboard?.sourceDocContent) return [];
    try {
      const raw = JSON.parse(data.publicDashboard.sourceDocContent);
      return raw.map((row: any) => row.map((cell: any) => {
        if (typeof cell === 'string') return { value: cell };
        return cell;
      }));
    } catch {
      return [];
    }
  }, [data]);

  const charts = useMemo(() => {
    if (!data?.publicDashboard?.dashboardDoc?.config) return [];
    try {
      const cfg = JSON.parse(data.publicDashboard.dashboardDoc.config);
      return cfg.charts || [];
    } catch {
      return [];
    }
  }, [data]);

  const updateToggle = (chartId: string, key: string) => {
    setToggles(prev => ({
      ...prev,
      [chartId]: {
        ...(prev[chartId] || {}),
        [key]: !(prev[chartId]?.[key])
      }
    }));
  };

  const getChartDataMulti = (chart: any) => {
    if (!gridData || gridData.length === 0) return [];
    const { range, labelOffset, valueOffsets } = chart;
    const { minR, maxR, minC } = range;
    const cData = [];
    for (let r = minR; r <= maxR; r++) {
      const labelCell = gridData[r]?.[minC + labelOffset];
      const name = labelCell?.value || `Row ${r + 1}`;
      const entry: any = { name };
      valueOffsets.forEach((vOff: number, i: number) => {
        const cell = gridData[r]?.[minC + vOff];
        const rawVal = cell?.value || "0";
        entry[`val${i}`] = parseFloat(rawVal) || 0;
      });
      cData.push(entry);
    }
    return cData;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
       <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
       <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Live Intelligence</p>
    </div>
  );

  if (error || !data?.publicDashboard) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-red-500">
       <Activity size={48} />
       <p className="font-bold">Dashboard not found or unavailable.</p>
    </div>
  );

  const title = data.publicDashboard.dashboardDoc.title;

  return (
    <div className="min-h-screen mesh-bg bg-background text-foreground overflow-y-auto">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                 <Activity size={20} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-xl font-black tracking-tight">{title}</h1>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Updated</span>
              </div>
           </div>
           
           <button onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Public shareable link copied to clipboard!");
           }} className="px-4 py-2 bg-secondary text-foreground text-sm font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all rounded-lg flex items-center gap-2">
             <Share2 size={16} /> Share Link
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {charts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-bold">
             <Activity size={48} className="mx-auto mb-4 opacity-30" />
             <p>No visualization data provided in this dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart: any) => {
              const cDataUnsorted = getChartDataMulti(chart);
              const customToggles = toggles[chart.id] || {};
              const showLabels = customToggles.showLabels !== undefined ? customToggles.showLabels : chart.showLabels;
              const isStacked = customToggles.isStacked !== undefined ? customToggles.isStacked : chart.isStacked;
              const isSorted = customToggles.isSorted !== undefined ? customToggles.isSorted : chart.isSorted;
              
              const cData = isSorted ? [...cDataUnsorted].sort((a,b) => b.val0 - a.val0) : cDataUnsorted;
              const themeColors = chart.colors || ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

              return (
                 <div key={chart.id} className="bg-card shadow-2xl border border-border rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                       <div>
                         <h3 className="text-xs font-black uppercase tracking-widest">{chart.title || "Data Insight"}</h3>
                         {chart.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{chart.description}</p>}
                       </div>
                       <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                         <button onClick={() => updateToggle(chart.id, 'showLabels')} className={`p-1.5 rounded transition-all ${showLabels ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}><Type size={12} /></button>
                         <button onClick={() => updateToggle(chart.id, 'isStacked')} className={`p-1.5 rounded transition-all ${isStacked ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}><Layers size={12} /></button>
                       </div>
                    </div>

                    <div className="flex-1 p-6">
                       <ResponsiveContainer width="100%" height="100%">
                         {chart.type === 'bar' ? (
                           <BarChart data={cData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                              <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} />
                              <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: 'rgba(150,150,150,0.1)'}} contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid rgba(150,150,150,0.2)' }} />
                              <Legend iconType="circle" wrapperStyle={{paddingTop: 10, fontSize: 10, fontWeight: 900}} />
                              {chart.valueOffsets?.map((_: any, i: number) => (
                                 <Bar key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} dataKey={`val${i}`} stackId={isStacked ? "a" : undefined} fill={themeColors[i % themeColors.length]} radius={isStacked ? [0,0,0,0] : [4, 4, 0, 0]}>
                                    {showLabels && <LabelList dataKey={`val${i}`} position="top" style={{ fontSize: 10, fontWeight: 900, fill: themeColors[i % themeColors.length] }} />}
                                 </Bar>
                              ))}
                           </BarChart>
                         ) : chart.type === 'area' ? (
                           <AreaChart data={cData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                              {chart.valueOffsets?.map((_: any, i: number) => (
                                 <Area key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} type="monotone" dataKey={`val${i}`} stroke={themeColors[i % themeColors.length]} fill={themeColors[i % themeColors.length]} fillOpacity={0.2} stackId={isStacked ? "1" : i.toString()} />
                              ))}
                           </AreaChart>
                         ) : chart.type === 'pie' ? (
                           <PieChart>
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none' }} />
                              <Legend iconType="circle" wrapperStyle={{paddingTop: 10, fontSize: 10, fontWeight: 900}} />
                              <Pie data={cData} dataKey="val0" nameKey="name" cx="50%" cy="50%" innerRadius={isStacked ? 0 : 60} outerRadius={100} paddingAngle={2}>
                                {cData.map((_: any, i: number) => (
                                  <Cell key={`cell-${i}`} fill={themeColors[i % themeColors.length]} />
                                ))}
                              </Pie>
                           </PieChart>
                         ) : chart.type === 'radar' ? (
                           <RadarChart cx="50%" cy="50%" outerRadius="70%" data={cData}>
                              <PolarGrid opacity={0.2} />
                              <PolarAngleAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900}} />
                              <PolarRadiusAxis angle={30} domain={['auto', 'auto']} opacity={0.5} />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none' }} />
                              <Legend wrapperStyle={{paddingTop: 10, fontSize: 10, fontWeight: 900}} />
                              {chart.valueOffsets?.map((_: any, i: number) => (
                                <Radar key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} dataKey={`val${i}`} stroke={themeColors[i % themeColors.length]} fill={themeColors[i % themeColors.length]} fillOpacity={0.3} />
                              ))}
                           </RadarChart>
                         ) : chart.type === 'composed' ? (
                           <ComposedChart data={cData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                              <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} />
                              <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none' }} />
                              <Legend wrapperStyle={{paddingTop: 10, fontSize: 10, fontWeight: 900}} />
                              {chart.valueOffsets?.map((_: any, i: number) => {
                                if (i === 0) return <Bar key={i} name={chart.seriesNames?.[i]} dataKey={`val${i}`} fill={themeColors[i % themeColors.length]} radius={[4,4,0,0]} />;
                                if (i === 1) return <Line key={i} name={chart.seriesNames?.[i]} type="monotone" dataKey={`val${i}`} stroke={themeColors[i % themeColors.length]} strokeWidth={3} />;
                                return <Area key={i} name={chart.seriesNames?.[i]} type="monotone" dataKey={`val${i}`} fill={themeColors[i % themeColors.length]} fillOpacity={0.2} stroke="none" />;
                              })}
                           </ComposedChart>
                         ) : (
                           <LineChart data={cData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                              <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} />
                              <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none' }} />
                              <Legend wrapperStyle={{paddingTop: 10, fontSize: 10, fontWeight: 900}} />
                              {chart.valueOffsets?.map((_: any, i: number) => (
                                 <Line key={i} name={chart.seriesNames?.[i] || `Series ${i+1}`} type="monotone" dataKey={`val${i}`} stroke={themeColors[i % themeColors.length]} strokeWidth={3} dot={{ r: 4, fill: themeColors[i % themeColors.length] }}>
                                    {showLabels && <LabelList dataKey={`val${i}`} position="top" style={{ fontSize: 10, fontWeight: 900, fill: themeColors[i % themeColors.length] }} offset={10} />}
                                 </Line>
                              ))}
                           </LineChart>
                         )}
                       </ResponsiveContainer>
                    </div>
                 </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
