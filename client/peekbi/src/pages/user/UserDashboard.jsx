import { useState, useEffect, useRef } from 'react';
import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiFile, FiBarChart2, FiCpu, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';

// Import components
import Sidebar from '../../components/dashboard/Sidebar';
import FilesList from '../../components/dashboard/FilesList';
import AnalysisStatus from '../../components/dashboard/AnalysisStatus';
import ApiLogs from '../../components/dashboard/ApiLogs';
import DataUpload from '../../components/dashboard/DataUpload';
import Profile from '../../components/dashboard/Profile';
import DataSources from '../../components/dashboard/DataSources';

const UserDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, getAllUserFiles } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [fileError, setFileError] = useState('');
    const [analysisError, setAnalysisError] = useState('');
    const [apiLogs, setApiLogs] = useState([]);
    const logIdRef = useRef(0);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        if (location.state) {
            if (location.state.selectedIndustry) {
                setSelectedIndustry(location.state.selectedIndustry);
            }
            if (location.state.uploadedFiles) {
                setUploadedFiles(location.state.uploadedFiles);
            }
        }
    }, [location]);

    // Check for fileId in URL query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fileId = params.get('fileId');
        if (fileId) {
            const file = userFiles.find(f => f._id === fileId);
            if (file) {
                setSelectedFile(file);
                if (file.analysis) {
                    setAnalysis(file.analysis);
                    // Add log entry for viewing analysis
                    setApiLogs(prevLogs => [
                        ...prevLogs,
                        {
                            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            timestamp: new Date().toISOString(),
                            message: `Viewing analysis for file: ${file.originalName}`,
                            type: 'info'
                        }
                    ]);
                }
            }
        }
    }, [location.search, userFiles]);

    // Fetch user files
    useEffect(() => {
        const fetchFiles = async () => {
            if (!user?._id) return;
            
            setIsLoadingFiles(true);
            setFileError('');
            try {
                const result = await getAllUserFiles(user._id);
                if (result.success && result.data?.files) {
                    const files = result.data.files.map(file => ({
                        ...file,
                        displayName: file.originalName || 'Unnamed File',
                        fileSize: file.sizeInBytes ? `${(file.sizeInBytes / (1024 * 1024)).toFixed(2)} MB` : 'Unknown Size',
                        category: file.fileCategory || 'General',
                        uploadDate: new Date(file.uploadedAt).toLocaleDateString()
                    }));
                    setUserFiles(files);
                    if (files.length > 0) {
                        setSelectedFile(files[0]);
                    }
                } else {
                    setFileError(result.error || "Error fetching files");
                }
            } catch (err) {
                setFileError(err.message || "Error fetching files");
            } finally {
                setIsLoadingFiles(false);
            }
        };

            fetchFiles();
    }, [user?._id, getAllUserFiles]);

    const handleLoadFileAnalysis = async (fileId) => {
        try {
            setSelectedFile(userFiles.find(f => f._id === fileId));
            setIsLoadingAnalysis(true);
            setAnalysis(null);
            setAnalysisError(null);

            // Add initial log entry
            const logId = Date.now().toString();
            setApiLogs(prev => [...prev, {
                id: logId,
                timestamp: new Date().toISOString(),
                message: `Starting analysis for file: ${userFiles.find(f => f._id === fileId)?.originalName}`,
                status: 'info'
            }]);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`https://api.peekbi.com/files/analyse/${user._id}/${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Add success log entry
            setApiLogs(prev => [...prev, {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                message: 'Analysis completed successfully',
                status: 'success'
            }]);

            setAnalysis(response.data.analysis);
        } catch (err) {
            console.error('Error loading analysis:', err);
            setAnalysisError(err.response?.data?.message || 'Failed to load analysis');
            
            // Add error log entry
            setApiLogs(prev => [...prev, {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                message: `Analysis failed: ${err.response?.data?.message || 'Unknown error'}`,
                status: 'error'
            }]);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const DashboardContent = () => {
        // Sort files by upload date and get the 3 most recent
        const recentFiles = [...userFiles]
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .slice(0, 3);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {selectedFile && analysis && (
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setAnalysis(null);
                                    navigate('/user/dashboard');
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-white text-[#7400B8] rounded-lg border border-[#7400B8] hover:bg-[#F9F4FF] transition-colors"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                <span>Back to Dashboard</span>
                            </button>
                        )}
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text">
                            {selectedFile && analysis ? `Analysis: ${selectedFile.originalName}` : 'Dashboard'}
                        </h1>
                    </div>
                </div>
                {selectedFile && isLoadingAnalysis ? (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Analyzing Data</h2>
                                <div className="w-full max-w-md mx-auto">
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#7400B8] bg-[#F9F4FF]">
                                                    Processing
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold inline-block text-[#7400B8]">
                                                    Analyzing your data...
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#F9F4FF]">
                                            <div className="animate-progress shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#7400B8] to-[#9B4DCA]"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    This may take a few moments depending on the file size...
                                </p>
                            </div>

                            {/* API Logs during analysis */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Progress</h3>
                                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {apiLogs.slice(-5).map((log) => (
                                        <div key={log.id} className={`flex items-start space-x-3 mb-3 ${
                                            log.status === 'error' ? 'text-red-600' :
                                            log.status === 'success' ? 'text-green-600' :
                                            'text-gray-600'
                                        }`}>
                                            <div className="flex-shrink-0 mt-1">
                                                {log.status === 'error' ? '❌' :
                                                 log.status === 'success' ? '✅' :
                                                 '⏳'}
                                            </div>
                                            <div>
                                                <p className="text-sm">{log.message}</p>
                                                <p className="text-xs opacity-75">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedFile && analysis ? (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="space-y-6">
                            {/* KPIs Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {analysis.insights.kpis && Object.entries(analysis.insights.kpis).map(([key, value]) => (
                                        <div key={key} className="p-4 bg-[#F9F4FF] rounded-lg">
                                            <p className="text-sm text-gray-600">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                                            <p className="text-xl font-semibold text-[#7400B8]">
                                                ${typeof value === 'number' ? value.toLocaleString() : value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sales by Region - Only show if data exists */}
                            {analysis.insights.totals?.sales_by_region && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Region</h3>
                                    <div className="space-y-3">
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
                                                    data={analysis.insights.totals.sales_by_region.Region.map((region, index) => ({
                                                        name: region,
                                                        sales: analysis.insights.totals.sales_by_region.Sales[index],
                                                        trend: analysis.insights.totals.sales_by_region.Sales[index] * 0.8 // Simulated trend line
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        formatter={(value, name) => [
                                                            `$${value.toLocaleString()}`,
                                                            name === 'sales' ? 'Sales' : 'Trend'
                                                        ]}
                                                        labelStyle={{ color: '#7400B8' }}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: '8px',
                                                            padding: '10px'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar 
                                                        dataKey="sales" 
                                                        fill="#7400B8" 
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={40}
                                                    >
                                                        {analysis.insights.totals.sales_by_region.Region.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                                        ))}
                                                    </Bar>
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="trend" 
                                                        stroke="#9B4DCA" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#9B4DCA', strokeWidth: 2 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sales by Category - Pie Chart */}
                            {analysis.insights.totals?.sales_by_category && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Distribution by Category</h3>
                                    <div className="space-y-3">
                                        <div className="h-[400px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analysis.insights.totals.sales_by_category.Category.map((category, index) => ({
                                                            name: category,
                                                            value: analysis.insights.totals.sales_by_category.Sales[index]
                                                        }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                        outerRadius={150}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {analysis.insights.totals.sales_by_category.Category.map((_, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={`hsl(${index * 45}, 70%, 50%)`}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: '8px',
                                                            padding: '10px'
                                                        }}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* High Performers - Only show if data exists */}
                            {analysis.insights.highPerformers && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Categories</h3>
                                    <div className="space-y-3">
                                        <div className="h-[400px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
                                                    data={analysis.insights.highPerformers.Category.map((category, index) => ({
                                                        name: category,
                                                        sales: analysis.insights.highPerformers.Sales[index],
                                                        percentage: (analysis.insights.highPerformers.Sales[index] / 
                                                            analysis.insights.highPerformers.Sales.reduce((a, b) => a + b, 0) * 100).toFixed(1)
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
                                                    <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                                                    <Tooltip 
                                                        formatter={(value, name) => [
                                                            name === 'sales' ? `$${value.toLocaleString()}` : `${value}%`,
                                                            name === 'sales' ? 'Sales' : 'Percentage'
                                                        ]}
                                                        labelStyle={{ color: '#22c55e' }}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: '8px',
                                                            padding: '10px'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar 
                                                        yAxisId="left"
                                                        dataKey="sales" 
                                                        fill="#22c55e" 
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={40}
                                                    >
                                                        {analysis.insights.highPerformers.Category.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={`rgba(34, 197, 94, ${0.3 + (index * 0.15)})`} />
                                                        ))}
                                                    </Bar>
                                                    <Line 
                                                        yAxisId="right"
                                                        type="monotone" 
                                                        dataKey="percentage" 
                                                        stroke="#15803d" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#15803d', strokeWidth: 2 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Low Performers - Only show if data exists */}
                            {analysis.insights.lowPerformers && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Performing Categories</h3>
                                    <div className="space-y-3">
                                        <div className="h-[400px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
                                                    data={analysis.insights.lowPerformers.Category.map((category, index) => ({
                                                        name: category,
                                                        sales: analysis.insights.lowPerformers.Sales[index],
                                                        percentage: (analysis.insights.lowPerformers.Sales[index] / 
                                                            analysis.insights.lowPerformers.Sales.reduce((a, b) => a + b, 0) * 100).toFixed(1)
                                                    }))}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis yAxisId="left" orientation="left" stroke="#ef4444" />
                                                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                                                    <Tooltip 
                                                        formatter={(value, name) => [
                                                            name === 'sales' ? `$${value.toLocaleString()}` : `${value}%`,
                                                            name === 'sales' ? 'Sales' : 'Percentage'
                                                        ]}
                                                        labelStyle={{ color: '#ef4444' }}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: '8px',
                                                            padding: '10px'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar 
                                                        yAxisId="left"
                                                        dataKey="sales" 
                                                        fill="#ef4444" 
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={40}
                                                    >
                                                        {analysis.insights.lowPerformers.Category.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={`rgba(239, 68, 68, ${0.3 + (index * 0.15)})`} />
                                                        ))}
                                                    </Bar>
                                                    <Line 
                                                        yAxisId="right"
                                                        type="monotone" 
                                                        dataKey="percentage" 
                                                        stroke="#b91c1c" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#b91c1c', strokeWidth: 2 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trends - Only show if data exists */}
                            {analysis.insights.trends && analysis.insights.trends.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Trends</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={analysis.insights.trends}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip 
                                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Average']}
                                                    labelStyle={{ color: '#7400B8' }}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #f0f0f0',
                                                        borderRadius: '8px',
                                                        padding: '10px'
                                                    }}
                                                />
                                                <Legend />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="avg" 
                                                    stroke="#7400B8" 
                                                    fill="url(#trendGradient)"
                                                    strokeWidth={2}
                                                />
                                                <defs>
                                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Summary Statistics */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary Statistics</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {analysis.summary && Object.entries(analysis.summary).map(([metric, stats]) => (
                                        <div key={metric} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                            <h4 className="font-medium text-gray-800 mb-4">{metric}</h4>
                                            <div className="h-[200px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ComposedChart
                                                        data={[
                                                            { name: 'Min', value: stats.min },
                                                            { name: 'Max', value: stats.max },
                                                            { name: 'Mean', value: stats.mean },
                                                            { name: 'Median', value: stats.median }
                                                        ]}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip 
                                                            formatter={(value) => [value.toLocaleString(), 'Value']}
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #f0f0f0',
                                                                borderRadius: '8px',
                                                                padding: '10px'
                                                            }}
                                                        />
                                                        <Bar 
                                                            dataKey="value" 
                                                            fill="#7400B8" 
                                                            radius={[4, 4, 0, 0]}
                                                            barSize={40}
                                                        >
                                                            {['Min', 'Max', 'Mean', 'Median'].map((_, index) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} 
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="p-3 bg-[#F9F4FF] rounded-lg">
                                                    <p className="text-sm text-gray-600">Standard Deviation</p>
                                                    <p className="font-semibold text-[#7400B8]">{stats.stddev.toLocaleString()}</p>
                                                </div>
                                                <div className="p-3 bg-[#F9F4FF] rounded-lg">
                                                    <p className="text-sm text-gray-600">Range</p>
                                                    <p className="font-semibold text-[#7400B8]">{(stats.max - stats.min).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Insights Section */}
                            {analysis.insights.hypothesis && analysis.insights.hypothesis.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysis.insights.hypothesis.map((insight, index) => (
                                            <div key={index} className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                                                <p className="text-gray-800">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text">Recent Files</h2>
                                <button
                                    onClick={() => navigate('/user/data-sources')}
                                    className="text-[#7400B8] hover:text-[#9B4DCA] font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            {recentFiles.length > 0 ? (
                                <div className="space-y-4">
                                    {recentFiles.map((file) => (
                                        <div
                                            key={file._id}
                                            className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#7400B8]/10 flex items-center justify-center">
                                                        <FiFile className="w-5 h-5 text-[#7400B8]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {file.originalName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {file.fileCategory} • {formatFileSize(file.sizeInBytes)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {file.analysis ? (
                                                    <button
                                                        onClick={() => navigate(`/user/dashboard?fileId=${file._id}`)}
                                                        className="px-3 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-1"
                                                    >
                                                        <FiBarChart2 className="w-3 h-3" />
                                                        <span>View Analysis</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleLoadFileAnalysis(file._id)}
                                                        className="px-3 py-1 text-xs bg-[#7400B8] text-white rounded-full hover:bg-[#9B4DCA] transition-colors flex items-center space-x-1"
                                                    >
                                                        <FiCpu className="w-3 h-3" />
                                                        <span>Analyze</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No files uploaded yet</p>
                                    <button
                                        onClick={() => navigate('/user/data-upload')}
                                        className="mt-4 text-[#7400B8] hover:text-[#9B4DCA] font-medium"
                                    >
                                        Upload your first file
                                    </button>
                                </div>
                            )}
                        </div>
                        <AnalysisStatus
                            selectedFile={selectedFile}
                            isLoadingAnalysis={isLoadingAnalysis}
                            analysisError={analysisError}
                            analysis={analysis}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF]">
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="px-6 py-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Routes>
                                <Route index element={
                                    <>
                                        <DashboardContent />
                                        <div className="mt-6 -mx-6">
                                            <ApiLogs logs={apiLogs} />
                                        </div>
                                    </>
                                } />
                                <Route path="dashboard" element={
                                    <>
                                        <DashboardContent />
                                        <div className="mt-6 -mx-6">
                                            <ApiLogs logs={apiLogs} />
                                        </div>
                                    </>
                                } />
                                <Route path="data-sources" element={<DataSources />} />
                                <Route path="data-upload" element={<DataUpload />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Add this to your existing styles
const styles = `
    @keyframes progress {
        0% { width: 0%; }
        100% { width: 100%; }
    }
    .animate-progress {
        animation: progress 2s ease-in-out infinite;
    }
`;

export default UserDashboard;