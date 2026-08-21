import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building2,
  Coins,
  CheckCircle2,
  Clock,
  Globe2,
  Calendar,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Activity
} from 'lucide-react';
import { AccountApplication, BankRegion } from '../../types';
import { useBank } from '../../context/BankContext';

interface EnrollmentTrendWidgetProps {
  applications?: AccountApplication[];
  onSelectApplication?: (app: AccountApplication) => void;
}

type ChartViewType = 'AREA_TREND' | 'REGIONAL_STACK' | 'CUMULATIVE' | 'DEPOSIT_VOLUME';
type DateRangeOption = 30 | 14 | 7;

export const EnrollmentTrendWidget: React.FC<EnrollmentTrendWidgetProps> = ({
  applications: propApps,
  onSelectApplication
}) => {
  const { applications: ctxApps, triggerTestEnrollmentNotification, isLoading } = useBank();
  const applications = propApps || ctxApps;

  const [chartView, setChartView] = useState<ChartViewType>('AREA_TREND');
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>(30);
  const [regionFilter, setRegionFilter] = useState<'ALL' | BankRegion>('ALL');

  // Compute 30-day timeline and data points
  const { chartData, metrics } = useMemo(() => {
    const now = new Date();
    const days = selectedRange;
    const dayMs = 24 * 60 * 60 * 1000;

    // Filter applications by region if applicable
    const filteredApps = applications.filter((app) => {
      const reg = app.requestedRegion || app.region || 'EU';
      if (regionFilter !== 'ALL' && reg !== regionFilter) return false;
      return true;
    });

    // Create an array of all dates in the range
    const dateMap = new Map<string, {
      date: string;
      fullDate: string;
      rawDate: Date;
      total: number;
      eu: number;
      uk: number;
      us: number;
      approved: number;
      pending: number;
      rejected: number;
      depositVolumeMinor: number;
      depositVolumeK: number;
      cumulative: number;
      movingAvg: number;
      pepCount: number;
    }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * dayMs);
      const dateKey = d.toISOString().slice(0, 10);
      const formattedLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const fullDateLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      dateMap.set(dateKey, {
        date: formattedLabel,
        fullDate: fullDateLabel,
        rawDate: d,
        total: 0,
        eu: 0,
        uk: 0,
        us: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        depositVolumeMinor: 0,
        depositVolumeK: 0,
        cumulative: 0,
        movingAvg: 0,
        pepCount: 0
      });
    }

    let total30DApps = 0;
    let total30DDepositMinor = 0;
    let totalApproved = 0;
    let totalPending = 0;
    let totalRejected = 0;
    let euCount = 0;
    let ukCount = 0;
    let usCount = 0;

    filteredApps.forEach((app) => {
      const subDate = new Date(app.submittedAt || new Date());
      const dateKey = subDate.toISOString().slice(0, 10);
      const reg = app.requestedRegion || app.region || 'EU';
      const depositMinor = app.initialDepositAmountMinor || 0;

      if (dateMap.has(dateKey)) {
        const item = dateMap.get(dateKey)!;
        item.total += 1;
        total30DApps += 1;
        total30DDepositMinor += depositMinor;
        item.depositVolumeMinor += depositMinor;
        item.depositVolumeK = Math.round(item.depositVolumeMinor / 100000); // in thousands (€k)

        if (reg === 'EU') {
          item.eu += 1;
          euCount += 1;
        } else if (reg === 'UK') {
          item.uk += 1;
          ukCount += 1;
        } else if (reg === 'US') {
          item.us += 1;
          usCount += 1;
        }

        if (app.status === 'APPROVED') {
          item.approved += 1;
          totalApproved += 1;
        } else if (app.status === 'REJECTED') {
          item.rejected += 1;
          totalRejected += 1;
        } else {
          item.pending += 1;
          totalPending += 1;
        }

        if (app.isPep) {
          item.pepCount += 1;
        }
      }
    });

    // Compute cumulative counts and 7-day moving averages
    const rawData = Array.from(dateMap.values());
    let runningCumulative = 0;

    const computedData = rawData.map((dayObj, idx) => {
      runningCumulative += dayObj.total;
      
      // 7-day rolling window
      const startIdx = Math.max(0, idx - 6);
      const windowSlice = rawData.slice(startIdx, idx + 1);
      const windowSum = windowSlice.reduce((acc, curr) => acc + curr.total, 0);
      const movingAvg = Number((windowSum / windowSlice.length).toFixed(1));

      return {
        ...dayObj,
        cumulative: runningCumulative,
        movingAvg
      };
    });

    // Find peak day
    let peakDay = computedData[0];
    computedData.forEach((d) => {
      if (d.total > (peakDay?.total || 0)) {
        peakDay = d;
      }
    });

    const approvalRate = total30DApps > 0 ? ((totalApproved / total30DApps) * 100).toFixed(1) : '0.0';
    const avgDaily = (total30DApps / days).toFixed(1);

    return {
      chartData: computedData,
      metrics: {
        total30DApps,
        total30DDepositMinor,
        totalApproved,
        totalPending,
        totalRejected,
        approvalRate,
        avgDaily,
        peakDay,
        regionDistribution: {
          EU: euCount,
          UK: ukCount,
          US: usCount
        }
      }
    };
  }, [applications, selectedRange, regionFilter]);

  const formatCurrencyMinor = (minor: number) => {
    const major = minor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(major);
  };

  // Custom high-contrast tooltip matching institutional private banking aesthetics
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-[#050e1a]/95 border border-[#d4af37]/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-sans min-w-[200px] z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="font-bold text-slate-100 font-serif flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{data.fullDate || label}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[#d4af37] font-mono text-[10px] font-bold">
            {data.total} Apps
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              New Applications:
            </span>
            <span className="font-bold text-white">{data.total}</span>
          </div>

          {chartView === 'REGIONAL_STACK' && (
            <>
              <div className="flex justify-between items-center text-slate-400 pl-3.5">
                <span>🇪🇺 Frankfurt (EU):</span>
                <span className="text-emerald-400 font-bold">{data.eu}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pl-3.5">
                <span>🇬🇧 London (UK):</span>
                <span className="text-blue-400 font-bold">{data.uk}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pl-3.5">
                <span>🇺🇸 New York (US):</span>
                <span className="text-amber-400 font-bold">{data.us}</span>
              </div>
            </>
          )}

          {chartView === 'CUMULATIVE' && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Cumulative Total:
              </span>
              <span className="font-bold text-emerald-400">{data.cumulative}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              7-Day Rolling Avg:
            </span>
            <span className="font-bold text-blue-300">{data.movingAvg} / day</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/80 pt-1.5 mt-1.5">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3 h-3 text-[#d4af37]" />
              Deposit Volume:
            </span>
            <span className="font-bold text-[#d4af37]">
              {formatCurrencyMinor(data.depositVolumeMinor)}
            </span>
          </div>

          {data.pepCount > 0 && (
            <div className="text-[10px] text-amber-300/90 pt-1 flex items-center gap-1">
              <span>⚠️ Includes {data.pepCount} PEP / High-Risk submission</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0a1e36] border border-[#1b3d68] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Widget Header & Range Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#d4af37]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                APPLICATIONS ANALYTICS ENGINE • RECHARTS 30-DAY TELEMETRY
              </div>
              <h3 className="text-lg font-bold font-serif text-slate-100 flex items-center gap-2">
                <span>New User Enrollment Trends</span>
                <span className="text-xs font-mono font-normal text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                  Last {selectedRange} Days
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* View Switchers & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chart Mode Selector */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setChartView('AREA_TREND')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                chartView === 'AREA_TREND'
                  ? 'bg-[#d4af37] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Daily Applications Area Trend"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Volume Trend</span>
            </button>

            <button
              onClick={() => setChartView('REGIONAL_STACK')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                chartView === 'REGIONAL_STACK'
                  ? 'bg-[#d4af37] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Regional Breakdown (EU, UK, US)"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Regional</span>
            </button>

            <button
              onClick={() => setChartView('CUMULATIVE')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                chartView === 'CUMULATIVE'
                  ? 'bg-[#d4af37] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cumulative Growth Curve"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cumulative</span>
            </button>

            <button
              onClick={() => setChartView('DEPOSIT_VOLUME')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                chartView === 'DEPOSIT_VOLUME'
                  ? 'bg-[#d4af37] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Capital & Deposit Pipeline Volume"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Deposits</span>
            </button>
          </div>

          {/* Range Picker */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-mono">
            {([30, 14, 7] as const).map((r) => (
              <button
                key={`range-${r}`}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedRange === r
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="ALL">All Regions</option>
            <option value="EU">🇪🇺 Frankfurt (EU)</option>
            <option value="UK">🇬🇧 London (UK)</option>
            <option value="US">🇺🇸 New York (US)</option>
          </select>

          {/* Simulation Trigger */}
          <button
            onClick={() => triggerTestEnrollmentNotification()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            title="Simulate New Client Application in Real Time"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Application</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        <div className="p-3.5 bg-[#061426] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wider">Total Inflow</span>
            <Users className="w-3.5 h-3.5 text-[#d4af37]" />
          </div>
          <div className="text-xl font-bold text-white font-serif mt-1">
            {metrics.total30DApps} <span className="text-xs font-mono font-normal text-slate-400">apps</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Avg {metrics.avgDaily}/day</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#061426] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wider">Deposit Pipeline</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-[#d4af37] font-serif mt-1 truncate">
            {formatCurrencyMinor(metrics.total30DDepositMinor)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Initial capital commitments
          </div>
        </div>

        <div className="p-3.5 bg-[#061426] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wider">KYC Clearance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 font-serif mt-1">
            {metrics.approvalRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {metrics.totalApproved} approved • {metrics.totalPending} pending
          </div>
        </div>

        <div className="p-3.5 bg-[#061426] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wider">Top Booking Region</span>
            <Globe2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1.5 flex items-center gap-1.5">
            <span>🇪🇺 EU ({metrics.regionDistribution.EU})</span>
            <span className="text-slate-500">•</span>
            <span>🇬🇧 UK ({metrics.regionDistribution.UK})</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            🇺🇸 US: {metrics.regionDistribution.US} applications
          </div>
        </div>

        <div className="p-3.5 bg-[#061426] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase tracking-wider">Peak Velocity Day</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-serif mt-1">
            {metrics.peakDay?.date || 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {metrics.peakDay?.total || 0} applications received
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="bg-[#061426] border border-slate-800/80 rounded-xl p-4 sm:p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'AREA_TREND' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="blueLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickMargin={8}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomChartTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  name="New Applications / Day"
                  stroke="#d4af37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldAreaGrad)"
                  activeDot={{ r: 6, stroke: '#d4af37', strokeWidth: 2, fill: '#0b1e36' }}
                />

                <Line
                  type="monotone"
                  dataKey="movingAvg"
                  name="7-Day Rolling Average"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            ) : chartView === 'REGIONAL_STACK' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickMargin={8}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomChartTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="rect"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                />

                <Bar dataKey="eu" name="🇪🇺 EU Frankfurt" stackId="regionStack" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="uk" name="🇬🇧 UK London" stackId="regionStack" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="us" name="🇺🇸 US New York" stackId="regionStack" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartView === 'CUMULATIVE' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickMargin={8}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />

                <Tooltip content={<CustomChartTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                />

                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Client Onboardings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#emeraldGrad)"
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0b1e36' }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#b38f28" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickMargin={8}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `€${val}k`}
                />

                <Tooltip content={<CustomChartTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                />

                <Bar
                  dataKey="depositVolumeK"
                  name="Initial Deposit Volume (€ in thousands)"
                  fill="url(#goldBarGrad)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Footer Note & Real-time Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Pipeline Live • Institutional Intake Gateways Synced</span>
          </div>
          <div>
            Showing <strong className="text-slate-200">{metrics.total30DApps}</strong> application entries across Frankfurt, London &amp; New York.
          </div>
        </div>
      </div>
    </div>
  );
};
