import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome, FiSettings, FiUser, FiBarChart2,
    FiPieChart, FiTrendingUp, FiLogOut, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiDatabase
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleProfileClick = () => {
        navigate('/user/profile');
    };

    const handleLogout = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            logout();
        } catch (err) {
            console.error('Logout error:', err);
            window.location.href = '/';
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-white shadow-md text-gray-700 hover:text-[#7400B8] transition-colors"
                >
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <motion.div
                className={`fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'w-64' : 'w-20'
                }`}
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col h-full bg-gradient-to-b from-white to-[#F9F4FF]">
                    {/* Logo and Toggle */}
                    <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100">
                        {sidebarOpen ? (
                            <img src="/assets/logo.svg" alt="PeekBI Logo" className="h-10" />
                        ) : (
                            <img src="/assets/logo.svg" alt="PeekBI Logo" className="h-8" />
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-700 hover:text-[#7400B8] transition-colors"
                        >
                            {sidebarOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <Link
                            to="/user/dashboard"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                isActive('/user/dashboard') 
                                    ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white' 
                                    : 'text-gray-700 hover:bg-[#F9F4FF] hover:text-[#7400B8]'
                            }`}
                        >
                            <FiHome className="w-5 h-5" />
                            {sidebarOpen && <span className="ml-3">Dashboard</span>}
                        </Link>
                        <Link
                            to="/user/data-sources"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                isActive('/user/data-sources') 
                                    ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white' 
                                    : 'text-gray-700 hover:bg-[#F9F4FF] hover:text-[#7400B8]'
                            }`}
                        >
                            <FiDatabase className="w-5 h-5" />
                            {sidebarOpen && <span className="ml-3">Data Sources</span>}
                        </Link>
                        <Link
                            to="/user/data-upload"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                isActive('/user/data-upload') 
                                    ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white' 
                                    : 'text-gray-700 hover:bg-[#F9F4FF] hover:text-[#7400B8]'
                            }`}
                        >
                            <FiBarChart2 className="w-5 h-5" />
                            {sidebarOpen && <span className="ml-3">Data Upload</span>}
                        </Link>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            to="/user/profile"
                            className={`flex items-center p-3 rounded-lg transition-colors ${
                                isActive('/user/profile') 
                                    ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white' 
                                    : 'hover:bg-[#F9F4FF] hover:text-[#7400B8]'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white flex items-center justify-center font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                                </div>
                            )}
                        </Link>

                        {/* Settings and Logout */}
                        <div className="mt-4 space-y-2">
                            <a
                                href="#"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-[#F9F4FF] hover:text-[#7400B8] transition-colors"
                            >
                                <FiSettings className="w-4 h-4" />
                                {sidebarOpen && <span className="ml-3">Settings</span>}
                            </a>
                            <a
                                href="#"
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-[#F9F4FF] hover:text-red-500 transition-colors"
                            >
                                <FiLogOut className="w-4 h-4" />
                                {sidebarOpen && <span className="ml-3">Logout</span>}
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;