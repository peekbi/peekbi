import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiBarChart2, FiActivity, FiCpu, FiMessageSquare, FiPieChart, FiTarget, FiArrowUp, FiArrowDown, FiArrowRight, FiAlertCircle, FiCheckCircle, FiInfo, FiCalendar } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import AIAnalyst from './AIAnalyst';

const FinanceDashboard = ({ file, analysis }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [showSummary, setShowSummary] = useState(false);
    const [trendMetric, setTrendMetric] = useState(null);
    const [trendWindow, setTrendWindow] = useState([0, 12]);
    const [totalsWindow, setTotalsWindow] = useState({});

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

    // Helper function to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
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

    // Create chart data for revenue by division
    const divisionChartData = totals?.revenue_by_Division || [];

    // Create trend data
    const trendData = trends || [];

    // --- Trends Section Logic ---
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
        // Window logic
        const dataLength = trends.length;
        const showSlider = dataLength > 12;
        const [start, end] = trendWindow;
        const visibleData = showSlider ? trends.slice(start, end) : trends;
        // Dropdown for metric selection
        const handleMetricChange = (e) => setTrendMetric(e.target.value);
        // Slider for window selection
        const handleWindowChange = (e) => {
            const val = Number(e.target.value);
            setTrendWindow([val, Math.min(val + 12, dataLength)]);
        };
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key={mainKey} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Trends
                    </h3>
                    <div className="flex items-center gap-2">
                        <label htmlFor="trend-metric" className="text-sm text-gray-600 mr-1">Metric:</label>
                        <select id="trend-metric" value={mainKey} onChange={handleMetricChange} className="border rounded px-2 py-1 text-sm">
                            {numericKeys.map((k) => (
                                <option key={k} value={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {showSlider && (
                    <div className="mb-4 flex items-center gap-2">
                        <label htmlFor="trend-slider" className="text-xs text-gray-500">Window:</label>
                        <input
                            id="trend-slider"
                            type="range"
                            min={0}
                            max={dataLength - 12}
                            value={start}
                            onChange={handleWindowChange}
                            className="w-full max-w-xs"
                        />
                        <span className="text-xs text-gray-500">{start + 1} - {end}</span>
                    </div>
                )}
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
                            <AreaChart data={visibleData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
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

    // --- Section Renderers (conditional, dynamic) ---
    // KPIs
    const renderKPIs = (kpis) => {
        if (!kpis || Object.keys(kpis).length === 0) return null;
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" /> Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <p className="text-2xl font-bold text-[#7400B8]">{typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined) ? round4(value) : String(value)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // High/Low Performers
    const renderPerformerSection = (title, data, labelKey, valueKey, color) => {
        if (!data || !Array.isArray(data) || data.length === 0) return null;
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col items-start mb-8 w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" /> {title}
                </h3>
                <div className="w-full">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis dataKey={labelKey} type="category" width={120} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={valueKey} fill={color} radius={[0, 8, 8, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        );
    };

    // Totals (show as chart or table if possible)
    const renderTotals = (totals) => {
        if (!totals || Object.keys(totals).length === 0) return null;
        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Totals
                </h3>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(totals).map(([key, value], idx) => {
                        // Chart for array of objects with two keys
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length === 2) {
                            const [labelKey, valueKey] = Object.keys(value[0]);
                            const dataLength = value.length;
                            const showSlider = dataLength > 12;
                            const windowState = totalsWindow[key] || [0, 12];
                            const [start, end] = windowState;
                            const visibleData = showSlider ? value.slice(start, end) : value;
                            const handleTotalsWindowChange = (e) => {
                                const val = Number(e.target.value);
                                setTotalsWindow(prev => ({ ...prev, [key]: [val, Math.min(val + 12, dataLength)] }));
                            };
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    {showSlider && (
                                        <div className="mb-2 flex items-center gap-2 w-full max-w-md mx-auto">
                                            <label htmlFor={`totals-slider-${key}`} className="text-xs text-gray-500">Window:</label>
                                            <input
                                                id={`totals-slider-${key}`}
                                                type="range"
                                                min={0}
                                                max={dataLength - 12}
                                                value={start}
                                                onChange={handleTotalsWindowChange}
                                                className="w-full max-w-xs"
                                            />
                                            <span className="text-xs text-gray-500">{start + 1} - {end}</span>
                                        </div>
                                    )}
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={visibleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} interval={0} angle={visibleData.length > 8 ? -30 : 0} textAnchor={visibleData.length > 8 ? 'end' : 'middle'} height={visibleData.length > 8 ? 60 : 30} />
                                                <YAxis />
                                                <Tooltip />
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
                            const showSlider = dataLength > 12;
                            const windowState = totalsWindow[key] || [0, 12];
                            const [start, end] = windowState;
                            const visibleRows = showSlider ? Array.from({length: end - start}, (_, i) => start + i) : Array.from({length: dataLength}, (_, i) => i);
                            const handleTotalsWindowChange = (e) => {
                                const val = Number(e.target.value);
                                setTotalsWindow(prev => ({ ...prev, [key]: [val, Math.min(val + 12, dataLength)] }));
                            };
                            return (
                                <div key={key} className="w-full">
                                    <h4 className="font-bold mb-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    {showSlider && (
                                        <div className="mb-2 flex items-center gap-2 w-full max-w-md mx-auto">
                                            <label htmlFor={`totals-slider-table-${key}`} className="text-xs text-gray-500">Window:</label>
                                            <input
                                                id={`totals-slider-table-${key}`}
                                                type="range"
                                                min={0}
                                                max={dataLength - 12}
                                                value={start}
                                                onChange={handleTotalsWindowChange}
                                                className="w-full max-w-xs"
                                            />
                                            <span className="text-xs text-gray-500">{start + 1} - {end}</span>
                                        </div>
                                    )}
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
                                <p>{JSON.stringify(value)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Summary
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

    // Hypotheses
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

    // Helper: Render Forecast section for Finance
    const renderForecast = (forecast) => {
        if (!forecast || Object.keys(forecast).length === 0) return null;
        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" /> Forecast
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(forecast).map(([key, value], idx) => (
                        <div key={key} className="p-4 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10">
                            <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {typeof value === 'object' && value !== null ? (
                                <div className="space-y-2">
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={subKey} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                            </span>
                                            <span className="font-bold text-[#7400B8]">
                                                {typeof subValue === 'number' ? round4(subValue) : String(subValue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-[#7400B8]">
                                    {typeof value === 'number' ? round4(value) : String(value)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Helper: Render Segments section for Finance
    const renderSegments = (segments) => {
        if (!segments || Object.keys(segments).length === 0) return null;
        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Segments
                </h3>
                <div className="space-y-4">
                    {Object.entries(segments).map(([key, value], idx) => (
                        <div key={key} className="p-4 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10">
                            <h4 className="font-semibold text-gray-800 mb-3 capitalize">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {Array.isArray(value) ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {value.map((item, index) => (
                                        <span key={index} className="px-3 py-2 bg-white/60 rounded-lg text-sm font-medium text-[#7400B8] border border-[#7400B8]/20">
                                            {String(item)}
                                        </span>
                                    ))}
                                </div>
                            ) : typeof value === 'object' && value !== null ? (
                                <div className="space-y-2">
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={subKey} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                            </span>
                                            <span className="font-bold text-[#7400B8]">
                                                {typeof subValue === 'number' ? round4(subValue) : String(subValue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-[#7400B8]">
                                    {typeof value === 'number' ? round4(value) : String(value)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Helper: round to 3 decimals
    const round4 = (v) => {
        if (typeof v === 'number') return Number(v.toFixed(3));
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(Number(v).toFixed(3));
        return v;
    };

    // Variance Section (styled, chart/table fallback, numbers rounded)
    const renderVariance = (variance) => {
        if (!variance || Object.keys(variance).length === 0) return null;
        return (
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Variance
                </h3>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(variance).map(([key, value], idx) => {
                        // Chart for array of objects with two keys
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length === 2) {
                            const [labelKey, valueKey] = Object.keys(value[0]);
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={value.map(d => ({ ...d, [valueKey]: round4(d[valueKey]) }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} interval={0} angle={value.length > 8 ? -30 : 0} textAnchor={value.length > 8 ? 'end' : 'middle'} height={value.length > 8 ? 60 : 30} />
                                                <YAxis tickFormatter={round4} />
                                                <Tooltip formatter={round4} />
                                                <Legend formatter={v => v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                                                <Line type="monotone" dataKey={valueKey} stroke="#7400B8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        // Fallback: table or primitive
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
                                                        {Object.keys(value).map((col, i) => <td key={i} className="px-2 py-1 border-b">{round4(value[col][rowIdx])}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                            </div>
                                ) : (
                                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- Render ---
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-4 sm:p-6 lg:p-8">
            {renderKPIs(insights.kpis)}
            {insights.highPerformers?.top_Month && renderPerformerSection('Top Months', insights.highPerformers.top_Month, 'Month', 'Revenue', '#7400B8')}
            {insights.lowPerformers?.bottom_Month && renderPerformerSection('Bottom Months', insights.lowPerformers.bottom_Month, 'Month', 'Revenue', '#C084FC')}
            {renderTotals(insights.totals)}
            {renderTrends(insights.trends)}
            {renderForecast(insights.forecast)}
            {renderSegments(insights.segments)}
            {renderVariance(insights.variance)}
            {renderSummary(summary)}
            {renderHypotheses(insights.hypothesis)}
        </motion.div>
    );
};

export default FinanceDashboard; 