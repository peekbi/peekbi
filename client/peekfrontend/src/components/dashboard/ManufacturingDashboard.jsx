import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiSettings, FiPackage, FiBarChart2, FiAlertTriangle, FiCpu, FiMessageSquare, FiTarget, FiArrowUp, FiArrowDown, FiCalendar, FiDollarSign, FiActivity, FiUsers } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import AIAnalyst from './AIAnalyst';

const ManufacturingDashboard = ({ file, analysis }) => {
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
    const { kpis, highPerformers, lowPerformers, hypothesis, totals, trends, efficiency, quality, maintenance, supplyChain, energy, workforce } = insights;
    const [showSummary, setShowSummary] = useState(false);
    const forecast = insights && insights.forecast ? insights.forecast : null;

    // Helper function to format numbers
    const formatNumber = (value) => {
        return typeof value === 'number' ? value.toLocaleString() : value;
    };

    // Helper function to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
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

    // Helper: Round numbers to 4 decimals
    const round4 = (v) => {
        if (typeof v === 'number') return Number(v.toFixed(3));
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(Number(v).toFixed(3));
        return v;
    };

    // Helper: Render KPIs
    const renderKPIs = (kpis) => {
        if (!kpis || Object.keys(kpis).length === 0) return null;
    return (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" /> Key Performance Indicators
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
                            <p className="text-2xl font-bold text-[#7400B8]">{typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined) ? round4(value) : String(value)}</p>
                        </motion.div>
                    ))}
                </div>
                                        </div>
        );
    };

    // Helper: Render High/Low Performers (BarChart)
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
                            <Tooltip formatter={(value) => [value, valueKey]} />
                                        <Legend />
                            <Bar dataKey={valueKey} fill={color} radius={[0, 8, 8, 0]} barSize={28}>
                                {data.map((_, idx) => (
                                    <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                                            ))}
                                        </Bar>
                        </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
        );
    };

    // Helper: Render Totals (LineChart or BarChart)
    const [totalsWindow, setTotalsWindow] = useState({});
    const renderTotals = (totals) => {
        if (!totals || Object.keys(totals).length === 0) return null;
        return (
                <div className="flex flex-col gap-8 w-full">
                    {Object.entries(totals).map(([key, value], idx) => {
                        // If value is array of objects with two keys, render LineChart
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
                                    {/* Removed h4 for totals */}
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
                                    {/* Removed h4 for totals */}
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
                                {/* Removed h4 for totals */}
                                <p>{JSON.stringify(value)}</p>
                            </div>
                        );
                    })}
            </div>
        );
    };

    // Helper: Get main metric from a section (first numeric or rate/efficiency/cost)
    const getMainMetric = (data) => {
        if (!data) return null;
        const keys = Object.keys(data);
        // Prefer keys with 'rate', 'efficiency', 'cost', 'main', 'avg', 'total'
        const preferred = keys.find(k => /rate|efficiency|cost|main|avg|total/i.test(k) && typeof data[k] === 'number');
        if (preferred) return { key: preferred, value: data[preferred] };
        // Otherwise, first numeric
        const firstNum = keys.find(k => typeof data[k] === 'number');
        if (firstNum) return { key: firstNum, value: data[firstNum] };
        // Otherwise, first value
        return { key: keys[0], value: data[keys[0]] };
    };

    // Helper: Render KPI Cards Row (for efficiency, quality, energy, supplyChain)
    const renderKpiCardsRow = () => {
        const cardData = [
            { title: 'Efficiency', data: efficiency, icon: <FiActivity className="w-6 h-6 text-[#7400B8]" />, color: 'from-[#F9F4FF] to-white', border: 'border-[#7400B8]/10' },
            { title: 'Quality', data: quality, icon: <FiAlertTriangle className="w-6 h-6 text-[#C084FC]" />, color: 'from-[#F9F4FF] to-white', border: 'border-[#C084FC]/10' },
            { title: 'Energy', data: energy, icon: <FiCpu className="w-6 h-6 text-[#8B5CF6]" />, color: 'from-[#F9F4FF] to-white', border: 'border-[#8B5CF6]/10' },
            { title: 'Supply Chain', data: supplyChain, icon: <FiPackage className="w-6 h-6 text-[#F59E42]" />, color: 'from-[#F9F4FF] to-white', border: 'border-[#F59E42]/10' },
        ];
        // Only show cards with data
        const visibleCards = cardData.filter(card => card.data && Object.keys(card.data).length > 0);
        if (visibleCards.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-4 w-full mb-8">
                {visibleCards.map((card, idx) => {
                    // Show all numeric or string-number values
                    const metrics = Object.entries(card.data).filter(([k, v]) => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v))));
                    return (
                        <div key={card.title} className={`flex-1 min-w-[220px] max-w-[20%] bg-white/80 rounded-2xl p-6 border ${card.border} flex flex-col items-start justify-between shadow h-[220px] transition-all duration-200 hover:shadow-lg hover:scale-[1.03] bg-gradient-to-br ${card.color}`}>
                            <div className="flex items-center gap-2 mb-2">{card.icon}<span className="font-bold text-lg">{card.title}</span></div>
                            <div className="flex-1 flex flex-col justify-center w-full gap-3">
                                {metrics.length === 0 && <p className="text-gray-400 text-sm">No numeric data</p>}
                                {metrics.map(([k, v]) => (
                                    <div key={k} className="flex flex-col items-start w-full">
                                        <span className="text-2xl font-bold text-[#7400B8]">{round4(v)}</span>
                                        <span className="text-xs text-gray-600">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Filter state for trends and maintenance
    const [trendsMetric, setTrendsMetric] = useState('total');
    const [maintMetric, setMaintMetric] = useState('total');

    // Helper: Get available metrics for trends/maintenance
    const getAvailableMetrics = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        return Object.keys(arr[0]).filter(k => typeof arr[0][k] === 'number');
    };

    // Helper: Render Trends with filter
    const renderTrends = (trends) => {
        if (!Array.isArray(trends) || trends.length === 0) return null;
        if (trends.length < 3) {
            return (
                <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 text-center text-gray-500">
                    Not enough data to display trends graph.
                </div>
            );
        }
        const metrics = getAvailableMetrics(trends);
        const metric = metrics.includes(trendsMetric) ? trendsMetric : metrics[0];
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" /> Trends
                        </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Metric:</span>
                        <select value={metric} onChange={e => setTrendsMetric(e.target.value)} className="border rounded px-2 py-1 text-sm">
                            {metrics.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.map(d => ({ ...d, [metric]: round4(d[metric]) }))} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                            <Tooltip formatter={(v) => round4(v)} />
                            <Legend />
                            <Area type="monotone" dataKey={metric} stroke="#7400B8" fill="url(#colorTrend)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
        );
    };

    // Helper: Render Maintenance Trends with filter
    const renderMaintenanceTrends = (maintenance) => {
        if (!maintenance || !Array.isArray(maintenance.downtime_trends)) return null;
        const data = maintenance.downtime_trends;
        if (data.length === 0) return null;
        if (data.length < 3) {
            return (
                <div className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 text-center text-gray-500">
                    Not enough data to display maintenance trends graph.
                </div>
            );
        }
        const metrics = getAvailableMetrics(data);
        const metric = metrics.includes(maintMetric) ? maintMetric : metrics[0];
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 rounded-3xl p-6 shadow-xl border border-white/20 mb-8 w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiSettings className="w-6 h-6 text-[#7400B8]" /> Maintenance Trends
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Metric:</span>
                        <select value={metric} onChange={e => setMaintMetric(e.target.value)} className="border rounded px-2 py-1 text-sm">
                            {metrics.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.map(d => ({ ...d, [metric]: round4(d[metric]) }))} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(v) => round4(v)} />
                            <Legend />
                            <Area type="monotone" dataKey={metric} stroke="#7400B8" fill="url(#colorMaint)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        );
    };

    // Helper: Render Section Cards (for efficiency, quality, etc.)
    const renderSectionCard = (title, data, icon) => {
        if (!data || Object.keys(data).length === 0) return null;
        // Choose color based on section
        let color = '#7400B8';
        let subtitle = `${title} related metrics and KPIs`;
        if (title === 'Quality') color = '#C084FC';
        if (title === 'Energy') color = '#8B5CF6';
        if (title === 'Supply Chain') color = '#F59E42';
        return (
            <div className="bg-white border border-gray-200 shadow-sm mb-8" style={{ borderRadius: '2px' }}>
                <div className="h-1" style={{ backgroundColor: color }}></div>
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="p-2 rounded-sm text-white" style={{ backgroundColor: color }}>
                        {icon}
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900">{title}</div>
                        <div className="text-xs text-gray-500">{subtitle}</div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {Object.entries(data).map(([k, v]) => (
                            <div key={k} className="flex flex-col items-start">
                                <span className="text-2xl font-bold text-[#7400B8]">{typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== undefined) ? round4(v) : String(v)}</span>
                                <span className="text-xs text-gray-600">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                    ))}
                    </div>
                </div>
                    </div>
        );
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

    // Replace the entire return statement with a new layout matching HealthcareDashboard.jsx, using the purple color palette for Manufacturing.
    return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F9F4FF] to-white p-4 sm:p-6">
      {/* Main Dashboard Content - Full Width */}
      <div className="w-full max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Power BI Style KPI Section */}
          <div className="space-y-4">
            {/* Top 4 KPI Cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {/* Use the first 4 KPIs, styled as Power BI cards */}
              {(() => {
                const kpiEntries = Object.entries(kpis || {});
                return kpiEntries.slice(0, 4).map(([key, value], index) => {
                  const color = [
                    '#7400B8', // purple
                    '#8B5CF6', // indigo
                    '#C084FC', // light purple
                    '#F59E42', // orange
                  ][index % 4];
                  const icon = [
                    <FiBarChart2 className="w-5 h-5" />, <FiActivity className="w-5 h-5" />, <FiCpu className="w-5 h-5" />, <FiPackage className="w-5 h-5" />
                  ][index % 4];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                      style={{ borderRadius: '2px' }}
                    >
                      <div className="h-1" style={{ backgroundColor: color }}></div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-sm text-white" style={{ backgroundColor: color }}>{icon}</div>
                            <div className="text-xs text-gray-600 font-medium">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined) ? round4(value) : String(value)}
                        </div>
                        <div className="text-sm text-gray-700 font-medium">
                          KPI
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          
          </div>
 {/* Quality Card (full width) */}
 <div className="w-full">
    {renderSectionCard('Quality', quality, <FiAlertTriangle className="w-6 h-6 text-[#C084FC]" />)}
  </div>
          {/* Trends Section */}
          {trends && Array.isArray(trends) && trends.length > 0 && (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Production Trends</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Metric:</span>
                    <select value={trendsMetric} onChange={e => setTrendsMetric(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500">
                      {getAvailableMetrics(trends).map(m => <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Track production trends over time to identify patterns and optimize output.</p>
              </div>
              <div className="h-80 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.map(d => ({ ...d, [trendsMetric]: round4(d[trendsMetric]) }))} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a78bfa' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#a78bfa' }} />
                    <Tooltip formatter={(v) => round4(v)} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey={trendsMetric} stroke="#7400B8" fill="url(#colorTrend)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* KPI Cards Row for efficiency, quality, etc. */}
          <div className="flex flex-col gap-4 w-full mb-4">
  <div className="flex flex-row gap-4 w-full flex-wrap md:flex-nowrap">
    <div className="flex-1 min-w-[280px] max-w-full">
      {/* Additional KPI Cards if any */}
      {Object.keys(kpis || {}).length > 4 && (
  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
    {Object.entries(kpis).slice(4).map(([key, value], idx) => {
      const color = '#7400B8';
      return (
        <div
          key={key}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          style={{ borderRadius: '2px' }}
        >
          <div className="h-1" style={{ backgroundColor: color }}></div>
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="p-2 rounded-sm text-white" style={{ backgroundColor: color }}>
              <FiBarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              <div className="text-xs text-gray-500">Additional KPI</div>
            </div>
          </div>
          <div className="p-6">
            <span className="text-2xl font-bold text-[#7400B8]">{typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined) ? round4(value) : String(value)}</span>
           <div className="text-xs text-gray-500">  Avg Production</div>
          </div>
      
        </div>
      );
    })}
  </div>
)}
    </div>
    {/* Efficiency Card */}
    <div className="flex-1 min-w-[280px] max-w-full">
      {renderSectionCard('Efficiency', efficiency, <FiActivity className="w-6 h-6 text-[#7400B8]" />)}
    </div>
  </div>
 
  {/* Energy and Supply Chain in a row */}
  <div className="flex flex-row gap-4 w-full flex-wrap md:flex-nowrap">
    <div className="flex-1 min-w-[280px] max-w-full">
      {renderSectionCard('Energy', energy, <FiCpu className="w-6 h-6 text-[#8B5CF6]" />)}
    </div>
    <div className="flex-1 min-w-[280px] max-w-full">
      {renderSectionCard('Supply Chain', supplyChain, <FiPackage className="w-6 h-6 text-[#F59E42]" />)}
    </div>
  </div>
</div>

            {/* High Performers */}
          {highPerformers && highPerformers.top_Product && (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              {renderPerformerSection('Top Product Lines', highPerformers.top_Product, 'Product Line', 'Units Produced', '#7400B8')}
            </div>
          )}
            {/* Low Performers */}
          {lowPerformers && lowPerformers.bottom_Product && (
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              {renderPerformerSection('Low Product Lines', lowPerformers.bottom_Product, 'Product Line', 'Units Produced', '#C084FC')}
            </div>
          )}

          {/* Totals Section */}
          {totals && Object.keys(totals).length > 0 && (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiBarChart2 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Totals</h3>
                </div>
                <p className="text-sm text-gray-600">Aggregated totals and time series for key metrics</p>
              </div>
              <div className="p-6">
            {renderTotals(totals)}
              </div>
            </div>
          )}

          {/* Maintenance Trends Section */}
          {maintenance && Array.isArray(maintenance.downtime_trends) && maintenance.downtime_trends.length > 0 && (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiSettings className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Trends</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Metric:</span>
                    <select value={maintMetric} onChange={e => setMaintMetric(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500">
                      {getAvailableMetrics(maintenance.downtime_trends).map(m => <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Monitor downtime and maintenance trends to improve equipment reliability.</p>
              </div>
              <div className="h-80 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={maintenance.downtime_trends.map(d => ({ ...d, [maintMetric]: round4(d[maintMetric]) }))} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a78bfa' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#a78bfa' }} />
                    <Tooltip formatter={(v) => round4(v)} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey={maintMetric} stroke="#7400B8" fill="url(#colorMaint)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Workforce Section */}
            {renderSectionCard('Workforce', workforce, <FiUsers className="w-6 h-6 text-[#7400B8]" />)}

          {/* Data Summary & Hypotheses */}
          <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiCpu className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights & Data Summary</h3>
                </div>
                <button
                  onClick={() => setShowSummary(s => !s)}
                  className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-sm hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  {showSummary ? 'Hide Data Summary' : 'Show Data Summary'}
                </button>
              </div>
              <p className="text-sm text-gray-600">Automated analysis findings, recommendations, and detailed data summary from {originalName}</p>
            </div>
            <div className="p-6">
              {/* AI Insights Section */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  AI-Generated Insights
                </h4>
                {hypothesis && Array.isArray(hypothesis) && hypothesis.length > 0 ? (
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {hypothesis.slice(0, 6).map((item, index) => (
                      <div key={index} className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-sm bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                                AI Generated
                              </span>
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
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-sm">
                    <FiCpu className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-500 font-medium">No AI Insights Available</p>
                    <p className="text-sm text-gray-400 mt-2">Insights will appear here when data analysis is complete</p>
                  </div>
                )}
              </div>
              {/* Data Summary Section */}
              {showSummary && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Detailed Data Summary
                  </h4>
                  <div className="mb-4 p-4 bg-purple-50 rounded-sm border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>Analysis Overview:</strong> Analyzed {summaryFields.length} metrics from {originalName}
                    </p>
                  </div>
            {renderSummary(summary)}
                </div>
              )}
            </div>
          </div>
            </motion.div>
      </div>
    </div>
    );
};

export default ManufacturingDashboard; 