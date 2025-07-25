import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiBarChart2, FiActivity, FiCpu, FiMessageSquare, FiPieChart, FiTarget, FiArrowUp, FiArrowDown, FiArrowRight, FiAlertCircle, FiCheckCircle, FiInfo, FiCalendar, FiDownload } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import AIAnalyst from './AIAnalyst';
import * as XLSX from 'xlsx';

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

    // Color palette for charts (matches HealthcareDashboard)
    const chartColors = [
        '#3B82F6', // blue
        '#6366F1', // indigo
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#A855F7', // purple
        '#F97316', // orange
        '#06B6D4', // cyan
        '#F43F5E', // pink
        '#22D3EE', // teal
        '#84CC16', // lime
        '#EAB308', // amber
        '#0EA5E9', // sky
        '#8B5CF6', // violet
        '#F472B6', // fuchsia
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
        console.log('=== FINANCE TRENDS DATA ===', trends);
        if (!Array.isArray(trends) || trends.length === 0) return null;
        if (trends.length < 3) {
            return (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8 text-center text-gray-500">
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
        // const dataLength = trends.length;
        // const showSlider = dataLength > 12;
        // const [start, end] = trendWindow;
        // const visibleData = showSlider ? trends.slice(start, end) : trends;
        const visibleData = trends;
        // Dropdown for metric selection
        const handleMetricChange = (e) => setTrendMetric(e.target.value);
        // Slider for window selection (removed)
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
                <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <FiBarChart2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Trends</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="trend-metric" className="text-sm text-gray-600 mr-1">Metric:</label>
                        <select id="trend-metric" value={mainKey} onChange={handleMetricChange} className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                            {numericKeys.map((k) => (
                                <option key={k} value={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Slider removed for pixel-perfect Healthcare match */}
                <div className="h-[350px] w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visibleData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey={xKey} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                            <Area type="monotone" dataKey={mainKey} stroke={chartColors[0]} fill="url(#colorTrend)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // --- Section Renderers (conditional, dynamic) ---
    // KPIs
    const renderKPIs = (kpis) => {
        if (!kpis || Object.keys(kpis).length === 0) return null;
        const kpiEntries = Object.entries(kpis);
        const kpiCount = kpiEntries.length;
        let gridCols = 'grid-cols-1';
        if (kpiCount === 2) gridCols = 'sm:grid-cols-2';
        else if (kpiCount === 3) gridCols = 'sm:grid-cols-2 lg:grid-cols-3';
        else if (kpiCount >= 4) gridCols = 'sm:grid-cols-2 lg:grid-cols-4';
        // Calculate if last row needs special col-span
        const fullRows = Math.floor(kpiCount / 4);
        const lastRowCount = kpiCount % 4;
        return (
            <div className="space-y-4">
                <div className={`grid ${gridCols} gap-4`}>
                    {kpiEntries.map(([key, value], idx) => {
                        // For 9 or 10 cards, last 1 or 2 cards should take full width of last row
                        let extraClass = '';
                        if (kpiCount >= 9 && idx >= fullRows * 4) {
                            if (lastRowCount === 1 && idx === kpiCount - 1) extraClass = 'col-span-full';
                            if (lastRowCount === 2 && idx >= kpiCount - 2) extraClass = 'sm:col-span-2 lg:col-span-2';
                        }
                        return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                                className={`bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md ${extraClass}`}
                                style={{ borderRadius: '2px' }}
                            >
                                {/* Power BI style colored top border */}
                                <div className="h-1" style={{ backgroundColor: '#3B82F6' }}></div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-sm text-white" style={{ backgroundColor: '#3B82F6' }}>
                                                <FiBarChart2 className="w-5 h-5" />
                                </div>
                                            <div className="text-xs text-gray-600 font-medium">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </div>
                            </div>
                                        <div className="text-xs text-blue-600 font-semibold">
                                            +0%
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined)
                                            ? round4(value)
                                            : String(value)}
                                </div>
                                    <div className="text-sm text-gray-700 font-medium">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </div>
                                </div>
                        </motion.div>
                        );
                    })}
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
        console.log('=== FINANCE TOTALS DATA ===', totals);
        if (!totals || Object.keys(totals).length === 0) return null;
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-blue-600" /> Totals
                </h3>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(totals).map(([key, value], idx) => {
                        // Pie chart for array of objects with two keys (one numeric)
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length === 2) {
                            const [labelKey, valueKey] = Object.keys(value[0]);
                            const isNumeric = value.every(v => typeof v[valueKey] === 'number');
                            if (isNumeric && value.length <= 8) {
                                // Pie chart for up to 8 segments
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                        <div className="w-full flex items-center justify-center h-full overflow-visible">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={value}
                                                        dataKey={valueKey}
                                                        nameKey={labelKey}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill={chartColors[0]}
                                                        label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    >
                                                        {value.map((entry, i) => (
                                                            <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(v, n) => [v, n]} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                );
                            } else if (isNumeric) {
                                // Horizontal bar chart for more than 8 segments
                                return (
                                    <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                        <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={value} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey={labelKey} type="category" width={120} />
                                                <Tooltip />
                                                <Legend />
                                                    <Bar dataKey={valueKey} radius={[0, 8, 8, 0]} barSize={28}>
                                                        {value.map((_, i) => (
                                                            <Cell key={`cell-bar-${i}`} fill={chartColors[i % chartColors.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        }
                        // Fallback: line chart for object of arrays
                        if (typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0])) {
                            const dataLength = Object.values(value)[0].length;
                            const keys = Object.keys(value);
                            const chartData = Array.from({ length: dataLength }, (_, i) => {
                                const obj = {};
                                keys.forEach(k => { obj[k] = value[k][i]; });
                                return obj;
                            });
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey={keys[0]} tick={{ fontSize: 12 }} interval={0} angle={chartData.length > 8 ? -30 : 0} textAnchor={chartData.length > 8 ? 'end' : 'middle'} height={chartData.length > 8 ? 60 : 30} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {keys.slice(1).map((k, i) => (
                                                    <Line key={k} type="monotone" dataKey={k} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                                ))}
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
                <div className="border-b border-gray-200 p-4 flex items-center gap-2 mb-2">
                    <FiCpu className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
                </div>
                <div className="p-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {hypothesis.slice(0, 6).map((item, index) => (
                        <div key={index} className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors bg-blue-50">
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">AI Generated</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs text-gray-500">High Confidence</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Helper: Render Forecast section for Finance
    const renderForecast = (forecast) => {
        console.log('=== FINANCE FORECAST RAW DATA ===', forecast);
        if (!forecast || Object.keys(forecast).length === 0) return null;
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
                <div className="border-b border-gray-200 p-4 flex items-center gap-2 mb-2">
                    <FiTarget className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Forecast</h3>
                </div>
                <div className="p-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {Object.entries(forecast).map(([key, value], idx) => (
                        <div key={key} className="border border-blue-100 rounded-sm p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FiTarget className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-0.5 capitalize">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            </div>
                            {typeof value === 'object' && value !== null ? (
                                <div className="space-y-2">
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={subKey} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                            </span>
                                            <span className="font-bold text-blue-700">
                                                {typeof subValue === 'number' ? round4(subValue) : String(subValue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-2xl font-bold text-blue-700">
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
        console.log('=== FINANCE VARIANCE DATA ===', variance);
        if (!variance || Object.keys(variance).length === 0) return null;
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-6 h-6 text-blue-600" /> Variance
                </h3>
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(variance).map(([key, value], idx) => {
                        // Pie chart for array of objects with two keys (one numeric)
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length === 2) {
                            const [labelKey, valueKey] = Object.keys(value[0]);
                            const isNumeric = value.every(v => typeof v[valueKey] === 'number' || (!isNaN(Number(v[valueKey])) && v[valueKey] !== null && v[valueKey] !== undefined));
                            // Special handling for percent strings
                            const isPercent = value.some(v => typeof v[valueKey] === 'string' && v[valueKey].toString().includes('%'));
                            // Special handling for ratio (e.g., 0.52 as percent)
                            const isRatio = value.some(v => typeof v[valueKey] === 'string' && !isNaN(Number(v[valueKey])) && Number(v[valueKey]) < 1);
                            // If percent, format y-axis and tooltip as percent
                            if (isPercent || isRatio) {
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={value.map(d => ({ ...d, [valueKey]: parseFloat(d[valueKey]) }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
                                                    <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                                                    <Tooltip formatter={v => `${(v * 100).toFixed(2)}%`} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey={valueKey} stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                );
                            }
                            // Otherwise, bar chart or line chart for numbers
                            if (isNumeric) {
                                return (
                                    <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                        <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                        <div className="w-full flex items-center justify-center h-full overflow-visible">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={value} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey={labelKey} type="category" width={120} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey={valueKey} radius={[0, 8, 8, 0]} barSize={28}>
                                                        {value.map((_, i) => (
                                                            <Cell key={`cell-bar-${i}`} fill={chartColors[i % chartColors.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        // Fallback: line chart for object of arrays
                        if (typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0])) {
                            const dataLength = Object.values(value)[0].length;
                            const keys = Object.keys(value);
                            const chartData = Array.from({ length: dataLength }, (_, i) => {
                                const obj = {};
                                keys.forEach(k => { obj[k] = value[k][i]; });
                                return obj;
                            });
                            return (
                                <div key={key} className="w-full flex flex-col items-center justify-center h-full flex-1 overflow-visible">
                                    <h4 className="font-bold mb-2 text-center w-full break-words">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="w-full flex items-center justify-center h-full overflow-visible">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey={keys[0]} tick={{ fontSize: 12 }} interval={0} angle={chartData.length > 8 ? -30 : 0} textAnchor={chartData.length > 8 ? 'end' : 'middle'} height={chartData.length > 8 ? 60 : 30} />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {keys.slice(1).map((k, i) => (
                                                    <Line key={k} type="monotone" dataKey={k} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                                ))}
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
                                <p>{JSON.stringify(value)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Export to Excel function (multi-sheet)
    const exportToExcel = () => {
        if (!analysis) return;
        const wb = XLSX.utils.book_new();
        // KPIs
        if (insights?.kpis) {
            const kpiSheet = XLSX.utils.aoa_to_sheet([
                ['KPI', 'Value'],
                ...Object.entries(insights.kpis)
            ]);
            XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');
        }
        // Summary
        if (summary) {
            const summaryRows = Object.entries(summary).map(([k, v]) => {
                if (typeof v === 'object' && v !== null) {
                    return [k, JSON.stringify(v)];
                }
                return [k, v];
            });
            const summarySheet = XLSX.utils.aoa_to_sheet([
                ['Field', 'Value'],
                ...summaryRows
            ]);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        }
        // High Performers
        if (insights?.highPerformers?.top_Month?.length) {
            const arr = insights.highPerformers.top_Month;
            const highSheet = XLSX.utils.json_to_sheet(arr);
            XLSX.utils.book_append_sheet(wb, highSheet, 'High Performers');
        }
        // Low Performers
        if (insights?.lowPerformers?.bottom_Month?.length) {
            const arr = insights.lowPerformers.bottom_Month;
            const lowSheet = XLSX.utils.json_to_sheet(arr);
            XLSX.utils.book_append_sheet(wb, lowSheet, 'Low Performers');
        }
        // Totals
        if (insights?.totals) {
            Object.entries(insights.totals).forEach(([key, value]) => {
                if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
                    const sheet = XLSX.utils.json_to_sheet(value);
                    XLSX.utils.book_append_sheet(wb, sheet, `Totals - ${key}`);
                } else if (Array.isArray(value) && value.length >= 2 && Array.isArray(value[0]) && Array.isArray(value[1])) {
                    // Array of arrays (labels, values)
                    const rows = value[0].map((label, i) => ({ [key + ' Name']: label, [key + ' Value']: value[1][i] }));
                    const sheet = XLSX.utils.json_to_sheet(rows);
                    XLSX.utils.book_append_sheet(wb, sheet, `Totals - ${key}`);
                } else if (typeof value === 'object' && value !== null) {
                    const rows = Object.entries(value).map(([k, v]) => ({ [k]: v }));
                    const sheet = XLSX.utils.json_to_sheet(rows);
                    XLSX.utils.book_append_sheet(wb, sheet, `Totals - ${key}`);
                }
            });
        }
        // Trends
        if (insights?.trends && Array.isArray(insights.trends)) {
            const trendSheet = XLSX.utils.json_to_sheet(insights.trends);
            XLSX.utils.book_append_sheet(wb, trendSheet, 'Trends');
        } else if (insights?.trends && typeof insights.trends === 'object') {
            Object.entries(insights.trends).forEach(([key, value]) => {
                if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
                    const sheet = XLSX.utils.json_to_sheet(value);
                    XLSX.utils.book_append_sheet(wb, sheet, `Trends - ${key}`);
                } else if (Array.isArray(value) && value.length >= 2 && Array.isArray(value[0]) && Array.isArray(value[1])) {
                    const rows = value[0].map((label, i) => ({ [key + ' Name']: label, [key + ' Value']: value[1][i] }));
                    const sheet = XLSX.utils.json_to_sheet(rows);
                    XLSX.utils.book_append_sheet(wb, sheet, `Trends - ${key}`);
                }
            });
        }
        // Hypotheses
        if (insights?.hypothesis?.length) {
            const hypoSheet = XLSX.utils.aoa_to_sheet([
                ['Hypothesis'],
                ...insights.hypothesis.map(h => [h])
            ]);
            XLSX.utils.book_append_sheet(wb, hypoSheet, 'Hypotheses');
        }
        XLSX.writeFile(wb, `${file?.originalName?.replace(/\.[^/.]+$/, '') || 'finance_analysis'}.xlsx`);
    };

    // --- Render ---
    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            {renderKPIs(insights.kpis)}
            {insights.highPerformers?.top_Month && renderPerformerSection('Top Months', insights.highPerformers.top_Month, 'Month', 'Revenue', '#7400B8')}
            {insights.lowPerformers?.bottom_Month && renderPerformerSection('Bottom Months', insights.lowPerformers.bottom_Month, 'Month', 'Revenue', '#C084FC')}
            {renderTotals(insights.totals)}
            {renderTrends(insights.trends)}
            {renderForecast(insights.forecast)}
            {renderVariance(insights.variance)}
            {renderSummary(summary)}
            {renderHypotheses(insights.hypothesis)}
        </div>
    );
};

export default FinanceDashboard; 