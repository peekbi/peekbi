import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiRefreshCw, FiFileText, FiBarChart2, FiTrendingUp, FiDatabase, FiLoader } from 'react-icons/fi';
import Header from './Header';

const AnalysisStatus = ({ analysisId, onComplete }) => {
    const [status, setStatus] = useState('processing');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('Initializing analysis...');
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const steps = [
        { id: 'init', label: 'Initializing analysis...', icon: FiLoader },
        { id: 'data', label: 'Processing data...', icon: FiDatabase },
        { id: 'analysis', label: 'Running analysis...', icon: FiBarChart2 },
        { id: 'insights', label: 'Generating insights...', icon: FiTrendingUp },
        { id: 'report', label: 'Creating report...', icon: FiFileText },
        { id: 'complete', label: 'Analysis complete!', icon: FiCheckCircle }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStatus('completed');
                    setCurrentStep('Analysis complete!');
                    if (onComplete) {
                        onComplete({
                            id: analysisId,
                            status: 'completed',
                            results: {
                                kpis: [
                                    { name: 'Total Revenue', value: '$1,234,567', change: '+12.5%', trend: 'up' },
                                    { name: 'Customer Count', value: '45,678', change: '+8.2%', trend: 'up' },
                                    { name: 'Conversion Rate', value: '3.2%', change: '-0.5%', trend: 'down' },
                                    { name: 'Average Order', value: '$89.45', change: '+15.3%', trend: 'up' }
                                ],
                                insights: [
                                    'Revenue increased by 12.5% compared to last month',
                                    'Customer acquisition cost decreased by 8%',
                                    'Top performing product category: Electronics',
                                    'Peak sales hours: 2-4 PM and 8-10 PM'
                                ]
                            }
                        });
                    }
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [analysisId, onComplete]);

    useEffect(() => {
        const stepIndex = Math.floor((progress / 100) * steps.length);
        if (stepIndex < steps.length) {
            setCurrentStep(steps[stepIndex].label);
        }
    }, [progress, steps]);

    const getStatusIcon = () => {
        switch (status) {
            case 'processing':
                return <FiRefreshCw className="w-6 h-6 animate-spin" />;
            case 'completed':
                return <FiCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':
                return <FiXCircle className="w-6 h-6 text-red-500" />;
            default:
                return <FiClock className="w-6 h-6" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'processing':
                return 'text-blue-600';
            case 'completed':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    if (error) {
        return (
            <div className="h-full flex flex-col">
                <Header
                    title="Analysis Error"
                    description="Something went wrong during analysis"
                    icon={FiAlertCircle}
                />
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiXCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Analysis Failed</h3>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200 font-medium shadow-lg"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <Header
                title="Analysis in Progress"
                description="Processing your data and generating insights"
                icon={FiBarChart2}
            />
            
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                    {getStatusIcon()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Analysis Progress</h2>
                                    <p className={`text-lg font-medium ${getStatusColor()}`}>
                                        {status === 'processing' ? 'Processing...' : status === 'completed' ? 'Completed!' : 'Error'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-[#7400B8]">{Math.round(progress)}%</div>
                                <div className="text-sm text-gray-600">Complete</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Current Step */}
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-800">{currentStep}</p>
                        </div>
                    </motion.div>

                    {/* Steps Timeline */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
        >
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Analysis Steps</h3>
            <div className="space-y-4">
                            {steps.map((step, index) => {
                                const isActive = currentStep === step.label;
                                const isCompleted = progress > (index / steps.length) * 100;
                                const Icon = step.icon;
                                
                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 border border-[#7400B8]/20' 
                                                : isCompleted 
                                                    ? 'bg-green-50/50 border border-green-200/50' 
                                                    : 'bg-gray-50/50 border border-gray-200/50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA]' 
                                                : isCompleted 
                                                    ? 'bg-green-500' 
                                                    : 'bg-gray-300'
                                        }`}>
                                            {isActive ? (
                                                <FiLoader className="w-6 h-6 text-white animate-spin" />
                                            ) : isCompleted ? (
                                                <FiCheckCircle className="w-6 h-6 text-white" />
                                            ) : (
                                                <Icon className="w-6 h-6 text-white" />
                                            )}
                    </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                isActive 
                                                    ? 'text-[#7400B8]' 
                                                    : isCompleted 
                                                        ? 'text-green-700' 
                                                        : 'text-gray-600'
                                            }`}>
                                                {step.label}
                                            </p>
                    </div>
                                        {isActive && (
                                            <div className="w-3 h-3 bg-[#7400B8] rounded-full animate-pulse" />
                                        )}
                                    </motion.div>
                                );
                            })}
                    </div>
                    </motion.div>

                    {/* Estimated Time */}
                    {status === 'processing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 bg-gradient-to-r from-[#7400B8]/5 to-[#9B4DCA]/5 rounded-2xl p-6 border border-[#7400B8]/10"
                        >
                            <div className="flex items-center justify-center space-x-4">
                                <FiClock className="w-6 h-6 text-[#7400B8]" />
                                <p className="text-gray-700 font-medium">
                                    Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 10))} minutes
                                </p>
                    </div>
                        </motion.div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisStatus;