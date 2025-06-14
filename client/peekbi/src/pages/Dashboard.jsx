import { motion } from 'framer-motion';
import DashboardSection from '../components/sections/DashboardSection';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiSettings, FiUser, FiBarChart2, FiPieChart, FiTrendingUp, FiCalendar, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-full bg-[#7400B8] text-white shadow-lg"
                >
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <motion.div
                className={`bg-white shadow-xl fixed h-full z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 flex justify-center items-center border-b border-gray-100">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                            <img
                                src="/assets/logos.png"
                                alt="PeekBI Logo"
                                className={`transition-all duration-300 ${sidebarOpen ? 'h-12' : 'h-10'}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/logo.png";
                                }}
                            />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-4 flex-grow overflow-y-auto">
                        <ul className="space-y-3">
                            <li className="p-3 rounded-lg bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white font-medium flex items-center gap-3">
                                <FiBarChart2 className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Analytics</span>}
                            </li>
                            <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                <FiPieChart className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Reports</span>}
                            </li>
                            <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                <FiTrendingUp className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Performance</span>}
                            </li>
                            <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                <FiCalendar className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Schedule</span>}
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className={`text-xs uppercase text-gray-400 font-semibold mb-3 ${!sidebarOpen && 'text-center'}`}>
                                {sidebarOpen ? 'User' : ''}
                            </h3>
                            <ul className="space-y-3">
                                <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                    <FiUser className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Profile</span>}
                                </li>
                                <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                    <FiSettings className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Settings</span>}
                                </li>
                                <li className="p-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer"
                                    onClick={() => navigate('/')}
                                >
                                    <FiHome className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Home</span>}
                                </li>
                                <li className="p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200 font-medium flex items-center gap-3 cursor-pointer">
                                    <FiLogOut className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>Logout</span>}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar toggle */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full p-2 rounded-lg bg-purple-50 text-[#7400B8] hover:bg-purple-100 transition-colors duration-200 flex items-center justify-center"
                        >
                            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
                <div className="p-6 md:p-8">
                    <DashboardSection />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;