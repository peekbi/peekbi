import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign, FiUsers, FiShoppingCart, FiCalendar, FiFilter, FiRefreshCw, FiDownload } from 'react-icons/fi';

const DashboardSection = forwardRef((props, ref) => {
    // Sample data for charts and metrics
    const metrics = [
        { title: 'Total Revenue', value: '$24,345', change: '+12.5%', icon: <FiDollarSign className="w-6 h-6" /> },
        { title: 'Total Users', value: '1,234', change: '+7.2%', icon: <FiUsers className="w-6 h-6" /> },
        { title: 'Conversion Rate', value: '3.2%', change: '+0.8%', icon: <FiTrendingUp className="w-6 h-6" /> },
        { title: 'Orders', value: '845', change: '+5.3%', icon: <FiShoppingCart className="w-6 h-6" /> }
    ];

    const recentTransactions = [
        { id: '#TRX-123', customer: 'John Smith', date: '2023-05-10', amount: '$345.00', status: 'Completed' },
        { id: '#TRX-124', customer: 'Sarah Johnson', date: '2023-05-09', amount: '$128.50', status: 'Completed' },
        { id: '#TRX-125', customer: 'Michael Brown', date: '2023-05-09', amount: '$97.25', status: 'Pending' },
        { id: '#TRX-126', customer: 'Emily Davis', date: '2023-05-08', amount: '$542.00', status: 'Completed' },
        { id: '#TRX-127', customer: 'Robert Wilson', date: '2023-05-08', amount: '$213.75', status: 'Failed' },
    ];

    const topProducts = [
        { name: 'Product A', sales: 342, revenue: '$5,124' },
        { name: 'Product B', sales: 276, revenue: '$4,140' },
        { name: 'Product C', sales: 189, revenue: '$2,835' },
        { name: 'Product D', sales: 157, revenue: '$2,355' },
    ];

    return (
        <section ref={ref} className="py-16 bg-white relative overflow-hidden">
            {/* Background Elements - matching the style from FeaturesSection */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[45rem] h-[45rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
                            <p className="text-gray-600 mt-1">Overview of your business performance</p>
                        </div>
                        <motion.div 
                            className="flex items-center space-x-3 mt-4 md:mt-0"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="relative">
                                <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last 90 days</option>
                                    <option>This year</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <FiCalendar className="h-4 w-4" />
                                </div>
                            </div>
                            <motion.button 
                                className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiFilter className="h-4 w-4" />
                                <span>Filter</span>
                            </motion.button>
                            <motion.button 
                                className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiRefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </motion.button>
                            <motion.button 
                                className="flex items-center space-x-1 bg-[#7400B8] rounded-lg px-3 py-2 text-white hover:bg-[#9B4DCA] transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiDownload className="h-4 w-4" />
                                <span>Export</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Metrics Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-600 text-sm">{metric.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</h3>
                                    <div className="flex items-center mt-2">
                                        <span className="text-green-500 text-sm font-medium">{metric.change}</span>
                                        <span className="text-gray-500 text-sm ml-1">vs last period</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-full p-3">
                                    {metric.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
                            <select className="text-sm border-none bg-gray-50 rounded p-1 focus:outline-none focus:ring-1 focus:ring-purple-500">
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Quarter</option>
                            </select>
                        </div>
                        {/* Placeholder for chart - in a real implementation, you would use a chart library */}
                        <div className="h-64 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <FiBarChart2 className="w-12 h-12 mx-auto text-[#7400B8]" />
                                <p className="mt-2 text-gray-700 font-medium">Revenue Chart Placeholder</p>
                                <p className="text-sm text-gray-500">Connect a chart library for real implementation</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sales Distribution */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Sales Distribution</h3>
                            <select className="text-sm border-none bg-gray-50 rounded p-1 focus:outline-none focus:ring-1 focus:ring-purple-500">
                                <option>By Category</option>
                                <option>By Region</option>
                            </select>
                        </div>
                        {/* Placeholder for pie chart */}
                        <div className="h-64 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <FiPieChart className="w-12 h-12 mx-auto text-[#7400B8]" />
                                <p className="mt-2 text-gray-700 font-medium">Distribution Chart Placeholder</p>
                                <p className="text-sm text-gray-500">Connect a chart library for real implementation</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Transactions */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTransactions.map((transaction, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.customer}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.amount}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-right">
                            <button className="text-[#7400B8] hover:text-[#9B4DCA] text-sm font-medium">View All Transactions →</button>
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Products</h3>
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-800">{product.name}</h4>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs text-gray-500">{product.sales} sales</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-800">{product.revenue}</span>
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div className="bg-[#7400B8] h-1.5 rounded-full" style={{ width: `${(index === 0 ? 100 : index === 1 ? 80 : index === 2 ? 55 : 45)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <button className="text-[#7400B8] hover:text-[#9B4DCA] text-sm font-medium">View All Products →</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

export default DashboardSection;