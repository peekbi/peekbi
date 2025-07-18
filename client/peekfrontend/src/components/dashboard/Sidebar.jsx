import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome, FiSettings, FiUser, FiBarChart2,
    FiPieChart, FiTrendingUp, FiLogOut, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiDatabase, FiUpload
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
            toast.success('Logged out successfully');
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Logout failed');
            window.location.href = '/';
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        {
            path: '/user/dashboard',
            icon: <FiHome className="w-5 h-5" />,
            label: 'Dashboard',
            description: 'Overview & Analytics'
        },
        {
            path: '/user/data-sources',
            icon: <FiDatabase className="w-5 h-5" />,
            label: 'Data Sources',
            description: 'Manage Files'
        },
        {
            path: '/user/data-upload',
            icon: <FiUpload className="w-5 h-5" />,
            label: 'Upload Data',
            description: 'Add New Files'
        }
    ];

    return (
        <>
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl text-gray-700 hover:text-[#7400B8] transition-all duration-200 border border-white/30"
                    style={{ pointerEvents: 'auto' }}
                >
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </motion.button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <motion.div
                className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] shadow-2xl transform transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'block w-72' : 'hidden w-0'}
                    lg:block
                    ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'}
                `}
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: sidebarOpen || window.innerWidth >= 1024 ? (window.innerWidth >= 1024 && !sidebarOpen ? '5rem' : '18rem') : '0', minWidth: 0 }}
            >
                <div className={`flex flex-col h-full ${sidebarOpen || window.innerWidth >= 1024 ? '' : 'hidden'} ${!sidebarOpen && window.innerWidth >= 1024 ? 'items-center' : ''}`}>
                    {/* Logo and Toggle */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-white/20">
                        {sidebarOpen ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={handleLogoClick}
                            >
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden">
                                    <img 
                                        src="/assets/logo.svg" 
                                        alt="PeekBI Logo" 
                                        style={{ width: '52px', height: '52px' }}
                                        className="object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/logo.png";
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">
                                        PeekBI
                                    </h1>
                                    <p className="text-xs text-white/80">Analytics Platform</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm mx-auto overflow-hidden cursor-pointer"
                                onClick={handleLogoClick}
                            >
                                <img 
                                    src="/assets/logo.svg" 
                                    alt="PeekBI Logo" 
                                    style={{ width: '52px', height: '52px' }}
                                    className="object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/assets/logo.png";
                                    }}
                                />
                            </motion.div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10"
                        >
                            {sidebarOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                        </motion.button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => {
                                    navigate(item.path);
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                            >
                                <Link
                                    to={item.path}
                                    className={`group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 ${
                                        isActive(item.path) 
                                            ? 'bg-white/20 text-white shadow-xl backdrop-blur-sm' 
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                        isActive(item.path) 
                                            ? 'bg-white/20' 
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        {item.icon}
                                    </div>
                                    {sidebarOpen && (
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-sm">{item.label}</p>
                                            <p className={`text-xs ${
                                                isActive(item.path) ? 'text-white/90' : 'text-white/60'
                                            }`}>
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                        {/* Admin Dashboard link for admin users only */}
                        {user && user.role === 'admin' && (
                            <motion.div
                                key="/user/admin-dashboard"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: menuItems.length * 0.1 }}
                                onClick={() => {
                                    navigate('/user/admin-dashboard');
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                            >
                                <Link
                                    to="/user/admin-dashboard"
                                    className={`group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 ${
                                        isActive('/user/admin-dashboard')
                                            ? 'bg-white/20 text-white shadow-xl backdrop-blur-sm'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                        isActive('/user/admin-dashboard')
                                            ? 'bg-white/20'
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        <FiBarChart2 className="w-5 h-5" />
                                    </div>
                                    {sidebarOpen && (
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-sm">Admin Dashboard</p>
                                            <p className={`text-xs ${
                                                isActive('/user/admin-dashboard') ? 'text-white/90' : 'text-white/60'
                                            }`}>
                                                Manage Users
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        )}
                        {user && user.role === 'admin' && (
                            <motion.div
                                key="/user/admin-testimonials"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: menuItems.length * 0.1 + 0.1 }}
                                onClick={() => {
                                    navigate('/user/admin-testimonials');
                                    if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                            >
                                <Link
                                    to="/user/admin-testimonials"
                                    className={`group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 ${
                                        isActive('/user/admin-testimonials')
                                            ? 'bg-white/20 text-white shadow-xl backdrop-blur-sm'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                        isActive('/user/admin-testimonials')
                                            ? 'bg-white/20'
                                            : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                        <FiUser className="w-5 h-5" />
                                    </div>
                                    {sidebarOpen && (
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-sm">Testimonials</p>
                                            <p className={`text-xs ${
                                                isActive('/user/admin-testimonials') ? 'text-white/90' : 'text-white/60'
                                            }`}>
                                                Manage Testimonials
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        )}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Link
                                to="/user/profile"
                                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                                    isActive('/user/profile') 
                                        ? 'bg-white/20 text-white shadow-xl backdrop-blur-sm' 
                                        : 'hover:bg-white/10 hover:text-white text-white/80'
                                } ${!sidebarOpen ? 'justify-center' : ''}`}
                            >
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden">
                                    <FiUser className="w-6 h-6 text-white" />
                                </div>
                                {sidebarOpen && (
                                    <div className="ml-4 flex-1">
                                        <p className="font-semibold text-sm">{user?.name || 'User'}</p>
                                        <p className="text-xs text-white/60">{user?.email || 'user@example.com'}</p>
                                    </div>
                                )}
                            </Link>
                        </motion.div>

                        {/* Settings and Logout */}
                        <div className="mt-4 space-y-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    to="/user/settings"
                                    className={`flex items-center px-4 py-3 text-sm text-white/80 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 ${!sidebarOpen ? 'justify-center' : ''} ${isActive('/user/settings') ? 'bg-white/20' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <FiSettings className="w-5 h-5" />
                                    </div>
                                    {sidebarOpen && <span className="ml-4 font-medium">Settings</span>}
                                </Link>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <a
                                    href="#"
                                    onClick={handleLogout}
                                    className={`flex items-center px-4 py-3 text-sm text-white/80 rounded-2xl hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 ${!sidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <FiLogOut className="w-5 h-5" />
                                    </div>
                                    {sidebarOpen && <span className="ml-4 font-medium">Logout</span>}
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;