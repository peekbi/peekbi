import { useState, useEffect, useRef } from 'react';
import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiBarChart2, FiCpu, FiActivity, FiFile, FiDownload, FiCalendar, FiDatabase, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Import components
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import Analysis from '../../components/dashboard/Analysis';
import DataUpload from '../../components/dashboard/DataUpload';
import Profile from '../../components/dashboard/Profile';
import DataSources from '../../components/dashboard/DataSources';
import RetailDashboard from '../../components/dashboard/RetailDashboard';
import FinanceDashboard from '../../components/dashboard/FinanceDashboard';
import EducationDashboard from '../../components/dashboard/EducationDashboard';
import ManufacturingDashboard from '../../components/dashboard/ManufacturingDashboard';
import HealthcareDashboard from '../../components/dashboard/HealthcareDashboard';
import Settings from '../../components/dashboard/Settings';
import AIAnalyst from '../../components/dashboard/AIAnalyst';
import AdminDashboard from '../admin/AdminDashboard';
import AdminTestimonials from '../admin/AdminTestimonials';

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
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const filesFetchedRef = useRef(false);
    const initialAnalysisHandledRef = useRef(false);
    const handledFileIdsRef = useRef(new Set());

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        if (location.state) {
            if (location.state.selectedIndustry) {
                setSelectedIndustry(location.state.selectedIndustry);
            }
            if (location.state.uploadedFiles) {
                setUploadedFiles(location.state.uploadedFiles);
                // Trigger file fetch when new files are uploaded
                filesFetchedRef.current = false;

                // Immediately fetch files after upload
                fetchUserFiles();

                // Clear the location state to prevent duplicate fetches on navigation
                window.history.replaceState({}, document.title);
            }
            // Check for refreshFiles flag
            if (location.state.refreshFiles === true) {
                filesFetchedRef.current = false;
                // Immediately fetch files when refresh flag is present
                fetchUserFiles();
            }
        }
    }, [location]);

    // Check for fileId in URL query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fileId = params.get('fileId');
        const analysisComplete = params.get('analysisComplete') === 'true';

        if (fileId) {
            const file = userFiles.find(f => f._id === fileId);

            if (file) {
                setSelectedFile(file);

                // If the file has analysis data or the analysisComplete flag is set, just show it
                if (file.analysis || analysisComplete) {
                    setAnalysis(file.analysis);
                    setShowAnalysis(true);

                    // If we have analysisComplete flag but no analysis data yet, 
                    // the analysis might have just completed but the userFiles state hasn't updated
                    // Force a refresh of the files to get the latest analysis data
                    if (analysisComplete && !file.analysis) {
                        fetchUserFiles();
                    }
                } else {
                    // If file has no analysis yet, start analysis automatically
                    handleLoadFileAnalysis(fileId);
                }
            } else {
                // If we can't find the file, try refreshing the files
                if (userFiles.length === 0 || analysisComplete) {
                    fetchUserFiles();
                }
            }
        }
    }, [location.search, userFiles]);

    // Special effect to handle navigation from DataSources with analysis results
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fileId = params.get('fileId');
        const analysisComplete = params.get('analysisComplete') === 'true';

        if (fileId && analysisComplete && !handledFileIdsRef.current.has(fileId)) {
            handledFileIdsRef.current.add(fileId); // Mark this fileId as handled

            // First check if we already have the file with analysis in userFiles
            const existingFile = userFiles.find(f => f._id === fileId);
            if (existingFile && existingFile.analysis) {
                setSelectedFile(existingFile);
                setAnalysis(existingFile.analysis);
                setShowAnalysis(true);
                return;
            }

            // If not, force a refresh of files to get the latest data
            filesFetchedRef.current = false;

            // Make a direct API call to get the file with analysis
            const getFileWithAnalysis = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('No authentication token found');
                    }

                    const response = await axios.get(`https://api.peekbi.com/files/${user._id}/${fileId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data && response.data.file) {
                        const file = response.data.file;
                        setSelectedFile(file);
                        setAnalysis(file.analysis);
                        setShowAnalysis(true);

                        // Also update the file in userFiles
                        setUserFiles(prev =>
                            prev.map(f => f._id === fileId ? file : f)
                        );
                    } else {
                        // Fall back to refreshing all files
                        fetchUserFiles();
                    }
                } catch (err) {
                    // Fall back to refreshing all files
                    fetchUserFiles();
                }
            };

            getFileWithAnalysis();
        }
    }, [location.search, userFiles]);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showExportMenu && !event.target.closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu]);

    // Function to fetch user files
    const fetchUserFiles = async () => {
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

                // Sort files by upload date (newest first)
                const sortedFiles = [...files].sort((a, b) =>
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)
                );

                setUserFiles(sortedFiles);
                filesFetchedRef.current = true;

                if (sortedFiles.length > 0 && !selectedFile) {
                    setSelectedFile(sortedFiles[0]);
                }
            } else {
                setFileError(result.error || "Error fetching files");
                toast.error(result.error || "Error fetching files");
            }
        } catch (err) {
            setFileError(err.message || "Error fetching files");
            toast.error(err.message || "Error fetching files");
        } finally {
            setIsLoadingFiles(false);
        }
    };

    // Fetch user files immediately when component mounts or when triggered by file upload
    useEffect(() => {
        if (!user?._id || filesFetchedRef.current) return;
        fetchUserFiles();
    }, [user?._id, getAllUserFiles]);

    const handleLoadFileAnalysis = async (fileId) => {
        try {
            // Check if the file already has analysis data
            const fileToAnalyze = userFiles.find(f => f._id === fileId);

            // If file already has analysis data, just show it without re-analyzing
            if (fileToAnalyze?.analysis) {
                setSelectedFile(fileToAnalyze);
                setAnalysis(fileToAnalyze.analysis);
                setShowAnalysis(true);

                // Navigate to dashboard to show analysis if not already there
                if (location.pathname !== '/user/dashboard' && location.pathname !== '/user') {
                    navigate(`/user/dashboard?fileId=${fileId}`);
                }

                return;
            }

            // Start new analysis
            setSelectedFile(fileToAnalyze);
            setIsLoadingAnalysis(true);
            setAnalysis(null);
            setAnalysisError(null);
            setShowAnalysis(false);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Track the source page for proper navigation after analysis
            const sourcePage = location.pathname;

            const response = await axios.get(`https://api.peekbi.com/files/analyse/${user._id}/${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update the file in userFiles with the analysis data
            const updatedFiles = userFiles.map(file => {
                if (file._id === fileId) {
                    return { ...file, analysis: response.data.analysis };
                }
                return file;
            });

            setUserFiles(updatedFiles);
            setAnalysis(response.data.analysis);
            setShowAnalysis(true);

            // Always navigate to dashboard to show analysis
            // Add analysisComplete=true flag to prevent re-analysis
            navigate(`/user/dashboard?fileId=${fileId}&analysisComplete=true`);
            toast.success('Analysis completed successfully!');

        } catch (err) {
            setAnalysisError(err.response?.data?.message || 'Failed to load analysis');
            toast.error(err.response?.data?.message || 'Failed to load analysis');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    // Function to manually trigger file refresh
    const refreshFiles = () => {
        filesFetchedRef.current = false;
        setIsLoadingFiles(true);
    };

    const handleBackToDashboard = () => {
        setShowAnalysis(false);
        setSelectedFile(null);
        setAnalysis(null);
        // Navigate to the base dashboard URL without any query params
        navigate('/user/dashboard');
    };

    // --- Simpler Export to Excel (Summary + Insights) ---
    const handleExportToExcel = () => {
        if (!selectedFile || !analysis) return;
        const file = selectedFile;
        const analysisData = analysis;
        const wb = XLSX.utils.book_new();

        // --- Summary Sheet ---
        const summary = analysisData.summary || analysisData.Summary || {};
        let summaryRows = [];
        const flattenSummary = (prefix, value) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.entries(value).forEach(([k, v]) => {
                    flattenSummary(prefix ? `${prefix} - ${k}` : k, v);
                });
            } else {
                summaryRows.push([prefix, value]);
            }
        };
        Object.entries(summary).forEach(([k, v]) => flattenSummary(k, v));
        if (summaryRows.length) {
            const summarySheet = XLSX.utils.aoa_to_sheet([
                ['Field', 'Value'],
                ...summaryRows
            ]);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        }

        // --- Insights Sheet ---
        const insights = analysisData.insights || analysisData.Insights || {};
        let insightsRows = [];
        const addInsightSection = (sectionName, value) => {
            if (Array.isArray(value)) {
                if (value.length === 0) return;
                if (typeof value[0] === 'object' && value[0] !== null) {
                    // Array of objects: add each row with section name
                    value.forEach(row => {
                        insightsRows.push({ Section: sectionName, ...row });
                    });
                } else {
                    // Array of primitives: add as value rows
                    value.forEach(v => {
                        insightsRows.push({ Section: sectionName, Value: v });
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                // Object: flatten as key-value pairs
                Object.entries(value).forEach(([k, v]) => {
                    if (Array.isArray(v)) {
                        // Nested array: treat as sub-section
                        addInsightSection(`${sectionName} - ${k}`, v);
                    } else if (typeof v === 'object' && v !== null) {
                        // Nested object: flatten
                        insightsRows.push({ Section: `${sectionName} - ${k}`, Value: JSON.stringify(v) });
                    } else {
                        insightsRows.push({ Section: `${sectionName} - ${k}`, Value: v });
                    }
                });
            } else {
                // Primitive
                insightsRows.push({ Section: sectionName, Value: value });
            }
        };
        Object.entries(insights).forEach(([section, value]) => {
            addInsightSection(section, value);
        });
        if (insightsRows.length) {
            // Collect all unique columns
            const allCols = Array.from(new Set(insightsRows.flatMap(row => Object.keys(row))));
            const aoa = [allCols, ...insightsRows.map(row => allCols.map(col => row[col] !== undefined ? row[col] : ''))];
            const insightsSheet = XLSX.utils.aoa_to_sheet(aoa);
            XLSX.utils.book_append_sheet(wb, insightsSheet, 'Insights');
        }

        // Fallback: if no sheets, add the whole object as JSON
        if (wb.SheetNames.length === 0) {
            const aoa = [["Data"], [JSON.stringify(analysisData)]];
            const sheet = XLSX.utils.aoa_to_sheet(aoa);
            XLSX.utils.book_append_sheet(wb, sheet, 'Data');
        }

        XLSX.writeFile(wb, `${file?.originalName?.replace(/\.[^/.]+$/, '') || 'analysis'}.xlsx`);
    };

    // --- Secure JSON Export Function ---
    const createSecureExportData = () => {
        if (!selectedFile || !analysis) return null;

        const secureData = {
            file_info: {
                name: selectedFile?.originalName || 'Unknown',
                size: selectedFile?.sizeInBytes ? `${(selectedFile.sizeInBytes / 1024).toFixed(1)} KB` : 'Unknown',
                upload_date: selectedFile?.uploadedAt ? new Date(selectedFile.uploadedAt).toLocaleDateString() : 'Unknown',
                category: selectedFile?.fileCategory || 'Unknown'
            },
            analysis_summary: {
                total_sections: Object.keys(analysis?.insights || {}).length,
                export_timestamp: new Date().toISOString(),
                dashboard_version: '2.0'
            },
            insights: {},
            summary: analysis?.summary || {}
        };

        // Safely include insights data
        if (analysis?.insights) {
            const insights = analysis.insights;

            // Include all available insights sections
            if (insights.kpis) secureData.insights.kpis = insights.kpis;
            if (insights.advanced_kpis) secureData.insights.advanced_kpis = insights.advanced_kpis;
            if (insights.highPerformers) secureData.insights.high_performers = insights.highPerformers;
            if (insights.lowPerformers) secureData.insights.low_performers = insights.lowPerformers;
            if (insights.totals) secureData.insights.totals = insights.totals;
            if (insights.trends) secureData.insights.trends = insights.trends;
            if (insights.customer_segments) secureData.insights.customer_segments = insights.customer_segments;
            if (insights.seasonal_analysis) secureData.insights.seasonal_analysis = insights.seasonal_analysis;
            if (insights.forecasting) secureData.insights.forecasting = insights.forecasting;
            if (insights.performance_metrics) secureData.insights.performance_metrics = insights.performance_metrics;
            if (insights.risk_analysis) secureData.insights.risk_analysis = insights.risk_analysis;
            if (insights.recommendations) secureData.insights.recommendations = insights.recommendations;
            if (insights.alerts) secureData.insights.alerts = insights.alerts;
            if (insights.outliers) secureData.insights.outliers = insights.outliers;
            if (insights.correlations) secureData.insights.correlations = insights.correlations;
            if (insights.hypothesis) secureData.insights.hypothesis = insights.hypothesis;
            if (insights.product_analysis) secureData.insights.product_analysis = insights.product_analysis;
        }

        return secureData;
    };

    const handleExportToJSON = () => {
        const secureData = createSecureExportData();
        if (!secureData) return;

        const dataStr = JSON.stringify(secureData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFile?.originalName?.replace(/\.[^/.]+$/, '') || 'analysis'}_data.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('JSON export completed successfully!');
    };

    // Recent Files Component
    const RecentFiles = () => {
        const recentFiles = userFiles.slice(0, 5); // Get 5 most recent files

        if (isLoadingFiles) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                    </div>
                </div>
            );
        }

        if (recentFiles.length === 0) {
            return (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Recent Files</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/user/data-upload')}
                            className="px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl text-sm"
                        >
                            Upload File
                        </motion.button>
                    </div>
                    <div className="text-center py-8">
                        <p className="text-gray-600">No files uploaded yet</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
                    <h2 className="text-xl font-bold text-gray-800">Recent Files</h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/user/data-sources')}
                            className="px-4 py-2 bg-white/80 text-[#7400B8] border border-[#7400B8] rounded-xl text-sm w-full sm:w-auto"
                        >
                            View All
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/user/data-upload')}
                            className="px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl text-sm w-full sm:w-auto"
                        >
                            Upload File
                        </motion.button>
                    </div>
                </div>
                <div className="space-y-3">
                    {recentFiles.map((file) => (
                        <motion.div
                            key={file._id}
                            whileHover={{ y: -2 }}
                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 bg-white/60 backdrop-blur-sm border ${selectedFile?._id === file._id
                                ? 'border-[#7400B8]/50 shadow-lg bg-gradient-to-r from-[#F9F4FF] to-white'
                                : 'border-white/30 hover:border-[#7400B8]/30 hover:shadow-md'
                                }`}
                            onClick={() => setSelectedFile(file)}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-center space-x-3 w-full">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] flex items-center justify-center flex-shrink-0">
                                            <FiFile className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-semibold text-gray-800 truncate mb-1">
                                                {file.originalName}
                                            </p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs w-full">
                                                <span className="flex items-center text-gray-600">
                                                    <FiDatabase className="w-3 h-3 mr-1" />
                                                    {file.fileCategory}
                                                </span>
                                                <span className="flex items-center text-gray-600">
                                                    <FiDownload className="w-3 h-3 mr-1" />
                                                    {formatFileSize(file.sizeInBytes)}
                                                </span>
                                                <span className="flex items-center text-gray-600">
                                                    <FiCalendar className="w-3 h-3 mr-1" />
                                                    {formatDate(file.uploadedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
                                    {file.analysis ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(file);
                                                setAnalysis(file.analysis);
                                                setShowAnalysis(true);
                                            }}
                                            className="px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2 text-xs font-medium shadow-lg w-full sm:w-auto"
                                        >
                                            <FiBarChart2 className="w-4 h-4" />
                                            <span>View Analysis</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoadFileAnalysis(file._id);
                                            }}
                                            className="px-3 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-xs font-medium w-full sm:w-auto"
                                        >
                                            <FiCpu className="w-4 h-4" />
                                            <span>Analyze</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    // This component will render the correct dashboard based on the file category
    const AnalysisDashboard = ({ file, analysisData, onBack }) => {
        const [isAiChatOpen, setIsAiChatOpen] = useState(false);

        // Listen for the openAiChat custom event
        useEffect(() => {
            const handleOpenAiChat = () => {
                setIsAiChatOpen(true);
            };

            window.addEventListener('openAiChat', handleOpenAiChat);

            return () => {
                window.removeEventListener('openAiChat', handleOpenAiChat);
            };
        }, []);

        if (!file || !analysisData) {
            return (
                <div className="flex justify-center items-center h-full">
                    <p>No analysis data available.</p>
                </div>
            );
        }

        const category = file.fileCategory || 'General';

        switch (category) {
            case 'Retail':
                return (
                    <>
                        <RetailDashboard file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            case 'Finance':
                return (
                    <>
                        <FinanceDashboard file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            case 'Education':
                return (
                    <>
                        <EducationDashboard file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            case 'Manufacturing':
                return (
                    <>
                        <ManufacturingDashboard file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            case 'Healthcare':
                return (
                    <>
                        <HealthcareDashboard file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            default:
                // Fallback to a general analysis component if it exists, or show a message
                return (
                    <>
                        <Analysis file={file} analysis={analysisData} onBack={onBack} />
                        <AnimatePresence>
                            {isAiChatOpen && (
                                <AIAnalyst
                                    file={file}
                                    analysis={analysisData}
                                    summary={analysisData.summary}
                                    onClose={() => setIsAiChatOpen(false)}
                                    onUpgradePlan={() => setShowUpgrade(true)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
        }
    };

    const DashboardContent = () => {
        const fileToDisplay = selectedFile || (userFiles.length > 0 ? userFiles[0] : null);

        if (showAnalysis && analysis && fileToDisplay) {
            return (
                <AnalysisDashboard
                    file={fileToDisplay}
                    analysisData={analysis}
                    onBack={handleBackToDashboard}
                />
            );
        }

        if (selectedFile && isLoadingAnalysis) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 relative">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-20 animate-pulse"></div>
                                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] animate-spin"></div>
                                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                    <FiCpu className="w-8 h-8 text-[#7400B8]" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Data</h2>
                            <p className="text-gray-600 mb-6">Processing your file to extract valuable insights...</p>

                            <div className="w-full max-w-md mx-auto">
                                <div className="relative">
                                    <div className="flex mb-3 items-center justify-between">
                                        <span className="text-sm font-medium text-[#7400B8]">Processing</span>
                                        <span className="text-sm text-gray-500">Analyzing...</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full animate-progress"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // Main Dashboard View
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col space-y-4"
                    >
                        <div className="flex flex-col space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Recent Files</h2>
                            <p className="text-gray-500 mt-1">Here are the latest files you've uploaded.</p>
                        </div>
                        <RecentFiles />
                    </motion.div>

                    {/* Placeholder for more dashboard widgets */}
                </AnimatePresence>
            </div>
        );
    };

    const getHeaderInfo = () => {
        const path = location.pathname;

        // If showing analysis, the header should have a back button and AI button
        if (showAnalysis && selectedFile) {
            const category = selectedFile.fileCategory || 'General';
            return {
                title: `${category} Analysis`,
                description: `Analysis for ${selectedFile.displayName}`,
                icon: FiCpu,
                onBack: handleBackToDashboard, // Pass the back handler to the header
                aiButton: {
                    onClick: () => {
                        // This will be handled by the AnalysisDashboard component
                        // We need to trigger the AI chat from here
                        // For now, we'll use a custom event to communicate with the AnalysisDashboard
                        window.dispatchEvent(new CustomEvent('openAiChat'));
                    }
                }
            };
        }

        if (path.includes('/datasources')) {
            return {
                title: 'Data Sources',
                description: 'Manage and analyze your data sources',
                icon: FiDatabase,
                onBack: handleBackToDashboard
            };
        }

        return {
            title: 'Dashboard',
            description: 'Welcome back! Here\'s your data overview',
            icon: FiBarChart2,
            onBack: null
        };
    };

    const { title, description, icon, onBack, aiButton } = getHeaderInfo();

    // --- Export Button for Header ---
    const exportButton = (showAnalysis && analysis && selectedFile) ? (
        <div className="relative export-menu-container">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 text-sm sm:text-base border border-white/30"
            >
                <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Export Data</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </motion.button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="py-2">
                        <button
                            onClick={() => {
                                handleExportToExcel();
                                setShowExportMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
                                <path d="M6 7h8v2H6V7zm0 4h8v2H6v-2z" />
                            </svg>
                            <div>
                                <div className="font-medium">Export as Excel</div>
                                <div className="text-xs text-gray-500">Complete data in spreadsheet format</div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                handleExportToJSON();
                                setShowExportMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <div className="font-medium">Export as JSON</div>
                                <div className="text-xs text-gray-500">Structured data for developers</div>
                            </div>
                        </button>
                    </div>
                    {/* <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Secure export - sensitive API data excluded
                        </p>
                    </div> */}
                </div>
            )}
        </div>
    ) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5">
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className={`flex-1 overflow-y-auto transition-all duration-300 w-full ml-0 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
                    <Routes>
                        <Route index element={
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <Header
                                    title={title}
                                    description={description}
                                    icon={icon}
                                    setSidebarOpen={setSidebarOpen}
                                    sidebarOpen={sidebarOpen}
                                    onBack={onBack}
                                    aiButton={aiButton}
                                    exportButton={exportButton}
                                />

                                {/* Content */}
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <div className="max-w-7xl mx-auto">
                                        <DashboardContent />
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="dashboard" element={
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <Header
                                    title={title}
                                    description={description}
                                    icon={icon}
                                    setSidebarOpen={setSidebarOpen}
                                    sidebarOpen={sidebarOpen}
                                    onBack={onBack}
                                    aiButton={aiButton}
                                    exportButton={exportButton}
                                />

                                {/* Content */}
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <div className="max-w-7xl mx-auto">
                                        <DashboardContent />
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="data-sources" element={
                            <DataSources
                                userFiles={userFiles}
                                isLoading={isLoadingFiles}
                                handleLoadFileAnalysis={handleLoadFileAnalysis}
                                isLoadingAnalysis={isLoadingAnalysis}
                            />
                        } />
                        <Route path="data-upload" element={<DataUpload />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="admin-dashboard" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/user/dashboard" replace />} />
                        <Route path="admin-testimonials" element={user && user.role === 'admin' ? <AdminTestimonials /> : <Navigate to="/user/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
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