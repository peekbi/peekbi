import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiBarChart2, FiPieChart, FiLineChart, FiDollarSign, FiShoppingBag, FiUsers, FiCalendar, FiTrendingDown } from 'react-icons/fi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ComposedChart
} from 'recharts';

const COLORS = ['#7400B8', '#9B4DCA', '#B75CFF', '#D4A5FF', '#E8C5FF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const Insights = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [fileData, setFileData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const loadData = () => {
            try {
                const stateData = location.state?.fileData;
                if (stateData) {
                    setFileData(stateData);
                    setLoading(false);
                    return;
                }

                const storedData = localStorage.getItem('currentFileData');
                if (storedData) {
                    setFileData(JSON.parse(storedData));
                } else {
                    setError('No data available. Please analyze a file first.');
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load analysis data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [location]);

    const renderSalesMetrics = () => {
        if (!fileData?.analysis?.basic?.data) return null;

        const data = fileData.analysis.basic.data;
        const salesColumn = fileData.headers.find(h => 
            h.toLowerCase().includes('sales') || h.toLowerCase().includes('revenue')
        );
        const dateColumn = fileData.headers.find(h => 
            h.toLowerCase().includes('date') || h.toLowerCase().includes('time')
        );

        if (!salesColumn || !dateColumn) return null;

        // Calculate daily sales
        const dailySales = data.reduce((acc, row) => {
            const date = row[dateColumn];
            const sales = parseFloat(row[salesColumn]) || 0;
            acc[date] = (acc[date] || 0) + sales;
            return acc;
        }, {});

        const chartData = Object.entries(dailySales).map(([date, sales]) => ({
            date,
            sales
        }));

        // Calculate growth rate
        const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
        const avgSales = totalSales / chartData.length;
        const growthRate = ((chartData[chartData.length - 1].sales - chartData[0].sales) / chartData[0].sales * 100).toFixed(1);

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Sales Performance</h3>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Sales</div>
                            <div className="text-xl font-bold text-[#7400B8]">${totalSales.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Avg Daily Sales</div>
                            <div className="text-xl font-bold text-[#7400B8]">${avgSales.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Growth Rate</div>
                            <div className={`text-xl font-bold ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {growthRate}%
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#7400B8" 
                                fillOpacity={1} 
                                fill="url(#colorSales)" 
                            />
                            <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#FF6B6B" 
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderCategoryAnalysis = () => {
        if (!fileData?.analysis?.basic?.data) return null;

        const data = fileData.analysis.basic.data;
        const categoryColumn = fileData.headers.find(h => 
            h.toLowerCase().includes('category') || h.toLowerCase().includes('product')
        );
        const salesColumn = fileData.headers.find(h => 
            h.toLowerCase().includes('sales') || h.toLowerCase().includes('revenue')
        );

        if (!categoryColumn || !salesColumn) return null;

        // Calculate sales by category
        const categorySales = data.reduce((acc, row) => {
            const category = row[categoryColumn] || 'Uncategorized';
            const sales = parseFloat(row[salesColumn]) || 0;
            acc[category] = (acc[category] || 0) + sales;
            return acc;
        }, {});

        const chartData = Object.entries(categorySales)
            .map(([category, sales]) => ({
                category,
                sales,
                percentage: (sales / Object.values(categorySales).reduce((a, b) => a + b, 0) * 100).toFixed(1)
            }))
            .sort((a, b) => b.sales - a.sales);

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Category Performance</h3>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Top Category</div>
                            <div className="text-xl font-bold text-[#7400B8]">{chartData[0]?.category}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Top Category Share</div>
                            <div className="text-xl font-bold text-[#7400B8]">{chartData[0]?.percentage}%</div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sales" fill="#7400B8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="sales"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderCorrelationAnalysis = () => {
        if (!fileData?.analysis?.correlations) return null;

        const correlations = fileData.analysis.correlations;
        const significantCorrelations = Object.entries(correlations)
            .filter(([_, value]) => Math.abs(value) > 0.3)
            .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Key Correlations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {significantCorrelations.map(([pair, value]) => {
                        const [col1, col2] = pair.split(' vs ');
                        return (
                            <div key={pair} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium text-gray-700">{col1}</div>
                                    <div className={`text-sm font-medium ${
                                        value > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {value.toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{col2}</div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${
                                            value > 0 ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.abs(value * 100)}%` }}
                                    />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    {value > 0 ? 'Positive' : 'Negative'} correlation
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderStatisticalAnalysis = () => {
        if (!fileData?.analysis?.distributions) return null;

        const distributions = fileData.analysis.distributions;
        const numericColumns = Object.entries(distributions)
            .filter(([_, data]) => data.type === 'numeric');

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Statistical Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {numericColumns.map(([column, data]) => (
                        <div key={column} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-gray-700 mb-3">{column}</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Mean</span>
                                    <span className="text-sm font-medium bg-[#7400B8] text-white px-2 py-1 rounded">
                                        {data.mean.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Median</span>
                                    <span className="text-sm font-medium bg-[#9B4DCA] text-white px-2 py-1 rounded">
                                        {data.median.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Mode</span>
                                    <span className="text-sm font-medium bg-[#B75CFF] text-white px-2 py-1 rounded">
                                        {data.mode.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Std Dev</span>
                                    <span className="text-sm font-medium bg-[#D4A5FF] text-white px-2 py-1 rounded">
                                        {data.std.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPatternAnalysis = () => {
        if (!fileData?.analysis?.patterns) return null;

        const patterns = fileData.analysis.patterns;
        const patternColumns = Object.entries(patterns)
            .filter(([_, data]) => data.patterns.length > 0);

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Pattern Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patternColumns.map(([column, data]) => (
                        <div key={column} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-gray-700 mb-3">{column}</h4>
                            <div className="space-y-2">
                                {data.patterns.map((pattern, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded">
                                        <div className="w-2 h-2 rounded-full bg-[#7400B8]"></div>
                                        <span className="text-sm text-gray-600">{pattern}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] p-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] p-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] p-6">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] bg-clip-text text-transparent">
                                Retail Data Insights
                            </h1>
                            <p className="text-gray-600 mt-2">Comprehensive analysis of your retail data</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/dashboard')}
                            className="bg-white text-[#7400B8] px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </motion.button>
                    </div>

                    {fileData && (
                        <div className="space-y-8">
                            {/* File Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {fileData.fileName}
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        Analyzed on {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiShoppingBag className="text-[#7400B8]" />
                                            <div className="text-sm text-gray-500">Total Rows</div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#7400B8]">
                                            {fileData.totalRows.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiBarChart2 className="text-[#7400B8]" />
                                            <div className="text-sm text-gray-500">Total Columns</div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#7400B8]">
                                            {fileData.headers.length}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiPieChart className="text-[#7400B8]" />
                                            <div className="text-sm text-gray-500">Data Types</div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#7400B8]">
                                            {Object.keys(fileData.analysis.basic.columnTypes).length}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <FiCalendar className="text-[#7400B8]" />
                                            <div className="text-sm text-gray-500">Analysis Date</div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#7400B8]">
                                            {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Metrics */}
                            {renderSalesMetrics()}

                            {/* Category Analysis */}
                            {renderCategoryAnalysis()}

                            {/* Correlation Analysis */}
                            {renderCorrelationAnalysis()}

                            {/* Statistical Analysis */}
                            {renderStatisticalAnalysis()}

                            {/* Pattern Analysis */}
                            {renderPatternAnalysis()}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Insights; 