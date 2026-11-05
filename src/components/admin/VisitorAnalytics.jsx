import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchWithAuth } from "../../utils/apiConfig";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Globe,
  Monitor,
  TrendingUp,
  RefreshCw,
  LogOut,
  CalendarDays,
  X,
} from "lucide-react";

const CHART_COLORS = ["#22c55e", "#fbbf24", "#3b82f6", "#ec4899", "#a855f7", "#f97316"];
const DEVICE_COLORS = { Desktop: "#22c55e", Mobile: "#fbbf24", Tablet: "#3b82f6" };
const RANGE_OPTIONS = [
  { value: "15m", label: "15 Min" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
];
const GRANULARITY_OPTIONS = [
  { value: "1h", label: "1 Hr" },
  { value: "15m", label: "15 Min" },
  { value: "10m", label: "10 Min" },
];

const toIST = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

// Produces "YYYY-MM-DD HH:MM" in IST — matches MongoDB %Y-%m-%d %H:%M with timezone "+05:30"
const toISTDateTimeKey = (date) => {
  const d = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const t = date.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${d} ${t}`;
};

// Fill in missing time slots so the line chart has no gaps (all dates/hours in IST)
const buildChartData = (byTime, range, granularity = "1h") => {
  // Sub-hour granularity: fill minute buckets aligned to bin boundaries
  if (granularity !== "1h" && range !== "all" && range !== "15m") {
    const binMinutes = granularity === "15m" ? 15 : 10;
    const map = {};
    byTime.forEach((d) => { map[d.time] = d.count; });
    const totalMins =
      range === "today" ? 24 * 60 : range === "7d" ? 7 * 24 * 60 : 30 * 24 * 60;
    const binMs = binMinutes * 60 * 1000;
    const nowBin = Math.floor(Date.now() / binMs) * binMs;
    const slots = Math.floor(totalMins / binMinutes);
    return Array.from({ length: slots }, (_, i) => {
      const d = new Date(nowBin - (slots - 1 - i) * binMs);
      const key = toISTDateTimeKey(d);
      // "today": show only HH:MM; multi-day: show MM-DD HH:MM
      const label = range === "today" ? key.slice(11) : key.slice(5);
      return { label, count: map[key] || 0 };
    });
  }
  if (range === "all") {
    return byTime.map((d) => ({ label: d.time, count: d.count }));
  }
  if (range === "15m") {
    const map = {};
    byTime.forEach((d) => { map[d.time] = d.count; });
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date(Date.now() - (14 - i) * 60 * 1000);
      const label = d.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { label, count: map[label] || 0 };
    });
  }
  if (range === "today") {
    const map = {};
    byTime.forEach((d) => { map[d.time] = d.count; });
    return Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, "0") + ":00",
      count: map[i.toString().padStart(2, "0")] || 0,
    }));
  }
  const days = range === "7d" ? 7 : 30;
  const map = {};
  byTime.forEach((d) => { map[d.time] = d.count; });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const iso = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return { label: iso.slice(5), count: map[iso] || 0 };
  });
};

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-3xl font-black text-white">
      {value != null ? value.toLocaleString() : "—"}
    </p>
  </div>
);

const DarkTooltip = ({ active, payload, label, unit = "visits" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-bold" style={{ color: payload[0].color || "#22c55e" }}>
        {payload[0].value} {unit}
      </p>
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const VisitorAnalytics = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [range, setRange] = useState("30d");
  const [granularity, setGranularity] = useState("1h");
  const [customDate, setCustomDate] = useState(""); // "YYYY-MM-DD" IST date
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [visitors, setVisitors] = useState([]);
  const [visitorsTotal, setVisitorsTotal] = useState(0);
  const [visitorsPages, setVisitorsPages] = useState(1);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorsLoading, setVisitorsLoading] = useState(true);

  const [deviceFilter, setDeviceFilter] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({ granularity });
      if (customDate) params.set("date", customDate);
      else params.set("range", range);
      const res = await fetchWithAuth(`/api/admin/analytics/stats?${params}`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else toast.error("Failed to load stats");
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setStatsLoading(false);
    }
  }, [range, granularity, customDate]);

  const fetchVisitors = useCallback(async () => {
    setVisitorsLoading(true);
    try {
      const params = new URLSearchParams({ page: visitorPage, limit: 15 });
      if (customDate) params.set("date", customDate);
      else params.set("range", range);
      if (deviceFilter) params.set("device", deviceFilter);
      if (browserFilter) params.set("browser", browserFilter);
      const res = await fetchWithAuth(`/api/admin/analytics/visitors?${params}`);
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors);
        setVisitorsTotal(data.total);
        setVisitorsPages(data.pages);
      }
    } catch {
      toast.error("Failed to load visitors");
    } finally {
      setVisitorsLoading(false);
    }
  }, [range, visitorPage, deviceFilter, browserFilter, customDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);
  // Reset to page 1 when any filter changes
  useEffect(() => { setVisitorPage(1); }, [range, deviceFilter, browserFilter, customDate]);

  const handleLogout = () => { logout(); router.push("/admin"); };
  const handleRefresh = () => { fetchStats(); fetchVisitors(); };

  // When customDate is active: treat as single-day hourly view (same as "today")
  const effectiveRange = customDate ? "today" : range;
  const effectiveGranularity = customDate ? "1h" : granularity;
  const chartData = stats ? buildChartData(stats.byTime, effectiveRange, effectiveGranularity) : [];
  const xAxisInterval = (() => {
    if (effectiveGranularity !== "1h" && effectiveRange !== "all" && effectiveRange !== "15m") {
      return Math.max(0, Math.floor(chartData.length / 24) - 1);
    }
    return effectiveRange === "15m" ? 0 : effectiveRange === "today" ? 3 : effectiveRange === "30d" ? 4 : 0;
  })();
  const istToday = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
            <h1 className="text-3xl lg:text-4xl font-black text-white">Visitor Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRange(opt.value); setCustomDate(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                range === opt.value && !customDate
                  ? "bg-green-500 text-black"
                  : "bg-[#111111] text-gray-400 border border-gray-800 hover:border-green-500/40"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Custom Date Picker */}
          <div className="flex items-center gap-1 ml-1">
            <div className="relative flex items-center">
              <CalendarDays
                size={14}
                className="absolute left-3 pointer-events-none text-gray-500"
              />
              <input
                type="date"
                value={customDate}
                max={istToday}
                onChange={(e) => { setCustomDate(e.target.value); }}
                className={`pl-8 pr-3 py-2 rounded-lg text-sm font-semibold bg-dark-card border outline-none cursor-pointer transition-colors
                  scheme-dark
                  ${customDate
                    ? "border-green-500 text-white"
                    : "border-gray-800 text-gray-500 hover:border-green-500/40"
                  }`}
              />
            </div>
            {customDate && (
              <button
                onClick={() => setCustomDate("")}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Clear date"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Total Visits"
            value={stats?.total}
            colorClass="bg-green-500/10 text-green-500"
          />
          <StatCard
            icon={Users}
            label="Unique IPs"
            value={stats?.uniqueIps}
            colorClass="bg-yellow-500/10 text-yellow-400"
          />
          <StatCard
            icon={Globe}
            label="Today"
            value={stats?.todayCount}
            colorClass="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            icon={Monitor}
            label="Unique Pages"
            value={stats?.byPage?.length}
            colorClass="bg-purple-500/10 text-purple-400"
          />
        </div>

        {/* Visits Over Time */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold">
              Visits Over Time
              <span className="ml-2 text-xs font-normal text-gray-500">
                {customDate
                  ? `— ${new Date(customDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} (by hour)`
                  : effectiveGranularity !== "1h" && effectiveRange !== "all" && effectiveRange !== "15m"
                  ? `(${effectiveGranularity === "15m" ? "15-min" : "10-min"} intervals)`
                  : effectiveRange === "15m" ? "(by minute)" : effectiveRange === "today" ? "(by hour)" : effectiveRange === "all" ? "(by month)" : "(by day)"}
              </span>
            </h2>
            {!customDate && (
              <div className="flex gap-1">
                {GRANULARITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGranularity(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      granularity === opt.value
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : "bg-[#1a1a1a] text-gray-500 border border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {statsLoading ? (
            <Spinner />
          ) : chartData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  interval={xAxisInterval}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Pages + Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Pages */}
          <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6">Top Pages</h2>
            {statsLoading ? (
              <Spinner />
            ) : stats?.byPage?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byPage} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="page"
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                          <p className="text-gray-400 mb-1">{payload[0].payload.page}</p>
                          <p className="font-bold text-green-400">{payload[0].value} visits</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">No data yet</p>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6">Devices</h2>
            {statsLoading ? (
              <Spinner />
            ) : stats?.byDevice?.length ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={stats.byDevice}
                      dataKey="count"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                    >
                      {stats.byDevice.map((entry) => (
                        <Cell
                          key={entry.device}
                          fill={DEVICE_COLORS[entry.device] || CHART_COLORS[2]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                            <p className="font-bold text-white">{payload[0].name}</p>
                            <p style={{ color: DEVICE_COLORS[payload[0].name] || CHART_COLORS[2] }}>
                              {payload[0].value} visits
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-3">
                  {stats.byDevice.map((entry) => (
                    <div key={entry.device} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: DEVICE_COLORS[entry.device] || CHART_COLORS[2] }}
                        />
                        <span className="text-gray-300">{entry.device}</span>
                      </div>
                      <span className="text-gray-400 font-mono tabular-nums">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">No data yet</p>
            )}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-6">Browsers</h2>
          {statsLoading ? (
            <Spinner />
          ) : stats?.byBrowser?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byBrowser} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="browser" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl">
                        <p className="text-gray-400 mb-1">{payload[0].payload.browser}</p>
                        <p className="font-bold text-yellow-400">{payload[0].value} visits</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.byBrowser.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        {/* Visitor Log Table */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold">
              Visitor Log
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({visitorsTotal.toLocaleString()} records)
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              >
                <option value="">All Devices</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
              </select>
              <select
                value={browserFilter}
                onChange={(e) => setBrowserFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              >
                <option value="">All Browsers</option>
                <option value="Chrome">Chrome</option>
                <option value="Firefox">Firefox</option>
                <option value="Safari">Safari</option>
                <option value="Edge">Edge</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {visitorsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 bg-gray-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : visitors.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No visitors recorded yet</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      {["IP", "Page", "Device", "Browser", "OS", "Lang", "Referrer", "Time"].map(
                        (h) => (
                          <th key={h} className="pb-3 pr-4 text-gray-500 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {visitors.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-3 pr-4 font-mono text-gray-400 text-xs whitespace-nowrap">
                          {v.ip}
                        </td>
                        <td className="py-3 pr-4 text-green-400 whitespace-nowrap">{v.page || "/"}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              v.device === "Desktop"
                                ? "bg-green-500/10 text-green-400"
                                : v.device === "Mobile"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {v.device || "Unknown"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">
                          {v.browser || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">{v.os || "—"}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                          {v.language || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs max-w-[140px] truncate">
                          {v.referrer || "—"}
                        </td>
                        <td className="py-3 text-gray-500 text-xs whitespace-nowrap">
                          {toIST(v.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {visitorsPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setVisitorPage((p) => Math.max(1, p - 1))}
                    disabled={visitorPage === 1}
                    className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(visitorsPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setVisitorPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        visitorPage === p
                          ? "bg-green-500 text-black font-bold"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setVisitorPage((p) => Math.min(visitorsPages, p + 1))}
                    disabled={visitorPage === visitorsPages}
                    className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default VisitorAnalytics;
