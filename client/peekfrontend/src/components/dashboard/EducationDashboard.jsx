import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiBookOpen, FiBarChart2, FiAward, FiCpu, FiMessageSquare, FiTarget, FiArrowUp, FiArrowDown, FiCalendar, FiActivity, FiInfo } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';

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

    // Color palette exactly matching the Healthcare dashboard design
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

    const [showSummary, setShowSummary] = useState(false);

    // Helper: Render High/Low Performers with dynamic chart selection
    const renderPerformerSection = (title, data, labelKey, valueKey, color, icon = FiTrendingUp) => {
        if (!data || !data[labelKey] || !data[valueKey] || !Array.isArray(data[labelKey]) || !Array.isArray(data[valueKey]) || data[labelKey].length === 0) return null;

        const chartData = data[labelKey].map((label, i) => ({
            [labelKey]: label,
            [valueKey]: data[valueKey][i],
            name: label,
            value: data[valueKey][i]
        }));

        // Use pie chart for 6 or fewer items, bar chart for more
        const usePieChart = chartData.length <= 6;

        return (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {React.createElement(icon, { className: "w-5 h-5 text-gray-600" })}
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            {(() => {
                                const values = chartData.map(d => d.value).filter(v => typeof v === 'number');
                                const avgValue = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A';
                                const maxValue = values.length > 0 ? Math.max(...values) : 'N/A';
                                const minValue = values.length > 0 ? Math.min(...values) : 'N/A';
                                return (
                                    <>
                                        <span>Avg: <strong className="text-gray-700">{avgValue}</strong></span>
                                        <span>Max: <strong className="text-gray-700">{maxValue}</strong></span>
                                        <span>Min: <strong className="text-gray-700">{minValue}</strong></span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {usePieChart ? `Distribution overview • ${chartData.length} items` : `Performance analysis and rankings • ${chartData.length} items`}
                    </p>
                </div>
                <div className="h-80 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        {usePieChart ? (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
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
                                            <text
                                                x={x}
                                                y={y}
                                                fill="white"
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                fontSize={10}
                                                fontWeight="bold"
                                            >
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={svgColors[index % svgColors.length]} />
                                    ))}
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
                        ) : (
                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                    tickLine={{ stroke: '#d1d5db' }}
                                />
                                <YAxis
                                    dataKey={labelKey}
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#d1d5db' }}
                                    tickLine={{ stroke: '#d1d5db' }}
                                />
                                <Tooltip
                                    formatter={(value) => [value, valueKey]}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '2px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey={valueKey} radius={[0, 2, 2, 0]} barSize={28}>
                                    {chartData.map((_, idx) => (
                                        <Cell key={`cell-${idx}`} fill={svgColors[idx % svgColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
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
        const filterIndices = Array.from({ length: firstArrLen }, (_, i) => i >= startIdx);

        return (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FiBarChart2 className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Educational Metrics Overview</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Show:</span>
                            <select
                                value={totalsWindow}
                                onChange={e => {
                                    setTotalsWindow(e.target.value);
                                }}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="px-2 py-1 rounded border border-gray-300 text-sm w-20"
                                    placeholder="N"
                                />
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Comprehensive analysis of educational performance metrics and trends</p>
                </div>
                <div className="p-6 space-y-8">
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
                                <div key={key} className="w-full">
                                    <h4 className="text-md font-semibold text-gray-800 mb-4">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {(() => {
                                                // Use Area chart with fill if data > 10, otherwise Line chart
                                                if (data.length > 10) {
                                                    return (
                                                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id={`colorMetric${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#0078D4" stopOpacity={0.8} />
                                                                    <stop offset="95%" stopColor="#0078D4" stopOpacity={0.1} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey={labelKey}
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
                                                                dataKey={valueKey}
                                                                stroke="#0078D4"
                                                                strokeWidth={2}
                                                                fill={`url(#colorMetric${idx})`}
                                                                dot={{ fill: '#0078D4', strokeWidth: 2, r: 3 }}
                                                                activeDot={{ r: 5, fill: '#0078D4', stroke: '#ffffff', strokeWidth: 2 }}
                                                            />
                                                        </AreaChart>
                                                    );
                                                } else {
                                                    return (
                                                        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey={labelKey}
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
                                                                dataKey={valueKey}
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
                                </div>
                            );
                        }
                        // Fallback: table or primitive
                        if (typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0])) {
                            const dataLength = Object.values(value)[0].length;
                            // Filter rows using filterIndices if available
                            let visibleRows = Array.from({ length: dataLength }, (_, i) => i);
                            if (filterIndices && filterIndices.length === dataLength) {
                                visibleRows = visibleRows.filter(i => filterIndices[i]);
                            }
                            return (
                                <div key={key} className="w-full">
                                    <h4 className="text-md font-semibold text-gray-800 mb-4">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs border border-gray-200 rounded">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    {Object.keys(value).map((col, i) => <th key={i} className="px-3 py-2 border-b text-left font-medium text-gray-700">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleRows.map((rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-gray-50">
                                                        {Object.keys(value).map((col, i) => <td key={i} className="px-3 py-2 border-b text-gray-600">{value[col][rowIdx]}</td>)}
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
                                <h4 className="text-md font-semibold text-gray-800 mb-4">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                {typeof value === 'object' && value !== null && Array.isArray(Object.values(value)[0]) ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs border border-gray-200 rounded">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    {Object.keys(value).map((col, i) => <th key={i} className="px-3 py-2 border-b text-left font-medium text-gray-700">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {value[Object.keys(value)[0]].map((_, rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-gray-50">
                                                        {Object.keys(value).map((col, i) => <td key={i} className="px-3 py-2 border-b text-gray-600">{value[col][rowIdx]}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">{JSON.stringify(value)}</p>
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

    const handleMetricChange = (e) => {
        setTrendMetric(e.target.value);
    };

    const renderTrends = (trends) => {
        if (!Array.isArray(trends) || trends.length === 0) return null;
        if (trends.length < 3) {
            return (
                <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                    <div className="p-6 text-center text-gray-500">
                        Not enough data to display trends graph.
                    </div>
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
            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FiBarChart2 className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Educational Performance Trends</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Show:</span>
                            <select
                                value={trendWindow}
                                onChange={e => {
                                    setTrendWindow(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setCustomRange({ start: '', end: '' });
                                    }
                                }}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ml-2"
                                    />
                                    <span className="mx-1 text-gray-500">to</span>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        min={customRange.start || undefined}
                                        onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                </>
                            )}
                            <label htmlFor="trend-metric" className="text-sm font-medium text-gray-700 ml-4 mr-1">Metric:</label>
                            <select
                                id="trend-metric"
                                value={mainKey}
                                onChange={handleMetricChange}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {numericKeys.map((k) => (
                                    <option key={k} value={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">Track educational performance metrics over time to identify trends and patterns</p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="h-80 p-4"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            {(() => {
                                // Use Area chart with fill if data > 10, otherwise Line chart
                                if (filtered.length > 10) {
                                    return (
                                        <AreaChart data={filtered} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0078D4" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#0078D4" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey={xKey}
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
                                                dataKey={mainKey}
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
                                        <LineChart data={filtered} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey={xKey}
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
                                                dataKey={mainKey}
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
                    </motion.div>
                </AnimatePresence>
            </div>
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
                    {/* Circular KPI Cards with Comparisons */}
                    <div className="space-y-4">
                        {/* KPI Cards */}
                        {kpis && Object.keys(kpis).length > 0 ? (
                            <div
                                className="grid gap-4 auto-rows-fr mx-auto"
                                style={{
                                    gridTemplateColumns: 'repeat(6, 1fr)', // Use 6 columns for precise control
                                    maxWidth: '1200px',
                                    width: '100%'
                                }}
                            >
                                {(() => {
                                    const kpiEntries = Object.entries(kpis);
                                    const pairedKpis = [];

                                    // Group KPIs in pairs for comparison
                                    for (let i = 0; i < kpiEntries.length; i += 2) {
                                        const primary = kpiEntries[i];
                                        const secondary = kpiEntries[i + 1] || null;
                                        pairedKpis.push({ primary, secondary });
                                    }

                                    const cardStyles = [
                                        { primary: '#0078D4', secondary: '#60A5FA', icon: FiBarChart2, bgGradient: 'from-blue-50 to-blue-100' },
                                        { primary: '#10B981', secondary: '#34D399', icon: FiTrendingUp, bgGradient: 'from-emerald-50 to-emerald-100' },
                                        { primary: '#8B5CF6', secondary: '#A78BFA', icon: FiUsers, bgGradient: 'from-purple-50 to-purple-100' },
                                        { primary: '#F59E0B', secondary: '#FBBF24', icon: FiAward, bgGradient: 'from-amber-50 to-amber-100' },
                                        { primary: '#EF4444', secondary: '#F87171', icon: FiTarget, bgGradient: 'from-red-50 to-red-100' },
                                        { primary: '#6366F1', secondary: '#818CF8', icon: FiBookOpen, bgGradient: 'from-indigo-50 to-indigo-100' }
                                    ];

                                    return pairedKpis.map((pair, idx) => {
                                        const style = cardStyles[idx % cardStyles.length];
                                        const IconComponent = style.icon;
                                        const [primaryKey, primaryValue] = pair.primary;
                                        const secondaryData = pair.secondary ? pair.secondary : null;

                                        // Calculate percentage for circular progress
                                        const primaryPercentage = Math.min(100, Math.max(0, (typeof primaryValue === 'number' ? (primaryValue / 100) * 100 : 75)));
                                        const secondaryPercentage = secondaryData ? Math.min(100, Math.max(0, (typeof secondaryData[1] === 'number' ? (secondaryData[1] / 100) * 100 : 60))) : 0;

                                        return (
                                            <motion.div
                                                key={`${primaryKey}-${idx}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`bg-gradient-to-br ${style.bgGradient} border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 rounded-xl overflow-hidden w-full h-full min-h-[180px] flex flex-col`}
                                                style={{
                                                    gridColumn: (() => {
                                                        const kpiCount = Object.keys(kpis).length;
                                                        const pairCount = Math.ceil(kpiCount / 2);

                                                        // Handle different card distributions with max 3 per row
                                                        // Using 6-column grid where each visual column = 2 grid columns
                                                        if (pairCount === 1) {
                                                            // 1 card: Spans all 6 columns (full width)
                                                            return '1 / -1';
                                                        }
                                                        if (pairCount === 2) {
                                                            // 2 cards: Each spans 2 columns (with 2 empty columns)
                                                            if (idx === 0) return '1 / 3'; // First card: columns 1-2
                                                            if (idx === 1) return '3 / 5'; // Second card: columns 3-4
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 3) {
                                                            // 3 cards: Each spans 2 columns (perfect fit)
                                                            if (idx === 0) return '1 / 3'; // First card: columns 1-2
                                                            if (idx === 1) return '3 / 5'; // Second card: columns 3-4
                                                            if (idx === 2) return '5 / 7'; // Third card: columns 5-6
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 4) {
                                                            // 4 cards: 3 + 1 (last card centered, spans 4 columns)
                                                            if (idx === 0) return '1 / 3'; // First card: columns 1-2
                                                            if (idx === 1) return '3 / 5'; // Second card: columns 3-4
                                                            if (idx === 2) return '5 / 7'; // Third card: columns 5-6
                                                            if (idx === 3) return '2 / 6'; // Fourth card: columns 2-5 (centered, spans 4)
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 5) {
                                                            // 5 cards: 3 + 2 (last 2 cards each span 3 columns)
                                                            if (idx === 0) return '1 / 3'; // First card: columns 1-2
                                                            if (idx === 1) return '3 / 5'; // Second card: columns 3-4
                                                            if (idx === 2) return '5 / 7'; // Third card: columns 5-6
                                                            if (idx === 3) return '1 / 4'; // Fourth card: columns 1-3 (1.5 visual columns)
                                                            if (idx === 4) return '4 / 7'; // Fifth card: columns 4-6 (1.5 visual columns)
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 6) {
                                                            // 6 cards: 3 + 3 (perfect fit in 2 rows)
                                                            if (idx === 0) return '1 / 3'; // Row 1, Card 1
                                                            if (idx === 1) return '3 / 5'; // Row 1, Card 2
                                                            if (idx === 2) return '5 / 7'; // Row 1, Card 3
                                                            if (idx === 3) return '1 / 3'; // Row 2, Card 1
                                                            if (idx === 4) return '3 / 5'; // Row 2, Card 2
                                                            if (idx === 5) return '5 / 7'; // Row 2, Card 3
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 7) {
                                                            // 7 cards: 3 + 3 + 1 (last card centered, spans 4 columns)
                                                            if (idx === 0) return '1 / 3'; // Row 1, Card 1
                                                            if (idx === 1) return '3 / 5'; // Row 1, Card 2
                                                            if (idx === 2) return '5 / 7'; // Row 1, Card 3
                                                            if (idx === 3) return '1 / 3'; // Row 2, Card 1
                                                            if (idx === 4) return '3 / 5'; // Row 2, Card 2
                                                            if (idx === 5) return '5 / 7'; // Row 2, Card 3
                                                            if (idx === 6) return '2 / 6'; // Row 3, Card 1 (centered, spans 4)
                                                            return 'auto';
                                                        }
                                                        if (pairCount === 8) {
                                                            // 8 cards: 3 + 3 + 2 (last 2 cards each span 3 columns)
                                                            if (idx === 0) return '1 / 3'; // Row 1, Card 1
                                                            if (idx === 1) return '3 / 5'; // Row 1, Card 2
                                                            if (idx === 2) return '5 / 7'; // Row 1, Card 3
                                                            if (idx === 3) return '1 / 3'; // Row 2, Card 1
                                                            if (idx === 4) return '3 / 5'; // Row 2, Card 2
                                                            if (idx === 5) return '5 / 7'; // Row 2, Card 3
                                                            if (idx === 6) return '1 / 4'; // Row 3, Card 1 (spans 3 columns)
                                                            if (idx === 7) return '4 / 7'; // Row 3, Card 2 (spans 3 columns)
                                                            return 'auto';
                                                        }
                                                        return 'auto';
                                                    })()
                                                }}
                                            >
                                                <div className="p-4 h-full flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                <IconComponent className="w-4 h-4" style={{ color: style.primary }} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-gray-800">Performance</h3>
                                                                <p className="text-xs text-gray-600">Analytics</p>
                                                            </div>
                                                        </div>
                                                        {secondaryData && (
                                                            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                                                Compare
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between flex-1">
                                                        {secondaryData ? (
                                                            // Two KPIs side by side
                                                            <>
                                                                {/* Primary KPI with Circular Progress */}
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <div className="relative w-14 h-14 flex-shrink-0">
                                                                        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke="#e5e7eb"
                                                                                strokeWidth="2"
                                                                            />
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke={style.primary}
                                                                                strokeWidth="2"
                                                                                strokeDasharray={`${primaryPercentage}, 100`}
                                                                                strokeLinecap="round"
                                                                            />
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <span className="text-xs font-bold" style={{ color: style.primary }}>
                                                                                {Math.round(primaryPercentage)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-base font-bold text-gray-900 mb-1">
                                                                            {formatNumber(primaryValue)}
                                                                        </div>
                                                                        <div className="text-xs font-medium text-gray-700 mb-1 leading-tight" title={primaryKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}>
                                                                            {(() => {
                                                                                const fullText = primaryKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                                                                return fullText.length > 15 ? fullText.substring(0, 15) + '...' : fullText;
                                                                            })()}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-green-600">
                                                                            <FiArrowUp className="w-3 h-3" />
                                                                            <span className="text-xs font-medium">+8.2%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Divider */}
                                                                <div className="w-px h-12 bg-gray-300 mx-2"></div>

                                                                {/* Secondary KPI with Circular Progress */}
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <div className="relative w-14 h-14 flex-shrink-0">
                                                                        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke="#e5e7eb"
                                                                                strokeWidth="2"
                                                                            />
                                                                            <path
                                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                                fill="none"
                                                                                stroke={style.secondary}
                                                                                strokeWidth="2"
                                                                                strokeDasharray={`${secondaryPercentage}, 100`}
                                                                                strokeLinecap="round"
                                                                            />
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <span className="text-xs font-bold" style={{ color: style.secondary }}>
                                                                                {Math.round(secondaryPercentage)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-base font-bold text-gray-900 mb-1">
                                                                            {formatNumber(secondaryData[1])}
                                                                        </div>
                                                                        <div className="text-xs font-medium text-gray-700 mb-1 leading-tight" title={secondaryData[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}>
                                                                            {(() => {
                                                                                const fullText = secondaryData[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                                                                return fullText.length > 15 ? fullText.substring(0, 15) + '...' : fullText;
                                                                            })()}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-red-600">
                                                                            <FiArrowDown className="w-3 h-3" />
                                                                            <span className="text-xs font-medium">-2.1%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // Single KPI centered
                                                            <div className="flex items-center justify-center gap-4">
                                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                                                        <path
                                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                            fill="none"
                                                                            stroke="#e5e7eb"
                                                                            strokeWidth="2"
                                                                        />
                                                                        <path
                                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                            fill="none"
                                                                            stroke={style.primary}
                                                                            strokeWidth="2"
                                                                            strokeDasharray={`${primaryPercentage}, 100`}
                                                                            strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-xs font-bold" style={{ color: style.primary }}>
                                                                            {Math.round(primaryPercentage)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-xl font-bold text-gray-900 mb-1">
                                                                        {formatNumber(primaryValue)}
                                                                    </div>
                                                                    <div className="text-sm font-medium text-gray-700 mb-2" title={primaryKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}>
                                                                        {primaryKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                    </div>
                                                                    <div className="flex items-center justify-center gap-1 text-green-600">
                                                                        <FiArrowUp className="w-3 h-3" />
                                                                        <span className="text-xs font-medium">+8.2%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Comparison Insight */}
                                                    {secondaryData && (
                                                        <div className="mt-auto pt-3">
                                                            <div className="p-2 bg-white/60 rounded-lg">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-600">Gap:</span>
                                                                    <span className="font-semibold" style={{ color: primaryPercentage > secondaryPercentage ? style.primary : style.secondary }}>
                                                                        {Math.abs(primaryPercentage - secondaryPercentage).toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                                <FiBarChart2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg text-gray-500 font-medium">No KPI Data Available</p>
                                <p className="text-sm text-gray-400 mt-2">Key performance indicators will appear here when data is available</p>
                            </div>
                        )}
                    </div>
                    {/* Trends Analysis */}
                    {renderTrends(trends)}

                    {/* Performance Analysis Charts */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                        {/* High Performers */}
                        {highPerformers && (
                            <>
                                {renderPerformerSection('Top Students', highPerformers.top_students, 'StudentID', 'Grade', '#0078D4', FiAward)}
                                {renderPerformerSection('Top Subjects', highPerformers.top_subjects, 'Subject', 'Grade', '#107C10', FiBookOpen)}
                                {renderPerformerSection('Top Resource Users', highPerformers.top_resource_users, 'StudentID', 'LibraryUsage (hrs/month)', '#5C2D91', FiUsers)}
                            </>
                        )}
                        {/* Low Performers */}
                        {lowPerformers && (
                            <>
                                {renderPerformerSection('Students Needing Support', lowPerformers.bottom_students, 'StudentID', 'Grade', '#D83B01', FiTrendingDown)}
                                {renderPerformerSection('Challenging Subjects', lowPerformers.bottom_subjects, 'Subject', 'Grade', '#F59E0B', FiTarget)}
                                {renderPerformerSection('Low Resource Engagement', lowPerformers.bottom_resource_users, 'StudentID', 'LibraryUsage (hrs/month)', '#EF4444', FiActivity)}
                            </>
                        )}
                    </div>

                    {/* Educational Metrics Overview */}
                    {renderTotals(totals)}



                    {/* Performance Metrics */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                        {/* Data Correlations */}
                        {correlations && correlations.length > 0 && (
                            <div className="bg-white border border-gray-200" style={{ borderRadius: '2px' }}>
                                <div className="border-b border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiActivity className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Data Correlations</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">Statistical relationships between key educational metrics</p>
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
                                    <p className="text-sm text-gray-600">AI-generated forecasts and educational projections</p>
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
                </motion.div >
            </div >
        </div >
    );
};

export default EducationDashboard; 