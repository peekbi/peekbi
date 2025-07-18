import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCpu, FiDownload, FiCalendar, FiFile, FiDatabase, FiBarChart2, FiCheck, FiLoader, FiFileText, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Header from './Header';
import toast from 'react-hot-toast';

const DataSources = ({ userFiles = [], isLoading = true, handleLoadFileAnalysis, isLoadingAnalysis = false }) => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [previouslyAnalyzing, setPreviouslyAnalyzing] = useState(false);

    // Track when analysis completes (isLoadingAnalysis changes from true to false)
    useEffect(() => {
        // If we were analyzing but now we're not, analysis just completed
        if (previouslyAnalyzing && !isLoadingAnalysis && selectedFile) {
            // Find the updated file with analysis data
            const updatedFile = userFiles.find(file => file._id === selectedFile._id);
            if (updatedFile && updatedFile.analysis) {
                // Update the selected file with the latest data
                setSelectedFile(updatedFile);
            }
        }
        
        // Update the previous analyzing state
        setPreviouslyAnalyzing(isLoadingAnalysis);
    }, [isLoadingAnalysis, selectedFile, userFiles]);

    // Update selected file when userFiles changes (to get latest analysis data)
    useEffect(() => {
        if (selectedFile && userFiles.length > 0) {
            // Find the updated version of the selected file
            const updatedFile = userFiles.find(file => file._id === selectedFile._id);
            if (updatedFile) {
                setSelectedFile(updatedFile);
            }
        }
    }, [userFiles]);

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    // Handle analysis button click
    const handleAnalyzeClick = (e, fileId) => {
        e.stopPropagation();
        // Find the file to analyze
        const fileToAnalyze = userFiles.find(f => f._id === fileId);
        setSelectedFile(fileToAnalyze);
        // Call the parent component's analysis handler
        try {
            handleLoadFileAnalysis(fileId);
            toast.success('Analysis started!');
        } catch (err) {
            toast.error(err.message || 'Failed to start analysis');
        }
    };

    // Check if a file has analysis data
    const hasAnalysis = (file) => {
        // Check if file has analysis directly
        if (file.analysis) return true;
        
        // Check if it's the currently selected file and analysis just completed
        if (selectedFile && selectedFile._id === file._id && selectedFile.analysis) return true;
        
        // Check if the updated version in userFiles has analysis
        const updatedFile = userFiles.find(f => f._id === file._id);
        return updatedFile && updatedFile.analysis;
    };

    // Show loading analysis UI for selected file
    const renderAnalysisLoading = () => {
        if (!selectedFile || !isLoadingAnalysis) return null;
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-20 animate-pulse"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] animate-spin"></div>
                            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                <FiCpu className="w-8 h-8 text-[#7400B8]" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Data</h2>
                        <p className="text-gray-600 mb-6">Processing {selectedFile.originalName}...</p>
                        
                        <div className="w-full max-w-md mx-auto">
                            <div className="relative">
                                <div className="flex mb-3 items-center justify-between">
                                    <span className="text-sm font-medium text-[#7400B8]">Processing</span>
                                    <span className="text-sm text-gray-500">Please wait...</span>
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
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-6 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your data sources...</h2>
                        <p className="text-gray-600 mb-2">Please wait while we fetch your files</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        toast.error(error);
    }

    return (
        <div className="h-full flex flex-col">
            {/* Show analysis loading overlay if analyzing */}
            {renderAnalysisLoading()}
            
            {/* Header */}
            <Header
                title="Data Sources"
                description="Manage and analyze your uploaded data files"
                icon={FiDatabase}
                actionButton={
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/user/data-upload')}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                    >
                        <FiPlus className="w-5 h-5" />
                        <span>Upload New File</span>
                    </motion.button>
                }
            />

            {/* Content */}
            <div className="flex-1 px-8 pb-8 mt-4 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Dashboard Summary (scrolls away on mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                    <FiFileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Dashboard Summary</h2>
                                    <p className="text-gray-600 text-sm">Quick overview of your data and analytics</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#F9F4FF] to-white p-4 lg:p-6 rounded-2xl border border-[#7400B8]/10 shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Total Files</h3>
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7400B8]/10 rounded-xl flex items-center justify-center">
                                            <FiFileText className="w-4 h-4 lg:w-5 lg:h-5 text-[#7400B8]" />
                                        </div>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-[#7400B8]">{userFiles?.length || 0}</p>
                                    <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                        {userFiles?.length === 1 ? '1 file uploaded' : `${userFiles?.length || 0} files uploaded`}
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#F9F4FF] to-white p-4 lg:p-6 rounded-2xl border border-[#7400B8]/10 shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Analyzed Files</h3>
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7400B8]/10 rounded-xl flex items-center justify-center">
                                            <FiBarChart2 className="w-4 h-4 lg:w-5 lg:h-5 text-[#7400B8]" />
                                        </div>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-[#7400B8]">
                                        {userFiles?.filter(file => file.analysis)?.length || 0}
                                    </p>
                                    <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                        {Math.round(((userFiles?.filter(file => file.analysis)?.length || 0) / (userFiles?.length || 1)) * 100)}% analyzed
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#F9F4FF] to-white p-4 lg:p-6 rounded-2xl border border-[#7400B8]/10 shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Total Storage</h3>
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7400B8]/10 rounded-xl flex items-center justify-center">
                                            <FiDatabase className="w-4 h-4 lg:w-5 lg:h-5 text-[#7400B8]" />
                                        </div>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-[#7400B8]">
                                        {formatFileSize(userFiles?.reduce((acc, file) => acc + (file.sizeInBytes || 0), 0) || 0)}
                                    </p>
                                    <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                        Used storage space
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#F9F4FF] to-white p-4 lg:p-6 rounded-2xl border border-[#7400B8]/10 shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Processing</h3>
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7400B8]/10 rounded-xl flex items-center justify-center">
                                            <FiActivity className="w-4 h-4 lg:w-5 lg:h-5 text-[#7400B8]" />
                                        </div>
                                    </div>
                                    <p className="text-2xl lg:text-3xl font-bold text-[#7400B8]">{isLoadingAnalysis ? '1' : '0'}</p>
                                    <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                        {isLoadingAnalysis ? 'Analysis in progress' : 'No active analysis'}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                    {/* File List (scrolls up under summary) */}
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center py-16"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiBarChart2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Files</h3>
                                <p className="text-gray-600">{error}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div>
                            {userFiles.length > 0 ? (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                                        {userFiles.map((file, index) => (
                                            <motion.div
                                                key={file._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                onClick={() => handleFileSelect(file)}
                                                className={`bg-gradient-to-br from-[#F9F4FF] to-white p-3 sm:p-4 lg:p-6 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between min-h-[120px] sm:h-48 lg:h-52 ${
                                                    selectedFile?._id === file._id
                                                        ? 'border-[#7400B8]/50 shadow-lg'
                                                        : 'border-[#7400B8]/10 hover:border-[#7400B8]/30 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 lg:mb-4">
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] flex items-center justify-center">
                                                            <FiFile className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 truncate">
                                                                {file.originalName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <FiDatabase className="w-3 h-3 mr-1" />
                                                            <span className="truncate">{file.fileCategory}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <FiDownload className="w-3 h-3 mr-1" />
                                                            <span>{formatFileSize(file.sizeInBytes)}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-600">
                                                            <FiCalendar className="w-3 h-3 mr-1" />
                                                            <span>{formatDate(file.uploadedAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:mt-3  lg:mt-4">
                                                    {hasAnalysis(file) ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                                // Navigate to dashboard with this file's analysis
                                                                navigate(`/user/dashboard?fileId=${file._id}&analysisComplete=true`);
                                                        }}
                                                            className="w-full px-2 sm:px-3 lg:px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium shadow-lg"
                                                    >
                                                            <FiBarChart2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                                                        <span>View Analysis</span>
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => handleAnalyzeClick(e, file._id)}
                                                            className="w-full px-2 sm:px-3 lg:px-3 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium"
                                                        >
                                                            <FiCpu className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                                                        <span>Analyze</span>
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 flex items-center justify-center">
                                        <FiFile className="w-12 h-12 text-[#7400B8]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Sources Found</h3>
                                    <p className="text-gray-600 mb-6">Upload your first data file to get started with analytics</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/user/data-upload')}
                                        className="px-8 py-4 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        <span>Upload Your First File</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #7400B8;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9B4DCA;
                }
                
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default DataSources; 