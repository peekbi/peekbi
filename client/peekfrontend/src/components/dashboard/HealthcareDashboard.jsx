import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiHeart, FiUsers, FiBarChart2, FiActivity, FiCpu, FiMessageSquare, FiTarget, FiArrowUp, FiArrowDown, FiCalendar, FiSearch, FiBell, FiSettings } from 'react-icons/fi';
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

    // Color palette exactly matching the SVG design
    const svgColors = [
        '#0D2F4F', // Dark blue from SVG text
        '#3B82F6', // Primary blue
        '#1E40AF', // Dark blue
        '#60A5FA', // Light blue
        '#93C5FD', // Lighter blue
        '#DBEAFE', // Very light blue
        '#6366F1', // Indigo
        '#4F46E5', // Dark indigo
        '#8B5CF6', // Purple
        '#A78BFA', // Light purple
        '#C4B5FD', // Very light purple
        '#10B981', // Green
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5A2B'  // Brown
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

    // Debug logging - Log all the data we're receiving
    console.log('=== HEALTHCARE DASHBOARD DEBUG ===');
    console.log('File:', file);
    console.log('Analysis:', analysis);
    console.log('Breakdowns:', breakdowns);
    console.log('=== END DEBUG ===');

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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    // Helper to render pie chart breakdowns
    const renderPieBreakdown = (data, nameKey, valueKey, title, icon) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
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
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={svgColors[index % svgColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <FiBarChart2 className="w-5 h-5 text-blue-600" /> Medication Trends
                    </h3>
                    {data.length > 30 && (
                        <div className="flex gap-2 items-center">
                            <span className="text-sm font-medium text-slate-600">Show:</span>
                            <select
                                value={trendWindow}
                                onChange={e => {
                                    setTrendWindow(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setCustomRange({ start: '', end: '' });
                                    }
                                }}
                                className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                                        className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ml-2"
                                    />
                                    <span className="mx-1 text-slate-500">to</span>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        min={customRange.start || undefined}
                                        onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                        className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filtered}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#1d4ed8' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // Helper to render correlations
    const renderCorrelations = (correlations) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FiActivity className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Correlations</h3>
            </div>
            <div className="space-y-3">
                {correlations.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 truncate">{renderValue(c.between)}</span>
                        <span className="font-semibold text-purple-600 ml-2">{renderValue(c.correlation)}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Helper to render forecasts
    const renderForecasts = (forecasts) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiTarget className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Forecasts</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(forecasts).map(([key, value], i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 truncate">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-blue-600 ml-2">{renderValue(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Add a helper to render a bar chart for array of objects with two keys
    const renderBarChart = (data, color = '#3b82f6') => {
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" />
                        <YAxis dataKey={labelKey} type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} barSize={28}>
                            {data.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={svgColors[idx % svgColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // Helper to render any breakdown data dynamically
    const renderDynamicBreakdown = (data, title) => {
        console.log(`Rendering dynamic breakdown for ${title}:`, data);

        if (!Array.isArray(data) || data.length === 0) return null;

        const firstItem = data[0];
        const keys = Object.keys(firstItem);
        console.log(`Keys for ${title}:`, keys);

        // Try to find label and value keys
        let labelKey = keys.find(k =>
            k.toLowerCase().includes('department') ||
            k.toLowerCase().includes('name') ||
            k.toLowerCase().includes('category') ||
            k.toLowerCase().includes('type') ||
            typeof firstItem[k] === 'string'
        );

        let valueKey = keys.find(k =>
            k.toLowerCase().includes('admission') ||
            k.toLowerCase().includes('count') ||
            k.toLowerCase().includes('value') ||
            typeof firstItem[k] === 'number'
        );

        // Fallback to first string and first number
        if (!labelKey) labelKey = keys.find(k => typeof firstItem[k] === 'string') || keys[0];
        if (!valueKey) valueKey = keys.find(k => typeof firstItem[k] === 'number') || keys[1];

        console.log(`Using labelKey: ${labelKey}, valueKey: ${valueKey} for ${title}`);

        return (
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey={labelKey}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey={valueKey} radius={[4, 4, 0, 0]}>
                            {data.slice(0, 8).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={svgColors[index % svgColors.length]} />
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
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
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
                                <div key={field} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <h4 className="font-semibold text-slate-800 mb-2">{friendlyLabel(field)}</h4>
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
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
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
                            {(() => {
                                // Get available KPI data - Remove duplicate max_bed_occupancy
                                const kpiData = [
                                    totals.total_admissions && {
                                        title: "Total Admissions",
                                        value: formatNumber(totals.total_admissions),
                                        subtitle: "All Departments",
                                        icon: <FiUsers className="w-5 h-5" />,
                                        color: "#0078D4",
                                        trend: "+12%"
                                    },
                                    totals.avg_admissions && {
                                        title: "Avg Daily Admissions",
                                        value: formatNumber(totals.avg_admissions),
                                        subtitle: "Per Day",
                                        icon: <FiBarChart2 className="w-5 h-5" />,
                                        color: "#107C10",
                                        trend: "+5%"
                                    },
                                    kpis.avg_bed_occupancy && {
                                        title: "Avg Bed Occupancy",
                                        value: formatNumber(kpis.avg_bed_occupancy),
                                        subtitle: "Average Usage",
                                        icon: <FiHeart className="w-5 h-5" />,
                                        color: "#5C2D91",
                                        trend: "-2%"
                                    },
                                    kpis.treatment_success_rate && {
                                        title: "Success Rate",
                                        value: kpis.treatment_success_rate,
                                        subtitle: "Treatment Success",
                                        icon: <FiTarget className="w-5 h-5" />,
                                        color: "#D83B01",
                                        trend: "+8%"
                                    }
                                ].filter(Boolean).slice(0, 4);

                                return kpiData.map((kpi, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                                        style={{ borderRadius: '2px' }}
                                    >
                                        {/* Power BI style colored top border */}
                                        <div className="h-1" style={{ backgroundColor: kpi.color }}></div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="p-2 rounded-sm text-white"
                                                        style={{ backgroundColor: kpi.color }}
                                                    >
                                                        {kpi.icon}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium">
                                                        {kpi.subtitle}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-green-600 font-semibold">
                                                    {kpi.trend}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                                {kpi.value}
                                            </div>
                                            <div className="text-sm text-gray-700 font-medium">
                                                {kpi.title}
                                            </div>
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                        </div>

                        {/* Bottom 2 KPI Cards - Full Width Bar Style */}
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                            {(() => {
                                const bottomKpis = [
                                    kpis.max_bed_occupancy && {
                                        title: "Maximum Bed Occupancy",
                                        value: formatNumber(kpis.max_bed_occupancy),
                                        subtitle: "Peak Capacity Usage",
                                        icon: <FiActivity className="w-6 h-6" />,
                                        color: "#D83B01",
                                        progress: 85
                                    },
                                    totals.max_admissions && {
                                        title: "Maximum Daily Admissions",
                                        value: formatNumber(totals.max_admissions),
                                        subtitle: "Highest Single Day",
                                        icon: <FiArrowUp className="w-6 h-6" />,
                                        color: "#0078D4",
                                        progress: 92
                                    }
                                ].filter(Boolean);

                                return bottomKpis.map((kpi, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                                        style={{ borderRadius: '2px' }}
                                    >
                                        <div className="h-1" style={{ backgroundColor: kpi.color }}></div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="p-3 rounded-sm text-white"
                                                        style={{ backgroundColor: kpi.color }}
                                                    >
                                                        {kpi.icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-3xl font-bold text-gray-900 mb-1">
                                                            {kpi.value}
                                                        </div>
                                                        <div className="text-lg font-semibold text-gray-700">
                                                            {kpi.title}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {kpi.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-2xl font-bold mb-2" style={{ color: kpi.color }}>
                                                        {kpi.progress}%
                                                    </div>
                                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                backgroundColor: kpi.color,
                                                                width: `${kpi.progress}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Additional KPI Cards for other metrics */}
                    {/* {Object.keys(kpis).length > 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(kpis).filter(([k]) => !['avg_bed_occupancyss', 'treatment_success_rate'].includes(k)).map(([k, v], idx) => (
                                <motion.div
                                    key={k}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (idx + 5) }}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <FiActivity className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                            Metric
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-1">
                                        {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h3>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== undefined) ? round4(v) : renderValue(v)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )} */}


                    {/* Power BI Style Trends Chart */}
                    <div className="w-full">
                        <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                            <div className="border-b border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiBarChart2 className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Medication Usage Trends</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={trendWindow}
                                            onChange={e => setTrendWindow(e.target.value)}
                                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="30">Last 30 Days</option>
                                            <option value="7">Last 7 Days</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Track medication prescription patterns over time to identify usage trends and optimize inventory management.</p>
                            </div>
                            {trends.medication_trends && Array.isArray(trends.medication_trends) && trends.medication_trends.length > 0 ? (
                                <div className="h-80 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {(() => {
                                            let filtered = trends.medication_trends;
                                            if (trendWindow !== 'all') {
                                                const window = Math.min(filtered.length, parseInt(trendWindow));
                                                filtered = filtered.slice(-window);
                                            }
                                            const chartData = filtered.map(d => ({
                                                ...d,
                                                date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            }));

                                            // Use Area chart with fill if data > 10, otherwise Line chart
                                            if (chartData.length > 10) {
                                                return (
                                                    <AreaChart data={chartData}>
                                                        <defs>
                                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0078D4" stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor="#0078D4" stopOpacity={0.1} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#0078D4"
                                                            strokeWidth={2}
                                                            fill="url(#colorTrend)"
                                                            dot={{ fill: '#0078D4', strokeWidth: 2, r: 3 }}
                                                            activeDot={{ r: 5, fill: '#0078D4', stroke: '#ffffff', strokeWidth: 2 }}
                                                        />
                                                    </AreaChart>
                                                );
                                            } else {
                                                return (
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#0078D4"
                                                            strokeWidth={3}
                                                            dot={{ fill: '#0078D4', strokeWidth: 2, r: 5 }}
                                                            activeDot={{ r: 7, fill: '#0078D4', stroke: '#ffffff', strokeWidth: 2 }}
                                                        />
                                                    </LineChart>
                                                );
                                            }
                                        })()}
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <FiBarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-500">No trend data available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Power BI Style Department Performance Chart */}
                    <div className="w-full">
                        <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                            <div className="border-b border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiUsers className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Department Performance Analysis</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                                            Top Departments
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Compare admission volumes across different hospital departments to identify high-demand areas and resource allocation needs.</p>
                            </div>

                            {(() => {
                                // Enhanced robust data handling with multiple fallbacks
                                let departmentData = null;

                                // Try different possible data structures
                                if (breakdowns?.admissions_by_department && Array.isArray(breakdowns.admissions_by_department) && breakdowns.admissions_by_department.length > 0) {
                                    departmentData = breakdowns.admissions_by_department;
                                } else if (breakdowns?.department_admissions && Array.isArray(breakdowns.department_admissions) && breakdowns.department_admissions.length > 0) {
                                    departmentData = breakdowns.department_admissions;
                                } else if (breakdowns?.departments && Array.isArray(breakdowns.departments) && breakdowns.departments.length > 0) {
                                    departmentData = breakdowns.departments;
                                } else if (typeof breakdowns === 'object' && breakdowns !== null) {
                                    // Check for any array property that might contain department data
                                    const arrayProps = Object.entries(breakdowns).filter(([key, value]) =>
                                        Array.isArray(value) && value.length > 0 &&
                                        typeof value[0] === 'object' && value[0] !== null &&
                                        (key.toLowerCase().includes('department') || key.toLowerCase().includes('dept'))
                                    );
                                    if (arrayProps.length > 0) {
                                        departmentData = arrayProps[0][1];
                                    }
                                }

                                // Process and normalize the data with enhanced field detection
                                if (departmentData && departmentData.length > 0) {
                                    // Dynamic field detection - find the best label and value fields
                                    const firstItem = departmentData[0];
                                    const keys = Object.keys(firstItem);

                                    // Find label field (department/category name)
                                    let labelField = keys.find(k =>
                                        k.toLowerCase().includes('department') ||
                                        k.toLowerCase().includes('dept') ||
                                        k.toLowerCase().includes('name') ||
                                        k.toLowerCase().includes('category') ||
                                        k.toLowerCase().includes('type') ||
                                        typeof firstItem[k] === 'string'
                                    ) || keys[0];

                                    // Find value field (numeric data)
                                    let valueField = keys.find(k =>
                                        k.toLowerCase().includes('admission') ||
                                        k.toLowerCase().includes('count') ||
                                        k.toLowerCase().includes('value') ||
                                        k.toLowerCase().includes('total') ||
                                        k.toLowerCase().includes('pregnancies') ||
                                        k.toLowerCase().includes('year') ||
                                        typeof firstItem[k] === 'number'
                                    ) || keys[1];

                                    // Limit data to prevent overcrowding - show top 15 for large datasets, use line chart for >20
                                    const shouldUseLineChart = departmentData.length > 20;
                                    const dataLimit = shouldUseLineChart ? 20 : (departmentData.length > 10 ? 15 : 8);

                                    const processedData = departmentData.slice(0, dataLimit).map((item, index) => {
                                        let department = '';
                                        let admission = 0;

                                        if (typeof item === 'object' && item !== null) {
                                            // Get label value
                                            department = String(item[labelField] || `Item ${index + 1}`);

                                            // Get numeric value
                                            admission = item[valueField] || 0;

                                            // Ensure admission is a number with better parsing
                                            if (typeof admission === 'string') {
                                                admission = parseFloat(admission.replace(/[^0-9.-]/g, '')) || 0;
                                            } else if (typeof admission !== 'number') {
                                                admission = Number(admission) || 0;
                                            }
                                        } else {
                                            department = `Item ${index + 1}`;
                                            admission = 0;
                                        }

                                        return { department, admission };
                                    }).filter(item => item.admission > 0); // Filter out zero values

                                    if (processedData.length > 0) {
                                        // Sort by admission count for better visualization
                                        processedData.sort((a, b) => b.admission - a.admission);

                                        return (
                                            <div className="h-80 p-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    {shouldUseLineChart ? (
                                                        // Use Line Chart for large datasets (>20 items)
                                                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey="department"
                                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={60}
                                                                axisLine={{ stroke: '#d1d5db' }}
                                                                tickLine={{ stroke: '#d1d5db' }}
                                                            />
                                                            <YAxis
                                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                                axisLine={{ stroke: '#d1d5db' }}
                                                                tickLine={{ stroke: '#d1d5db' }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '2px',
                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                    fontSize: '12px'
                                                                }}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="admission"
                                                                stroke="#0078D4"
                                                                strokeWidth={2}
                                                                dot={{ fill: '#0078D4', strokeWidth: 2, r: 4 }}
                                                                activeDot={{ r: 6, fill: '#0078D4' }}
                                                            />
                                                        </LineChart>
                                                    ) : (
                                                        // Use Bar Chart for smaller datasets
                                                        <BarChart
                                                            data={processedData}
                                                            layout="vertical"
                                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                type="number"
                                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                                axisLine={{ stroke: '#d1d5db' }}
                                                                tickLine={{ stroke: '#d1d5db' }}
                                                            />
                                                            <YAxis
                                                                dataKey="department"
                                                                type="category"
                                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                                width={120}
                                                                axisLine={{ stroke: '#d1d5db' }}
                                                                tickLine={{ stroke: '#d1d5db' }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: 'white',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '2px',
                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                    fontSize: '12px'
                                                                }}
                                                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                                            />
                                                            <Bar dataKey="admission" radius={[0, 2, 2, 0]} barSize={24}>
                                                                {processedData.map((entry, index) => (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={index === 0 ? '#0078D4' : index === 1 ? '#107C10' : index === 2 ? '#5C2D91' : svgColors[index % svgColors.length]}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    }
                                }

                                // Fallback when no data is available
                                return (
                                    <div className="h-80 flex items-center justify-center bg-gray-50">
                                        <div className="text-center">
                                            <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-500 font-medium">No Department Data Available</p>
                                            <p className="text-sm text-gray-400 mt-1">Department performance data will appear here when available</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Additional Breakdown Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                        {/* Disease Incidence */}
                        {breakdowns.disease_incidence && Array.isArray(breakdowns.disease_incidence) && breakdowns.disease_incidence.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiHeart className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Disease Incidence Analysis</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Monitor the frequency of different diseases to understand health patterns and prepare appropriate medical resources.</p>
                                </div>
                                <div className="h-80 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {(() => {
                                            // Dynamic field detection for disease data
                                            const firstItem = breakdowns.disease_incidence[0];
                                            const keys = Object.keys(firstItem);

                                            // Find label field
                                            let labelField = keys.find(k =>
                                                k.toLowerCase().includes('disease') ||
                                                k.toLowerCase().includes('condition') ||
                                                k.toLowerCase().includes('name') ||
                                                k.toLowerCase().includes('group') ||
                                                k.toLowerCase().includes('skinthickness') ||
                                                typeof firstItem[k] === 'string'
                                            ) || keys[0];

                                            // Find value field
                                            let valueField = keys.find(k =>
                                                k.toLowerCase().includes('admission') ||
                                                k.toLowerCase().includes('count') ||
                                                k.toLowerCase().includes('value') ||
                                                k.toLowerCase().includes('total') ||
                                                k.toLowerCase().includes('pregnancies') ||
                                                k.toLowerCase().includes('year') ||
                                                typeof firstItem[k] === 'number'
                                            ) || keys[1];

                                            // Process data with dynamic field detection
                                            const shouldUseLineChart = breakdowns.disease_incidence.length > 20;
                                            const dataLimit = shouldUseLineChart ? 20 : (breakdowns.disease_incidence.length > 10 ? 15 : 8);

                                            const processedData = breakdowns.disease_incidence.slice(0, dataLimit).map((item, index) => {
                                                let disease = String(item[labelField] || `Item ${index + 1}`);
                                                let admission = item[valueField] || 0;

                                                // Ensure admission is a number
                                                if (typeof admission === 'string') {
                                                    admission = parseFloat(admission.replace(/[^0-9.-]/g, '')) || 0;
                                                } else if (typeof admission !== 'number') {
                                                    admission = Number(admission) || 0;
                                                }

                                                return { disease, admission };
                                            }).filter(item => item.admission > 0).sort((a, b) => b.admission - a.admission);

                                            if (shouldUseLineChart) {
                                                return (
                                                    <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="disease"
                                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="admission"
                                                            stroke="#EF4444"
                                                            strokeWidth={2}
                                                            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, fill: '#EF4444' }}
                                                        />
                                                    </LineChart>
                                                );
                                            } else {
                                                return (
                                                    <BarChart
                                                        data={processedData}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            type="number"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            dataKey="disease"
                                                            type="category"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            width={150}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                            cursor={{ fill: 'rgba(239,68,68,0.1)' }}
                                                        />
                                                        <Bar dataKey="admission" radius={[0, 2, 2, 0]} barSize={20}>
                                                            {processedData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={`rgba(239,68,68,${0.5 + index * 0.05})`} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                );
                                            }
                                        })()}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Equipment Usage */}
                        {breakdowns.equipment_usage && Array.isArray(breakdowns.equipment_usage) && breakdowns.equipment_usage.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiCpu className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Medical Equipment Utilization</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Track medical equipment usage to optimize maintenance schedules and identify equipment needs across departments.</p>
                                </div>
                                <div className="h-80 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {(() => {
                                            // Dynamic field detection for equipment data
                                            const firstItem = breakdowns.equipment_usage[0];
                                            const keys = Object.keys(firstItem);

                                            // Find label field
                                            let labelField = keys.find(k =>
                                                k.toLowerCase().includes('equipment') ||
                                                k.toLowerCase().includes('device') ||
                                                k.toLowerCase().includes('name') ||
                                                k.toLowerCase().includes('type') ||
                                                typeof firstItem[k] === 'string'
                                            ) || keys[0];

                                            // Find value field
                                            let valueField = keys.find(k =>
                                                k.toLowerCase().includes('admission') ||
                                                k.toLowerCase().includes('count') ||
                                                k.toLowerCase().includes('value') ||
                                                k.toLowerCase().includes('total') ||
                                                k.toLowerCase().includes('usage') ||
                                                k.toLowerCase().includes('pregnancies') ||
                                                k.toLowerCase().includes('year') ||
                                                typeof firstItem[k] === 'number'
                                            ) || keys[1];

                                            // Process data with dynamic field detection
                                            const shouldUseLineChart = breakdowns.equipment_usage.length > 20;
                                            const dataLimit = shouldUseLineChart ? 20 : (breakdowns.equipment_usage.length > 10 ? 15 : 8);

                                            const processedData = breakdowns.equipment_usage.slice(0, dataLimit).map((item, index) => {
                                                let equipment = String(item[labelField] || `Item ${index + 1}`);
                                                let admission = item[valueField] || 0;

                                                // Ensure admission is a number
                                                if (typeof admission === 'string') {
                                                    admission = parseFloat(admission.replace(/[^0-9.-]/g, '')) || 0;
                                                } else if (typeof admission !== 'number') {
                                                    admission = Number(admission) || 0;
                                                }

                                                return { equipment, admission };
                                            }).filter(item => item.admission > 0).sort((a, b) => b.admission - a.admission);

                                            if (shouldUseLineChart) {
                                                return (
                                                    <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="equipment"
                                                            tick={{ fontSize: 10, fill: '#6b7280' }}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="admission"
                                                            stroke="#8B5CF6"
                                                            strokeWidth={2}
                                                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, fill: '#8B5CF6' }}
                                                        />
                                                    </LineChart>
                                                );
                                            } else {
                                                return (
                                                    <BarChart
                                                        data={processedData}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            type="number"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            dataKey="equipment"
                                                            type="category"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            width={140}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                            cursor={{ fill: 'rgba(139,92,246,0.1)' }}
                                                        />
                                                        <Bar dataKey="admission" radius={[0, 2, 2, 0]} barSize={20}>
                                                            {processedData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={`rgba(139,92,246,${0.5 + index * 0.05})`} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                );
                                            }
                                        })()}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Insurance Claims */}
                        {breakdowns.insurance_claims && Array.isArray(breakdowns.insurance_claims) && breakdowns.insurance_claims.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiTarget className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Insurance Claims Distribution</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Analyze insurance provider distribution to understand patient demographics and optimize billing processes.</p>
                                </div>
                                <div className="h-80 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={(() => {
                                                    // Process insurance data with enhanced field detection
                                                    // Limit data to prevent overcrowding in pie chart
                                                    const dataLimit = breakdowns.insurance_claims.length > 10 ? 10 : 8;
                                                    return breakdowns.insurance_claims.slice(0, dataLimit).map((item, index) => {
                                                        let insurance = '';
                                                        let admission = 0;

                                                        if (typeof item === 'object' && item !== null) {
                                                            // Try different field names for insurance
                                                            const insuranceFields = ['insurance', 'Insurance', 'INSURANCE', 'Insurance Claims', 'insurance_claims', 'provider', 'Provider', 'plan', 'Plan'];
                                                            for (const field of insuranceFields) {
                                                                if (item[field] !== undefined && item[field] !== null) {
                                                                    insurance = String(item[field]);
                                                                    break;
                                                                }
                                                            }
                                                            if (!insurance) {
                                                                const keys = Object.keys(item);
                                                                const insuranceKey = keys.find(k =>
                                                                    k.toLowerCase().includes('insurance') ||
                                                                    k.toLowerCase().includes('provider') ||
                                                                    k.toLowerCase().includes('plan') ||
                                                                    k.toLowerCase().includes('claim')
                                                                );
                                                                if (insuranceKey) insurance = String(item[insuranceKey]);
                                                            }
                                                            if (!insurance) insurance = `Plan ${index + 1}`;

                                                            // Try different field names for admission count
                                                            const admissionFields = ['admission', 'admissions', 'count', 'value', 'total', 'Admission', 'Admissions', 'Count', 'Value', 'Total'];
                                                            for (const field of admissionFields) {
                                                                if (item[field] !== undefined && item[field] !== null) {
                                                                    admission = item[field];
                                                                    break;
                                                                }
                                                            }

                                                            // Ensure admission is a number
                                                            if (typeof admission === 'string') {
                                                                admission = parseFloat(admission.replace(/[^0-9.-]/g, '')) || 0;
                                                            } else if (typeof admission !== 'number') {
                                                                admission = Number(admission) || 0;
                                                            }
                                                        }

                                                        return { insurance, admission };
                                                    }).filter(item => item.admission > 0);
                                                })()}
                                                dataKey="admission"
                                                nameKey="insurance"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                labelLine={false}
                                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                    const RADIAN = Math.PI / 180;
                                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                    return (
                                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                                                            {`${(percent * 100).toFixed(0)}%`}
                                                        </text>
                                                    );
                                                }}
                                            >
                                                {(() => {
                                                    const dataLimit = breakdowns.insurance_claims.length > 10 ? 10 : 8;
                                                    return breakdowns.insurance_claims.slice(0, dataLimit).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={svgColors[index % svgColors.length]} />
                                                    ));
                                                })()}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '2px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Staff Workload */}
                        {breakdowns.staff_workload && Array.isArray(breakdowns.staff_workload) && breakdowns.staff_workload.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiUsers className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Staff Workload Distribution</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Monitor staff availability and workload distribution to ensure adequate coverage and optimize shift scheduling.</p>
                                </div>
                                <div className="h-80 p-4">
                                    {(() => {
                                        // Process staff data and create meaningful visualization
                                        const staffData = breakdowns.staff_workload.map((item, index) => {
                                            let staffCount = 0;
                                            let label = '';

                                            if (typeof item === 'object' && item !== null) {
                                                // Try different field names for staff count
                                                const staffFields = ['Staff On Duty', 'staff', 'Staff', 'STAFF', 'count', 'Count', 'staff_count', 'on_duty'];
                                                for (const field of staffFields) {
                                                    if (item[field] !== undefined && item[field] !== null) {
                                                        staffCount = item[field];
                                                        break;
                                                    }
                                                }

                                                // Ensure staffCount is a number
                                                if (typeof staffCount === 'string') {
                                                    staffCount = parseFloat(staffCount.replace(/[^0-9.-]/g, '')) || 0;
                                                } else if (typeof staffCount !== 'number') {
                                                    staffCount = Number(staffCount) || 0;
                                                }

                                                label = `Shift ${index + 1}`;
                                            } else {
                                                staffCount = Number(item) || 0;
                                                label = `Shift ${index + 1}`;
                                            }

                                            return { label, staffCount };
                                        }).filter(item => item.staffCount > 0);

                                        // Group staff counts for better visualization
                                        const staffGroups = {};
                                        staffData.forEach(item => {
                                            const count = item.staffCount;
                                            if (staffGroups[count]) {
                                                staffGroups[count]++;
                                            } else {
                                                staffGroups[count] = 1;
                                            }
                                        });

                                        const chartData = Object.entries(staffGroups).map(([count, frequency]) => ({
                                            staffCount: `${count} Staff`,
                                            frequency: frequency,
                                            count: parseInt(count)
                                        })).sort((a, b) => a.count - b.count);

                                        if (chartData.length > 0) {
                                            return (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={chartData}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                        <XAxis
                                                            dataKey="staffCount"
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                                            axisLine={{ stroke: '#d1d5db' }}
                                                            tickLine={{ stroke: '#d1d5db' }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '2px',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                            formatter={(value) => [value, 'Shifts']}
                                                        />
                                                        <Bar dataKey="frequency" radius={[2, 2, 0, 0]} barSize={40}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={`rgba(99, 102, 241, ${0.5 + index * 0.1})`} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            );
                                        } else {
                                            return (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                        <p className="text-gray-500 font-medium">No Staff Data Available</p>
                                                        <p className="text-sm text-gray-400 mt-1">Staff workload data will appear here when available</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                        {/* High Performers */}
                        {(() => {
                            // Enhanced dynamic high performer detection
                            let highPerformerCards = [];

                            if (highPerformers && Object.keys(highPerformers).length > 0) {
                                // Handle highPerformers as an object with multiple key-value pairs
                                Object.entries(highPerformers).forEach(([key, value]) => {
                                    // Skip non-meaningful keys
                                    if (key === 'type' || key === 'category') return;

                                    let displayLabel = key;
                                    let displayValue = value;

                                    // Format the label
                                    displayLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                    // Handle different value types
                                    if (typeof value === 'object' && value !== null) {
                                        // If value is an object, try to extract meaningful data
                                        const objKeys = Object.keys(value);
                                        const textKey = objKeys.find(k => typeof value[k] === 'string') || objKeys[0];
                                        const numKey = objKeys.find(k => typeof value[k] === 'number') || objKeys[1];

                                        displayLabel = value[textKey] || displayLabel;
                                        displayValue = value[numKey] || JSON.stringify(value);
                                    }

                                    highPerformerCards.push({
                                        label: String(displayLabel),
                                        value: displayValue,
                                        originalKey: key
                                    });
                                });
                            } else if (breakdowns?.admissions_by_department && Array.isArray(breakdowns.admissions_by_department) && breakdowns.admissions_by_department.length > 0) {
                                // Find highest from department data
                                const firstItem = breakdowns.admissions_by_department[0];
                                const keys = Object.keys(firstItem);
                                const labelField = keys.find(k =>
                                    k.toLowerCase().includes('department') ||
                                    k.toLowerCase().includes('name') ||
                                    typeof firstItem[k] === 'string'
                                ) || keys[0];
                                const valueField = keys.find(k =>
                                    k.toLowerCase().includes('admission') ||
                                    k.toLowerCase().includes('count') ||
                                    typeof firstItem[k] === 'number'
                                ) || keys[1];

                                const sorted = [...breakdowns.admissions_by_department].sort((a, b) => {
                                    const aVal = Number(a[valueField]) || 0;
                                    const bVal = Number(b[valueField]) || 0;
                                    return bVal - aVal;
                                });
                                const top = sorted[0];
                                highPerformerCards.push({
                                    label: String(top[labelField] || 'Top Department'),
                                    value: top[valueField] || 0,
                                    originalKey: 'department'
                                });
                            } else if (totals && Object.keys(totals).length > 0) {
                                // Use totals as fallback
                                const maxKey = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
                                highPerformerCards.push({
                                    label: maxKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    value: totals[maxKey],
                                    originalKey: maxKey
                                });
                            }

                            return highPerformerCards.length > 0 ? (
                                <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                    <div className="border-b border-gray-200 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiTrendingUp className="w-5 h-5 text-green-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">Highest performing metrics and departments</p>
                                    </div>
                                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                        {highPerformerCards.map((item, index) => (
                                            <div key={index} className="border border-green-100 rounded-sm p-3 bg-green-50 hover:bg-green-100 transition-colors">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-gray-700 block">
                                                            {item.label}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Top Performer</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-bold text-green-600">
                                                            {formatNumber(item.value)}
                                                        </span>
                                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                                            <FiArrowUp className="w-3 h-3 text-green-500" />
                                                            <span className="text-xs text-green-600 font-medium">High</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;
                        })()}

                        {/* Low Performers */}
                        {(() => {
                            // Enhanced dynamic low performer detection
                            let lowPerformerCards = [];

                            if (lowPerformers && Object.keys(lowPerformers).length > 0) {
                                // Handle lowPerformers as an object with multiple key-value pairs
                                Object.entries(lowPerformers).forEach(([key, value]) => {
                                    // Skip non-meaningful keys
                                    if (key === 'type' || key === 'category') return;

                                    let displayLabel = key;
                                    let displayValue = value;

                                    // Format the label
                                    displayLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                    // Handle different value types
                                    if (typeof value === 'object' && value !== null) {
                                        // If value is an object, try to extract meaningful data
                                        const objKeys = Object.keys(value);
                                        const textKey = objKeys.find(k => typeof value[k] === 'string') || objKeys[0];
                                        const numKey = objKeys.find(k => typeof value[k] === 'number') || objKeys[1];

                                        displayLabel = value[textKey] || displayLabel;
                                        displayValue = value[numKey] || JSON.stringify(value);
                                    }

                                    lowPerformerCards.push({
                                        label: String(displayLabel),
                                        value: displayValue,
                                        originalKey: key
                                    });
                                });
                            } else if (breakdowns?.admissions_by_department && Array.isArray(breakdowns.admissions_by_department) && breakdowns.admissions_by_department.length > 0) {
                                // Find lowest from department data
                                const firstItem = breakdowns.admissions_by_department[0];
                                const keys = Object.keys(firstItem);
                                const labelField = keys.find(k =>
                                    k.toLowerCase().includes('department') ||
                                    k.toLowerCase().includes('name') ||
                                    typeof firstItem[k] === 'string'
                                ) || keys[0];
                                const valueField = keys.find(k =>
                                    k.toLowerCase().includes('admission') ||
                                    k.toLowerCase().includes('count') ||
                                    typeof firstItem[k] === 'number'
                                ) || keys[1];

                                // Filter out zero values
                                const filtered = breakdowns.admissions_by_department.filter(item => {
                                    const val = Number(item[valueField]) || 0;
                                    return val > 0;
                                });
                                if (filtered.length > 0) {
                                    const sorted = [...filtered].sort((a, b) => {
                                        const aVal = Number(a[valueField]) || 0;
                                        const bVal = Number(b[valueField]) || 0;
                                        return aVal - bVal;
                                    });
                                    const bottom = sorted[0];
                                    lowPerformerCards.push({
                                        label: String(bottom[labelField] || 'Low Department'),
                                        value: bottom[valueField] || 0,
                                        originalKey: 'department'
                                    });
                                }
                            } else if (totals && Object.keys(totals).length > 0) {
                                // Use totals as fallback
                                const minKey = Object.keys(totals).reduce((a, b) => totals[a] < totals[b] ? a : b);
                                lowPerformerCards.push({
                                    label: minKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                    value: totals[minKey],
                                    originalKey: minKey
                                });
                            }

                            return lowPerformerCards.length > 0 ? (
                                <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                    <div className="border-b border-gray-200 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiTrendingDown className="w-5 h-5 text-red-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Areas Needing Attention</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">Metrics requiring improvement or focus</p>
                                    </div>
                                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                        {lowPerformerCards.map((item, index) => (
                                            <div key={index} className="border border-red-100 rounded-sm p-3 bg-red-50 hover:bg-red-100 transition-colors">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-gray-700 block">
                                                            {item.label}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Needs Attention</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-bold text-red-600">
                                                            {formatNumber(item.value)}
                                                        </span>
                                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                                            <FiArrowDown className="w-3 h-3 text-red-500" />
                                                            <span className="text-xs text-red-600 font-medium">Low</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>

                    {/* Power BI Style Analytics Insights - Row Layout */}
                    <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                        {/* Data Correlations */}
                        {correlations && correlations.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiActivity className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Data Correlations</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Statistical relationships between key metrics</p>
                                </div>
                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                    {correlations.slice(0, 6).map((c, i) => {
                                        const correlationValue = parseFloat(c.correlation) || 0;
                                        const isPositive = correlationValue > 0;
                                        const strength = Math.abs(correlationValue);
                                        const strengthLabel = strength > 0.7 ? 'Strong' : strength > 0.4 ? 'Moderate' : 'Weak';

                                        return (
                                            <div key={i} className="border border-gray-100 rounded-sm p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-medium text-gray-700 flex-1 pr-2">{renderValue(c.between)}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-gray-900">{correlationValue.toFixed(2)}</span>
                                                        <div className={`w-3 h-3 rounded-full ${strength > 0.7 ? (isPositive ? 'bg-green-500' : 'bg-red-500') :
                                                            strength > 0.4 ? (isPositive ? 'bg-yellow-500' : 'bg-orange-500') :
                                                                'bg-gray-400'
                                                            }`}></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                    <span>{strengthLabel} {isPositive ? 'Positive' : 'Negative'}</span>
                                                    <span>{Math.round(strength * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${strength > 0.7 ? (isPositive ? 'bg-green-500' : 'bg-red-500') :
                                                            strength > 0.4 ? (isPositive ? 'bg-yellow-500' : 'bg-orange-500') :
                                                                'bg-gray-400'
                                                            }`}
                                                        style={{ width: `${strength * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Future Predictions */}
                        {forecasts && Object.keys(forecasts).length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiTarget className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Future Predictions</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">AI-generated forecasts and projections</p>
                                </div>
                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                    {Object.entries(forecasts).slice(0, 6).map(([key, value], i) => (
                                        <div key={i} className="border border-gray-100 rounded-sm p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-gray-700 capitalize block">
                                                        {key.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Predicted Value</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-blue-600">{renderValue(value)}</span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <FiArrowUp className="w-3 h-3 text-green-500" />
                                                        <span className="text-xs text-green-600 font-medium">Trending</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI-Powered Insights & Data Summary - Full Width */}
                    <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                        <div className="border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FiCpu className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights & Data Summary</h3>
                                </div>
                                <button
                                    onClick={() => setShowSummary(s => !s)}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-sm hover:bg-blue-100 transition-colors border border-blue-200"
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
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    AI-Generated Insights
                                </h4>
                                {hypothesis && Array.isArray(hypothesis) && hypothesis.length > 0 ? (
                                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                                        {hypothesis.slice(0, 6).map((item, index) => (
                                            <div key={index} className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-sm bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-sm text-gray-700 leading-relaxed">{renderValue(item)}</span>
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
                                    <div className="mb-4 p-4 bg-blue-50 rounded-sm border border-blue-200">
                                        <p className="text-sm text-blue-800">
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

export default HealthcareDashboard; 