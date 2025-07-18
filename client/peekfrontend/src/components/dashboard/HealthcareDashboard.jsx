import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiHeart, FiUsers, FiBarChart2, FiActivity, FiCpu, FiMessageSquare, FiTarget, FiArrowUp, FiArrowDown, FiCalendar } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';

const HealthcareDashboard = ({ file, analysis }) => {
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
        '#7400B8', '#9B4DCA', '#C77DFF', '#E0AAFF', '#4e389f',
        '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#4e389f',
        '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#4e389f'
    ];

    const { summary, insights } = analysis;
    const {
        kpis = {},
        highPerformers = {},
        lowPerformers = {},
        hypothesis = [],
        totals = {},
        trends = {},
        breakdowns = {},
        correlations = [],
        forecasts = {},
    } = insights || {};

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
    const summaryFields = Object.entries(summary || {}).map(([name, field]) => ({
        name,
        ...field,
    }));

    // Utility for safe rendering
    const renderValue = (v) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return <span className="font-mono text-xs bg-gray-100 px-1 rounded">{JSON.stringify(v)}</span>;
        return String(v);
    };

    // Helper to render summary field
    const renderSummaryField = (field) => {
        if (field.type === 'numeric') {
            return (
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Min:</span>
                        <span className="font-medium text-[#7400B8]">{formatNumber(field.min)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-medium text-[#7400B8]">{formatNumber(field.max)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Mean:</span>
                        <span className="font-medium text-[#7400B8]">{formatNumber(field.mean)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Median:</span>
                        <span className="font-medium text-[#7400B8]">{formatNumber(field.median)}</span>
                    </div>
                    {field.stddev !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Stddev:</span>
                            <span className="font-medium text-[#7400B8]">{formatNumber(field.stddev)}</span>
                        </div>
                    )}
                </div>
            );
        } else if (field.type === 'categorical') {
            return (
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Unique:</span>
                        <span className="font-medium text-[#7400B8]">{field.unique_count}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Top values:</span>
                        <ul className="ml-2 mt-1 list-disc text-xs text-gray-700">
                            {field.top_values?.map((v, i) => (
                                <li key={i}>{renderValue(v.value)} <span className="text-[#7400B8]">({renderValue(v.count)})</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Helper to render breakdown charts
    const renderBreakdownChart = (data, xKey, yKey, title, icon) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
        >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey={yKey} fill="#7400B8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // Helper to render pie chart breakdowns
    const renderPieBreakdown = (data, nameKey, valueKey, title, icon) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
        >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={valueKey}
                            nameKey={nameKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // --- Trends scaling state ---
    const [trendWindow, setTrendWindow] = useState('all');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showSummary, setShowSummary] = useState(false);

    // Helper to render medication trends
    const renderMedicationTrends = (data) => {
        // Helper to normalize to YYYY-MM-DD
        const toYMD = (date) => {
            if (!date) return '';
            const d = new Date(date);
            if (isNaN(d)) return '';
            return d.toISOString().slice(0, 10);
        };
        let filtered = data;
        if (trendWindow === 'custom' && (customRange.start || customRange.end)) {
            const startYMD = customRange.start;
            const endYMD = customRange.end;
            filtered = data.filter(d => {
                const dYMD = toYMD(d.date);
                if (!dYMD) return false;
                if (startYMD && endYMD) return dYMD >= startYMD && dYMD <= endYMD;
                if (startYMD) return dYMD >= startYMD;
                if (endYMD) return dYMD <= endYMD;
                return true;
            });
        } else if (trendWindow !== 'all') {
            const window = Math.min(data.length, parseInt(trendWindow));
            const start = data.length - window;
            filtered = data.slice(start);
        }
        // Format date for display
        filtered = filtered.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Medication Trends
                    </h3>
                    {data.length > 30 && (
                        <div className="flex gap-2 items-center bg-white/70 border border-[#7400B8]/10 rounded-xl px-3 py-2 shadow-sm">
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
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
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
                        </div>
                    )}
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filtered}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#7400B8" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        );
    };

    // Helper to render correlations
    const renderCorrelations = (correlations) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 shadow-lg"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#7400B8]/10 flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-[#7400B8]" />
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-800">Correlations</p>
                </div>
            </div>
            <ul className="space-y-2 mt-4">
                {correlations.map((c, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-700">
                        <span className="font-medium text-gray-600">{renderValue(c.between)}</span>
                        <span className="font-bold text-[#7400B8]">{renderValue(c.correlation)}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    // Helper to render forecasts
    const renderForecasts = (forecasts) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 shadow-lg"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#7400B8]/10 flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-[#7400B8]" />
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-800">Forecasts</p>
                </div>
            </div>
            <ul className="space-y-2 mt-4">
                {Object.entries(forecasts).map(([key, value], i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-700">
                        <span className="font-medium text-gray-600">{renderValue(key.replace(/_/g, ' '))}</span>
                        <span className="font-bold text-[#7400B8]">{renderValue(value)}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    // Add a helper to render a bar chart for array of objects with two keys
    const renderBarChart = (data, color = '#7400B8') => {
        if (!Array.isArray(data) || data.length === 0) return null;
        const keys = Object.keys(data[0] || {});
        if (keys.length !== 2) return null;
        const [labelKey, valueKey] = keys;
        // Check if valueKey is numeric in all rows
        if (!data.every(d => typeof d[valueKey] === 'number')) return null;
        return (
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis dataKey={labelKey} type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey={valueKey} fill={color} radius={[0, 8, 8, 0]} barSize={28}>
                            {data.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Add a rounding helper near the top (with other helpers):
    const round4 = (v) => {
        if (typeof v === 'number') return Number(v.toFixed(3));
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(Number(v).toFixed(3));
        return v;
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 p-4 sm:p-6 lg:p-8"
            >
                {/* Key Performance Indicators */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                        Key Performance Indicators
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(kpis).map(([k, v], idx) => (
                        <motion.div
                                key={k}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (idx + 1) }}
                            className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#7400B8]/10 flex items-center justify-center">
                                    <FiBarChart2 className="w-5 h-5 text-[#7400B8]" />
                                </div>
                                <div>
                                        <p className="text-sm font-medium text-gray-600">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                            </div>
                                </div>
                                <p className="text-2xl font-bold text-[#7400B8]">{typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== undefined) ? round4(v) : renderValue(v)}</p>
                        </motion.div>
                        ))}
                    </div>
                </div>

                {/* Correlations & Forecasts side by side */}
                {(correlations?.length > 0 || (forecasts && Object.keys(forecasts).length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {correlations && correlations.length > 0 && renderCorrelations(correlations)}
                    {forecasts && Object.keys(forecasts).length > 0 && renderForecasts(forecasts)}
                  </div>
                )}

                {/* High/Low Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* High Performer */}
                    {Object.keys(highPerformers).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                                High Performer
                        </h3>
                            <div className="space-y-2">
                                {Object.entries(highPerformers).map(([k, v], idx) => (
                                    <div key={k} className="mb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                        </div>
                                        {Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && Object.keys(v[0]).length === 2 && typeof Object.values(v[0])[1] === 'number'
                                            ? renderBarChart(v, '#16a34a')
                                            : <span className="font-bold text-green-600">{renderValue(v)}</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {/* Low Performer */}
                    {Object.keys(lowPerformers).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FiTrendingDown className="w-6 h-6 text-[#7400B8]" />
                                Low Performer
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(lowPerformers).map(([k, v], idx) => (
                                    <div key={k} className="mb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                        </div>
                                        {Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && Object.keys(v[0]).length === 2 && typeof Object.values(v[0])[1] === 'number'
                                            ? renderBarChart(v, '#e11d48')
                                            : <span className="font-bold text-red-600">{renderValue(v)}</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Breakdowns and Trends */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Admissions by Department */}
                    {breakdowns.admissions_by_department && Array.isArray(breakdowns.admissions_by_department) && breakdowns.admissions_by_department.length > 0 &&
                        renderBreakdownChart(breakdowns.admissions_by_department, 'Department', 'Admissions', 'Admissions by Department', <FiUsers className="w-6 h-6 text-[#7400B8]" />)
                    }
                    {/* Disease Incidence */}
                    {breakdowns.disease_incidence && Array.isArray(breakdowns.disease_incidence) && breakdowns.disease_incidence.length > 0 &&
                        renderBreakdownChart(breakdowns.disease_incidence, 'Disease', 'Admissions', 'Disease Incidence', <FiHeart className="w-6 h-6 text-[#7400B8]" />)
                    }
                    {/* Equipment Usage */}
                    {breakdowns.equipment_usage && Array.isArray(breakdowns.equipment_usage) && breakdowns.equipment_usage.length > 0 &&
                        renderBreakdownChart(breakdowns.equipment_usage, 'Equipment Used', 'Admissions', 'Equipment Usage', <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />)
                    }
                    {/* Insurance Claims */}
                    {breakdowns.insurance_claims && Array.isArray(breakdowns.insurance_claims) && breakdowns.insurance_claims.length > 0 &&
                        renderBreakdownChart(breakdowns.insurance_claims, 'Insurance Claims', 'Admissions', 'Insurance Claims', <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />)
                    }
                        </div>

                {/* Medication Trends */}
                {trends.medication_trends && Array.isArray(trends.medication_trends) && trends.medication_trends.length > 0 &&
                    renderMedicationTrends(trends.medication_trends)
                }

                {/* Data Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiCalendar className="w-6 h-6 text-[#7400B8]" />
                        Data Analytics Summary
                    </h3>
                    <p className="text-gray-600 mb-6">Statistical overview of healthcare metrics</p>
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">Metrics analyzed: <span className="font-semibold text-[#7400B8]">{summaryFields.length}</span></p>
                    </div>
                    {renderSummary(summary)}
                </motion.div>

                {/* AI Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FiCpu className="w-6 h-6 text-[#7400B8]" />
                            AI-Powered Insights
                        </h3>
                    </div>
                    {/* Hypothesis */}
                    {hypothesis && Array.isArray(hypothesis) && (
                        <div className="mb-6">
                            <h4 className="font-bold text-gray-800 mb-3">Analysis Summary:</h4>
                            <div className="space-y-2">
                                {hypothesis.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-[#7400B8] mt-0.5">•</span>
                                        <span>{renderValue(item)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
};

export default HealthcareDashboard; 