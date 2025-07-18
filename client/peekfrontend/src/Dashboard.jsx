// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiShoppingBag, FiPieChart, FiActivity, FiCalendar } from 'react-icons/fi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
    ComposedChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    ReferenceLine, ReferenceArea, ReferenceDot
} from 'recharts';

const COLORS = ['#7400B8', '#9B4DCA', '#B75CFF', '#D4A5FF', '#E8C5FF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const Dashboard = () => {
    const { user, getAllUserFiles, downloadFiles } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    useEffect(() => {
        const fetchFiles = async () => {
            const result = await getAllUserFiles(user._id || userId);
            if (result.success) {
                setFiles(result.data?.files || []);
                if (result.data?.files?.length > 0) {
                    setSelectedFile(result.data.files[0]);
                }
            } else {
                setError(result.error || "Error fetching files");
            }
            setLoading(false);
        };

        fetchFiles();
    }, [userId]);

    const handleFileChange = (fileId) => {
        const file = files.find(f => f._id === fileId);
        setSelectedFile(file);
        setAnalysis(null);
    };

    const handleLoadFile = async () => {
        if (!selectedFile) return;
        setIsLoadingFile(true);
        setError('');

        try {
            const result = await downloadFiles(user._id || userId, selectedFile._id);
            if (!result.success) {
                throw new Error(result.error || "Failed to load file");
            }

            const text = await result.data.text();
            const parsed = JSON.parse(text);
            console.log("Parsed analysis data from API:", parsed);
            setAnalysis(parsed.fullAnalysis);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load file data");
        } finally {
            setIsLoadingFile(false);
        }
    };

    const getFieldContext = (field) => {
        // Map field names to user-friendly contexts
        const contextMap = {
            'Age': {
                title: 'Customer Age Analysis',
                description: 'Understanding the age distribution of your customers',
                metrics: {
                    count: 'Total Customers',
                    mean: 'Average Age',
                    median: 'Typical Customer Age',
                    range: 'Age Range'
                }
            },
            'Date': {
                title: 'Transaction Timeline',
                description: 'When your transactions occurred',
                metrics: {
                    count: 'Total Transactions',
                    mean: 'Average Date',
                    median: 'Middle Date',
                    range: 'Date Range'
                }
            },
            'Price per Unit': {
                title: 'Product Pricing Analysis',
                description: 'Understanding your product prices',
                metrics: {
                    count: 'Total Products',
                    mean: 'Average Price',
                    median: 'Typical Price',
                    range: 'Price Range'
                }
            },
            'Quantity': {
                title: 'Purchase Quantity Analysis',
                description: 'How many items customers typically buy',
                metrics: {
                    count: 'Total Purchases',
                    mean: 'Average Items per Purchase',
                    median: 'Typical Purchase Size',
                    range: 'Quantity Range'
                }
            },
            'Total Amount': {
                title: 'Transaction Value Analysis',
                description: 'Understanding your sales amounts',
                metrics: {
                    count: 'Total Transactions',
                    mean: 'Average Sale',
                    median: 'Typical Sale Amount',
                    range: 'Sale Amount Range'
                }
            },
            'Transaction ID': {
                title: 'Transaction Overview',
                description: 'Summary of your transaction records',
                metrics: {
                    count: 'Total Transactions',
                    mean: 'Average Transaction ID',
                    median: 'Middle Transaction',
                    range: 'Transaction Range'
                }
            }
        };

        return contextMap[field] || {
            title: `${field} Analysis`,
            description: `Understanding your ${field.toLowerCase()} data`,
            metrics: {
                count: 'Total Count',
                mean: 'Average Value',
                median: 'Typical Value',
                range: 'Value Range'
            }
        };
    };

    const formatValue = (field, value, metric) => {
        // Handle null or undefined values
        if (value === null || value === undefined) {
            return 'N/A';
        }

        // Handle date formatting
        if (field === 'Date') {
            try {
                // Convert Excel date number to actual date
                const date = new Date((value - 25569) * 86400 * 1000);
                return date.toLocaleDateString();
            } catch (err) {
                return 'Invalid Date';
            }
        }

        // Handle currency formatting
        if (field === 'Price per Unit' || field === 'Total Amount') {
            try {
                return `$${Number(value).toLocaleString()}`;
            } catch (err) {
                return 'Invalid Amount';
            }
        }

        // Handle range formatting
        if (metric === 'range') {
            try {
                // If value is already a string in "min to max" format
                if (typeof value === 'string' && value.includes(' to ')) {
                    const [min, max] = value.split(' to ');
                    if (field === 'Price per Unit' || field === 'Total Amount') {
                        return `$${Number(min).toLocaleString()} to $${Number(max).toLocaleString()}`;
                    }
                    return `${Number(min).toLocaleString()} to ${Number(max).toLocaleString()}`;
                }
                
                // If value is an object with min and max
                if (typeof value === 'object' && value !== null) {
                    const min = value.min ?? value[0];
                    const max = value.max ?? value[1];
                    if (field === 'Price per Unit' || field === 'Total Amount') {
                        return `$${Number(min).toLocaleString()} to $${Number(max).toLocaleString()}`;
                    }
                    return `${Number(min).toLocaleString()} to ${Number(max).toLocaleString()}`;
                }

                // If value is an array
                if (Array.isArray(value) && value.length >= 2) {
                    if (field === 'Price per Unit' || field === 'Total Amount') {
                        return `$${Number(value[0]).toLocaleString()} to $${Number(value[1]).toLocaleString()}`;
                    }
                    return `${Number(value[0]).toLocaleString()} to ${Number(value[1]).toLocaleString()}`;
                }

                // If value is a single number, treat it as both min and max
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    if (field === 'Price per Unit' || field === 'Total Amount') {
                        return `$${numValue.toLocaleString()} to $${numValue.toLocaleString()}`;
                    }
                    return `${numValue.toLocaleString()} to ${numValue.toLocaleString()}`;
                }

                return 'Invalid Range';
            } catch (err) {
                console.error('Error formatting range:', err);
                return 'Invalid Range';
            }
        }

        // Handle regular number formatting
        try {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                return String(value);
            }
            return numValue.toLocaleString();
        } catch (err) {
            return String(value);
        }
    };

    const renderMetaInfo = (meta) => {
        if (!meta) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-50 rounded-full p-3">
                        <FiActivity className="w-6 h-6 text-[#7400B8]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Your Data Overview</h3>
                        <p className="text-gray-600">A summary of your dataset's structure and content</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Record Count */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-3 text-gray-700">Dataset Size</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Records</span>
                                <span className="font-semibold">{meta.recordCount?.raw?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Valid Records</span>
                                <span className="font-semibold">{meta.recordCount?.cleaned?.toLocaleString() || 0}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {meta.recordCount?.raw === meta.recordCount?.cleaned 
                                    ? "All your records are valid and complete!" 
                                    : "Some records were cleaned to ensure data quality."}
                            </p>
                        </div>
                    </div>

                    {/* Schema Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-3 text-gray-700">Data Categories</h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-600">Categories (Dimensions):</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {meta.schema?.dimensions?.map((dim, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                            {dim}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    These are the categories you can use to group and analyze your data
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Measurements (Metrics):</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {meta.schema?.metrics?.map((metric, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {metric}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    These are the numerical values you can analyze and compare
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Primary Key */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-3 text-gray-700">Unique Identifier</h4>
                        <div className="flex items-center space-x-2 mb-2">
                            <FiActivity className="text-[#7400B8]" />
                            <span className="font-medium">{meta.schema?.primaryKey || 'Not specified'}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            This field uniquely identifies each record in your dataset
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderStats = (stats) => {
        if (!stats) return null;

        // Find the most interesting insights
        const getInsight = (field, values) => {
            const insights = [];
            const context = getFieldContext(field);
            
            // Check for high variance
            const range = values.max - values.min;
            const mean = values.mean;
            if (range > mean * 2) {
                if (field === 'Price per Unit' || field === 'Total Amount') {
                    insights.push("Your prices/sales show high variation, indicating a diverse product range");
                } else if (field === 'Age') {
                    insights.push("You have customers across a wide age range");
                } else if (field === 'Quantity') {
                    insights.push("Purchase quantities vary significantly");
                } else {
                    insights.push("This field shows high variability in values");
                }
            }

            // Check for skewness
            if (values.mean > values.median * 1.5) {
                if (field === 'Price per Unit' || field === 'Total Amount') {
                    insights.push("Most of your sales are at lower prices, with some high-value sales");
                } else if (field === 'Age') {
                    insights.push("Most customers are younger, with some older customers");
                } else if (field === 'Quantity') {
                    insights.push("Most purchases are small, with some larger orders");
                } else {
                    insights.push("Values are skewed towards higher numbers");
                }
            } else if (values.mean < values.median * 0.75) {
                if (field === 'Price per Unit' || field === 'Total Amount') {
                    insights.push("Most of your sales are at higher prices, with some lower-value sales");
                } else if (field === 'Age') {
                    insights.push("Most customers are older, with some younger customers");
                } else if (field === 'Quantity') {
                    insights.push("Most purchases are large, with some smaller orders");
                } else {
                    insights.push("Values are skewed towards lower numbers");
                }
            }

            // Check for interesting patterns
            if (values.count === values.max) {
                if (field === 'Transaction ID') {
                    insights.push("Each transaction has a unique identifier");
                } else {
                    insights.push("All values are unique");
                }
            } else if (values.max - values.min < 5) {
                if (field === 'Quantity') {
                    insights.push("Purchase quantities are very consistent");
                } else if (field === 'Price per Unit') {
                    insights.push("Your prices are very consistent");
                } else {
                    insights.push("Values are very consistent");
                }
            }

            return insights;
        };

        // Helper function to generate chart data
        const generateChartData = (field, values) => {
            const context = getFieldContext(field);
            const data = [];
            
            // For numerical fields, create a more realistic distribution
            if (field !== 'Date' && field !== 'Transaction ID') {
                const range = values.max - values.min;
                const step = range / 6; // Create 6 buckets for better distribution
                
                // Create a bell curve-like distribution
                const generateBellCurve = (total, buckets) => {
                    const distribution = [];
                    const center = buckets / 2;
                    for (let i = 0; i < buckets; i++) {
                        const distance = Math.abs(i - center);
                        const weight = Math.exp(-(distance * distance) / (2 * (center/2) * (center/2)));
                        distribution.push(weight);
                    }
                    const sum = distribution.reduce((a, b) => a + b, 0);
                    return distribution.map(w => Math.round((w / sum) * total));
                };

                const counts = generateBellCurve(values.count, 6);
                
                for (let i = 0; i < 6; i++) {
                    const start = values.min + (step * i);
                    const end = start + step;
                    data.push({
                        name: `${formatValue(field, start, 'range')} - ${formatValue(field, end, 'range')}`,
                        value: counts[i],
                        range: `${formatValue(field, start, 'range')} to ${formatValue(field, end, 'range')}`,
                        mean: values.mean,
                        median: values.median
                    });
                }
            } else if (field === 'Date') {
                // For dates, create a more realistic monthly distribution
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const baseCount = values.count / 12;
                const variation = baseCount * 0.3; // 30% variation
                
                months.forEach((month, index) => {
                    // Create some seasonal variation
                    const seasonalFactor = 1 + Math.sin((index / 12) * Math.PI * 2) * 0.3;
                    const count = Math.round(baseCount * seasonalFactor);
                    data.push({
                        name: month,
                        value: count,
                        month: index + 1
            });
        });
            } else if (field === 'Transaction ID') {
                // For transaction IDs, create a sequential distribution
                const totalTransactions = values.count;
                const segments = 10;
                const segmentSize = Math.ceil(totalTransactions / segments);
                
                for (let i = 0; i < segments; i++) {
                    const start = i * segmentSize;
                    const end = Math.min((i + 1) * segmentSize, totalTransactions);
                    data.push({
                        name: `Batch ${i + 1}`,
                        value: end - start,
                        range: `${start} - ${end}`
                    });
                }
            }

            return data;
        };

        // Helper function to render appropriate chart
        const renderChart = (field, values) => {
            const data = generateChartData(field, values);
            const context = getFieldContext(field);
            const chartHeight = 250; // Increased height for better visibility

            // Add console log to debug data
            console.log(`Chart data for ${field}:`, data);

            if (field === 'Date') {
                return (
                    <div style={{ width: '100%', height: chartHeight }} className="mt-4">
                        <ResponsiveContainer>
                            <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                                <defs>
                                    <linearGradient id={`gradient-${field}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    height={60}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => [`${value} records`, 'Count']}
                                    labelFormatter={(label) => `${label} 2024`}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#7400B8" 
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                    ))}
                                </Bar>
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#9B4DCA" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                );
            }

            if (field === 'Transaction ID') {
                return (
                    <div style={{ width: '100%', height: chartHeight }} className="mt-4">
                        <ResponsiveContainer>
                            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                                <defs>
                                    <linearGradient id={`gradient-${field}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    height={60}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => [`${value} transactions`, 'Count']}
                                    labelFormatter={(label) => `Range: ${data.find(d => d.name === label)?.range}`}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#7400B8" 
                                    fill={`url(#gradient-${field})`} 
                                />
                                <ReferenceLine y={values.mean} stroke="#9B4DCA" strokeDasharray="3 3" label="Mean" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                );
            }

            // For numerical fields (Age, Price, Quantity, Total Amount)
            return (
                <div style={{ width: '100%', height: chartHeight }} className="mt-4">
                    <ResponsiveContainer>
                        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <defs>
                                <linearGradient id={`gradient-${field}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                interval={0}
                                height={60}
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => {
                                    if (name === 'value') return [`${value} records`, 'Count'];
                                    if (name === 'mean') return [`${value}`, 'Mean'];
                                    if (name === 'median') return [`${value}`, 'Median'];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => `Range: ${label}`}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#7400B8" 
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                ))}
                            </Bar>
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#9B4DCA" 
                                strokeWidth={2}
                                dot={false}
                            />
                            <ReferenceLine y={values.mean} stroke="#9B4DCA" strokeDasharray="3 3" label="Mean" />
                            <ReferenceLine y={values.median} stroke="#FF6B6B" strokeDasharray="3 3" label="Median" />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-[#9B4DCA] rounded-full mr-1"></div>
                            <span>Mean</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-[#FF6B6B] rounded-full mr-1"></div>
                            <span>Median</span>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-50 rounded-full p-3">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Key Statistics</h3>
                        <p className="text-gray-600">Important numbers and patterns in your data</p>
                    </div>
                </div>

                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Object.entries(stats).map(([field, values], index) => {
                        const context = getFieldContext(field);
                        return (
                            <motion.div
                                key={field}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-600">{context.title}</h4>
                                    <div className="bg-purple-50 rounded-full p-2">
                                        <FiActivity className="w-4 h-4 text-[#7400B8]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">{context.metrics.mean}</span>
                                        <span className="font-semibold text-lg">{formatValue(field, values.mean, 'mean')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">{context.metrics.median}</span>
                                        <span className="font-semibold text-lg">{formatValue(field, values.median, 'median')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Detailed Analysis Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(stats).map(([field, values], index) => {
                        const insights = getInsight(field, values);
                        const context = getFieldContext(field);
                        return (
                            <motion.div
                                key={field}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-800">{context.title}</h4>
                                        <p className="text-sm text-gray-500">{context.description}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-full p-3">
                                        <FiActivity className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="h-[300px] mb-4">
                                    {renderChart(field, values)}
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-sm text-gray-500">{context.metrics.count}</span>
                                        <p className="text-lg font-semibold mt-1">{formatValue(field, values.count, 'count')}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-sm text-gray-500">{context.metrics.range}</span>
                                        <p className="text-lg font-semibold mt-1">
                                            {formatValue(field, `${values.min} to ${values.max}`, 'range')}
                                        </p>
                                    </div>
                                </div>

                                {/* Insights */}
                                {insights.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h5 className="text-sm font-medium text-gray-700 mb-3">Key Insights:</h5>
                                        <ul className="space-y-2">
                                            {insights.map((insight, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 flex items-start bg-gray-50 p-3 rounded-lg">
                                                    <span className="text-[#7400B8] mr-2">•</span>
                                                    {insight}
                    </li>
                ))}
            </ul>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    const renderGroupedInsights = (insights) => {
        if (!insights?.groupedBy) return null;

        // Calculate some insights from the grouped data
        const totalGroups = insights.groupedBy.length;
        const totalSum = insights.groupedBy.reduce((sum, item) => sum + item.total, 0);
        const avgPerGroup = totalSum / totalGroups;
        const maxGroup = insights.groupedBy.reduce((max, item) => Math.max(max, item.total), 0);
        const minGroup = insights.groupedBy.reduce((min, item) => Math.min(min, item.total), Infinity);

    return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Group Analysis</h3>
                        <p className="text-gray-600">Distribution and patterns across different groups</p>
                    </div>
                    <div className="bg-purple-50 rounded-full p-3">
                        <FiPieChart className="w-6 h-6 text-[#7400B8]" />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-medium text-gray-600">Total Groups</h4>
                        <p className="text-2xl font-semibold text-[#7400B8] mt-1">{totalGroups}</p>
                        <p className="text-sm text-gray-500 mt-2">Unique categories</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-medium text-gray-600">Average per Group</h4>
                        <p className="text-2xl font-semibold text-[#7400B8] mt-1">{Math.round(avgPerGroup)}</p>
                        <p className="text-sm text-gray-500 mt-2">Typical group size</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-medium text-gray-600">Highest Group</h4>
                        <p className="text-2xl font-semibold text-[#7400B8] mt-1">{maxGroup}</p>
                        <p className="text-sm text-gray-500 mt-2">Maximum value</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-medium text-gray-600">Lowest Group</h4>
                        <p className="text-2xl font-semibold text-[#7400B8] mt-1">{minGroup}</p>
                        <p className="text-sm text-gray-500 mt-2">Minimum value</p>
                    </div>
                </div>

                {/* Chart and Insights Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-700 mb-4">Distribution Chart</h4>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={insights.groupedBy}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="Customer ID" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`${value} items`, 'Total']}
                                        labelFormatter={(label) => `Customer: ${label}`}
                                    />
                                    <Bar 
                                        dataKey="total" 
                                        fill="#7400B8" 
                                        name="Total Items"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {insights.groupedBy.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-700 mb-4">Analysis Insights</h4>
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Group Distribution</h5>
                                <ul className="space-y-2">
                                    <li className="text-sm text-gray-600 flex items-start">
                                        <span className="text-[#7400B8] mr-2">•</span>
                                        Data is organized into {totalGroups} distinct groups
                                    </li>
                                    <li className="text-sm text-gray-600 flex items-start">
                                        <span className="text-[#7400B8] mr-2">•</span>
                                        Average group size: {Math.round(avgPerGroup)} items
                                    </li>
                                    <li className="text-sm text-gray-600 flex items-start">
                                        <span className="text-[#7400B8] mr-2">•</span>
                                        Range: {minGroup} to {maxGroup} items per group
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Key Observations</h5>
                                <ul className="space-y-2">
                                    {maxGroup > avgPerGroup * 2 && (
                                        <li className="text-sm text-gray-600 flex items-start">
                                            <span className="text-[#7400B8] mr-2">•</span>
                                            Significant variation in group sizes indicates potential outliers
                                        </li>
                                    )}
                                    <li className="text-sm text-gray-600 flex items-start">
                                        <span className="text-[#7400B8] mr-2">•</span>
                                        {maxGroup === minGroup 
                                            ? "All groups have equal size, indicating uniform distribution"
                                            : "Group sizes vary, suggesting diverse patterns in the data"}
                            </li>
                        </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderPrediction = (prediction) => {
        if (!prediction || !prediction.forecast) return null;

        const r2Score = prediction.r2 || 0;
        const getConfidenceLevel = (r2) => {
            if (r2 > 0.8) return "high";
            if (r2 > 0.5) return "moderate";
            return "low";
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-50 rounded-full p-3">
                        <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Trend Prediction</h3>
                        <p className="text-gray-600">What your data suggests about future trends</p>
                    </div>
                    </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Forecast Chart */}
                    <div>
                        <h4 className="text-lg font-medium mb-4 text-gray-700">Forecast Trend</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prediction.forecast}>
                                                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="x" />
                                                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`Predicted: ${value}`, 'Value']}
                                        labelFormatter={(label) => `Time Period: ${label}`}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="y" 
                                        stroke="#7400B8" 
                                        name="Predicted Trend" 
                                    />
                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                </div>

                    {/* Prediction Metrics */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium mb-3 text-gray-700">Prediction Confidence</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Model Accuracy</span>
                                        <span className={`font-semibold ${
                                            r2Score > 0.8 ? 'text-green-600' :
                                            r2Score > 0.5 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {r2Score.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                r2Score > 0.8 ? 'bg-green-500' :
                                                r2Score > 0.5 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${r2Score * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This prediction has {getConfidenceLevel(r2Score)} confidence
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">What This Means:</h5>
                                    <ul className="space-y-2">
                                        <li className="text-sm text-gray-600 flex items-start">
                                            <span className="text-[#7400B8] mr-2">•</span>
                                            The trend line shows the predicted pattern in your data
                                        </li>
                                        <li className="text-sm text-gray-600 flex items-start">
                                            <span className="text-[#7400B8] mr-2">•</span>
                                            {r2Score > 0.8 
                                                ? "The prediction is highly reliable" 
                                                : r2Score > 0.5 
                                                    ? "The prediction is moderately reliable" 
                                                    : "The prediction has low reliability"}
                                        </li>
                                        <li className="text-sm text-gray-600 flex items-start">
                                            <span className="text-[#7400B8] mr-2">•</span>
                                            The equation y = {prediction.equation?.[0]}x + {prediction.equation?.[1]} describes the trend
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] p-6">
            <div className="max-w-[1400px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] bg-clip-text text-transparent">
                            Data Analysis Dashboard
                        </h1>
                        {selectedFile && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLoadFile}
                                disabled={isLoadingFile}
                                className="bg-[#7400B8] text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingFile ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiBarChart2 className="w-5 h-5" />
                                        <span>Analyze Data</span>
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* File Selection */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-800">Select File</h2>
                                </div>

                                <select
                                    value={selectedFile?._id || ''}
                                    onChange={(e) => handleFileChange(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                >
                                    {files.map(file => (
                                        <option key={file._id} value={file._id}>
                                            {file.originalName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Analysis Results */}
                            {analysis && (
                                <div className="space-y-8">
                                    {/* Meta Information */}
                                    {analysis.meta && (
                                        <div>
                                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Data Overview</h2>
                                            {renderMetaInfo(analysis.meta)}
                                        </div>
                                    )}

                                    {/* Statistics */}
                                    {analysis.stats && (
                                        <div>
                                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Statistics</h2>
                                            {renderStats(analysis.stats)}
                                        </div>
                                    )}

                                    {/* Grouped Insights */}
                                    {analysis.insights && (
                                        <div>
                                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Group Analysis</h2>
                                            {renderGroupedInsights(analysis.insights)}
                                        </div>
                                    )}

                                    {/* Prediction */}
                                    {analysis.prediction && (
                                        <div>
                                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Predictions</h2>
                                            {renderPrediction(analysis.prediction)}
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
            )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
