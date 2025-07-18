import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiFilter, FiDownload, FiTrash2, FiRefreshCw, FiInfo, FiCheckCircle, FiAlertCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Header from './Header';

const ApiLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - replace with actual API call
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const mockLogs = [
                    {
                        id: 1,
                        timestamp: new Date(Date.now() - 1000 * 60 * 5),
                        method: 'GET',
                        endpoint: '/api/data/upload',
                        status: 200,
                        duration: 245,
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ip: '192.168.1.100',
                        responseSize: '2.3KB'
                    },
                    {
                        id: 2,
                        timestamp: new Date(Date.now() - 1000 * 60 * 15),
                        method: 'POST',
                        endpoint: '/api/analysis/start',
                        status: 201,
                        duration: 1200,
                        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        ip: '192.168.1.101',
                        responseSize: '1.8KB'
                    },
                    {
                        id: 3,
                        timestamp: new Date(Date.now() - 1000 * 60 * 30),
                        method: 'GET',
                        endpoint: '/api/user/profile',
                        status: 401,
                        duration: 45,
                        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                        ip: '192.168.1.102',
                        responseSize: '0.5KB'
                    },
                    {
                        id: 4,
                        timestamp: new Date(Date.now() - 1000 * 60 * 60),
                        method: 'PUT',
                        endpoint: '/api/data/update',
                        status: 500,
                        duration: 3000,
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ip: '192.168.1.103',
                        responseSize: '0.2KB'
                    },
                    {
                        id: 5,
                        timestamp: new Date(Date.now() - 1000 * 60 * 120),
                        method: 'DELETE',
                        endpoint: '/api/files/123',
                        status: 204,
                        duration: 180,
                        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        ip: '192.168.1.104',
                        responseSize: '0KB'
                    }
                ];
                
                setLogs(mockLogs);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
        if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
        if (status >= 500) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-800';
            case 'POST': return 'bg-green-100 text-green-800';
            case 'PUT': return 'bg-yellow-100 text-yellow-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDuration = (ms) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleString();
    };

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || 
            (filter === 'success' && log.status >= 200 && log.status < 300) ||
            (filter === 'error' && log.status >= 400) ||
            (filter === 'warning' && log.status >= 300 && log.status < 400);
        
        const matchesSearch = searchTerm === '' || 
            log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.ip.includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    });

    const exportLogs = () => {
        const csvContent = [
            'Timestamp,Method,Endpoint,Status,Duration,IP,Response Size',
            ...filteredLogs.map(log => 
                `${formatTimestamp(log.timestamp)},${log.method},${log.endpoint},${log.status},${log.duration},${log.ip},${log.responseSize}`
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const clearLogs = () => {
        if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
            setLogs([]);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Header
                title="API Logs"
                description="Monitor and track API requests and responses"
                icon={FiActivity}
                actionButton={
                    <div className="flex space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportLogs}
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Export</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={clearLogs}
                            className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-xl hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2 border border-red-500/30 text-red-600"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Clear</span>
                        </motion.button>
                    </div>
                }
            />

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Filters and Search */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
                    >
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                        filter === 'all' 
                                            ? 'bg-[#7400B8] text-white' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    All ({logs.length})
                                </button>
                                <button
                                    onClick={() => setFilter('success')}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        filter === 'success' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    <FiCheckCircle className="w-4 h-4" />
                                    <span>Success ({logs.filter(l => l.status >= 200 && l.status < 300).length})</span>
                                </button>
                                <button
                                    onClick={() => setFilter('error')}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        filter === 'error' 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    <FiXCircle className="w-4 h-4" />
                                    <span>Errors ({logs.filter(l => l.status >= 400).length})</span>
                                </button>
                                <button
                                    onClick={() => setFilter('warning')}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        filter === 'warning' 
                                            ? 'bg-yellow-500 text-white' 
                                            : 'bg-white/60 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    <FiAlertCircle className="w-4 h-4" />
                                    <span>Warnings ({logs.filter(l => l.status >= 300 && l.status < 400).length})</span>
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200 w-64"
                                />
                                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Logs Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                                        <FiRefreshCw className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                    <p className="text-gray-600 font-medium">Loading logs...</p>
                                </div>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiInfo className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No logs found</h3>
                                    <p className="text-gray-600">Try adjusting your filters or search terms</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Endpoint</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">IP Address</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Response Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200/50">
                                        {filteredLogs.map((log, index) => (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                                        <FiClock className="w-4 h-4 text-gray-400" />
                                                        <span>{formatTimestamp(log.timestamp)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                                                        {log.method}
                                </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-mono">
                                                    {log.endpoint}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                        {log.status}
                                </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDuration(log.duration)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                    {log.ip}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {log.responseSize}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Summary Stats */}
                    {!loading && filteredLogs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Requests</p>
                                        <p className="text-2xl font-bold text-gray-800">{filteredLogs.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FiActivity className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Success Rate</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {Math.round((filteredLogs.filter(l => l.status >= 200 && l.status < 300).length / filteredLogs.length) * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <FiCheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Avg Response Time</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatDuration(Math.round(filteredLogs.reduce((acc, log) => acc + log.duration, 0) / filteredLogs.length))}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <FiClock className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Error Rate</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {Math.round((filteredLogs.filter(l => l.status >= 400).length / filteredLogs.length) * 100)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                        <FiXCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiLogs;