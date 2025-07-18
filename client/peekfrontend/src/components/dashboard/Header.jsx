import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
    title, 
    description, 
    icon: Icon, 
    actionButton = null,
    aiButton = null,
    className = "",
    sidebarOpen = false,
    setSidebarOpen = null,
    onBack = null
}) => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className={`bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] p-4 sm:p-8 text-white shadow-xl ${className}`}>
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-0">
                    {/* Sidebar Toggle Button (mobile only) or Back Button */}
                    {onBack ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onBack}
                            className="bg-white/20 p-3 rounded-xl text-white hover:bg-white/30 transition-all duration-200 focus:outline-none mr-2"
                        >
                            <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                    ) : setSidebarOpen && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden bg-transparent p-2 rounded-xl text-white/80 hover:text-white transition-all duration-200 focus:outline-none mr-2"
                        >
                            {sidebarOpen ? <FiX className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </motion.button>
                    )}
                    <div 
                        className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden cursor-pointer"
                        onClick={handleLogoClick}
                    >
                        <img 
                            src="/assets/logo.svg" 
                            alt="PeekBI Logo" 
                            className="w-11 h-11 sm:w-[70px] sm:h-[70px] object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/logo.png";
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-3xl font-bold">{title}</h1>
                        <p className="text-white/80 text-xs sm:text-base">{description}</p>
                    </div>
                </div>
                {/* Action buttons container */}
                <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                    {/* AI Button */}
                    {aiButton && (
                        React.isValidElement(aiButton) 
                        ? <div>{aiButton}</div>
                        : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={aiButton.onClick}
                                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 text-sm sm:text-base border border-white/30"
                            >
                                <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-medium">Ask AI</span>
                            </motion.button>
                        )
                    )}
                    
                    {/* Handle actionButton whether it's a React element or an object with properties */}
                    {actionButton && (
                        React.isValidElement(actionButton) 
                        ? <div>{actionButton}</div>
                        : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={actionButton.onClick}
                                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 text-sm sm:text-base"
                            >
                                {actionButton.icon && <actionButton.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                <span className="font-medium">{actionButton.label}</span>
                            </motion.button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header; 