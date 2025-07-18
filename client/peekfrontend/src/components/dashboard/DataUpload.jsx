import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiDatabase, FiCheckCircle, FiX, FiFileText, FiCpu, FiShoppingCart, FiDollarSign, FiActivity, FiPackage, FiBook, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const INDUSTRY_CATEGORIES = {
    finance: {
        name: 'Finance',
        icon: <FiDollarSign className="w-8 h-8" />,
        description: 'Financial analytics, risk assessment, and investment insights',
        color: 'from-blue-400/40 to-blue-500/40 hover:from-blue-400/50 hover:to-blue-500/50',
        iconColor: 'from-blue-500 to-blue-600',
        metrics: ['Transactions', 'Revenue', 'Expenses', 'Investment Returns']
    },
    education: {
        name: 'Education',
        icon: <FiBook className="w-8 h-8" />,
        description: 'Student performance, enrollment analytics, and educational outcomes',
        color: 'from-green-400/40 to-green-500/40 hover:from-green-400/50 hover:to-green-500/50',
        iconColor: 'from-green-500 to-green-600',
        metrics: ['Student Performance', 'Attendance', 'Course Completion', 'Resource Usage']
    },
    retail: {
        name: 'Retail & E-commerce',
        icon: <FiShoppingCart className="w-8 h-8" />,
        description: 'Sales analytics, inventory management, and customer behavior',
        color: 'from-purple-400/40 to-purple-500/40 hover:from-purple-400/50 hover:to-purple-500/50',
        iconColor: 'from-purple-500 to-purple-600',
        metrics: ['Sales', 'Inventory', 'Customer Demographics', 'Product Performance']
    },
    manufacturing: {
        name: 'Manufacturing',
        icon: <FiPackage className="w-8 h-8" />,
        description: 'Production efficiency, quality control, and supply chain analytics',
        color: 'from-orange-400/40 to-orange-500/40 hover:from-orange-400/50 hover:to-orange-500/50',
        iconColor: 'from-orange-500 to-orange-600',
        metrics: ['Production Volume', 'Quality Metrics', 'Supply Chain', 'Equipment Performance']
    },
    healthcare: {
        name: 'Healthcare',
        icon: <FiActivity className="w-8 h-8" />,
        description: 'Patient analytics, operational efficiency, and healthcare outcomes',
        color: 'from-red-400/40 to-red-500/40 hover:from-red-400/50 hover:to-red-500/50',
        iconColor: 'from-red-500 to-red-600',
        metrics: ['Patient Records', 'Treatments', 'Outcomes', 'Resource Utilization']
    }
};

