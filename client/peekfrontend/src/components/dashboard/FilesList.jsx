import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCpu, FiDownload, FiCalendar, FiFile, FiDatabase, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FilesList = ({
    userFiles,
    isLoadingFiles,
    fileError,
    selectedFile,
    setSelectedFile,
    isLoadingAnalysis,
    analysis,
    handleLoadFileAnalysis
}) => {
    const navigate = useNavigate();

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 sm:p-6 shadow-xl border border-white/20"
        >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                        <FiDatabase className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-xl font-bold text-gray-800">Your Files</h2>
                        <p className="text-gray-600 text-xs sm:text-sm">Manage and analyze your data files</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/user/data-upload')}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-xs sm:text-base"
                >
                    <FiPlus className="w-4 h-4" />
                    <span className="font-medium">Upload</span>
                </motion.button>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {isLoadingFiles ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                            </div>
                            <p className="text-gray-600 font-medium text-sm sm:text-base">Loading files...</p>
                        </div>
                    </div>
                ) : fileError ? (
                    <div className="p-4 sm:p-6 bg-red-50/80 backdrop-blur-sm rounded-xl text-red-600 text-xs sm:text-sm border border-red-200">{fileError}</div>
                ) : (
                    <div>
                        {userFiles.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-3 pr-0 sm:pr-2 custom-scrollbar">
                                    {userFiles.map((file, index) => (
                                        <motion.div
                                            key={file._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -2 }}
                                            onClick={() => setSelectedFile(file)}
                                            className={`p-3 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-white/60 backdrop-blur-sm border ${
                                                selectedFile?._id === file._id
                                                    ? 'border-[#7400B8]/50 shadow-lg bg-gradient-to-r from-[#F9F4FF] to-white'
                                                    : 'border-white/30 hover:border-[#7400B8]/30 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] flex items-center justify-center">
                                                            <FiFile className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm sm:text-lg font-semibold text-gray-800 truncate mb-1 sm:mb-2">
                                                                {file.originalName}
                                                            </p>
                                                            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                                                                <span className="flex items-center text-gray-600">
                                                                    <FiDatabase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                                    {file.fileCategory}
                                                                </span>
                                                                <span className="flex items-center text-gray-600">
                                                                    <FiDownload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                                    {formatFileSize(file.sizeInBytes)}
                                                                </span>
                                                                <span className="flex items-center text-gray-600">
                                                                    <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                                    {formatDate(file.uploadedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                    {file.analysis ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/user/dashboard?fileId=${file._id}`);
                                                            }}
                                                            className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center space-x-2 text-xs sm:text-base font-medium shadow-lg"
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
                                                            className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-xs sm:text-base font-medium"
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

                                {selectedFile && !isLoadingAnalysis && !analysis && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleLoadFileAnalysis(selectedFile._id)}
                                        className="w-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-base font-medium"
                                    >
                                        <FiCpu className="w-5 h-5" />
                                        <span>Analyze Data</span>
                                    </motion.button>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-10 sm:py-16"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 flex items-center justify-center">
                                    <FiFile className="w-8 h-8 sm:w-12 sm:h-12 text-[#7400B8]" />
                                </div>
                                <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">No files uploaded yet</h3>
                                <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-base">Upload your first data file to get started with analytics</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/user/data-upload')}
                                    className="px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto text-xs sm:text-base"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    <span>Upload your first file</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                )}
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
            `}</style>
        </motion.div>
    );
};

export default FilesList;