import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiUsers, FiBarChart2, FiShoppingCart, FiCpu, FiMessageSquare, FiDownload } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import AIAnalyst from './AIAnalyst';
import * as XLSX from 'xlsx';

const RetailDashboard = ({ file, analysis }) => {
    // Helper function to round numbers to 3 decimal places
    const round4 = (v) => {
        if (typeof v === 'number') return Number(v.toFixed(3));
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(Number(v).toFixed(3));
        return v;
    };

    // Helper function to convert technical/statistical terms to user-friendly labels
    const friendlyLabel = (key) => {
        const map = {
            mean: "Average",
            median: "Middle Value",
            std: "Variation",
            min: "Minimum",
            max: "Maximum",
            sum: "Total",
            count: "Count",
            mode: "Most Common",
            percentile: "Percentile",
            range: "Range",
            variance: "Spread",
            skew: "Skewness",
            kurtosis: "Peakedness",
            // Add more as needed
        };
        const cleaned = key.replace(/_/g, '').toLowerCase();
        for (const [stat, label] of Object.entries(map)) {
            if (cleaned === stat || cleaned.endsWith(stat) || cleaned.startsWith(stat)) return label;
        }
        // Fallback: prettify
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (!file || !analysis) {
        return (
            <div className="text-center p-8">
                <p>No analysis data available for this file.</p>
            </div>
        );
    }

    const { originalName } = file;
    
    // Multi-color palette for charts (matches HealthcareDashboard)
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

    // Debug logging (as in HealthcareDashboard)
    console.log('=== RETAIL DASHBOARD DEBUG ===');
    console.log('File:', file);
    console.log('Analysis:', analysis);
    console.log('=== END DEBUG ===');

    const [showSummary, setShowSummary] = useState(false);

    // --- Trends scaling state ---
    const [trendWindow, setTrendWindow] = useState('all');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    // Generic section renderer for dynamic fields
    const renderSection = (title, data) => {
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return (
                <div className="bg-white rounded p-4 border border-gray-200 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                    <p className="text-gray-500">No data available.</p>
                </div>
            );
        }
        if (Array.isArray(data)) {
            if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
                // Table
                const columns = Object.keys(data[0]);
                return (
                    <div className="overflow-x-auto mb-4 bg-white rounded p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                        <table className="min-w-full text-sm border border-gray-200 rounded">
                            <thead>
                                <tr>
                                    {columns.map(col => <th key={col} className="px-2 py-1 border-b text-left bg-blue-50 text-gray-700 font-semibold">{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i}>
                                        {columns.map(col => <td key={col} className="px-2 py-1 border-b text-gray-800">{row[col]}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            } else {
                // List
                return (
                    <div className="mb-4 bg-white rounded p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                        <ul className="list-disc list-inside text-gray-800">
                            {data.map((item, i) => <li key={i}>{String(item)}</li>)}
                        </ul>
                    </div>
                );
            }
        }
        if (typeof data === 'object') {
            return (
                <div className="mb-4 bg-white rounded p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                    <ul className="list-disc list-inside text-gray-800">
                        {Object.entries(data).map(([k, v]) => (
                            <li key={k}><span className="font-semibold text-gray-700">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
                        ))}
                    </ul>
                </div>
            );
        }
        // Primitive
        return (
            <div className="mb-4 bg-white rounded p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                <p className="text-gray-800">{String(data)}</p>
            </div>
        );
    };

    // Utility: Normalize array-of-arrays to array-of-objects
    function normalizeArrayOfArrays(arr, labelKey = 'name', valueKey = 'value') {
        if (
            Array.isArray(arr) &&
            arr.length === 2 &&
            Array.isArray(arr[0]) &&
            Array.isArray(arr[1]) &&
            arr[0].length === arr[1].length
        ) {
            return arr[0].map((label, i) => ({ [labelKey]: label, [valueKey]: arr[1][i] }));
        }
        return arr;
    }

    // --- Fixed KPI order and headings ---
    const KPI_ORDER = [
        { key: 'avg_order_value', label: 'Avg Order Value' },
        { key: 'avg_sales', label: 'Avg Sales' },
        { key: 'median_sales', label: 'Median Sales' },
        { key: 'profit_margin_percent', label: 'Profit Margin (%)' },
        { key: 'sales_forecast_next_period', label: 'Sales Forecast (Next Period)' },
        { key: 'total_loss', label: 'Total Loss' },
        { key: 'total_profit', label: 'Total Profit' },
        { key: 'total_sales', label: 'Total Sales' },
    ];

    // For high/low performers and totals, remove normalization and dynamic key detection, use fixed keys as per your sample
    // High Performers
    let highPerf = analysis.insights.highPerformers?.top_products || [];
    // Low Performers
    let lowPerf = analysis.insights.lowPerformers?.low_products || [];
    // Totals: sales_by_region
    let salesByRegion = analysis.insights.totals?.sales_by_region || [];
    // Totals: sales_by_category
    let salesByCategory = analysis.insights.totals?.sales_by_category || [];

    // Export to Excel function (multi-sheet)
    const exportToExcel = () => {
        if (!analysis) return;
        const wb = XLSX.utils.book_new();
        // KPIs
        if (analysis.insights?.kpis) {
            const kpiSheet = XLSX.utils.aoa_to_sheet([
                ['KPI', 'Value'],
                ...Object.entries(analysis.insights.kpis)
            ]);
            XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs');
        }
        // Summary
        if (analysis.summary) {
            const summaryRows = Object.entries(analysis.summary).map(([k, v]) => {
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
        if (analysis.insights?.highPerformers?.top_products?.length) {
            const arr = analysis.insights.highPerformers.top_products;
            const highSheet = XLSX.utils.json_to_sheet(arr);
            XLSX.utils.book_append_sheet(wb, highSheet, 'High Performers');
        }
        // Low Performers
        if (analysis.insights?.lowPerformers?.low_products?.length) {
            const arr = analysis.insights.lowPerformers.low_products;
            const lowSheet = XLSX.utils.json_to_sheet(arr);
            XLSX.utils.book_append_sheet(wb, lowSheet, 'Low Performers');
        }
        // Totals
        if (analysis.insights?.totals) {
            Object.entries(analysis.insights.totals).forEach(([key, value]) => {
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
        if (analysis.insights?.trends?.daily?.length) {
            const trendSheet = XLSX.utils.json_to_sheet(analysis.insights.trends.daily);
            XLSX.utils.book_append_sheet(wb, trendSheet, 'Trends - Daily');
        }
        if (analysis.insights?.trends?.sales_over_time?.Date && Array.isArray(analysis.insights.trends.sales_over_time.Date)) {
            const dates = analysis.insights.trends.sales_over_time.Date;
            const sales = analysis.insights.trends.sales_over_time.Sales || [];
            const rows = dates.map((date, i) => ({ Date: date, Sales: sales[i] }));
            const trendSheet = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, trendSheet, 'Trends - Sales Over Time');
        }
        // Hypotheses
        if (analysis.insights?.hypothesis?.length) {
            const hypoSheet = XLSX.utils.aoa_to_sheet([
                ['Hypothesis'],
                ...analysis.insights.hypothesis.map(h => [h])
            ]);
            XLSX.utils.book_append_sheet(wb, hypoSheet, 'Hypotheses');
        }
        XLSX.writeFile(wb, `${file?.originalName?.replace(/\.[^/.]+$/, '') || 'retail_analysis'}.xlsx`);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
            <div className="w-full max-w-none">
                {/* Common Header with Export Button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Retail Dashboard</h2>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                    >
                        <FiDownload className="w-5 h-5" />
                        Export to Excel
                    </button>
                </div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Power BI Style KPI Section */}
                    <div className="space-y-4">
                        {/* Top 4 KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(() => {
                                const kpiCards = KPI_ORDER.map(({ key, label }, index) => {
                                    const value = analysis.insights.kpis ? analysis.insights.kpis[key] : undefined;
                                    if (value === undefined || value === null || value === 0) return null;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                            className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                                            style={{ borderRadius: '2px' }}
                                        >
                                            <div className="h-1" style={{ backgroundColor: '#3B82F6' }}></div>
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-sm text-white" style={{ backgroundColor: '#3B82F6' }}>
                                                            <FiDollarSign className="w-5 h-5" />
                                        </div>
                                                        <div className="text-xs text-gray-600 font-medium">
                                                            {label}
                                        </div>
                                    </div>
                                                    <div className="text-xs text-blue-600 font-semibold">
                                                        +0%
                    </div>
                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {key.includes('total') || key.includes('avg') || key.includes('median')
                                                        ? `₹${typeof value === 'number' ? round4(value).toLocaleString() : value}`
                                                        : typeof value === 'number' ? round4(value).toLocaleString() : value}
                                                </div>
                                                <div className="text-sm text-gray-700 font-medium">
                                                    {label}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }).filter(Boolean);
                                // Add empty placeholders to fill the row to 4
                                const placeholders = Array.from({ length: Math.max(0, 4 - kpiCards.length) }, (_, i) => (
                                    <div key={`kpi-placeholder-${i}`} className="invisible" />
                                ));
                                return [...kpiCards, ...placeholders];
                            })()}
                        </div>
                        {/* Bottom 2 KPI Cards - Full Width Bar Style (optional, can be added if you have more KPIs) */}
                                </div>
                    {/* Trends - Line/Area Chart for Daily Trends */}
                    {analysis.insights.trends?.daily && Array.isArray(analysis.insights.trends.daily) && analysis.insights.trends.daily.length > 0 && (
                        <div className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: '2px' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" /> Sales Trends (Daily)
                                </h3>
                                {analysis.insights.trends.daily.length > 30 && (
                                    <div className="flex gap-2 items-center bg-white/70 border border-blue-100 rounded-xl px-3 py-2 shadow-sm">
                                        <span className="text-sm font-medium text-gray-700">Show:</span>
                                        <select
                                            value={trendWindow}
                                            onChange={e => {
                                                setTrendWindow(e.target.value);
                                                if (e.target.value !== 'custom') {
                                                    setCustomRange({ start: '', end: '' });
                                                }
                                            }}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                                </div>
                        )}
                    </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={(() => {
                                            const daily = analysis.insights.trends.daily;
                                            // Helper to normalize to YYYY-MM-DD
                                            const toYMD = (date) => {
                                                if (!date) return '';
                                                const d = new Date(date);
                                                if (isNaN(d)) return '';
                                                return d.toISOString().slice(0, 10);
                                            };
                                            if (trendWindow === 'custom' && (customRange.start || customRange.end)) {
                                                const startYMD = customRange.start;
                                                const endYMD = customRange.end;
                                                return daily.filter(d => {
                                                    const dYMD = toYMD(d.date);
                                                    if (!dYMD) return false;
                                                    if (startYMD && endYMD) return dYMD >= startYMD && dYMD <= endYMD;
                                                    if (startYMD) return dYMD >= startYMD;
                                                    if (endYMD) return dYMD <= endYMD;
                                                    return true;
                                                }).map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
                                            } else {
                                                let window = daily.length;
                                                if (trendWindow !== 'all') window = Math.min(daily.length, parseInt(trendWindow));
                                                const start = daily.length - window;
                                                return daily.slice(start).map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
                                            }
                                        })()}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value, name) => name === 'total' ? [`₹${value.toLocaleString()}`, 'Total'] : [value, name]} />
                                        <Legend />
                                        <Area type="monotone" dataKey="total" stroke={chartColors[0]} fill="url(#colorTrend)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    {/* --- Top Row: Special KPIs + Totals (now below KPIs) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-8">
                        {/* Left: Frequent Customers Card (if present) */}
                        {analysis.insights.customer?.frequent_customers && Array.isArray(analysis.insights.customer.frequent_customers) && analysis.insights.customer.frequent_customers.length > 0 && analysis.insights.customer.frequent_customers.some(cust => Object.values(cust).some(v => v !== undefined && v !== null && v !== 0 && v !== '')) && (
                        <div className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: '2px' }}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiUsers className="w-5 h-5 text-[#3B82F6]" /> Frequent Customers
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analysis.insights.customer.frequent_customers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="customer" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [value, 'Purchases']} />
                                        <Legend />
                                        <Bar dataKey="purchases" fill={chartColors[2]} radius={[8, 8, 0, 0]} barSize={40}>
                                            {analysis.insights.customer.frequent_customers.map((_, index) => (
                                                <Cell key={`cell-cust-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                        {/* Right: Totals Card (unchanged) */}
                        {analysis.insights.totals && Object.keys(analysis.insights.totals).length > 0 && (
                            <div className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col justify-between min-h-[240px]" style={{ borderRadius: '2px' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" /> Totals
                                </h3>
                                <div className="flex-1 grid grid-cols-1 gap-4 min-h-0 items-center justify-center">
                                    {Object.entries(analysis.insights.totals).map(([key, value], idx) => {
                                        // Pie chart for array of objects with two keys (e.g., sales_by_region)
                                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && Object.keys(value[0]).length === 2) {
                                            const [nameKey, valueKey] = Object.keys(value[0]);
                                            return (
                                                <div
                                                    key={key}
                                                    className={`${Object.keys(analysis.insights.totals).length === 1 ? 'col-span-1 max-w-lg mx-auto' : 'col-span-1'} flex flex-col items-center justify-center h-full w-full flex-1 overflow-visible`}
                                                >
                                                    <h4 className="font-bold mb-4 text-center w-full break-words">{friendlyLabel(key)}</h4>
                                                    <div className="w-full flex justify-center items-center flex-1">
                                                        <div className="w-full h-full flex justify-center items-center">
                                                            <ResponsiveContainer width="100%" height={300}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={value}
                                                                    dataKey={valueKey}
                                                                    nameKey={nameKey}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                        outerRadius="70%"
                                                                    fill={chartColors[0]}
                                                                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                >
                                                                    {value.map((entry, i) => (
                                                                        <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n]} />
                                                                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ textAlign: 'center', width: '100%' }} height={60} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Handle array data that can be converted to pie charts (like Sales By Category, Sales By Region)
                                    if (Array.isArray(value) && value.length >= 2 && Array.isArray(value[0]) && Array.isArray(value[1])) {
                                        const [labels, data] = value;
                                        const pieData = labels.map((label, index) => ({
                                            name: label,
                                            value: data[index] || 0
                                        }));
                                        
                                        return (
                                            <div
                                                key={key}
                                                className="col-span-1 max-w-lg mx-auto flex flex-col items-center justify-center h-full w-full flex-1 overflow-visible"
                                            >
                                                <h4 className="font-bold mb-4 text-center w-full break-words">{friendlyLabel(key)}</h4>
                                                <div className="w-full flex justify-center items-center flex-1">
                                                    <div className="w-full h-full flex justify-center items-center">
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={pieData}
                                                                    dataKey="value"
                                                                    nameKey="name"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    outerRadius="70%"
                                                                    fill={chartColors[0]}
                                                                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                >
                                                                    {pieData.map((entry, i) => (
                                                                        <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n]} />
                                                                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ textAlign: 'center', width: '100%' }} height={60} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Handle object with Region and Sales arrays
                                    if (typeof value === 'object' && value !== null && value.Region && value.Sales && Array.isArray(value.Region) && Array.isArray(value.Sales)) {
                                        const pieData = value.Region.map((region, index) => ({
                                            name: region,
                                            value: value.Sales[index] || 0
                                        }));
                                        
                                        return (
                                            <div
                                                key={key}
                                                className="col-span-1 max-w-lg mx-auto flex flex-col items-center justify-center h-full w-full flex-1 overflow-visible"
                                            >
                                                <h4 className="font-bold mb-4 text-center w-full break-words">{friendlyLabel(key)}</h4>
                                                <div className="w-full flex justify-center items-center flex-1">
                                                    <div className="w-full h-full flex justify-center items-center">
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={pieData}
                                                                    dataKey="value"
                                                                    nameKey="name"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    outerRadius="70%"
                                                                    fill={chartColors[0]}
                                                                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                >
                                                                    {pieData.map((entry, i) => (
                                                                        <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n]} />
                                                                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ textAlign: 'center', width: '100%' }} height={60} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Card for primitives/objects
                                    if (typeof value === 'object' && value !== null) {
                                        return (
                                            <div key={key} className={`${Object.keys(analysis.insights.totals).length === 1 ? 'col-span-1 max-w-lg mx-auto' : 'col-span-1'} h-full w-full`}>
                                                <h4 className="font-bold mb-2">{friendlyLabel(key)}</h4>
                                                <ul className="list-disc list-inside">
                                                    {Object.entries(value).map(([k, v]) => (
                                                        <li key={k}><span className="font-semibold">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    // Primitive
                                    return (
                                        <div key={key} className={`${Object.keys(analysis.insights.totals).length === 1 ? 'col-span-1 max-w-lg mx-auto' : 'col-span-1'} flex flex-col items-center justify-center h-full w-full`}>
                                            <h4 className="font-bold mb-2">{friendlyLabel(key)}</h4>
                                            <p className="text-2xl font-bold text-[#7400B8]">{String(value)}</p>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        )}


                         {/* Charts Grid */}
                           {/* Sales by Region */}
                        {analysis.insights.totals?.sales_by_region?.Region &&
                         Array.isArray(analysis.insights.totals.sales_by_region.Region) &&
                         Array.isArray(analysis.insights.totals.sales_by_region.Sales) &&
                         analysis.insights.totals.sales_by_region.Region.length > 0 &&
                         analysis.insights.totals.sales_by_region.Sales.length === analysis.insights.totals.sales_by_region.Region.length && (
                            <div className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: '2px' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiUsers className="w-5 h-5 text-[#3B82F6]" /> Sales by Region
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={analysis.insights.totals.sales_by_region.Region.map((region, index) => ({
                                                name: region,
                                                sales: analysis.insights.totals.sales_by_region.Sales[index],
                                                trend: analysis.insights.totals.sales_by_region.Sales[index] * 0.8
                                            }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value, name) => [
                                                    `₹${value.toLocaleString()}`,
                                                    name === 'sales' ? 'Sales' : 'Trend'
                                                ]}
                                                labelStyle={{ color: '#7400B8' }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="sales" 
                                                fill={chartColors[0]} 
                                                radius={[8, 8, 0, 0]}
                                                barSize={40}
                                            >
                                                {analysis.insights.totals.sales_by_region.Region.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.3 + (index * 0.15)})`} />
                                                ))}
                                            </Bar>
                                            <Line 
                                                type="monotone" 
                                                dataKey="trend" 
                                                stroke={chartColors[1]} 
                                                strokeWidth={3}
                                                dot={{ fill: chartColors[1], strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 10 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                                                </div>
                        )}
 {/* Sales by Region/Category */}
 {analysis.insights.totals?.sales_by_category &&
                         Array.isArray(analysis.insights.totals.sales_by_category) &&
                         analysis.insights.totals.sales_by_category.length >= 2 &&
                         Array.isArray(analysis.insights.totals.sales_by_category[0]) &&
                         Array.isArray(analysis.insights.totals.sales_by_category[1]) &&
                         analysis.insights.totals.sales_by_category[0].length > 0 &&
                         analysis.insights.totals.sales_by_category[0].length === analysis.insights.totals.sales_by_category[1].length && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: '2px' }}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" />
                                    Sales by Category
                                    </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={analysis.insights.totals.sales_by_category[0].map((category, index) => ({
                                                name: category,
                                                sales: analysis.insights.totals.sales_by_category[1][index],
                                                trend: analysis.insights.totals.sales_by_category[1][index] * 0.8 + Math.random() * 0.4 * analysis.insights.totals.sales_by_category[1][index]
                                            }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                                                labelStyle={{ color: '#7400B8' }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="sales" 
                                                fill={chartColors[0]} 
                                                radius={[8, 8, 0, 0]}
                                                barSize={40}
                                            >
                                                {analysis.insights.totals.sales_by_category[0].map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.3 + (index * 0.15)})`} />
                                                ))}
                                            </Bar>
                                            <Line 
                                                type="monotone" 
                                                dataKey="trend" 
                                                stroke={chartColors[1]} 
                                                strokeWidth={3}
                                                dot={{ fill: chartColors[1], strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 10 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                        )}

                        {/* Sales by Category - Pie Chart */}
                        {analysis.insights.totals?.sales_by_category &&
                         Array.isArray(analysis.insights.totals.sales_by_category) &&
                         analysis.insights.totals.sales_by_category.length >= 2 &&
                         Array.isArray(analysis.insights.totals.sales_by_category[0]) &&
                         Array.isArray(analysis.insights.totals.sales_by_category[1]) &&
                         analysis.insights.totals.sales_by_category[0].length > 0 &&
                         analysis.insights.totals.sales_by_category[0].length === analysis.insights.totals.sales_by_category[1].length && (
                            <div className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: '2px' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" />
                                    Sales Distribution by Category
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analysis.insights.totals.sales_by_category[0].map((category, index) => ({
                                                    name: category,
                                                    value: analysis.insights.totals.sales_by_category[1][index]
                                                }))}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                fill={chartColors[0]}
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
                                                {analysis.insights.totals.sales_by_category[0].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                                                labelStyle={{ color: '#7400B8' }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                </div>
            </div>
                        )}

                        {/* Sales Over Time */}
                        {analysis.insights.trends?.sales_over_time?.Date &&
                         Array.isArray(analysis.insights.trends.sales_over_time.Date) &&
                         Array.isArray(analysis.insights.trends.sales_over_time.Sales) &&
                         analysis.insights.trends.sales_over_time.Date.length > 0 &&
                         analysis.insights.trends.sales_over_time.Sales.length === analysis.insights.trends.sales_over_time.Date.length && (
                            <div className="bg-white border border-gray-200 shadow-sm p-6 xl:col-span-2" style={{ borderRadius: '2px' }}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiShoppingCart className="w-5 h-5 text-[#3B82F6]" /> Sales Over Time
                                </h3>
                                {/* Scale/Zoom Controls */}
                                {analysis.insights.trends.sales_over_time.Date.length > 30 && (
                                    <div className="mb-4 flex gap-2 items-center">
                                        <span className="text-sm font-medium text-gray-700">Show:</span>
                                        <select value={trendWindow} onChange={e => setTrendWindow(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                                            <option value="7">Last 7 days</option>
                                            <option value="30">Last 30 days</option>
                                            <option value="90">Last 90 days</option>
                                            <option value="all">All</option>
                                        </select>
                    </div>
                                )}
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={(() => {
                                                const daily = analysis.insights.trends.daily;
                                                // Helper to normalize to YYYY-MM-DD
                                                const toYMD = (date) => {
                                                    if (!date) return '';
                                                    const d = new Date(date);
                                                    if (isNaN(d)) return '';
                                                    return d.toISOString().slice(0, 10);
                                                };
                                                if (trendWindow === 'custom' && (customRange.start || customRange.end)) {
                                                    const startYMD = customRange.start;
                                                    const endYMD = customRange.end;
                                                    return daily.filter(d => {
                                                        const dYMD = toYMD(d.date);
                                                        if (!dYMD) return false;
                                                        if (startYMD && endYMD) return dYMD >= startYMD && dYMD <= endYMD;
                                                        if (startYMD) return dYMD >= startYMD;
                                                        if (endYMD) return dYMD <= endYMD;
                                                        return true;
                                                    }).map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
                                                } else {
                                                    let window = daily.length;
                                                    if (trendWindow !== 'all') window = Math.min(daily.length, parseInt(trendWindow));
                                                    const start = daily.length - window;
                                                    return daily.slice(start).map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
                                                }
                                            })()}
                                            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                                                labelStyle={{ color: '#7400B8' }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="sales" 
                                                stroke={chartColors[0]} 
                                                fill="url(#colorSales)" 
                                                strokeWidth={3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      

                       
                    </div> {/* <-- CLOSE the charts grid here! */}
                    </div>


                    {/* --- Custom Visualizations for Insights --- */}
                    {/* High Performers - Horizontal Bar Chart + List */}
                    {highPerf && Array.isArray(highPerf) && highPerf.length > 0 && highPerf.some(prod => Object.values(prod).some(v => v !== undefined && v !== null && v !== 0 && v !== '')) && (
                        <div className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col lg:flex-row gap-8 items-start" style={{ borderRadius: '2px' }}>
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiTrendingUp className="w-5 h-5 text-[#3B82F6]" /> High Performing Products
                                </h3>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={highPerf} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" />
                                        {(() => {
                                            const first = highPerf[0];
                                            const stringKey = Object.keys(first).find(k => typeof first[k] === 'string');
                                            return <YAxis dataKey={stringKey} type="category" width={120} />;
                                        })()}
                                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                                        <Legend />
                                        {(() => {
                                            const first = highPerf[0];
                                            const numberKey = Object.keys(first).find(k => typeof first[k] === 'number');
                                            return (
                                                <Bar dataKey={numberKey} fill={chartColors[0]} radius={[0, 8, 8, 0]} barSize={28}>
                                                    {highPerf.map((_, index) => (
                                                        <Cell key={`cell-high-${index}`} fill={chartColors[index % chartColors.length]} />
                                                    ))}
                                                </Bar>
                                            );
                                        })()}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="font-bold mb-2">Top Products</h4>
                                <ul className="space-y-2">
                                    {highPerf.map((prod, i) => {
                                        const keys = Object.keys(prod);
                                        const nameKey = keys.find(k => typeof prod[k] === 'string') || keys[0];
                                        const valueKey = keys.find(k => typeof prod[k] === 'number');
                                        return (
                                            <li key={i} className="flex justify-between items-center bg-blue-50 rounded px-4 py-2">
                                                <span className="text-gray-800">{prod[nameKey]}</span>
                                                <span className="font-bold text-blue-700">
                                                    {typeof prod[valueKey] === 'number'
                                                        ? `₹${prod[valueKey].toLocaleString()}`
                                                        : prod[valueKey] !== undefined
                                                            ? String(prod[valueKey])
                                                            : 'N/A'}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Low Performers - Horizontal Bar Chart + List */}
                    {lowPerf && Array.isArray(lowPerf) && lowPerf.length > 0 && lowPerf.some(prod => Object.values(prod).some(v => v !== undefined && v !== null && v !== 0 && v !== '')) && (
                        <div className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col lg:flex-row gap-8 items-start" style={{ borderRadius: '2px' }}>
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiTrendingUp className="w-5 h-5 text-[#3B82F6]" /> Low Performing Products
                    </h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={lowPerf} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" />
                                        {(() => {
                                            const first = lowPerf[0];
                                            const stringKey = Object.keys(first).find(k => typeof first[k] === 'string');
                                            return <YAxis dataKey={stringKey} type="category" width={120} />;
                                        })()}
                                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                                        <Legend />
                                        {(() => {
                                            const first = lowPerf[0];
                                            const numberKey = Object.keys(first).find(k => typeof first[k] === 'number');
                                            return (
                                                <Bar dataKey={numberKey} fill={chartColors[1]} radius={[0, 8, 8, 0]} barSize={28}>
                                                    {lowPerf.map((_, index) => (
                                                        <Cell key={`cell-low-${index}`} fill={chartColors[index % chartColors.length]} />
                                                    ))}
                                                </Bar>
                                            );
                                        })()}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="font-bold mb-2">Low Products</h4>
                                <ul className="space-y-2">
                                    {lowPerf.map((prod, i) => {
                                        const keys = Object.keys(prod);
                                        const nameKey = keys.find(k => typeof prod[k] === 'string') || keys[0];
                                        const valueKey = keys.find(k => typeof prod[k] === 'number');
                                        return (
                                            <li key={i} className="flex justify-between items-center bg-blue-50 rounded px-4 py-2">
                                                <span className="text-gray-800">{prod[nameKey]}</span>
                                                <span className="font-bold text-blue-400">
                                                    {typeof prod[valueKey] === 'number'
                                                        ? `₹${prod[valueKey].toLocaleString()}`
                                                        : prod[valueKey] !== undefined
                                                            ? String(prod[valueKey])
                                                            : 'N/A'}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}

                 

                    
                </motion.div>

                {/* High/Low Performers and Hypotheses at the bottom as Insights */}
                <div className="bg-white border border-gray-200 shadow-sm p-6 mt-8" style={{ borderRadius: '2px' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FiCpu className="w-5 h-5 text-[#6366F1]" /> AI-Powered Insights & Hypotheses
                        </h3>
                        <button
                            className="ml-4 px-4 py-2 bg-[#3B82F6] text-white rounded shadow hover:bg-[#1E40AF] transition"
                            onClick={() => setShowSummary(s => !s)}
                        >
                            {showSummary ? 'Hide Summary' : 'Show Summary'}
                        </button>
                    </div>
                    {showSummary && (
                        analysis.summary ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                {Object.entries(analysis.summary).map(([field, details]) => {
                                    // Detect if this field is a percentage field
                                    const isPercentField = field.toLowerCase().includes('%') || field.toLowerCase().includes('percent');
                                    // Helper: check if object is a stats object (min, max, mean, median, stddev, etc.)
                                    const isStatsObject = (obj) => {
                                        if (!obj || typeof obj !== 'object') return false;
                                        const statKeys = ['min', 'max', 'mean', 'median', 'stddev', 'count', 'sum'];
                                        return statKeys.some(k => k in obj);
                                    };
                                    // Helper: render stats object as a list
                                    const renderStatsObject = (obj) => (
                                        <ul className="text-sm space-y-1">
                                            {Object.entries(obj).map(([k, v]) => (
                                                <li key={k}>
                                                    <span className="font-semibold">{k.toLowerCase() === 'count' ? 'Total Entries' : friendlyLabel(k)}:</span> {typeof v === 'number' ? round4(v) : String(v)}
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                    // Main rendering logic
                                    return (
                                    <div key={field} className="bg-blue-50 rounded p-4 border border-blue-100">
                                            <h4 className="font-bold mb-2">{friendlyLabel(field)}</h4>
                                            {/* If details has a type, use existing logic */}
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
                                            {/* If details is a stats object (min, max, mean, etc.) but no type */}
                                            {details && typeof details === 'object' && !('type' in details) && isStatsObject(details) && renderStatsObject(details)}
                                            {/* If details is an array of objects */}
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
                                            {/* If details is an array of primitives */}
                                            {Array.isArray(details) && details.length > 0 && typeof details[0] !== 'object' && (
                                                <ul className="ml-2 list-disc list-inside">
                                                    {details.map((v, idx) => (
                                                        <li key={idx}>{String(v)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {/* If details is a plain object (fallback) */}
                                            {details && typeof details === 'object' && !('type' in details) && !isStatsObject(details) && (
                                                <ul className="text-sm space-y-1">
                                                    {Object.entries(details).map(([k, v]) => (
                                                        <li key={k}><span className="font-semibold">{friendlyLabel(k)}:</span> {String(v)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {/* If details is a primitive */}
                                            {(!details || typeof details !== 'object') && (
                                                <div className="text-sm">{String(details)}</div>
                                            )}
                                            {/* If details is empty or missing */}
                                            {(!details || (typeof details === 'object' && Object.keys(details).length === 0)) && (
                                                <div className="text-gray-500 text-sm">No data available.</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-gray-500">No summary available.</div>
                        )
                    )}
                    {analysis.insights.hypothesis && Array.isArray(analysis.insights.hypothesis) && analysis.insights.hypothesis.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-bold text-gray-900 mb-2">Hypotheses:</h4>
                            <ul className="list-disc list-inside text-gray-700">
                                {analysis.insights.hypothesis.map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetailDashboard; 