import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiBookOpen, FiBarChart2, FiAward, FiCpu, FiMessageSquare, FiTarget, FiArrowUp, FiArrowDown, FiCalendar, FiActivity, FiInfo } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import AIAnalyst from './AIAnalyst';

const EducationDashboard = ({ file, analysis }) => {
    // Helper function to round numbers to 3 decimal places
    const round4 = (v) => {
        if (typeof v === 'number') return Number(v.toFixed(3));
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(Number(v).toFixed(3));
        return v;
    };

    if (!file || !analysis) {
        return (
            <div className="text-center p-8">
                <p>No analysis data available for this file.</p>
            </div>
        );
    }

    const { originalName } = file;
    
    // Enhanced color palette for pie charts
    const pieColors = [
        '#7400B8', '#9B4DCA', '#C77DFF', '#E0AAFF', '#F8F4FF',
        '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF',
        '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#DDD6FE'
    ];

    const { summary, insights } = analysis;
    const { kpis, highPerformers, lowPerformers, hypothesis, totals, trends } = insights;

    // Helper function to format numbers
    const formatNumber = (value) => {
        return typeof value === 'number' ? value.toLocaleString() : value;
    };

    // Helper function to format percentage
    const formatPercentage = (value) => {
        if (typeof value === 'string' && value.includes('%')) {
            return value;
        }
        return `${parseFloat(value).toFixed(2)}%`;
    };

    // Get summary fields dynamically
    const summaryFields = Object.keys(summary || {}).map(fieldName => {
        const fieldData = summary[fieldName];
        return {
            name: fieldName,
            min: fieldData?.min || 0,
            max: fieldData?.max || 0,
            mean: fieldData?.mean || 0,
            median: fieldData?.median || 0
        };
    });

    const [showSummary, setShowSummary] = useState(false);

    // Helper: Render KPIs
    const renderKPIs = (kpis) => {
        if (!kpis || Object.keys(kpis).length === 0) return null;
    return (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                        Key Performance Indicators
                    </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(kpis).map(([key, value], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#7400B8]/10 flex items-center justify-center">
                                    <FiBarChart2 className="w-5 h-5 text-[#7400B8]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-[#7400B8]">{String(value)}</p>
                        </motion.div>
                    ))}
                </div>
                                        </div>
        );
    };

    // Helper: Render High/Low Performers
    const renderPerformerSection = (title, data, labelKey, valueKey, color) => {
        if (!data || !data[labelKey] || !data[valueKey] || !Array.isArray(data[labelKey]) || !Array.isArray(data[valueKey]) || data[labelKey].length === 0) return null;
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col items-start mb-8 w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" /> {title}
                        </h3>
                <div className="w-full">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data[labelKey].map((label, i) => ({ [labelKey]: label, [valueKey]: data[valueKey][i] }))} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis dataKey={labelKey} type="category" width={120} />
                            <Tooltip formatter={(value) => [value, valueKey]} />
                                        <Legend />
                            <Bar dataKey={valueKey} fill={color} radius={[0, 8, 8, 0]} barSize={28}>
                                {data[labelKey].map((_, idx) => (
                                    <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                                            ))}
                                        </Bar>
                        </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
        );
    };

    // Add state for number-based totals filter
    const [totalsWindow, setTotalsWindow] = useState('all');
    const [totalsCustomN, setTotalsCustomN] = useState(10);

    const renderTotals = (totals) => {
        if (!totals || Object.keys(totals).length === 0) return null;
        // Compute filter indices (number-based only)
        // Find the length of the first array in totals
        let firstArrLen = 0;
        for (const value of Object.values(totals)) {
            if (typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0])) {
                firstArrLen = Object.values(value)[0].length;
                break;
            }
        }
        let windowN = 0;
        if (totalsWindow === 'custom') {
            windowN = Math.max(1, Math.min(firstArrLen, parseInt(totalsCustomN) || 1));
        } else if (totalsWindow !== 'all') {
            windowN = Math.min(firstArrLen, parseInt(totalsWindow));
        } else {
            windowN = firstArrLen;
        }
        const startIdx = Math.max(0, firstArrLen - windowN);
        const filterIndices = Array.from({length: firstArrLen}, (_, i) => i >= startIdx);

        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Totals
                </h3>
                    <div className="flex flex-wrap items-center gap-2 bg-white/70 border border-[#7400B8]/10 rounded-xl px-3 py-2 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Show:</span>
                        <select
                            value={totalsWindow}
                            onChange={e => {
                                setTotalsWindow(e.target.value);
                            }}
                            className="px-2 py-1 rounded border border-gray-200 text-sm"
                        >
                            <option value="7">Last 7</option>
                            <option value="30">Last 30</option>
                            <option value="90">Last 90</option>
                            <option value="all">All</option>
                            <option value="custom">Custom</option>
                        </select>
                        {totalsWindow === 'custom' && (
                            <input
                                type="number"
                                min={1}
                                max={firstArrLen}
                                value={totalsCustomN}
                                onChange={e => setTotalsCustomN(e.target.value)}
                                className="px-2 py-1 rounded border border-gray-200 text-sm w-20"
                                placeholder="N"
                            />
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(totals).map(([key, value], idx) => {
                        // Line chart for object with two arrays of equal length
                        if (
                            typeof value === 'object' && value !== null &&
                            Array.isArray(Object.values(value)[0]) &&
                            Array.isArray(Object.values(value)[1]) &&
                            Object.values(value)[0].length > 0 &&
                            Object.values(value)[0].length === Object.values(value)[1].length
                        ) {
                            const [labelKey, valueKey] = Object.keys(value);
                            const dataLength = value[labelKey].length;
                            // Filter data using filterIndices if available
                            let data = value[labelKey].map((label, i) => ({
                                [labelKey]: label,
                                [valueKey]: value[valueKey][i]
                            }));
                            if (filterIndices && filterIndices.length === data.length) {
                                data = data.filter((_, i) => filterIndices[i]);
                            }
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} interval={0} angle={data.length > 8 ? -30 : 0} textAnchor={data.length > 8 ? 'end' : 'middle'} height={data.length > 8 ? 60 : 30} />
                                                <YAxis />
                                                <Tooltip formatter={(v) => v} />
                                                <Legend />
                                                <Line type="monotone" dataKey={valueKey} stroke="#7400B8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        // Fallback: table or primitive
                        if (typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0])) {
                            const dataLength = Object.values(value)[0].length;
                            // Filter rows using filterIndices if available
                            let visibleRows = Array.from({length: dataLength}, (_, i) => i);
                            if (filterIndices && filterIndices.length === dataLength) {
                                visibleRows = visibleRows.filter(i => filterIndices[i]);
                            }
                            return (
                                <div key={key} className="w-full">
                                    <h4 className="font-bold mb-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs">
                                            <thead>
                                                <tr>
                                                    {Object.keys(value).map((col, i) => <th key={i} className="px-2 py-1 border-b text-left">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleRows.map((rowIdx) => (
                                                    <tr key={rowIdx}>
                                                        {Object.keys(value).map((col, i) => <td key={i} className="px-2 py-1 border-b">{value[col][rowIdx]}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={key} className="w-full">
                                <h4 className="font-bold mb-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                {typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0]) ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs">
                                            <thead>
                                                <tr>
                                                    {Object.keys(value).map((col, i) => <th key={i} className="px-2 py-1 border-b text-left">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {value[Object.keys(value)[0]].map((_, rowIdx) => (
                                                    <tr key={rowIdx}>
                                                        {Object.keys(value).map((col, i) => <td key={i} className="px-2 py-1 border-b">{value[col][rowIdx]}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                            </div>
                                ) : (
                                    <p>{JSON.stringify(value)}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Add state for advanced trends filter
    const [trendWindow, setTrendWindow] = useState('all');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    // Helper: Render Trends
    const [trendMetric, setTrendMetric] = useState(null);
    const renderTrends = (trends) => {
        if (!Array.isArray(trends) || trends.length === 0) return null;
        if (trends.length < 3) {
            return (
                <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 text-center text-gray-500">
                    Not enough data to display trends graph.
                </div>
            );
        }
        // Find numeric keys for plotting
        const numericKeys = Object.keys(trends[0] || {}).filter(k => typeof trends[0][k] === 'number');
        const allKeys = Object.keys(trends[0] || {});
        const mainKey = trendMetric || numericKeys[0] || allKeys[1];
        const xKey = allKeys[0];
        // --- Advanced filter logic ---
        // Helper to normalize to YYYY-MM-DD
        const toYMD = (date) => {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d)) return '';
            return d.toISOString().slice(0, 10);
        };
        let filtered = trends;
        if (trendWindow === 'custom' && (customRange.start || customRange.end)) {
            const startYMD = customRange.start;
            const endYMD = customRange.end;
            filtered = trends.filter(d => {
                const dYMD = toYMD(d[xKey]);
                if (!dYMD) return false;
                if (startYMD && endYMD) return dYMD >= startYMD && dYMD <= endYMD;
                if (startYMD) return dYMD >= startYMD;
                if (endYMD) return dYMD <= endYMD;
                return true;
            });
        } else if (trendWindow !== 'all') {
            const window = Math.min(trends.length, parseInt(trendWindow));
            const start = trends.length - window;
            filtered = trends.slice(start);
        }
        // Format date for display
        filtered = filtered.map(d => ({ ...d, [xKey]: new Date(d[xKey]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Trends
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 bg-white/70 border border-[#7400B8]/10 rounded-xl px-3 py-2 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">Show:</span>
                        <select
                            value={trendWindow}
                            onChange={e => {
                                setTrendWindow(e.target.value);
                                if (e.target.value !== 'custom') {
                                    setCustomRange({ start: '', end: '' });
                                }
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#7400B8] focus:border-[#7400B8] bg-white"
                        >
                            <option value="7">Last 7</option>
                            <option value="30">Last 30</option>
                            <option value="90">Last 90</option>
                            <option value="all">All</option>
                            <option value="custom">Custom Range…</option>
                        </select>
                        {trendWindow === 'custom' && (
                            <>
                                <input
                                    type="date"
                                    value={customRange.start}
                                    max={customRange.end || undefined}
                                    onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#7400B8] focus:border-[#7400B8] bg-white ml-2"
                                />
                                <span className="mx-1 text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={customRange.end}
                                    min={customRange.start || undefined}
                                    onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#7400B8] focus:border-[#7400B8] bg-white"
                                />
                            </>
                        )}
                        <label htmlFor="trend-metric" className="text-sm font-semibold text-[#7400B8] ml-4 mr-1">Metric:</label>
                        <select
                            id="trend-metric"
                            value={mainKey}
                            onChange={handleMetricChange}
                            className="rounded-full px-4 py-1.5 text-sm font-medium bg-white border-2 border-[#7400B8]/30 focus:border-[#7400B8] focus:ring-2 focus:ring-[#7400B8]/20 text-[#7400B8] transition-all duration-200 outline-none shadow-sm cursor-pointer hover:border-[#9B4DCA] hover:bg-[#F3E8FF]"
                            style={{ minWidth: 120 }}
                        >
                            {numericKeys.map((k) => (
                                <option key={k} value={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="h-[350px] w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filtered} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey={xKey} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey={mainKey} stroke="#7400B8" fill="url(#colorTrend)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        );
    };

    // Helper: Render Summary
    const friendlyLabel = (key) => {
        const map = {
            mean: "Average",
            median: "Middle Value",
            std: "Variation",
            stddev: "Variation",
            min: "Minimum",
            max: "Maximum",
            sum: "Total",
            count: "Total Entries",
            mode: "Most Common",
            percentile: "Percentile",
            range: "Range",
            variance: "Spread",
            skew: "Skewness",
            kurtosis: "Peakedness",
        };
        const cleaned = key.replace(/_/g, '').toLowerCase();
        for (const [stat, label] of Object.entries(map)) {
            if (cleaned === stat || cleaned.endsWith(stat) || cleaned.startsWith(stat)) return label;
        }
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderSummary = (summary) => {
        if (!summary || Object.keys(summary).length === 0) return null;
        return (
            <div className="mb-8">
                <button
                    className="mb-4 px-4 py-2 bg-[#7400B8] text-white rounded-lg shadow hover:bg-[#5a0091] transition"
                    onClick={() => setShowSummary(s => !s)}
                >
                    {showSummary ? 'Hide Summary' : 'Show Summary'}
                </button>
                {showSummary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(summary).map(([field, details]) => {
                            const isPercentField = field.toLowerCase().includes('%') || field.toLowerCase().includes('percent');
                            const isStatsObject = (obj) => {
                                if (!obj || typeof obj !== 'object') return false;
                                const statKeys = ['min', 'max', 'mean', 'median', 'stddev', 'count', 'sum'];
                                return statKeys.some(k => k in obj);
                            };
                            const renderStatsObject = (obj) => (
                                <ul className="text-sm space-y-1">
                                    {Object.entries(obj).map(([k, v]) => (
                                        <li key={k}>
                                            <span className="font-semibold">{k.toLowerCase() === 'count' ? 'Total Entries' : friendlyLabel(k)}:</span> {typeof v === 'number' ? round4(v) : String(v)}
                                        </li>
                                    ))}
                                </ul>
                            );
                            return (
                            <div key={field} className="bg-[#F9F4FF] rounded-2xl p-4 border border-[#7400B8]/10">
                                    <h4 className="font-bold mb-2">{friendlyLabel(field)}</h4>
                                    {details && typeof details === 'object' && 'type' in details && (
                                        <>
                                {details.type === 'numeric' && (
                                    <ul className="text-sm space-y-1">
                                                    {Object.entries(details).map(([statKey, statValue]) => {
                                                        if (statKey === 'type') return null;
                                                        if (statKey.toLowerCase().includes('variation')) {
                                                            return (
                                                                <li key={statKey}><span className="font-semibold">{friendlyLabel(statKey)}:</span> {isPercentField ? `${round4(statValue)}%` : round4(statValue)}</li>
                                                            );
                                                        }
                                                        if (Array.isArray(statValue) && statValue.length > 0 && typeof statValue[0] === 'object') {
                                                            const columns = Object.keys(statValue[0]);
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <div className="overflow-x-auto mt-1">
                                                                        <table className="min-w-full text-xs border border-gray-200 rounded">
                                                                            <thead>
                                                                                <tr>
                                                                                    {columns.map(col => (
                                                                                        <th key={col} className="px-2 py-1 border-b text-left">{friendlyLabel(col)}</th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {statValue.map((row, i) => (
                                                                                    <tr key={i}>
                                                                                        {columns.map(col => (
                                                                                            <td key={col} className="px-2 py-1 border-b">{row[col]}</td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </li>
                                                            );
                                                        }
                                                        if (Array.isArray(statValue) && statValue.length > 0 && typeof statValue[0] !== 'object') {
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <ul className="ml-2 list-disc list-inside">
                                                                        {statValue.map((v, idx) => (
                                                                            <li key={idx}>{String(v)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            );
                                                        }
                                                        if (typeof statValue === 'object' && statValue !== null) {
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <ul className="ml-2">
                                                                        {Object.entries(statValue).map(([k, v]) => (
                                                                            <li key={k}><span className="font-semibold">{friendlyLabel(k)}:</span> {String(v)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            );
                                                        }
                                                        return (
                                                            <li key={statKey}><span className="font-semibold">{statKey.toLowerCase() === 'count' ? 'Total Entries' : friendlyLabel(statKey)}:</span> {String(statValue)}</li>
                                                        );
                                                    })}
                                    </ul>
                                )}
                                            {details.type === 'boolean' && Array.isArray(details.counts) && (
                                                <div className="mt-2">
                                                    <span className="font-semibold">Counts:</span>
                                                    <div className="overflow-x-auto mt-1">
                                                        <table className="min-w-full text-xs border border-gray-200 rounded">
                                                <thead>
                                                    <tr>
                                                        <th className="px-2 py-1 border-b text-left">Value</th>
                                                        <th className="px-2 py-1 border-b text-left">Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                                {details.counts.map((row, i) => (
                                                                    <tr key={i}>
                                                                        <td className="px-2 py-1 border-b">{row.value === true ? 'Yes' : row.value === false ? 'No' : String(row.value)}</td>
                                                                        <td className="px-2 py-1 border-b">{row.count}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                            {details.type === 'categorical' && (
                                                <ul className="text-sm space-y-1">
                                                    {Object.entries(details).filter(([statKey]) => statKey !== 'type').map(([statKey, statValue]) => {
                                                        if (Array.isArray(statValue) && statValue.length > 0 && typeof statValue[0] === 'object') {
                                                            const columns = Object.keys(statValue[0]);
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <div className="overflow-x-auto mt-1">
                                                                        <table className="min-w-full text-xs border border-gray-200 rounded">
                                                                            <thead>
                                                                                <tr>
                                                                                    {columns.map(col => (
                                                                                        <th key={col} className="px-2 py-1 border-b text-left">{friendlyLabel(col)}</th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {statValue.map((row, i) => (
                                                        <tr key={i}>
                                                                                        {columns.map(col => (
                                                                                            <td key={col} className="px-2 py-1 border-b">{row[col]}</td>
                                                                                        ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                    </div>
                                                                </li>
                                                            );
                                                        }
                                                        if (Array.isArray(statValue) && statValue.length > 0 && typeof statValue[0] !== 'object') {
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <ul className="ml-2 list-disc list-inside">
                                                                        {statValue.map((v, idx) => (
                                                                            <li key={idx}>{String(v)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            );
                                                        }
                                                        if (typeof statValue === 'object' && statValue !== null) {
                                                            return (
                                                                <li key={statKey} className="mt-2">
                                                                    <span className="font-semibold">{friendlyLabel(statKey)}:</span>
                                                                    <ul className="ml-2">
                                                                        {Object.entries(statValue).map(([k, v]) => (
                                                                            <li key={k}><span className="font-semibold">{friendlyLabel(k)}:</span> {String(v)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            );
                                                        }
                                                        return (
                                                            <li key={statKey}><span className="font-semibold">{statKey.toLowerCase() === 'count' ? 'Total Entries' : friendlyLabel(statKey)}:</span> {String(statValue)}</li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                    </>
                                )}
                                    {details && typeof details === 'object' && !('type' in details) && isStatsObject(details) && renderStatsObject(details)}
                                    {Array.isArray(details) && details.length > 0 && typeof details[0] === 'object' && (() => {
                                        const columns = Object.keys(details[0]);
                                        return (
                                            <div className="overflow-x-auto mt-1">
                                                <table className="min-w-full text-xs border border-gray-200 rounded">
                                            <thead>
                                                <tr>
                                                            {columns.map(col => (
                                                                <th key={col} className="px-2 py-1 border-b text-left">{friendlyLabel(col)}</th>
                                                            ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                        {details.map((row, i) => (
                                                    <tr key={i}>
                                                                {columns.map(col => (
                                                                    <td key={col} className="px-2 py-1 border-b">{row[col]}</td>
                                                                ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                        );
                                    })()}
                                    {Array.isArray(details) && details.length > 0 && typeof details[0] !== 'object' && (
                                        <ul className="ml-2 list-disc list-inside">
                                            {details.map((v, idx) => (
                                                <li key={idx}>{String(v)}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {details && typeof details === 'object' && !('type' in details) && !isStatsObject(details) && (
                                        <ul className="text-sm space-y-1">
                                            {Object.entries(details).map(([k, v]) => (
                                                <li key={k}><span className="font-semibold">{friendlyLabel(k)}:</span> {String(v)}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {(!details || typeof details !== 'object') && (
                                        <div className="text-sm">{String(details)}</div>
                                    )}
                                    {(!details || (typeof details === 'object' && Object.keys(details).length === 0)) && (
                                        <div className="text-gray-500 text-sm">No data available.</div>
                                )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Helper: Render Hypotheses
    const renderHypotheses = (hypothesis) => {
        if (!Array.isArray(hypothesis) || hypothesis.length === 0) return null;
        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h4 className="font-bold mb-2">Hypotheses</h4>
                <ul className="list-disc list-inside">
                    {hypothesis.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
            </div>
        );
    };

    return (
        <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                className="space-y-8 p-4 sm:p-6 lg:p-8"
            >
                {renderKPIs(kpis)}
                {/* High Performers */}
                {highPerformers && (
                    <>
                        {renderPerformerSection('Top Students', highPerformers.top_students, 'StudentID', 'Grade', '#7400B8')}
                        {renderPerformerSection('Top Subjects', highPerformers.top_subjects, 'Subject', 'Grade', '#8B5CF6')}
                        {renderPerformerSection('Top Resource Users', highPerformers.top_resource_users, 'StudentID', 'LibraryUsage (hrs/month)', '#C084FC')}
                    </>
                )}
                {/* Low Performers */}
                {lowPerformers && (
                    <>
                        {renderPerformerSection('Bottom Students', lowPerformers.bottom_students, 'StudentID', 'Grade', '#C084FC')}
                        {renderPerformerSection('Bottom Subjects', lowPerformers.bottom_subjects, 'Subject', 'Grade', '#F59E42')}
                        {renderPerformerSection('Bottom Resource Users', lowPerformers.bottom_resource_users, 'StudentID', 'LibraryUsage (hrs/month)', '#F87171')}
                    </>
                )}
                {renderTotals(totals)}
                {renderTrends(trends)}
                {renderSummary(summary)}
                {renderHypotheses(hypothesis)}
            </motion.div>
        </>
    );
};

export default EducationDashboard; 