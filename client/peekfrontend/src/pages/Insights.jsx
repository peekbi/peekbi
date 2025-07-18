import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiPieChart, FiBarChart2, FiActivity, FiCalendar, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import { analyzeData } from '../utils/dataAnalytics';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
    AreaChart, Area, ComposedChart
} from 'recharts';

const COLORS = ['#7400B8', '#9B4DCA', '#B75CFF', '#D4A5FF', '#E8C5FF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const Insights = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const generateInsights = () => {
            try {
                const { headers, data, totalRows } = location.state.fileData;
                
                // Validate data size
                const MAX_ROWS = 10000;
                if (totalRows > MAX_ROWS) {
                    throw new Error(`File contains too many rows (${totalRows}). Maximum allowed is ${MAX_ROWS} rows.`);
                }

                // Process all data at once since we're already limiting to 10,000 rows
                const analysis = analyzeData(data, headers);
                setInsights(analysis);
            } catch (err) {
                console.error('Error generating insights:', err);
                setError(err.message || 'Failed to generate insights. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (location.state?.fileData) {
            generateInsights();
        } else {
            setError('No file data available');
            setLoading(false);
        }
    }, [location.state]);

    const renderSalesTrends = () => {
        if (!insights?.timeSeries) return null;

        const timeSeriesData = Object.entries(insights.timeSeries)[0]?.[1]?.data;
        if (!timeSeriesData) return null;

        const totalValue = timeSeriesData.reduce((sum, item) => sum + item.value, 0);
        const avgValue = totalValue / timeSeriesData.length;
        const growthRate = ((timeSeriesData[timeSeriesData.length - 1].value - timeSeriesData[0].value) / timeSeriesData[0].value * 100).toFixed(1);

        return (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800">Sales Performance</h3>
                        <p className="text-gray-500 mt-1">Historical trends and key metrics</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Sales</div>
                            <div className="text-2xl font-bold text-[#7400B8]">${totalValue.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Avg Daily Sales</div>
                            <div className="text-2xl font-bold text-[#7400B8]">${avgValue.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Growth Rate</div>
                            <div className={`text-2xl font-bold ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {growthRate}%
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#7400B8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="time" 
                                tick={{ fill: '#666' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis 
                                yAxisId="left"
                                tick={{ fill: '#666' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis 
                                yAxisId="right" 
                                orientation="right"
                                tick={{ fill: '#666' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend />
                            <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="value" 
                                stroke="#7400B8" 
                                fillOpacity={1} 
                                fill="url(#colorSales)" 
                            />
                            <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="value" 
                                stroke="#FF6B6B" 
                                dot={false}
                                strokeWidth={2}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderCategoryAnalysis = () => {
        if (!insights?.distributions) return null;

        const categoryData = Object.entries(insights.distributions)
            .find(([key]) => key.toLowerCase().includes('category') || key.toLowerCase().includes('product'));

        if (!categoryData) return null;

        const [column, distribution] = categoryData;
        const chartData = distribution.distribution
            .map(item => ({
                category: item.value,
                sales: item.count,
                percentage: (item.count / distribution.total * 100).toFixed(1)
            }))
            .sort((a, b) => b.sales - a.sales);

        return (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800">Category Performance</h3>
                        <p className="text-gray-500 mt-1">Distribution and market share analysis</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Top Category</div>
                            <div className="text-2xl font-bold text-[#7400B8]">{chartData[0]?.category}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Market Share</div>
                            <div className="text-2xl font-bold text-[#7400B8]">{chartData[0]?.percentage}%</div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="category" 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="sales" 
                                    fill="#7400B8"
                                    radius={[4, 4, 0, 0]}
                                />
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
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="white"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderCorrelationAnalysis = () => {
        if (!insights?.correlations) return null;

        const significantCorrelations = Object.entries(insights.correlations)
            .filter(([_, value]) => Math.abs(value) > 0.3)
            .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

        return (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Key Correlations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {significantCorrelations.map(([pair, value]) => {
                        const [col1, col2] = pair.split('-');
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
        if (!insights?.distributions) return null;

        // Helper functions for calculations
        function calculateMedian(values) {
            const sorted = [...values].sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0
                ? (sorted[middle - 1] + sorted[middle]) / 2
                : sorted[middle];
        }

        function calculateMode(values) {
            const counts = values.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            const mode = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
            return Number(mode); // Convert to number
        }

        function calculateStdDev(values) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const squareDiffs = values.map(value => {
                const diff = value - mean;
                return diff * diff;
            });
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            return Math.sqrt(avgSquareDiff);
        }

        // Get all numeric columns and their statistics
        const numericStats = Object.entries(insights.distributions)
            .filter(([column, data]) => {
                const isNumeric = data.type === 'numeric' || 
                                (data.distribution && data.distribution.some(item => !isNaN(Number(item.value))));
                return isNumeric;
            })
            .map(([column, data]) => {
                const values = data.distribution.map(item => Number(item.value));
                const stats = {
                    mean: data.mean || values.reduce((a, b) => a + b, 0) / values.length,
                    median: data.median || calculateMedian(values),
                    mode: data.mode || calculateMode(values),
                    std: data.std || calculateStdDev(values),
                    min: data.min || Math.min(...values),
                    max: data.max || Math.max(...values),
                    total: data.total || values.reduce((a, b) => a + b, 0)
                };
                return { column, stats };
            });

        if (numericStats.length === 0) {
            return (
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">Statistical Analysis</h3>
                    <div className="text-gray-600 text-center py-4">
                        No numeric columns found for statistical analysis
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Statistical Analysis</h3>
                    <div className="flex items-center space-x-2">
                        <FiActivity className="text-[#7400B8] w-5 h-5" />
                        <span className="text-sm text-gray-500">Detailed Metrics</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {numericStats.map(({ column, stats }) => (
                        <div key={column} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-800">{column}</h4>
                                <div className="px-3 py-1 bg-[#7400B8] bg-opacity-10 rounded-full">
                                    <span className="text-sm font-medium text-[#7400B8]">Numeric</span>
                                </div>
                            </div>
                            
                            {/* Summary Card */}
                            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Total Value</span>
                                    <span className="text-lg font-bold text-[#7400B8]">
                                        ${Number(stats.total).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA]"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-xs text-gray-500 mb-1">Mean</div>
                                    <div className="text-lg font-semibold text-[#9B4DCA]">
                                        ${Number(stats.mean).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-xs text-gray-500 mb-1">Median</div>
                                    <div className="text-lg font-semibold text-[#B75CFF]">
                                        ${Number(stats.median).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-xs text-gray-500 mb-1">Mode</div>
                                    <div className="text-lg font-semibold text-[#D4A5FF]">
                                        ${Number(stats.mode).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-xs text-gray-500 mb-1">Std Dev</div>
                                    <div className="text-lg font-semibold text-[#E8C5FF]">
                                        ${Number(stats.std).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Range Card */}
                            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-2">Value Range</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-[#FF6B6B]">
                                        Min: ${Number(stats.min).toFixed(2)}
                                    </div>
                                    <div className="text-sm font-medium text-[#FF6B6B]">
                                        Max: ${Number(stats.max).toFixed(2)}
                                    </div>
                                </div>
                                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]"
                                        style={{ width: '100%' }}
                                    />
                                </div>
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

                    {insights?.warning && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 mb-6">
                            <p className="flex items-center">
                                <span className="mr-2">⚠️</span>
                                {insights.warning}
                            </p>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* File Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {location.state.fileData.fileName}
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
                                        {location.state.fileData.totalRows.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FiBarChart2 className="text-[#7400B8]" />
                                        <div className="text-sm text-gray-500">Total Columns</div>
                                    </div>
                                    <div className="text-2xl font-semibold text-[#7400B8]">
                                        {location.state.fileData.headers.length}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FiPieChart className="text-[#7400B8]" />
                                        <div className="text-sm text-gray-500">Data Types</div>
                                    </div>
                                    <div className="text-2xl font-semibold text-[#7400B8]">
                                        {Object.keys(insights.basic.columnTypes).length}
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

                        {/* Sales Trends */}
                        {renderSalesTrends()}

                        {/* Category Analysis */}
                        {renderCategoryAnalysis()}

                        {/* Correlation Analysis */}
                        {renderCorrelationAnalysis()}

                        {/* Statistical Analysis */}
                        {renderStatisticalAnalysis()}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Insights; 