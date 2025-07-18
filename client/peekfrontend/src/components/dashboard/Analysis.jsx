import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiDollarSign, FiUsers, FiBarChart2, FiActivity } from 'react-icons/fi';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie
} from 'recharts';
import toast from 'react-hot-toast';

const Analysis = ({ selectedFile, analysis, onBack }) => {
    if (!selectedFile || !analysis) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    // Enhanced color palette for pie charts
    const pieColors = [
        '#7400B8', '#9B4DCA', '#C77DFF', '#E0AAFF', '#F8F4FF',
        '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF',
        '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#DDD6FE'
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </motion.button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">{selectedFile.originalName}</h1>
                    <p className="text-gray-600">Analysis Results</p>
                </div>
            </motion.div>

            {/* KPIs Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                    Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {analysis.insights.kpis && Object.entries(analysis.insights.kpis).map(([key, value], index) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#7400B8]/10 flex items-center justify-center">
                                    <FiDollarSign className="w-5 h-5 text-[#7400B8]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-[#7400B8]">
                                {key.includes('total') || key.includes('avg') || key.includes('median') ? 
                                  `₹${typeof value === 'number' ? value.toLocaleString() : value}` : 
                                  typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Sales by Region */}
                {analysis.insights.totals?.sales_by_region?.Region &&
                 Array.isArray(analysis.insights.totals.sales_by_region.Region) &&
                 Array.isArray(analysis.insights.totals.sales_by_region.Sales) &&
                 analysis.insights.totals.sales_by_region.Region.length > 0 &&
                 analysis.insights.totals.sales_by_region.Sales.length === analysis.insights.totals.sales_by_region.Region.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FiUsers className="w-6 h-6 text-[#7400B8]" />
                            Sales by Region
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={analysis.insights.totals.sales_by_region.Region.map((region, index) => ({
                                        name: region,
                                        sales: analysis.insights.totals.sales_by_region.Sales[index],
                                        trend: analysis.insights.totals.sales_by_region.Sales[index] * 0.8
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            `₹${value.toLocaleString()}`,
                                            name === 'sales' ? 'Sales' : 'Trend'
                                        ]}
                                        labelStyle={{ color: '#7400B8' }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="sales" 
                                        fill="#7400B8" 
                                        radius={[8, 8, 0, 0]}
                                        barSize={40}
                                    >
                                        {analysis.insights.totals.sales_by_region.Region.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                    <Line 
                                        type="monotone" 
                                        dataKey="trend" 
                                        stroke="#9B4DCA" 
                                        strokeWidth={3}
                                        dot={{ fill: '#9B4DCA', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 10 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Sales by Region/Category */}
                {analysis.insights.totals?.sales_by_category &&
                 Array.isArray(analysis.insights.totals.sales_by_category) &&
                 analysis.insights.totals.sales_by_category.length >= 2 &&
                 Array.isArray(analysis.insights.totals.sales_by_category[0]) &&
                 Array.isArray(analysis.insights.totals.sales_by_category[1]) &&
                 analysis.insights.totals.sales_by_category[0].length > 0 &&
                 analysis.insights.totals.sales_by_category[0].length === analysis.insights.totals.sales_by_category[1].length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />
                            Sales by Category
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={analysis.insights.totals.sales_by_category[0].map((category, index) => ({
                                        name: category,
                                        sales: analysis.insights.totals.sales_by_category[1][index],
                                        trend: analysis.insights.totals.sales_by_category[1][index] * 0.8 + Math.random() * 0.4 * analysis.insights.totals.sales_by_category[1][index]
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                                        labelStyle={{ color: '#7400B8' }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="sales" 
                                        fill="#7400B8" 
                                        radius={[8, 8, 0, 0]}
                                        barSize={40}
                                    >
                                        {analysis.insights.totals.sales_by_category[0].map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                    <Line 
                                        type="monotone" 
                                        dataKey="trend" 
                                        stroke="#9B4DCA" 
                                        strokeWidth={3}
                                        dot={{ fill: '#9B4DCA', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 10 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Sales by Category - Pie Chart */}
                {analysis.insights.totals?.sales_by_category &&
                 Array.isArray(analysis.insights.totals.sales_by_category) &&
                 analysis.insights.totals.sales_by_category.length >= 2 &&
                 Array.isArray(analysis.insights.totals.sales_by_category[0]) &&
                 Array.isArray(analysis.insights.totals.sales_by_category[1]) &&
                 analysis.insights.totals.sales_by_category[0].length > 0 &&
                 analysis.insights.totals.sales_by_category[0].length === analysis.insights.totals.sales_by_category[1].length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />
                            Sales Distribution by Category
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analysis.insights.totals.sales_by_category[0].map((category, index) => ({
                                            name: category,
                                            value: analysis.insights.totals.sales_by_category[1][index]
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analysis.insights.totals.sales_by_category[0].map((_, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={pieColors[index % pieColors.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* High Performers */}
                {analysis.insights.highPerformers &&
                 Array.isArray(analysis.insights.highPerformers) &&
                 analysis.insights.highPerformers.length >= 2 &&
                 Array.isArray(analysis.insights.highPerformers[0]) &&
                 Array.isArray(analysis.insights.highPerformers[1]) &&
                 analysis.insights.highPerformers[0].length > 0 &&
                 analysis.insights.highPerformers[0].length === analysis.insights.highPerformers[1].length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <FiTrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            Top Performing Categories
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={analysis.insights.highPerformers[0].map((category, index) => ({
                                        name: category,
                                        sales: analysis.insights.highPerformers[1][index],
                                        percentage: (analysis.insights.highPerformers[1][index] / 
                                            analysis.insights.highPerformers[1].reduce((a, b) => a + b, 0) * 100).toFixed(1)
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'sales' ? `₹${value.toLocaleString()}` : `${value}%`,
                                            name === 'sales' ? 'Sales' : 'Percentage'
                                        ]}
                                        labelStyle={{ color: '#22c55e' }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        yAxisId="left"
                                        dataKey="sales" 
                                        fill="#22c55e" 
                                        radius={[8, 8, 0, 0]}
                                        barSize={40}
                                    >
                                        {analysis.insights.highPerformers[0].map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`rgba(34, 197, 94, ${0.3 + (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="percentage" 
                                        stroke="#15803d" 
                                        strokeWidth={3}
                                        dot={{ fill: '#15803d', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 10 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Low Performers */}
                {analysis.insights.lowPerformers &&
                 Array.isArray(analysis.insights.lowPerformers) &&
                 analysis.insights.lowPerformers.length >= 2 &&
                 Array.isArray(analysis.insights.lowPerformers[0]) &&
                 Array.isArray(analysis.insights.lowPerformers[1]) &&
                 analysis.insights.lowPerformers[0].length > 0 &&
                 analysis.insights.lowPerformers[0].length === analysis.insights.lowPerformers[1].length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <FiTrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                            </div>
                            Low Performing Categories
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={analysis.insights.lowPerformers[0].map((category, index) => ({
                                        name: category,
                                        sales: analysis.insights.lowPerformers[1][index],
                                        percentage: (analysis.insights.lowPerformers[1][index] / 
                                            analysis.insights.lowPerformers[1].reduce((a, b) => a + b, 0) * 100).toFixed(1)
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#ef4444" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'sales' ? `₹${value.toLocaleString()}` : `${value}%`,
                                            name === 'sales' ? 'Sales' : 'Percentage'
                                        ]}
                                        labelStyle={{ color: '#ef4444' }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        yAxisId="left"
                                        dataKey="sales" 
                                        fill="#ef4444" 
                                        radius={[8, 8, 0, 0]}
                                        barSize={40}
                                    >
                                        {analysis.insights.lowPerformers[0].map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={`rgba(239, 68, 68, ${0.3 + (index * 0.15)})`} />
                                        ))}
                                    </Bar>
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="percentage" 
                                        stroke="#b91c1c" 
                                        strokeWidth={3}
                                        dot={{ fill: '#b91c1c', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 10 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Trends Section */}
            {Array.isArray(analysis.insights.trends) && analysis.insights.trends.length > 0 && analysis.insights.trends[0] && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                        Trends Analysis
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={analysis.insights.trends}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Average']}
                                    labelStyle={{ color: '#7400B8' }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="total_sales" 
                                    name="Total Sales"
                                    stroke="#7400B8" 
                                    fill="url(#trendGradient)"
                                    strokeWidth={3}
                                />
                                <defs>
                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7400B8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#7400B8" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Summary Statistics */}
            {analysis.summary && typeof analysis.summary === 'object' && Object.keys(analysis.summary).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBarChart2 className="w-6 h-6 text-[#7400B8]" />
                        Summary Statistics
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Object.entries(analysis.summary).map(([metric, stats], index) => (
                            <motion.div
                                key={metric}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl p-6 border border-[#7400B8]/10"
                            >
                                <h4 className="font-bold text-gray-800 mb-4 text-lg">{metric}</h4>
                                <div className="h-[200px] w-full mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={[
                                                { name: 'Min', value: stats.min },
                                                { name: 'Max', value: stats.max },
                                                { name: 'Mean', value: stats.mean },
                                                { name: 'Median', value: stats.median }
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value) => [value.toLocaleString(), 'Value']}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Bar 
                                                dataKey="value" 
                                                fill="#7400B8" 
                                                radius={[8, 8, 0, 0]}
                                                barSize={40}
                                            >
                                                {['Min', 'Max', 'Mean', 'Median'].map((_, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={`rgba(116, 0, 184, ${0.3 + (index * 0.15)})`} 
                                                    />
                                                ))}
                                            </Bar>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/60 rounded-xl border border-[#7400B8]/10">
                                        <p className="text-sm text-gray-600 font-medium">Standard Deviation</p>
                                        <p className="font-bold text-[#7400B8] text-lg">{stats.stddev.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-white/60 rounded-xl border border-[#7400B8]/10">
                                        <p className="text-sm text-gray-600 font-medium">Range</p>
                                        <p className="font-bold text-[#7400B8] text-lg">{(stats.max - stats.min).toLocaleString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Insights Section */}
            {Array.isArray(analysis.insights.hypothesis) && analysis.insights.hypothesis.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="w-6 h-6 text-[#7400B8]" />
                        Key Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.insights.hypothesis.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className="p-6 bg-gradient-to-br from-[#F9F4FF] to-white rounded-2xl border border-[#7400B8]/10 hover:border-[#7400B8]/20 transition-all duration-200 hover:shadow-lg"
                            >
                                <p className="text-gray-800 leading-relaxed">{insight}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Analysis; 