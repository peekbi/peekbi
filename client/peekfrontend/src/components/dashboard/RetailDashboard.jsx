import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiUsers, FiBarChart2, FiShoppingCart, FiCpu, FiMessageSquare, FiDownload } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import * as XLSX from 'xlsx';

const RetailDashboard = ({ file, analysis }) => {
    // Single comprehensive API response log
    console.log('=== RETAIL DASHBOARD API RESPONSE ===', {
        file,
        analysis,
        timestamp: new Date().toISOString()
    });

    // Error boundary state
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Wrap the entire component in error handling
    React.useEffect(() => {
        const handleError = (error) => {
            console.error('RetailDashboard Error:', error);
            setHasError(true);
            setErrorMessage(error.message || 'An unexpected error occurred');
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);



    if (hasError) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
                <div className="w-full max-w-none">
                    <div className="bg-red-50 border border-red-200 rounded-sm p-6 text-center">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Dashboard Error</h2>
                        <p className="text-red-600 mb-4">{errorMessage}</p>
                        <button
                            onClick={() => { setHasError(false); setErrorMessage(''); }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const [showSummary, setShowSummary] = useState(false);
    const [trendWindow, setTrendWindow] = useState('all');

    // Multi-color palette for charts
    const chartColors = [
        '#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#A855F7', '#F97316', '#06B6D4',
        '#F43F5E', '#22D3EE', '#84CC16', '#EAB308', '#0EA5E9', '#8B5CF6', '#F472B6'
    ];

    // Helper functions for safe data access
    const safeGet = (obj, path, defaultValue = null) => {
        try {
            return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
        } catch {
            return defaultValue;
        }
    };

    const hasValidData = (data) => {
        if (!data) return false;
        if (Array.isArray(data)) return data.length > 0;
        if (typeof data === 'object') return Object.keys(data).length > 0;
        return data !== null && data !== undefined && data !== '';
    };

    const getValidArray = (data, minLength = 1) => {
        if (!Array.isArray(data) || data.length < minLength) return [];
        return data.filter(item => item !== null && item !== undefined);
    };

    const formatValue = (value, type = 'auto') => {
        if (value === null || value === undefined || value === '') return 'N/A';

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return String(value);

        switch (type) {
            case 'currency':
                return `₹${numValue.toLocaleString()}`;
            case 'percentage':
                return `${numValue.toFixed(2)}%`;
            case 'number':
                return numValue.toLocaleString();
            default:
                if (numValue > 1000) {
                    return numValue.toLocaleString();
                }
                return numValue.toFixed(2);
        }
    };

    const renderGenericChart = (data, title, type = 'bar') => {
        if (!hasValidData(data)) return null;

        // Try to detect chart data structure
        let chartData = [];

        if (Array.isArray(data)) {
            if (data.length > 0 && typeof data[0] === 'object') {
                chartData = data;
            }
        } else if (typeof data === 'object') {
            chartData = Object.entries(data).map(([key, value]) => ({
                name: key,
                value: typeof value === 'object' ? value.value || value.count || value.total || 0 : value
            }));
        }

        if (chartData.length === 0) return null;

        return (
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill={chartColors[0]}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        ) : (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill={chartColors[0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    if (!file || !analysis) {
        return (
            <div className="text-center p-8">
                <p>No analysis data available for this file.</p>
            </div>
        );
    }



    // Count available sections for better layout
    const availableSections = {
        kpis: hasValidData(safeGet(analysis, 'insights.kpis', {})),
        advancedKpis: hasValidData(safeGet(analysis, 'insights.advanced_kpis', {})),
        trends: hasValidData(safeGet(analysis, 'insights.trends.daily', [])),
        salesByRegion: hasValidData(safeGet(analysis, 'insights.totals.sales_by_region', [])),
        highPerformers: hasValidData(safeGet(analysis, 'insights.highPerformers.top_products', [])),
        lowPerformers: hasValidData(safeGet(analysis, 'insights.lowPerformers.low_products', [])),
        customerSegments: hasValidData(safeGet(analysis, 'insights.customer_segments.rfm_analysis.segment_summary', {})),
        seasonalAnalysis: hasValidData(safeGet(analysis, 'insights.seasonal_analysis.seasonal_indices', {})),
        forecasting: hasValidData(safeGet(analysis, 'insights.forecasting.trend_forecast.forecasts', [])),
        performanceMetrics: hasValidData(safeGet(analysis, 'insights.performance_metrics', {})),
        riskAnalysis: hasValidData(safeGet(analysis, 'insights.risk_analysis', {})),
        recommendations: hasValidData(safeGet(analysis, 'insights.recommendations.priority_actions', [])),
        alerts: hasValidData(safeGet(analysis, 'insights.alerts', [])),
        outliers: hasValidData(safeGet(analysis, 'insights.outliers', {})),
        correlations: hasValidData(safeGet(analysis, 'insights.correlations', {})),
        summary: hasValidData(safeGet(analysis, 'summary', {}))
    };

    const totalSections = Object.values(availableSections).filter(Boolean).length;
    const isEmpty = totalSections === 0;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-none">

                <div className="px-4 sm:px-6 py-6">
                    {/* Empty State */}
                    {isEmpty && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                        >
                            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiBarChart2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                                <p className="text-gray-600 mb-4">
                                    The analysis data appears to be empty or incomplete. Please check your data source and try again.
                                </p>
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>File: {file?.originalName || 'Unknown'}</p>
                                    <p>Size: {file?.sizeInBytes ? `${(file.sizeInBytes / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                                    <p>Uploaded: {file?.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Data Available - Render Dashboard */}
                    {!isEmpty && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* KPI Section - Primary and Advanced KPIs */}
                            {availableSections.kpis && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <FiTrendingUp className="w-5 h-5 text-blue-600" />
                                            Key Performance Indicators
                                        </h2>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {Object.keys(analysis.insights.kpis).length} metrics
                                        </span>
                                    </div>
                                    {/* Primary KPI Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                        {Object.entries(analysis.insights.kpis).slice(0, 8).map(([key, value], index) => {
                                            if (value === undefined || value === null || value === '') return null;

                                            const getIcon = (key) => {
                                                if (key.includes('total') || key.includes('sales')) return FiDollarSign;
                                                if (key.includes('profit')) return FiTrendingUp;
                                                if (key.includes('margin') || key.includes('percent')) return FiBarChart2;
                                                if (key.includes('avg') || key.includes('order')) return FiShoppingCart;
                                                return FiBarChart2;
                                            };

                                            const IconComponent = getIcon(key);
                                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                            const formatKpiValue = (key, value) => {
                                                const numValue = parseFloat(value);
                                                if (isNaN(numValue)) return String(value);

                                                if (key.includes('total') || key.includes('avg') || key.includes('median') || key.includes('forecast')) {
                                                    return `₹${numValue.toLocaleString()}`;
                                                }
                                                if (key.includes('percent') || key.includes('margin')) {
                                                    return `${numValue.toFixed(2)}%`;
                                                }
                                                return numValue.toLocaleString();
                                            };

                                            return (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="group bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden"
                                                >
                                                    <div className="h-1 bg-gradient-to-r" style={{
                                                        backgroundImage: `linear-gradient(90deg, ${chartColors[index % chartColors.length]}, ${chartColors[(index + 1) % chartColors.length]})`
                                                    }}></div>
                                                    <div className="p-4 lg:p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-200"
                                                                    style={{ backgroundColor: chartColors[index % chartColors.length] }}>
                                                                    <IconComponent className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                                                        {label}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        {key.includes('total') ? 'Total Value' :
                                                                            key.includes('avg') ? 'Average' :
                                                                                key.includes('percent') ? 'Percentage' : 'Metric'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                                            {formatKpiValue(key, value)}
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>Updated now</span>
                                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        }).filter(Boolean)}
                                    </div>

                                    {/* Advanced KPI Cards */}
                                    {availableSections.advancedKpis && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <FiCpu className="w-4 h-4 text-purple-600" />
                                                    Advanced Analytics
                                                </h3>
                                                <span className="text-sm text-gray-500 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                                                    {Object.keys(analysis.insights.advanced_kpis).length} insights
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                                {Object.entries(analysis.insights.advanced_kpis).slice(0, 8).map(([key, value], index) => {
                                                    if (value === undefined || value === null) return null;

                                                    const IconComponent = FiCpu;
                                                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                                    const formatAdvancedValue = (key, value) => {
                                                        const numValue = parseFloat(value);
                                                        if (isNaN(numValue)) return String(value);

                                                        if (key.includes('total') || key.includes('avg') || key.includes('daily')) {
                                                            return `₹${numValue.toLocaleString()}`;
                                                        }
                                                        if (key.includes('percent') || key.includes('rate') || key.includes('variation')) {
                                                            return `${numValue.toFixed(2)}%`;
                                                        }
                                                        return numValue.toLocaleString();
                                                    };

                                                    return (
                                                        <motion.div
                                                            key={key}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: (index + 8) * 0.1 }}
                                                            className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md rounded-sm"
                                                        >
                                                            <div className="h-1" style={{ backgroundColor: chartColors[(index + 8) % chartColors.length] }}></div>
                                                            <div className="p-4 lg:p-5">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-2 rounded-lg text-white shadow-sm group-hover:scale-110 transition-transform duration-200"
                                                                            style={{ backgroundColor: chartColors[(index + 8) % chartColors.length] }}>
                                                                            <IconComponent className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-700">
                                                                                {label}
                                                                            </div>
                                                                            <div className="text-xs text-purple-600 font-medium">
                                                                                Advanced Metric
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                                                    {formatAdvancedValue(key, value)}
                                                                </div>
                                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                                    <span>AI Generated</span>
                                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                }).filter(Boolean)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Daily Trends Chart */}
                            {availableSections.trends && (
                                <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                                                    <FiBarChart2 className="w-5 h-5 text-blue-600" />
                                                    Daily Sales Trends
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {analysis.insights.trends.daily.length} data points •
                                                    {(() => {
                                                        const daily = analysis.insights.trends.daily;
                                                        const firstDate = new Date(daily[0]?.date);
                                                        const lastDate = new Date(daily[daily.length - 1]?.date);
                                                        const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
                                                        return ` ${daysDiff} days period`;
                                                    })()}
                                                </p>
                                            </div>
                                            {analysis.insights.trends.daily.length > 30 && (
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-sm font-medium text-gray-700">Show:</span>
                                                    <select
                                                        value={trendWindow}
                                                        onChange={e => setTrendWindow(e.target.value)}
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    >
                                                        <option value="7">Last 7 days</option>
                                                        <option value="30">Last 30 days</option>
                                                        <option value="90">Last 90 days</option>
                                                        <option value="all">All</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="h-[350px] lg:h-[400px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart
                                                        data={(() => {
                                                            const daily = analysis.insights.trends.daily;
                                                            let window = daily.length;
                                                            if (trendWindow !== 'all') window = Math.min(daily.length, parseInt(trendWindow));
                                                            const start = daily.length - window;
                                                            return daily.slice(start).map(d => ({
                                                                ...d,
                                                                date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                            }));
                                                        })()}
                                                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                                                    >
                                                        <defs>
                                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="date" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'total' ? 'Total Sales' : name]} />
                                                        <Legend />
                                                        <Area type="monotone" dataKey="total" stroke={chartColors[0]} fill="url(#colorTrend)" strokeWidth={3} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sales by Channel/Region - Dynamic */}
                            {(() => {
                                const salesByRegion = safeGet(analysis, 'insights.totals.sales_by_region', []);
                                if (!hasValidData(salesByRegion)) return null;

                                // Detect data structure dynamically
                                const validData = getValidArray(salesByRegion);
                                if (validData.length === 0) return null;

                                // Find the keys dynamically
                                const firstItem = validData[0];
                                const keys = Object.keys(firstItem);
                                const nameKey = keys.find(k => typeof firstItem[k] === 'string') || keys[0];
                                const valueKey = keys.find(k => typeof firstItem[k] === 'number') || keys[1];

                                if (!nameKey || !valueKey) return null;

                                return (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiUsers className="w-5 h-5 text-[#3B82F6]" /> Sales Distribution
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={validData}
                                                            dataKey={valueKey}
                                                            nameKey={nameKey}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            fill={chartColors[0]}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {validData.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [formatValue(value, 'currency'), nameKey]} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-800">Breakdown</h4>
                                                {validData.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${chartColors[index % chartColors.length]}15` }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
                                                            <span className="font-medium text-gray-800">{item[nameKey] || 'Unknown'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">{formatValue(item[valueKey], 'currency')}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {/* High and Low Performers - Dynamic */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* High Performers */}
                                {(() => {
                                    const highPerformers = safeGet(analysis, 'insights.highPerformers.top_products', []) ||
                                        safeGet(analysis, 'insights.product_analysis.category_performance', [])?.slice(0, 5) || [];

                                    const validData = getValidArray(highPerformers);
                                    if (validData.length === 0) return null;

                                    // Detect keys dynamically
                                    const firstItem = validData[0];
                                    const keys = Object.keys(firstItem);
                                    const nameKey = keys.find(k => typeof firstItem[k] === 'string') || keys[0];
                                    const valueKey = keys.find(k => typeof firstItem[k] === 'number') || keys[1];

                                    return (
                                        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <FiTrendingUp className="w-5 h-5 text-[#10B981]" /> Top Performers
                                            </h3>
                                            <div className="space-y-3">
                                                {validData.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-medium text-gray-800">{item[nameKey] || 'Unknown'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-green-700">{formatValue(item[valueKey], 'currency')}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Low Performers */}
                                {(() => {
                                    const lowPerformers = safeGet(analysis, 'insights.lowPerformers.low_products', []) ||
                                        safeGet(analysis, 'insights.product_analysis.category_performance', [])?.slice(-3) || [];

                                    const validData = getValidArray(lowPerformers);
                                    if (validData.length === 0) return null;

                                    // Detect keys dynamically
                                    const firstItem = validData[0];
                                    const keys = Object.keys(firstItem);
                                    const nameKey = keys.find(k => typeof firstItem[k] === 'string') || keys[0];
                                    const valueKey = keys.find(k => typeof firstItem[k] === 'number') || keys[1];

                                    return (
                                        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <FiTrendingUp className="w-5 h-5 text-[#EF4444]" /> Low Performers
                                            </h3>
                                            <div className="space-y-3">
                                                {validData.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <span className="font-medium text-gray-800">{item[nameKey] || 'Unknown'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-red-700">{formatValue(item[valueKey], 'currency')}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            {/* Customer Segments Analysis - Dynamic */}
                            {(() => {
                                const segmentSummary = safeGet(analysis, 'insights.customer_segments.rfm_analysis.segment_summary', {});
                                if (!hasValidData(segmentSummary)) return null;

                                const segmentData = Object.entries(segmentSummary).map(([segment, data]) => ({
                                    name: segment.replace(/_/g, ' '),
                                    value: safeGet(data, 'count', 0),
                                    totalValue: safeGet(data, 'total_value', 0)
                                })).filter(item => item.value > 0);

                                if (segmentData.length === 0) return null;

                                return (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiUsers className="w-5 h-5 text-[#3B82F6]" /> Customer Segments
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Pie Chart */}
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={segmentData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={100}
                                                            fill={chartColors[0]}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {segmentData.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value, name, props) => [
                                                            `${value} customers (${formatValue(props.payload.totalValue, 'currency')})`,
                                                            name
                                                        ]} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Segment Details */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-800">Segment Breakdown</h4>
                                                {segmentData.map((item, index) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${chartColors[index % chartColors.length]}15` }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
                                                            <span className="font-medium text-gray-800">{item.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">{item.value} customers</div>
                                                            <div className="text-sm text-gray-600">{formatValue(item.totalValue, 'currency')}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {/* Seasonal Analysis */}
                            {analysis?.insights?.seasonal_analysis?.seasonal_indices && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" /> Seasonal Performance
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Bar Chart */}
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={Object.entries(analysis.insights.seasonal_analysis.seasonal_indices).map(([quarter, data]) => ({
                                                        quarter,
                                                        avgSales: parseFloat(data.avg_sales),
                                                        seasonalIndex: parseFloat(data.seasonal_index),
                                                        interpretation: data.interpretation
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="quarter" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value, name) => [
                                                        name === 'avgSales' ? `₹${value.toLocaleString()}` : value,
                                                        name === 'avgSales' ? 'Average Sales' : 'Seasonal Index'
                                                    ]} />
                                                    <Legend />
                                                    <Bar dataKey="avgSales" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="seasonalIndex" fill={chartColors[1]} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Seasonal Insights */}
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-800">Quarterly Insights</h4>
                                            {Object.entries(analysis.insights.seasonal_analysis.seasonal_indices).map(([quarter, data], index) => (
                                                <div key={quarter} className="p-3 rounded-lg border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-800">{quarter}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${data.interpretation === 'Above Average' ? 'bg-green-100 text-green-800' :
                                                            data.interpretation === 'Below Average' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {data.interpretation}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <div>Avg Sales: ₹{parseFloat(data.avg_sales).toLocaleString()}</div>
                                                        <div>Index: {data.seasonal_index}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Forecasting */}
                            {analysis?.insights?.forecasting?.trend_forecast?.forecasts && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiTrendingUp className="w-5 h-5 text-[#3B82F6]" /> Sales Forecast
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Forecast Chart */}
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={analysis.insights.forecasting.trend_forecast.forecasts.map(forecast => ({
                                                        period: `Day ${forecast.period}`,
                                                        forecast: parseFloat(forecast.forecast_value),
                                                        confidence: forecast.confidence * 100
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="period" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value, name) => [
                                                        name === 'forecast' ? `₹${value.toLocaleString()}` : `${value.toFixed(0)}%`,
                                                        name === 'forecast' ? 'Forecast' : 'Confidence'
                                                    ]} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="forecast" stroke={chartColors[0]} strokeWidth={3} dot={{ fill: chartColors[0], strokeWidth: 2, r: 6 }} />
                                                    <Line type="monotone" dataKey="confidence" stroke={chartColors[1]} strokeWidth={2} strokeDasharray="5 5" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Forecast Details */}
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-800">Forecast Details</h4>
                                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                                <div className="text-sm text-blue-800">
                                                    <div><strong>Method:</strong> {analysis.insights.forecasting.trend_forecast.methodology}</div>
                                                    <div><strong>Growth Rate:</strong> {analysis.insights.forecasting.trend_forecast.avg_growth_rate}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {analysis.insights.forecasting.trend_forecast.forecasts.slice(0, 5).map((forecast, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 rounded border border-gray-200">
                                                        <span className="text-sm font-medium">Day {forecast.period}</span>
                                                        <div className="text-right">
                                                            <div className="font-bold">₹{parseFloat(forecast.forecast_value).toLocaleString()}</div>
                                                            <div className="text-xs text-gray-600">{(forecast.confidence * 100).toFixed(0)}% confidence</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Performance Metrics */}
                            {analysis?.insights?.performance_metrics && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiTrendingUp className="w-5 h-5 text-[#3B82F6]" /> Performance Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Sales Velocity */}
                                        {analysis.insights.performance_metrics.sales_velocity && (
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-gray-800 mb-2">Sales Velocity</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Sales per Day</span>
                                                        <span className="font-bold">₹{analysis.insights.performance_metrics.sales_velocity.sales_per_day}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Transactions per Day</span>
                                                        <span className="font-bold">{analysis.insights.performance_metrics.sales_velocity.transactions_per_day}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Performance Consistency */}
                                        {analysis.insights.performance_metrics.performance_consistency && (
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-gray-800 mb-2">Performance Consistency</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Consistency Score</span>
                                                        <span className="font-bold">{analysis.insights.performance_metrics.performance_consistency.consistency_score}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Volatility Level</span>
                                                        <span className={`font-bold ${analysis.insights.performance_metrics.performance_consistency.volatility_level === 'High' ? 'text-red-600' :
                                                            analysis.insights.performance_metrics.performance_consistency.volatility_level === 'Medium' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                            }`}>
                                                            {analysis.insights.performance_metrics.performance_consistency.volatility_level}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Efficiency Ratios */}
                                        {analysis.insights.performance_metrics.efficiency_ratios && (
                                            <div className="p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-1">
                                                <h4 className="font-semibold text-gray-800 mb-2">Efficiency Ratios</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(analysis.insights.performance_metrics.efficiency_ratios).map(([ratio, value]) => (
                                                        <div key={ratio} className="text-center">
                                                            <div className="text-lg font-bold text-blue-600">
                                                                {ratio.includes('ratio') ? value : `₹${value}`}
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {ratio.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Monthly and Weekly Patterns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Monthly Patterns */}
                                {analysis?.insights?.seasonal_analysis?.monthly_patterns && (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" /> Monthly Sales Patterns
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={analysis.insights.seasonal_analysis.monthly_patterns.filter(m => m.transaction_count > 0)}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value, name) => [
                                                        name === 'total_sales' ? `₹${parseFloat(value).toLocaleString()}` :
                                                            name === 'avg_sales' ? `₹${parseFloat(value).toLocaleString()}` : value,
                                                        name === 'total_sales' ? 'Total Sales' :
                                                            name === 'avg_sales' ? 'Average Sales' : 'Transactions'
                                                    ]} />
                                                    <Legend />
                                                    <Bar dataKey="total_sales" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="transaction_count" fill={chartColors[1]} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Weekly Patterns */}
                                {analysis?.insights?.seasonal_analysis?.weekly_patterns && (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiBarChart2 className="w-5 h-5 text-[#3B82F6]" /> Weekly Sales Patterns
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={analysis.insights.seasonal_analysis.weekly_patterns}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="day" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value, name) => [
                                                        name === 'total_sales' ? `₹${parseFloat(value).toLocaleString()}` :
                                                            name === 'avg_sales' ? `₹${parseFloat(value).toLocaleString()}` : value,
                                                        name === 'total_sales' ? 'Total Sales' :
                                                            name === 'avg_sales' ? 'Average Sales' : 'Transactions'
                                                    ]} />
                                                    <Legend />
                                                    <Bar dataKey="total_sales" fill={chartColors[2]} radius={[4, 4, 0, 0]}>
                                                        {analysis.insights.seasonal_analysis.weekly_patterns.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Risk Analysis */}
                            {analysis?.insights?.risk_analysis && Object.keys(analysis.insights.risk_analysis).length > 0 && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiMessageSquare className="w-5 h-5 text-[#EF4444]" /> Risk Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(analysis.insights.risk_analysis).map(([riskType, riskData], index) => {
                                            if (!riskData || typeof riskData !== 'object') return null;

                                            const getRiskColor = (level) => {
                                                switch (level?.toLowerCase()) {
                                                    case 'high': return '#EF4444';
                                                    case 'medium': return '#F59E0B';
                                                    case 'low': return '#10B981';
                                                    default: return '#6B7280';
                                                }
                                            };

                                            return (
                                                <div key={riskType} className="p-4 rounded-lg border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-800 text-sm">
                                                            {riskType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </h4>
                                                        <span
                                                            className="px-2 py-1 rounded text-xs font-bold text-white"
                                                            style={{ backgroundColor: getRiskColor(riskData.risk_level) }}
                                                        >
                                                            {riskData.risk_level?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Risk Score</span>
                                                            <span className="font-bold" style={{ color: getRiskColor(riskData.risk_level) }}>
                                                                {riskData.risk_score}/100
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${riskData.risk_score}%`,
                                                                    backgroundColor: getRiskColor(riskData.risk_level)
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2">
                                                            {riskData.recommendation}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Strategic Recommendations */}
                            {analysis?.insights?.recommendations?.priority_actions && analysis.insights.recommendations.priority_actions.length > 0 && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiCpu className="w-5 h-5 text-[#6366F1]" /> Strategic Recommendations
                                    </h3>
                                    <div className="space-y-4">
                                        {analysis.insights.recommendations.priority_actions.map((recommendation, index) => {
                                            const getImpactColor = (impact) => {
                                                switch (impact?.toLowerCase()) {
                                                    case 'high': return '#EF4444';
                                                    case 'medium': return '#F59E0B';
                                                    case 'low': return '#10B981';
                                                    default: return '#6B7280';
                                                }
                                            };

                                            const getEffortColor = (effort) => {
                                                switch (effort?.toLowerCase()) {
                                                    case 'high': return '#EF4444';
                                                    case 'medium': return '#F59E0B';
                                                    case 'low': return '#10B981';
                                                    default: return '#6B7280';
                                                }
                                            };

                                            return (
                                                <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-800 mb-1">{recommendation.category}</h4>
                                                            <p className="text-gray-700 text-sm">{recommendation.recommendation}</p>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <span
                                                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                                                style={{ backgroundColor: getImpactColor(recommendation.impact) }}
                                                            >
                                                                {recommendation.impact} Impact
                                                            </span>
                                                            <span
                                                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                                                style={{ backgroundColor: getEffortColor(recommendation.effort) }}
                                                            >
                                                                {recommendation.effort} Effort
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Timeline: {recommendation.timeline}</span>
                                                        <span className="text-blue-600 font-medium">Priority #{index + 1}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Alerts */}
                            {analysis?.insights?.alerts && analysis.insights.alerts.length > 0 && (
                                <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiMessageSquare className="w-5 h-5 text-[#F59E0B]" /> System Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.insights.alerts.map((alert, index) => {
                                            const getSeverityColor = (severity) => {
                                                switch (severity?.toLowerCase()) {
                                                    case 'high': return '#EF4444';
                                                    case 'medium': return '#F59E0B';
                                                    case 'low': return '#10B981';
                                                    default: return '#6B7280';
                                                }
                                            };

                                            return (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                                                    <div
                                                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                                    ></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-gray-800">{alert.type}</span>
                                                            <span
                                                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                                                style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                                            >
                                                                {alert.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm mb-1">{alert.message}</p>
                                                        <p className="text-blue-600 text-sm font-medium">Action: {alert.action}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Outliers and Correlations */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Outliers */}
                                {analysis?.insights?.outliers && Object.keys(analysis.insights.outliers).some(key => analysis.insights.outliers[key] && analysis.insights.outliers[key].outlier_count > 0) && (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiBarChart2 className="w-5 h-5 text-[#EF4444]" /> Outlier Detection
                                        </h3>
                                        <div className="space-y-4">
                                            {Object.entries(analysis.insights.outliers).map(([type, outlierData]) => {
                                                if (!outlierData || outlierData.outlier_count === 0) return null;

                                                return (
                                                    <div key={type} className="p-3 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-semibold text-gray-800 capitalize">
                                                                {type.replace(/_/g, ' ')}
                                                            </h4>
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                {outlierData.outlier_count} outliers ({outlierData.outlier_percentage}%)
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <div>Method: {outlierData.detection_method}</div>
                                                            <div>Range: {outlierData.lower_bound} - {outlierData.upper_bound}</div>
                                                            {outlierData.outlier_values && outlierData.outlier_values.length > 0 && (
                                                                <div className="mt-2">
                                                                    <span className="font-medium">Sample values: </span>
                                                                    {outlierData.outlier_values.slice(0, 3).map(val =>
                                                                        typeof val === 'number' ? val.toFixed(2) : val
                                                                    ).join(', ')}
                                                                    {outlierData.outlier_values.length > 3 && '...'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Correlations */}
                                {analysis?.insights?.correlations && Object.keys(analysis.insights.correlations).length > 0 && (
                                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiTrendingUp className="w-5 h-5 text-[#10B981]" /> Correlation Analysis
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(analysis.insights.correlations).map(([pair, corrData]) => {
                                                const getCorrelationColor = (strength) => {
                                                    switch (strength?.toLowerCase()) {
                                                        case 'strong': return '#10B981';
                                                        case 'moderate': return '#F59E0B';
                                                        case 'weak': return '#6B7280';
                                                        default: return '#6B7280';
                                                    }
                                                };

                                                const correlation = typeof corrData === 'object' ? corrData.correlation : corrData;
                                                const strength = typeof corrData === 'object' ? corrData.strength : 'Unknown';
                                                const direction = typeof corrData === 'object' ? corrData.direction : (parseFloat(correlation) >= 0 ? 'Positive' : 'Negative');

                                                return (
                                                    <div key={pair} className="p-3 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium text-gray-800 text-sm">
                                                                {pair.replace(/_vs_/g, ' vs ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="px-2 py-1 rounded text-xs font-medium text-white"
                                                                    style={{ backgroundColor: getCorrelationColor(strength) }}
                                                                >
                                                                    {strength}
                                                                </span>
                                                                <span className={`text-sm font-bold ${direction === 'Positive' ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {direction}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Correlation</span>
                                                            <span className="font-bold text-gray-900">{correlation}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                            <div
                                                                className="h-2 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.abs(parseFloat(correlation)) * 100}%`,
                                                                    backgroundColor: getCorrelationColor(strength)
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Summary and Insights Section */}
                            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FiCpu className="w-5 h-5 text-[#6366F1]" /> AI-Powered Insights & Summary
                                    </h3>
                                    <button
                                        className="px-4 py-2 bg-[#3B82F6] text-white rounded shadow hover:bg-[#1E40AF] transition"
                                        onClick={() => setShowSummary(s => !s)}
                                    >
                                        {showSummary ? 'Hide Summary' : 'Show Summary'}
                                    </button>
                                </div>

                                {showSummary && analysis?.summary && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        {Object.entries(analysis.summary).map(([field, details]) => {
                                            const friendlyLabel = (key) => {
                                                return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                            };

                                            return (
                                                <div key={field} className="bg-blue-50 rounded p-4 border border-blue-100">
                                                    <h4 className="font-bold mb-2">{friendlyLabel(field)}</h4>
                                                    {details && typeof details === 'object' && details.type === 'numeric' && (
                                                        <ul className="text-sm space-y-1">
                                                            <li><span className="font-semibold">Count:</span> {formatValue(details.count, 'number')}</li>
                                                            <li><span className="font-semibold">Min:</span> {formatValue(details.min)}</li>
                                                            <li><span className="font-semibold">Max:</span> {formatValue(details.max)}</li>
                                                            <li><span className="font-semibold">Mean:</span> {formatValue(details.mean)}</li>
                                                            <li><span className="font-semibold">Median:</span> {formatValue(details.median)}</li>
                                                        </ul>
                                                    )}
                                                    {details && typeof details === 'object' && details.type === 'categorical' && (
                                                        <div>
                                                            <p className="text-sm mb-2"><span className="font-semibold">Unique values:</span> {details.unique_count || 'N/A'}</p>
                                                            {details.top_values && Array.isArray(details.top_values) && (
                                                                <div>
                                                                    <p className="text-sm font-semibold mb-1">Top values:</p>
                                                                    <ul className="text-xs space-y-1">
                                                                        {details.top_values.slice(0, 3).map((item, i) => (
                                                                            <li key={i}>{safeGet(item, 'value', 'Unknown')}: {safeGet(item, 'count', 0)}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(!details || typeof details !== 'object' || (!details.type)) && (
                                                        <div className="text-sm text-gray-600">
                                                            {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details || 'N/A')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {analysis?.insights?.hypothesis && Array.isArray(analysis.insights.hypothesis) && analysis.insights.hypothesis.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold text-gray-900 mb-2">AI Hypotheses:</h4>
                                        <ul className="list-disc list-inside text-gray-700">
                                            {analysis.insights.hypothesis.map((h, i) => <li key={i}>{h}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetailDashboard;