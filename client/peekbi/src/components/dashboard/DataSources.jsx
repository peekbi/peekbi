import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCpu, FiDownload, FiCalendar, FiFile, FiDatabase, FiBarChart2, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const DataSources = () => {
    const navigate = useNavigate();
    const { user, getAllUserFiles } = useAuth();
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFiles = async () => {
        if (!user?._id) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAllUserFiles(user._id);
            if (result.success && result.data?.files) {
                const sortedFiles = result.data.files.sort((a, b) => 
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)
                );
                setFiles(sortedFiles);
            } else {
                setError(result.error || "Error fetching files");
            }
        } catch (err) {
            setError(err.message || "Error fetching files");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [user?._id, getAllUserFiles]);

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
        if (file.analysis) {
            navigate(`/user/dashboard?fileId=${file._id}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text">Data Sources</h1>
                <button
                    onClick={() => navigate('/user/data-upload')}
                    className="px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                    Upload New File
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7400B8]"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 rounded-lg text-red-600">{error}</div>
            ) : (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="space-y-4">
                        {files.length > 0 ? (
                            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {files.map((file) => (
                                    <motion.div
                                        key={file._id}
                                        whileHover={{ scale: 1.01 }}
                                        onClick={() => handleFileSelect(file)}
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
                                                                {formatFileSize(file.sizeInBytes)}
                                                            </span>
                                                            <span className="flex items-center text-xs text-gray-500">
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
                                                            navigate(`/user/dashboard?fileId=${file._id}`);
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
                                    <FiDatabase className="w-4 h-4" />
                                    <span>Upload your first file</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default DataSources; 