import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    FiHome, FiSettings, FiUser, FiBarChart2, FiPieChart,
    FiTrendingUp, FiCalendar, FiLogOut, FiMenu, FiX,
    FiPlus, FiSearch, FiGrid, FiFileText, FiDatabase,
    FiShare2, FiHelpCircle, FiCpu, FiLayers, FiDollarSign,
    FiUsers, FiShoppingCart, FiDownload, FiFilter, FiRefreshCw,
    FiBook, FiPackage, FiActivity
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user,getAllUserFiles,downloadFiles, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [fileError, setFileError] = useState('');
    const [analysisError, setAnalysisError] = useState('');
    const [apiLogs, setApiLogs] = useState([]);
    const logIdRef = useRef(0);

    useEffect(() => {
        // Get data from location state
        if (location.state) {
            if (location.state.selectedIndustry) {
                setSelectedIndustry(location.state.selectedIndustry);
            }
            if (location.state.uploadedFiles) {
                setUploadedFiles(location.state.uploadedFiles);
            }
        }
    }, [location]);

    // Industry icon mapping
    const industryIcons = {
        finance: <FiDollarSign className="w-5 h-5" />,
        education: <FiBook className="w-5 h-5" />,
        retail: <FiShoppingCart className="w-5 h-5" />,
        manufacturing: <FiPackage className="w-5 h-5" />,
        healthcare: <FiActivity className="w-5 h-5" />
    };

    // Industry name mapping
    const industryNames = {
        finance: 'Financial Analytics',
        education: 'Education Analytics',
        retail: 'Retail & E-commerce Analytics',
        manufacturing: 'Manufacturing Analytics',
        healthcare: 'Healthcare Analytics'
    };

    // Industry-specific metrics
    const getMetricsForIndustry = (industry) => {
        switch (industry) {
            case 'finance':
                return [
                    { title: 'Total Assets', value: '$2.5M', change: '+12.5%' },
                    { title: 'Revenue Growth', value: '15.2%', change: '+3.1%' },
                    { title: 'Risk Score', value: 'Low', change: '-5%' },
                    { title: 'Investment ROI', value: '18.7%', change: '+2.3%' }
                ];
            case 'education':
                return [
                    { title: 'Student Success Rate', value: '92%', change: '+4.2%' },
                    { title: 'Enrollment Growth', value: '8.5%', change: '+1.2%' },
                    { title: 'Course Completion', value: '87%', change: '+3.5%' },
                    { title: 'Student Satisfaction', value: '4.5/5', change: '+0.3' }
                ];
            case 'retail':
                return [
                    { title: 'Total Sales', value: '$1.2M', change: '+8.7%' },
                    { title: 'Customer Acquisition', value: '2.5K', change: '+15.3%' },
                    { title: 'Average Order Value', value: '$85', change: '+5.2%' },
                    { title: 'Inventory Turnover', value: '4.2x', change: '+0.8x' }
                ];
            case 'manufacturing':
                return [
                    { title: 'Production Efficiency', value: '92%', change: '+3.5%' },
                    { title: 'Quality Score', value: '98.5%', change: '+1.2%' },
                    { title: 'Supply Chain Time', value: '4.2 days', change: '-0.8 days' },
                    { title: 'Cost per Unit', value: '$12.5', change: '-2.3%' }
                ];
            case 'healthcare':
                return [
                    { title: 'Patient Satisfaction', value: '4.7/5', change: '+0.2' },
                    { title: 'Treatment Success', value: '94%', change: '+2.1%' },
                    { title: 'Average Wait Time', value: '15 min', change: '-3.5 min' },
                    { title: 'Resource Utilization', value: '88%', change: '+4.2%' }
                ];
            default:
                return [
                    { title: 'Total Metrics', value: '24', change: '+12.5%' },
                    { title: 'Data Points', value: '1,845', change: '+15.3%' },
                    { title: 'Insights Generated', value: '32', change: '+8.4%' },
                    { title: 'Accuracy Rate', value: '96.2%', change: '+1.8%' }
                ];
        }
    };

    // Get industry-specific insights
    const getInsightsForIndustry = (industry) => {
        switch (industry) {
            case 'finance':
                return [
                    { insight: 'Revenue Growth Trend', value: '15.2%', change: '+3.1%', status: 'Positive' },
                    { insight: 'Risk Assessment', value: 'Low Risk', change: '-5%', status: 'Stable' },
                    { insight: 'Investment Performance', value: '18.7% ROI', change: '+2.3%', status: 'Positive' }
                ];
            case 'education':
                return [
                    { insight: 'Student Performance', value: '92% Success', change: '+4.2%', status: 'Positive' },
                    { insight: 'Course Engagement', value: '87% Active', change: '+3.5%', status: 'Positive' },
                    { insight: 'Resource Utilization', value: '85%', change: '+2.1%', status: 'Optimal' }
                ];
            case 'retail':
                return [
                    { insight: 'Sales Performance', value: '$1.2M', change: '+8.7%', status: 'Positive' },
                    { insight: 'Customer Retention', value: '78%', change: '+5.2%', status: 'Positive' },
                    { insight: 'Inventory Health', value: 'Optimal', change: '+0.8x', status: 'Stable' }
                ];
            case 'manufacturing':
                return [
                    { insight: 'Production Efficiency', value: '92%', change: '+3.5%', status: 'Positive' },
                    { insight: 'Quality Metrics', value: '98.5%', change: '+1.2%', status: 'Positive' },
                    { insight: 'Supply Chain', value: '4.2 days', change: '-0.8 days', status: 'Improving' }
                ];
            case 'healthcare':
                return [
                    { insight: 'Patient Outcomes', value: '94% Success', change: '+2.1%', status: 'Positive' },
                    { insight: 'Resource Efficiency', value: '88%', change: '+4.2%', status: 'Optimal' },
                    { insight: 'Service Quality', value: '4.7/5', change: '+0.2', status: 'Positive' }
                ];
            default:
                return [
                    { insight: 'Overall Performance', value: 'Good', change: '+2.1%', status: 'Positive' },
                    { insight: 'Data Quality', value: 'High', change: '+1.5%', status: 'Stable' },
                    { insight: 'System Health', value: 'Optimal', change: '0%', status: 'Optimal' }
                ];
        }
    };

    // Get metrics for the active tab
    const getActiveMetrics = () => {
        if (activeTab === 'overview') {
            return getMetricsForIndustry(selectedIndustry);
        } else {
            return getMetricsForIndustry(activeTab);
        }
    };

    // Get insights for the active tab
    const getActiveInsights = () => {
        if (activeTab === 'overview') {
            return getInsightsForIndustry(selectedIndustry);
        } else {
            return getInsightsForIndustry(activeTab);
        }
    };

    // Add chart data generation functions
    const generateChartData = (industry, type) => {
        const baseData = Array.from({ length: 12 }, (_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            value: Math.floor(Math.random() * 1000) + 500,
            target: Math.floor(Math.random() * 1000) + 500,
            previous: Math.floor(Math.random() * 1000) + 500
        }));

        switch (industry) {
            case 'finance':
                return baseData.map(item => ({
                    ...item,
                    value: item.value * 1.5,
                    target: item.target * 1.5,
                    previous: item.previous * 1.5,
                    label: 'Revenue ($K)'
                }));
            case 'education':
                return baseData.map(item => ({
                    ...item,
                    value: Math.floor(item.value * 0.8),
                    target: Math.floor(item.target * 0.8),
                    previous: Math.floor(item.previous * 0.8),
                    label: 'Students'
                }));
            case 'retail':
                return baseData.map(item => ({
                    ...item,
                    value: item.value * 1.2,
                    target: item.target * 1.2,
                    previous: item.previous * 1.2,
                    label: 'Sales ($K)'
                }));
            case 'manufacturing':
                return baseData.map(item => ({
                    ...item,
                    value: Math.floor(item.value * 1.3),
                    target: Math.floor(item.target * 1.3),
                    previous: Math.floor(item.previous * 1.3),
                    label: 'Units'
                }));
            case 'healthcare':
                return baseData.map(item => ({
                    ...item,
                    value: Math.floor(item.value * 0.9),
                    target: Math.floor(item.target * 0.9),
                    previous: Math.floor(item.previous * 0.9),
                    label: 'Patients'
                }));
            default:
                return baseData.map(item => ({
                    ...item,
                    label: 'Value'
                }));
        }
    };

    const generateDistributionData = (industry) => {
        switch (industry) {
            case 'finance':
                return [
                    { name: 'Investments', value: 35 },
                    { name: 'Loans', value: 25 },
                    { name: 'Savings', value: 20 },
                    { name: 'Insurance', value: 15 },
                    { name: 'Other', value: 5 }
                ];
            case 'education':
                return [
                    { name: 'Undergraduate', value: 40 },
                    { name: 'Graduate', value: 30 },
                    { name: 'Professional', value: 20 },
                    { name: 'Research', value: 10 }
                ];
            case 'retail':
                return [
                    { name: 'Online', value: 45 },
                    { name: 'In-store', value: 35 },
                    { name: 'Mobile', value: 15 },
                    { name: 'Other', value: 5 }
                ];
            case 'manufacturing':
                return [
                    { name: 'Production', value: 40 },
                    { name: 'Quality', value: 25 },
                    { name: 'Supply Chain', value: 20 },
                    { name: 'R&D', value: 15 }
                ];
            case 'healthcare':
                return [
                    { name: 'Outpatient', value: 35 },
                    { name: 'Inpatient', value: 30 },
                    { name: 'Emergency', value: 20 },
                    { name: 'Other', value: 15 }
                ];
            default:
                return [
                    { name: 'Category A', value: 30 },
                    { name: 'Category B', value: 25 },
                    { name: 'Category C', value: 20 },
                    { name: 'Category D', value: 15 },
                    { name: 'Category E', value: 10 }
                ];
        }
    };

    const COLORS = ['#7400B8', '#9B4DCA', '#B75CFF', '#D4A5FF', '#E6C7FF'];

    const handleProfileClick = () => {
        navigate(`/user/profile/${user.id}`);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            logout();
        } catch (err) {
            console.error('Logout error:', err);
            // Force redirect even if there's an error
            window.location.href = '/';
        }
    };

    // Helper function to generate unique log ID
    const generateLogId = () => {
        logIdRef.current += 1;
        return `${logIdRef.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Add log entry helper
    const addLog = (type, message) => {
        setApiLogs(prev => [...prev, {
            id: generateLogId(),
            type,
            message,
            timestamp: new Date().toISOString()
        }]);
    };

    // Fetch user files
    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoadingFiles(true);
            setFileError('');
            addLog('info', 'Fetching user files...');

            try {
                console.log('Fetching files for user:', user._id);
                const result = await getAllUserFiles(user._id);
                console.log('Files fetch response:', result);

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
                        addLog('success', `Found ${files.length} files`);
                        addLog('info', `Selected file: ${files[0].displayName} (${files[0].fileSize})`);
                    } else {
                        addLog('info', 'No files found');
                    }
                } else {
                    const errorMsg = result.error || "Error fetching files";
                    setFileError(errorMsg);
                    addLog('error', `Failed to fetch files: ${errorMsg}`);
                    console.error('File fetch error:', errorMsg);
                }
            } catch (err) {
                const errorMsg = err.message || "Error fetching files";
                setFileError(errorMsg);
                addLog('error', `Error fetching files: ${errorMsg}`);
                console.error('File fetch error:', err);
            } finally {
                setIsLoadingFiles(false);
            }
        };

        if (user?._id) {
            fetchFiles();
        }
    }, [user?._id]);

    // Load file analysis
    const handleLoadFileAnalysis = async (fileId) => {
        if (!fileId) {
            addLog('error', 'No file selected for analysis');
            return;
        }

        const file = userFiles.find(f => f._id === fileId);
        if (!file) {
            addLog('error', 'Selected file not found');
            return;
        }

        setIsLoadingAnalysis(true);
        setAnalysisError('');
        setAnalysis(null); // Reset analysis when starting new analysis
        addLog('info', `Starting analysis for file: ${file.displayName} (${file.fileSize})`);

        try {
            console.log('Downloading file:', fileId);
            const result = await downloadFiles(user._id, fileId);
            console.log('File download response:', result);

            if (!result.success) {
                throw new Error(result.error || "Failed to load file");
            }

            const text = await result.data.text();
            const parsed = JSON.parse(text);
            console.log("Parsed analysis data:", parsed);
            
            setAnalysis(parsed.fullAnalysis);
            addLog('success', `Analysis completed for ${file.displayName}`);
            
            // Log key metrics from analysis
            if (parsed.fullAnalysis?.stats) {
                const metricCount = Object.keys(parsed.fullAnalysis.stats).length;
                addLog('info', `Analysis contains ${metricCount} metrics`);
            }
            if (parsed.fullAnalysis?.insights) {
                const insightCount = parsed.fullAnalysis.insights.groupedBy?.length || 0;
                addLog('info', `Analysis contains ${insightCount} insights`);
            }

        } catch (err) {
            const errorMsg = err.message || "Failed to load file data";
            setAnalysisError(errorMsg);
            addLog('error', `Analysis failed for ${file.displayName}: ${errorMsg}`);
            console.error('Analysis error:', err);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    // Get metrics based on file category
    const getMetricsForCategory = (analysis, category) => {
        if (!analysis?.stats || !analysis?.meta?.schema) return [];

        const stats = analysis.stats;
        const schema = analysis.meta.schema;
        const metrics = schema.metrics || [];
        const dimensions = schema.dimensions || [];
        const recordCount = analysis.meta.recordCount?.raw || 0;

        // Helper function to determine metric type
        const getMetricType = (key) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('date') || lowerKey.includes('id')) return 'identifier';
            if (lowerKey.includes('amount') || lowerKey.includes('sales') || lowerKey.includes('revenue') || 
                lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('profit')) return 'currency';
            if (lowerKey.includes('discount') || lowerKey.includes('percentage') || lowerKey.includes('rate')) return 'percentage';
            if (lowerKey.includes('age') || lowerKey.includes('quantity') || lowerKey.includes('count') || 
                lowerKey.includes('number') || lowerKey.includes('score')) return 'number';
            return 'text';
        };

        // Helper function to format metric value
        const formatMetricValue = (key, stat, type) => {
            if (!stat || stat.mean === undefined) return '0';

            switch (type) {
                case 'currency':
                    const total = stat.mean * stat.count;
                    return total.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                    });
                case 'percentage':
                    return `${(stat.mean * 100).toFixed(1)}%`;
                case 'number':
                    if (key.toLowerCase().includes('age')) {
                        return stat.mean.toFixed(1);
                    }
                    return stat.count ? stat.count.toLocaleString() : stat.mean.toLocaleString();
                case 'identifier':
                    return stat.count.toLocaleString();
                default:
                    return stat.mean.toLocaleString();
            }
        };

        // Helper function to calculate meaningful change
        const calculateChange = (stat, type) => {
            if (!stat || stat.mean === undefined || stat.median === undefined) return '0%';
            
            let change;
            switch (type) {
                case 'currency':
                case 'number':
                    change = ((stat.mean / stat.median - 1) * 100);
                    break;
                case 'percentage':
                    change = ((stat.mean - stat.median) * 100);
                    break;
                default:
                    change = 0;
            }
            return `${change.toFixed(1)}%`;
        };

        // Get primary metrics based on data type
        const getPrimaryMetrics = () => {
            const metricTypes = metrics.map(metric => ({
                name: metric,
                type: getMetricType(metric)
            }));

            // Prioritize metrics based on business importance
            const priorityOrder = ['currency', 'percentage', 'number', 'identifier'];
            const sortedMetrics = metricTypes.sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.type);
                const bIndex = priorityOrder.indexOf(b.type);
                return aIndex - bIndex;
            });

            return sortedMetrics.slice(0, 4);
        };

        // Get insights from the analysis
        const getInsights = () => {
            const insights = [];
            
            // Add record count insight
            insights.push({
                title: 'Total Records',
                value: recordCount.toLocaleString(),
                type: 'identifier'
            });

            // Add key metric insights
            const primaryMetrics = getPrimaryMetrics();
            primaryMetrics.forEach(({ name, type }) => {
                const stat = stats[name];
                if (stat) {
                    insights.push({
                        title: name.replace(/([A-Z])/g, ' $1').trim(),
                        value: formatMetricValue(name, stat, type),
                        change: calculateChange(stat, type),
                        trend: stat.mean > stat.median ? 'up' : 'down',
                        type
                    });
                }
            });

            return insights;
        };

        return getInsights();
    };

    // Get chart data based on analysis
    const getChartData = (analysis) => {
        if (!analysis?.insights?.groupedBy || !analysis?.meta?.schema) return [];

        const schema = analysis.meta.schema;
        const metrics = schema.metrics || [];
        const dimensions = schema.dimensions || [];

        // Find the best dimension for grouping
        const getGroupingDimension = () => {
            const preferredDimensions = ['Category', 'Region', 'City', 'State', 'Gender', 'Type'];
            return dimensions.find(dim => preferredDimensions.includes(dim)) || dimensions[0];
        };

        // Find the best metric for values
        const getValueMetric = () => {
            const preferredMetrics = ['Sales', 'Amount', 'Revenue', 'Profit', 'Total'];
            return metrics.find(metric => preferredMetrics.includes(metric)) || metrics[0];
        };

        const groupByDimension = getGroupingDimension();
        const valueMetric = getValueMetric();

        // Process and sort the data
        return analysis.insights.groupedBy
            .map(item => ({
                name: item[groupByDimension] || 'Unknown',
                value: item.total,
                date: item[valueMetric] || item.total,
                category: item[groupByDimension] || 'Unknown'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    };

    // Get chart title based on analysis
    const getChartTitle = (analysis, chartType) => {
        if (!analysis?.meta?.schema) return 'Data Analysis';

        const schema = analysis.meta.schema;
        const metrics = schema.metrics || [];
        const dimensions = schema.dimensions || [];

        const getPrimaryMetric = () => {
            const preferredMetrics = ['Sales', 'Amount', 'Revenue', 'Profit', 'Total'];
            return metrics.find(metric => preferredMetrics.includes(metric)) || metrics[0];
        };

        const getPrimaryDimension = () => {
            const preferredDimensions = ['Category', 'Region', 'City', 'State', 'Gender', 'Type'];
            return dimensions.find(dim => preferredDimensions.includes(dim)) || dimensions[0];
        };

        const metric = getPrimaryMetric();
        const dimension = getPrimaryDimension();

        if (chartType === 'trend') {
            return `${metric} Trend by ${dimension}`;
        } else {
            return `Top ${dimension}s by ${metric}`;
        }
    };

    // Format date for retail data
    const formatRetailDate = (excelDate) => {
        if (!excelDate) return '';
        // Convert Excel date (days since 1900-01-01) to JavaScript Date
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toLocaleDateString();
    };

    // Update the data processing functions to focus on business metrics
    const getSalesTrendData = (analysis) => {
        if (!analysis?.insights?.groupedBy || !analysis?.meta?.schema) return [];

        const schema = analysis.meta.schema;
        const dateField = schema.metrics.find(m => m.toLowerCase().includes('date')) || schema.metrics[0];
        const salesField = schema.metrics.find(m => 
            ['Sales', 'Amount', 'Revenue', 'Total'].includes(m)
        ) || schema.metrics[0];
        const profitField = schema.metrics.find(m => 
            ['Profit', 'Margin', 'Net Income'].includes(m)
        ) || schema.metrics[0];

        // Group by date and calculate business metrics
        const dailyData = analysis.insights.groupedBy.reduce((acc, item) => {
            const date = item[dateField];
            if (!acc[date]) {
                acc[date] = {
                    date,
                    sales: 0,
                    profit: 0,
                    margin: 0,
                    orderCount: 0,
                    averageOrderValue: 0
                };
            }
            acc[date].sales += item.total;
            if (profitField && item[profitField]) {
                acc[date].profit += item[profitField];
            }
            acc[date].orderCount += 1;
            acc[date].averageOrderValue = acc[date].sales / acc[date].orderCount;
            acc[date].margin = acc[date].profit / acc[date].sales * 100;
            return acc;
        }, {});

        return Object.values(dailyData)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(item => ({
                ...item,
                date: new Date(item.date).toLocaleDateString(),
                margin: Number(item.margin.toFixed(2))
            }));
    };

    const getCategoryDistributionData = (analysis) => {
        if (!analysis?.insights?.groupedBy || !analysis?.meta?.schema) return [];

        const schema = analysis.meta.schema;
        const categoryField = schema.dimensions.find(d => 
            ['Category', 'Product Category', 'Type'].includes(d)
        ) || schema.dimensions[0];
        const salesField = schema.metrics.find(m => 
            ['Sales', 'Amount', 'Revenue', 'Total'].includes(m)
        ) || schema.metrics[0];
        const profitField = schema.metrics.find(m => 
            ['Profit', 'Margin', 'Net Income'].includes(m)
        ) || schema.metrics[0];

        // Group by category and calculate business metrics
        const categoryData = analysis.insights.groupedBy.reduce((acc, item) => {
            const category = item[categoryField] || 'Unknown';
            if (!acc[category]) {
                acc[category] = {
                    name: category,
                    sales: 0,
                    profit: 0,
                    margin: 0,
                    orderCount: 0,
                    percentage: 0
                };
            }
            acc[category].sales += item.total;
            if (profitField && item[profitField]) {
                acc[category].profit += item[profitField];
            }
            acc[category].orderCount += 1;
            acc[category].margin = acc[category].profit / acc[category].sales * 100;
            return acc;
        }, {});

        const totalSales = Object.values(categoryData).reduce((sum, item) => sum + item.sales, 0);

        return Object.values(categoryData)
            .map(item => ({
                ...item,
                percentage: (item.sales / totalSales * 100).toFixed(1),
                margin: Number(item.margin.toFixed(2))
            }))
            .sort((a, b) => b.sales - a.sales);
    };

    const getRegionalPerformanceData = (analysis) => {
        if (!analysis?.insights?.groupedBy || !analysis?.meta?.schema) return [];

        const schema = analysis.meta.schema;
        const regionField = schema.dimensions.find(d => 
            ['Region', 'State', 'City'].includes(d)
        ) || schema.dimensions[0];
        const salesField = schema.metrics.find(m => 
            ['Sales', 'Amount', 'Revenue', 'Total'].includes(m)
        ) || schema.metrics[0];
        const profitField = schema.metrics.find(m => 
            ['Profit', 'Margin', 'Net Income'].includes(m)
        ) || schema.metrics[0];

        // Group by region and calculate business metrics
        const regionalData = analysis.insights.groupedBy.reduce((acc, item) => {
            const region = item[regionField] || 'Unknown';
            if (!acc[region]) {
                acc[region] = {
                    name: region,
                    sales: 0,
                    profit: 0,
                    margin: 0,
                    orderCount: 0,
                    averageOrderValue: 0
                };
            }
            acc[region].sales += item.total;
            if (profitField && item[profitField]) {
                acc[region].profit += item[profitField];
            }
            acc[region].orderCount += 1;
            acc[region].averageOrderValue = acc[region].sales / acc[region].orderCount;
            acc[region].margin = acc[region].profit / acc[region].sales * 100;
            return acc;
        }, {});

        return Object.values(regionalData)
            .map(item => ({
                ...item,
                margin: Number(item.margin.toFixed(2))
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);
    };

    const getTimeBasedAnalysisData = (analysis) => {
        if (!analysis?.insights?.groupedBy || !analysis?.meta?.schema) return [];

        const schema = analysis.meta.schema;
        const dateField = schema.metrics.find(m => m.toLowerCase().includes('date')) || schema.metrics[0];
        const salesField = schema.metrics.find(m => 
            ['Sales', 'Amount', 'Revenue', 'Total'].includes(m)
        ) || schema.metrics[0];
        const profitField = schema.metrics.find(m => 
            ['Profit', 'Margin', 'Net Income'].includes(m)
        ) || schema.metrics[0];

        // Group by hour and calculate business metrics
        const hourlyData = analysis.insights.groupedBy.reduce((acc, item) => {
            const date = new Date(item[dateField]);
            const hour = date.getHours();
            if (!acc[hour]) {
                acc[hour] = {
                    hour: `${hour}:00`,
                    sales: 0,
                    profit: 0,
                    margin: 0,
                    orderCount: 0,
                    averageOrderValue: 0
                };
            }
            acc[hour].sales += item.total;
            if (profitField && item[profitField]) {
                acc[hour].profit += item[profitField];
            }
            acc[hour].orderCount += 1;
            acc[hour].averageOrderValue = acc[hour].sales / acc[hour].orderCount;
            acc[hour].margin = acc[hour].profit / acc[hour].sales * 100;
            return acc;
        }, {});

        return Object.values(hourlyData)
            .map(item => ({
                ...item,
                margin: Number(item.margin.toFixed(2))
            }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF]">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-full bg-[#7400B8] text-white shadow-lg"
                >
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <motion.div
                className={`bg-[#7400B8] text-white shadow-xl fixed h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex justify-center items-center border-b border-[#9B4DCA]">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                            <img
                                src="/assets/logos.png"
                                alt="PeekBI Logo"
                                className={`transition-all duration-300 ${sidebarOpen ? 'h-12' : 'h-10'}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/logo.png";
                                }}
                            />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-4 flex-grow overflow-y-auto">
                        {/* Main Navigation */}
                        <ul className="space-y-3">
                            <li
                                className={`p-3 rounded-lg ${activeTab === 'overview' ? 'bg-white/10' : 'text-white/80 hover:bg-white/10'} text-white font-medium flex items-center gap-3 cursor-pointer`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FiGrid className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Overview</span>}
                            </li>

                            {/* Industry-based navigation */}
                            {selectedIndustry && (
                                <li
                                    className={`p-3 rounded-lg ${activeTab === selectedIndustry ? 'bg-white/10' : 'text-white/80 hover:bg-white/10'} text-white font-medium flex items-center gap-3 cursor-pointer`}
                                    onClick={() => setActiveTab(selectedIndustry)}
                                >
                                    {industryIcons[selectedIndustry]}
                                    {sidebarOpen && <span>{industryNames[selectedIndustry]}</span>}
                                </li>
                            )}

                            {/* Additional navigation items */}
                            <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                <FiFileText className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Reports</span>}
                            </li>
                            <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                <FiDatabase className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Data Sources</span>}
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t border-[#9B4DCA]">
                            <h3 className={`text-xs uppercase text-white/50 font-semibold mb-3 ${!sidebarOpen && 'text-center'}`}>
                                {sidebarOpen ? 'Settings' : ''}
                            </h3>
                            <ul className="space-y-3">
                                <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer"
                                    onClick={handleProfileClick}
                                >
                                    <FiUser className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Profile</span>}
                                </li>
                                <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                    <FiSettings className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Settings</span>}
                                </li>
                                <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer"
                                    onClick={() => navigate('/')}
                                >
                                    <FiHome className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Home</span>}
                                </li>
                                <li className="p-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                    <FiHelpCircle className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Help</span>}
                                </li>
                                <li 
                                    className="p-3 rounded-lg text-red-300 hover:bg-white/10 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Logout</span>}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar toggle */}
                    <div className="p-4 border-t border-[#9B4DCA]">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
                        >
                            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
                <div className="p-6 md:p-8">
                    {/* Header with search */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {activeTab === 'overview' ? 'Dashboard Overview' : industryNames[activeTab]}
                            </h1>
                            <p className="text-gray-600">
                                {uploadedFiles.length > 0 ?
                                    `Analysis based on ${uploadedFiles.length} uploaded file(s)` :
                                    'Your business intelligence dashboard'}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center">
                            <div className="relative mr-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent w-full md:w-64"
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <button className="bg-[#7400B8] text-white p-2 rounded-lg hover:bg-[#9B4DCA] transition-colors duration-200">
                                <FiPlus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Data Source Info */}
                        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FiDatabase className="w-5 h-5 text-[#7400B8] mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Data Sources</p>
                                    {isLoadingFiles ? (
                                        <p className="text-xs text-gray-500">Loading files...</p>
                                    ) : fileError ? (
                                        <p className="text-xs text-red-500">{fileError}</p>
                                    ) : userFiles.length > 0 ? (
                                        <div className="flex items-center space-x-4">
                                            <select
                                                className="text-sm text-gray-700 border border-gray-200 rounded px-3 py-2 min-w-[300px] focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                                value={selectedFile?._id || ''}
                                                onChange={(e) => {
                                                    const file = userFiles.find(f => f._id === e.target.value);
                                                    if (file) {
                                                        setSelectedFile(file);
                                                        setAnalysis(null);
                                                        addLog('info', `Selected file: ${file.displayName} (${file.fileSize}) - ${file.category}`);
                                                    }
                                                }}
                                            >
                                                {userFiles.map(file => (
                                                    <option key={file._id} value={file._id}>
                                                        {file.displayName} ({file.fileSize}) - {file.category}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedFile && !isLoadingAnalysis && !analysis && (
                                                <button
                                                    onClick={() => handleLoadFileAnalysis(selectedFile._id)}
                                                    className="bg-[#7400B8] text-white px-4 py-2 rounded-lg hover:bg-[#9B4DCA] transition-colors flex items-center space-x-2"
                                                >
                                                    <FiCpu className="w-4 h-4" />
                                                    <span>Analyze Data</span>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500">No files uploaded</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => navigate('/user/data-upload')}
                                    className="text-sm text-[#7400B8] hover:text-[#9B4DCA] font-medium flex items-center space-x-1"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    <span>Add New</span>
                                    </button>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Status */}
                    {selectedFile && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Analysis Status</p>
                                    {isLoadingAnalysis ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7400B8]"></div>
                                            <p className="text-xs text-gray-500">Processing analysis...</p>
                                        </div>
                                    ) : analysisError ? (
                                        <p className="text-xs text-red-500">{analysisError}</p>
                                    ) : analysis ? (
                                        <p className="text-xs text-green-500">Analysis complete</p>
                                    ) : (
                                        <p className="text-xs text-gray-500">Click "Analyze Data" to process file</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Logs */}
                    {apiLogs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-800 mb-2">Processing Logs</p>
                            <div className="max-h-[150px] overflow-y-auto space-y-2">
                                {apiLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`text-xs p-2 rounded-lg ${
                                            log.type === 'error' ? 'bg-red-50 text-red-700' :
                                            log.type === 'success' ? 'bg-green-50 text-green-700' :
                                            'bg-blue-50 text-blue-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{log.message}</span>
                                            <span className="text-gray-500 text-[10px]">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0">
                            <div className="relative">
                                <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last 90 days</option>
                                    <option>This year</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <FiCalendar className="h-4 w-4" />
                                </div>
                            </div>
                            <button className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                <FiFilter className="h-4 w-4" />
                                <span>Filter</span>
                            </button>
                            <button className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                <FiRefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                        <div className="flex items-center">
                            <button className="flex items-center space-x-1 bg-[#7400B8] rounded-lg px-3 py-2 text-white hover:bg-[#9B4DCA] transition-colors duration-200">
                                <FiDownload className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Content - Only show when analysis is complete */}
                    {analysis && (
                        <>
                            {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {getMetricsForCategory(analysis, selectedFile?.category).map((metric, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <h3 className="text-lg font-semibold text-gray-700">{metric.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                        {metric.change}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Dashboard Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Sales Trend Chart */}
                        <motion.div
                                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                                        {getChartTitle(analysis, 'trend')}
                                </h2>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={getSalesTrendData(analysis)}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00B894" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#00B894" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" />
                                                <YAxis yAxisId="left" 
                                                    tickFormatter={(value) => 
                                                        (value / 1000).toFixed(0) + 'K'
                                                    }
                                                />
                                                <YAxis yAxisId="right" orientation="right"
                                                    tickFormatter={(value) => 
                                                        value + '%'
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={(value, name) => {
                                                        if (name === 'margin') return [value + '%', 'Margin'];
                                                        return [value.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR',
                                                            maximumFractionDigits: 0
                                                        }), name === 'sales' ? 'Sales' : 'Profit'];
                                                    }}
                                                />
                                                <Legend />
                                                <Area
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#7400B8"
                                                    fillOpacity={1}
                                                    fill="url(#colorSales)"
                                                    name="Sales"
                                                />
                                                <Area
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="profit"
                                                    stroke="#00B894"
                                                    fillOpacity={1}
                                                    fill="url(#colorProfit)"
                                                    name="Profit"
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="margin"
                                                    stroke="#FF7675"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="Margin %"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                            </div>
                        </motion.div>

                                {/* Category Distribution Chart */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                                        {getChartTitle(analysis, 'top')}
                                </h2>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getCategoryDistributionData(analysis)}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={150}
                                                    fill="#7400B8"
                                                    label={({ name, percentage }) => 
                                                        `${name} (${percentage}%)`
                                                    }
                                                >
                                                    {getCategoryDistributionData(analysis).map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={COLORS[index % COLORS.length]} 
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => 
                                                        value.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR',
                                                            maximumFractionDigits: 0
                                                        })
                                                    }
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Additional Analysis Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Regional Performance Chart */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Regional Business Performance</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={getRegionalPerformanceData(analysis)}
                                        margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name" 
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis 
                                            yAxisId="left"
                                            tickFormatter={(value) => 
                                                (value / 1000).toFixed(0) + 'K'
                                            }
                                        />
                                        <YAxis 
                                            yAxisId="right"
                                            orientation="right"
                                            tickFormatter={(value) => 
                                                value + '%'
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'margin') return [value + '%', 'Margin'];
                                                if (name === 'averageOrderValue') return [value.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                }), 'Avg Order Value'];
                                                return [value.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                }), name === 'sales' ? 'Sales' : 'Profit'];
                                            }}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="sales" fill="#7400B8" name="Sales" />
                                        <Bar yAxisId="left" dataKey="profit" fill="#00B894" name="Profit" />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="margin"
                                            stroke="#FF7675"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Margin %"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Time-Based Analysis Chart */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Hourly Business Performance</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={getTimeBasedAnalysisData(analysis)}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis 
                                            yAxisId="left"
                                            tickFormatter={(value) => 
                                                (value / 1000).toFixed(0) + 'K'
                                            }
                                        />
                                        <YAxis 
                                            yAxisId="right"
                                            orientation="right"
                                            tickFormatter={(value) => 
                                                value + '%'
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'margin') return [value + '%', 'Margin'];
                                                if (name === 'averageOrderValue') return [value.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                }), 'Avg Order Value'];
                                                return [value.toLocaleString('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                }), name === 'sales' ? 'Sales' : 'Profit'];
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#7400B8"
                                            strokeWidth={2}
                                            dot={{ fill: '#7400B8' }}
                                            name="Sales"
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#00B894"
                                            strokeWidth={2}
                                            dot={{ fill: '#00B894' }}
                                            name="Profit"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="margin"
                                            stroke="#FF7675"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Margin %"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;