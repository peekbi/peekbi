import React from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const ApiLogs = ({ logs }) => {
    if (!logs || logs.length === 0) return null;

    const getIconForType = (type) => {
        switch (type) {
            case 'info':
                return <FiInfo className="w-4 h-4 text-blue-500" />;
            case 'error':
                return <FiAlertCircle className="w-4 h-4 text-red-500" />;
            case 'success':
                return <FiCheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <FiInfo className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text mb-4">
                Processing Logs
            </h3>
            <div className="max-h-[200px] overflow-y-auto bg-gray-50 rounded-xl p-4 space-y-3">
                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start space-x-3 text-sm"
                    >
                        <div className="mt-0.5">{getIconForType(log.type)}</div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={`font-medium ${log.type === 'error' ? 'text-red-600' : ''} ${log.type === 'success' ? 'text-green-600' : ''} ${log.type === 'info' ? 'text-blue-600' : ''}`}>
                                    {log.message}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default ApiLogs;