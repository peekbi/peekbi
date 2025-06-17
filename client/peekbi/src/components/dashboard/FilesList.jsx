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
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text">Your Files</h2>
                <button
                    onClick={() => navigate('/user/data-upload')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Upload</span>
                </button>
            </div>

            <div className="space-y-4">
                {isLoadingFiles ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7400B8]"></div>
                    </div>
                ) : fileError ? (
                    <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">{fileError}</div>
                ) : (
                    <div>
                        {userFiles.length > 0 ? (
                            <div className="space-y-4">
                                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {userFiles.map((file) => (
                                        <motion.div
                                            key={file._id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => setSelectedFile(file)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                                                selectedFile?._id === file._id
                                                    ? 'bg-[#F9F4FF] border-2 border-[#7400B8]/30 shadow-md'
                                                    : 'hover:bg-gray-50 border border-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#7400B8]/10 flex items-center justify-center">
                                                            <FiFile className="w-5 h-5 text-[#7400B8]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                                {file.originalName}
                                                            </p>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <span className="flex items-center text-xs text-gray-500">
                                                                    <FiDatabase className="w-3 h-3 mr-1" />
                                                                    {file.fileCategory}
                                                                </span>
                                                                <span className="flex items-center text-xs text-gray-500">
                                                                    <FiBarChart2 className="w-3 h-3 mr-1" />
                                                                    {formatFileSize(file.sizeInBytes)}
                                                                </span>
                                                                <span className="flex items-center text-xs text-gray-500">
                                                                    <FiCalendar className="w-3 h-3 mr-1" />
                                                                    {formatDate(file.uploadedAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {file.analysis ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/user/dashboard?fileId=${file._id}`);
                                                            }}
                                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-1"
                                                        >
                                                            <FiBarChart2 className="w-3 h-3" />
                                                            <span>View Analysis</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLoadFileAnalysis(file._id);
                                                            }}
                                                            className="px-3 py-1 text-xs bg-[#7400B8] text-white rounded-full hover:bg-[#9B4DCA] transition-colors flex items-center space-x-1"
                                                        >
                                                            <FiCpu className="w-3 h-3" />
                                                            <span>Analyze</span>
                                                        </button>
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
                                        className="w-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3"
                                    >
                                        <FiCpu className="w-5 h-5" />
                                        <span>Analyze Data</span>
                                    </motion.button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7400B8]/10 flex items-center justify-center">
                                    <FiFile className="w-8 h-8 text-[#7400B8]" />
                                </div>
                                <p className="text-gray-500 mb-2">No files uploaded yet</p>
                                <button
                                    onClick={() => navigate('/user/data-upload')}
                                    className="text-[#7400B8] hover:text-[#9B4DCA] font-medium flex items-center space-x-2 mx-auto"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    <span>Upload your first file</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
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