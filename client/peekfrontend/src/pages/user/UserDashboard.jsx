import { useState, useEffect, useRef } from 'react';
import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiBarChart2, FiCpu, FiActivity, FiFile, FiDownload, FiCalendar, FiDatabase, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

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
                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 bg-white/60 backdrop-blur-sm border ${
                                selectedFile?._id === file._id
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
        
        switch(category) {
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