const DataUpload = () => {
    const { user, uploadFile } = useAuth();
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [uploadStep, setUploadStep] = useState('select'); // 'select' | 'category' | 'uploading'
    const [apiLogs, setApiLogs] = useState([]);
    const [logCounter, setLogCounter] = useState(0);
    const logIdRef = useRef(0); // Add a ref for generating unique log IDs

    // Helper function to generate unique log ID
    const generateLogId = () => {
        logIdRef.current += 1;
        return `${logIdRef.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Handle file input change
    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    // Process the files
    const handleFiles = (fileList) => {
        const newFile = fileList[0];
        if (newFile) {
            setFiles([newFile]);
        }
    };

    // Remove a file from the list
    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    // Handle file upload
    const uploadFiles = async () => {
        if (files.length === 0 || !selectedIndustry) return;
        setUploadStep('uploading');
        setUploading(true);
        setApiLogs([]); // Clear previous logs
        logIdRef.current = 0; // Reset log ID counter
        let uploadedCount = 0;
        const responses = [];
        const category = selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1).toLowerCase();
        try {
            setApiLogs(prev => [...prev, {
                id: generateLogId(),
                type: 'info',
                message: `Starting upload for ${files[0].name}...`,
                timestamp: new Date().toISOString()
            }]);
            const file = files[0];
            setApiLogs(prev => [...prev, {
                id: generateLogId(),
                type: 'info',
                message: `Preparing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
                timestamp: new Date().toISOString()
            }]);

            const response = await uploadFile(user._id, file, category);
            const isSuccessful = response.success === true || 
                (response.success === false && response.error === "File uploaded successfully.");
            setApiLogs(prev => [...prev, {
                id: generateLogId(),
                type: 'info',
                message: `Server response: ${response.error || 'Success'}`,
                timestamp: new Date().toISOString()
            }]);
            if (isSuccessful) {
                const normalizedResponse = {
                    ...response,
                    success: true,
                    message: response.error || 'File uploaded successfully'
                };
                responses.push({
                    fileName: file.name,
                    response: normalizedResponse
                });
                setApiLogs(prev => [...prev, {
                    id: generateLogId(),
                    type: 'success',
                    message: `Successfully uploaded ${file.name}`,
                    timestamp: new Date().toISOString()
                }]);
                uploadedCount++;
                setUploadProgress(100);
                setApiLogs(prev => [...prev, {
                    id: generateLogId(),
                    type: 'success',
                    message: 'Upload completed successfully! Redirecting to dashboard...',
                    timestamp: new Date().toISOString()
                }]);
                toast.success('File uploaded successfully!');
                setTimeout(() => {
                    setUploading(false);
                    navigate('/user/dashboard', {
                        state: { 
                            uploadedFiles: files.map(f => f.name),
                            responses: responses,
                            industry: selectedIndustry,
                            refreshFiles: true
                        }
                    });
                }, 500);
            } else {
                throw new Error(response.error || 'Upload failed');
            }
        } catch (err) {
            setApiLogs(prev => [...prev, {
                id: generateLogId(),
                type: 'error',
                message: `Upload failed: ${err.message || 'Unknown error'}`,
                timestamp: new Date().toISOString()
            }]);
            setMessage('Upload failed. Please try again.');
            setUploading(false);
            setUploadStep('select');
            toast.error(err.message || 'Upload failed');
        }
    };

    const handleContinue = () => {
        if (files.length > 0) {
            setUploadStep('category');
        }
    };

    const handleSkip = () => {
        navigate('/user/dashboard', {
            state: { 
                uploadedFiles: [],
                responses: [],
                industry: null
            }
        });
    };

    // Add loading spinner overlay (like Profile) when uploading
    if (uploading || uploadStep === 'uploading') {
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Uploading your files...</h2>
                        <p className="text-gray-600 mb-2">Please wait while we process your data</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] p-4 sm:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <FiUpload className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Data Upload</h1>
                            <p className="text-white/80">Upload and analyze your data files</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-6 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                            {uploadStep === 'select' ? 'Upload Your Data' :
                             uploadStep === 'category' ? 'Select Industry Category' :
                             'Uploading Files'}
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600">
                            {uploadStep === 'select' ? 'Upload your data files to get started with PeekBI analytics' :
                             uploadStep === 'category' ? 'Choose your industry to get relevant insights' :
                             'Please wait while we process your data'}
                        </p>
                    </div>
                    
                    <div className={`grid ${uploadStep === 'select' && !selectedIndustry ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-12 items-start`}>
                        {/* Left side - Content Area */}
                        <div className={`space-y-8 ${uploadStep === 'category' ? 'max-w-6xl mx-auto' : ''}`}>
                            {uploadStep === 'select' && (
                                <div className="space-y-8">
                                    {/* Upload Area */}
                                    {!uploading ? (
                                        <div className="space-y-8">
                                            <motion.div
                                                className={`border-2 border-dashed rounded-3xl p-6 sm:p-12 text-center transition-all duration-300 bg-white/60 backdrop-blur-sm ${
                                                    dragActive ? 'border-[#7400B8] bg-purple-50/80 scale-105' : 'border-gray-300 hover:border-[#7400B8] hover:bg-purple-50/50'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <motion.div 
                                                    className="flex flex-col items-center justify-center gap-6"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <motion.div
                                                        className="bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] p-4 rounded-full shadow-lg"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FiUpload className="w-10 h-10 text-white" />
                                                    </motion.div>
                                                    <motion.div 
                                                        className="space-y-2"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.1 }}
                                                    >
                                                        <p className="text-xl font-medium text-gray-700">Upload your data file</p>
                                                        <p className="text-gray-500">or</p>
                                                    </motion.div>
                                                    <motion.label
                                                        className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-8 py-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 text-lg font-medium"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Choose File
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={handleChange}
                                                            accept=".csv,.xlsx,.json,.sql"
                                                        />
                                                    </motion.label>
                                                    <motion.p 
                                                        className="text-gray-500 text-sm"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3, delay: 0.2 }}
                                                    >
                                                        Supported formats: CSV, Excel, JSON, SQL (Max 1 file)
                                                    </motion.p>
                                                </motion.div>
                                            </motion.div>

                                            {/* File List */}
                                            {files.length > 0 && (
                                                <motion.div
                                                    className="mt-8"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Selected File</h3>
                                                    <div className="space-y-3">
                                                        <motion.div
                                                            className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 hover:border-[#7400B8]/50 transition-colors duration-200"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="bg-purple-100 p-2 rounded-xl mr-3">
                                                                    <FiFile className="w-5 h-5 text-[#7400B8]" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800">{files[0].name}</p>
                                                                    <p className="text-xs text-gray-500">{(files[0].size / 1024).toFixed(2)} KB</p>
                                                                </div>
                                                            </div>
                                                            <motion.button
                                                                onClick={() => removeFile(0)}
                                                                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <FiX className="w-5 h-5" />
                                                            </motion.button>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex justify-between pt-6">
                                                {/* <motion.button
                                                    onClick={handleSkip}
                                                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Skip Upload
                                                </motion.button> */}
                                                <div className="flex gap-4">
                                                    <motion.button
                                                        onClick={() => navigate('/')}
                                                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Cancel
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={handleContinue}
                                                        disabled={files.length === 0}
                                                        className={`px-6 py-3 rounded-xl text-white font-medium ${
                                                            files.length > 0
                                                                ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] hover:shadow-lg'
                                                                : 'bg-gray-400 cursor-not-allowed'
                                                        } transition-all duration-200 flex items-center gap-2`}
                                                        whileHover={files.length > 0 ? { scale: 1.02 } : {}}
                                                        whileTap={files.length > 0 ? { scale: 0.98 } : {}}
                                                    >
                                                        <FiUpload className="w-5 h-5" />
                                                        <span>Continue</span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <motion.div
                                                className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex flex-col items-center justify-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 border-4 border-[#7400B8] border-opacity-25 rounded-full"></div>
                                                        <motion.div
                                                            className="w-24 h-24 border-4 border-[#7400B8] rounded-full absolute top-0 left-0"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            style={{
                                                                clipPath: `polygon(50% 50%, 50% 0%, ${uploadProgress}% 0%, ${uploadProgress}% 100%, 50% 100%)`,
                                                                transform: 'rotate(90deg)'
                                                            }}
                                                        ></motion.div>
                                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                            <span className="text-[#7400B8] font-bold text-2xl">{uploadProgress}%</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xl font-medium text-gray-700">Uploading your files...</p>
                                                    <p className="text-gray-500">Please wait while we process your data</p>
                                                </div>
                                            </motion.div>

                                            {/* File List During Upload */}
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                {files.map((file) => (
                                                    <motion.div
                                                        key={`upload-${file.name}-${file.size}-${file.lastModified}`}
                                                        className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="bg-purple-100 p-2 rounded-xl mr-3">
                                                                <FiFile className="w-5 h-5 text-[#7400B8]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                                <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                    <motion.div
                                                                        className="h-1.5 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full"
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${uploadProgress}%` }}
                                                                        transition={{ duration: 0.3 }}
                                                                    ></motion.div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-[#7400B8]">{uploadProgress}%</div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {uploadStep === 'category' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-6xl mx-auto"
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* First row - 1 column on mobile, 3 columns on larger screens */}
                                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            {Object.entries(INDUSTRY_CATEGORIES).slice(0, 3).map(([key, category]) => (
                                                <motion.button
                                                    key={key}
                                                    onClick={() => setSelectedIndustry(key)}
                                                    className={`relative p-4 sm:p-6 rounded-2xl text-left transition-all duration-300 bg-white/60 backdrop-blur-sm ${
                                                        selectedIndustry === key
                                                            ? 'ring-2 ring-[#7400B8] ring-offset-1 shadow-lg'
                                                            : 'hover:ring-2 hover:ring-[#7400B8]/50 hover:ring-offset-1 hover:shadow-md'
                                                    } bg-gradient-to-br ${category.color}`}
                                                    whileHover={{ scale: 1.01, y: -1 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${category.iconColor} text-white shadow-sm`}>
                                                            {category.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-medium text-gray-800 mb-1">{category.name}</h3>
                                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{category.description}</p>
                                                        </div>
                                                    </div>
                                                    {selectedIndustry === key && (
                                                        <motion.div
                                                            className="absolute top-2 right-2"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                        >
                                                            <FiCheckCircle className="w-4 h-4 text-[#7400B8]" />
                                                        </motion.div>
                                                    )}
                                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                                        <h4 className="text-xs font-medium text-gray-700 mb-1">Key Metrics:</h4>
                                                        <ul className="space-y-0.5">
                                                            {category.metrics.map((metric, idx) => (
                                                                <li key={`${key}-metric-${idx}`} className="text-xs text-gray-600 flex items-center">
                                                                    <FiCheck className="w-3 h-3 text-[#7400B8] mr-1.5" />
                                                                    {metric}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                        {/* Second row - 2 columns */}
                                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(INDUSTRY_CATEGORIES).slice(3).map(([key, category]) => (
                                                <motion.button
                                                    key={key}
                                                    onClick={() => setSelectedIndustry(key)}
                                                    className={`relative p-4 sm:p-6 rounded-2xl text-left transition-all duration-300 bg-white/60 backdrop-blur-sm ${
                                                        selectedIndustry === key
                                                            ? 'ring-2 ring-[#7400B8] ring-offset-1 shadow-lg'
                                                            : 'hover:ring-2 hover:ring-[#7400B8]/50 hover:ring-offset-1 hover:shadow-md'
                                                    } bg-gradient-to-br ${category.color}`}
                                                    whileHover={{ scale: 1.01, y: -1 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${category.iconColor} text-white shadow-sm`}>
                                                            {category.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-medium text-gray-800 mb-1">{category.name}</h3>
                                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{category.description}</p>
                                                        </div>
                                                    </div>
                                                    {selectedIndustry === key && (
                                                        <motion.div
                                                            className="absolute top-2 right-2"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                        >
                                                            <FiCheckCircle className="w-4 h-4 text-[#7400B8]" />
                                                        </motion.div>
                                                    )}
                                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                                        <h4 className="text-xs font-medium text-gray-700 mb-1">Key Metrics:</h4>
                                                        <ul className="space-y-0.5">
                                                            {category.metrics.map((metric, idx) => (
                                                                <li key={`${key}-metric-${idx}`} className="text-xs text-gray-600 flex items-center">
                                                                    <FiCheck className="w-3 h-3 text-[#7400B8] mr-1.5" />
                                                                    {metric}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between mt-8">
                                        <motion.button
                                            onClick={handleSkip}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm mb-4 sm:mb-0"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Skip Upload
                                        </motion.button>
                                        <div className="flex gap-3">
                                            <motion.button
                                                onClick={() => setUploadStep('select')}
                                                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Back to Files
                                            </motion.button>
                                            <motion.button
                                                onClick={uploadFiles}
                                                disabled={!selectedIndustry}
                                                className={`px-4 py-2 rounded-xl text-white font-medium text-sm ${
                                                    selectedIndustry
                                                        ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] hover:shadow-lg'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                } transition-all duration-200 flex items-center gap-2`}
                                                whileHover={selectedIndustry ? { scale: 1.02 } : {}}
                                                whileTap={selectedIndustry ? { scale: 0.98 } : {}}
                                            >
                                                <FiUpload className="w-4 h-4" />
                                                <span>Upload & Analyze</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {uploadStep === 'uploading' && (
                                <div className="space-y-8">
                                    <motion.div
                                        className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 border-4 border-[#7400B8] border-opacity-25 rounded-full"></div>
                                                <motion.div
                                                    className="w-24 h-24 border-4 border-[#7400B8] rounded-full absolute top-0 left-0"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    style={{
                                                        clipPath: `polygon(50% 50%, 50% 0%, ${uploadProgress}% 0%, ${uploadProgress}% 100%, 50% 100%)`,
                                                        transform: 'rotate(90deg)'
                                                    }}
                                                ></motion.div>
                                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                                    <span className="text-[#7400B8] font-bold text-2xl">{uploadProgress}%</span>
                                                </div>
                                            </div>
                                            <p className="text-xl font-medium text-gray-700">Uploading your files...</p>
                                            <p className="text-gray-500">Please wait while we process your data</p>
                                        </div>
                                    </motion.div>

                                    {/* API Logs Section */}
                                    <motion.div
                                        className="bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100 overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-800">Upload Logs</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <span className="text-xs text-gray-600">Info</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-gray-600">Success</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                    <span className="text-xs text-gray-600">Error</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto p-4 space-y-2">
                                            <AnimatePresence>
                                                {apiLogs.map((log) => (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`flex items-start gap-3 p-2 rounded-xl ${
                                                            log.type === 'error' ? 'bg-red-50' :
                                                            log.type === 'success' ? 'bg-green-50' :
                                                            'bg-blue-50'
                                                        }`}
                                                    >
                                                        <div className={`mt-1 ${
                                                            log.type === 'error' ? 'text-red-500' :
                                                            log.type === 'success' ? 'text-green-500' :
                                                            'text-blue-500'
                                                        }`}>
                                                            {log.type === 'error' ? <FiX className="w-4 h-4" /> :
                                                             log.type === 'success' ? <FiCheckCircle className="w-4 h-4" /> :
                                                             <FiDatabase className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${
                                                                log.type === 'error' ? 'text-red-700' :
                                                                log.type === 'success' ? 'text-green-700' :
                                                                'text-blue-700'
                                                            }`}>
                                                                {log.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {new Date(log.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>

                                    {/* File List During Upload */}
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                        {files.map((file) => (
                                            <motion.div
                                                key={`upload-progress-${file.name}-${file.size}-${file.lastModified}`}
                                                className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="flex items-center">
                                                    <div className="bg-purple-100 p-2 rounded-xl mr-3">
                                                        <FiFile className="w-5 h-5 text-[#7400B8]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                        <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                            <motion.div
                                                                className="h-1.5 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadProgress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            ></motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-[#7400B8]">{uploadProgress}%</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Skip button during upload */}
                                    {/* <div className="flex justify-center pt-6">
                                        <motion.button
                                            onClick={handleSkip}
                                            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Skip Upload
                                        </motion.button>
                                    </div> */}
                                </div>
                            )}
                        </div>

                        {/* Right side - Illustration (only show for initial file upload step) */}
                        {uploadStep === 'select' && !selectedIndustry && (
                            <div className="hidden lg:block">
                                <motion.div
                                    className="relative h-full"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <img
                                        src="/assets/upload.jpg"
                                        alt="Data Upload Illustration"
                                        className="w-full h-auto rounded-3xl"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400/purple/white?text=Upload+Your+Data";
                                        }}
                                    />
                                </motion.div>
                                <div className="mt-8 space-y-6">
                                    <motion.div
                                        className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-[#7400B8]/50 transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                    >
                                        <div className="bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] p-3 rounded-full text-white">
                                            <FiFileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800">Secure Upload</h3>
                                            <p className="text-gray-600">Your data is encrypted and securely processed</p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-[#7400B8]/50 transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.5 }}
                                    >
                                        <div className="bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] p-3 rounded-full text-white">
                                            <FiCpu className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800">AI-Powered Analysis</h3>
                                            <p className="text-gray-600">Get instant insights with our advanced analytics engine</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataUpload;