import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiChevronRight, FiDatabase, FiDollarSign, FiBook, FiShoppingBag, FiPackage, FiActivity, FiArrowRight } from 'react-icons/fi';

const CategorySelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        // Get uploaded files from location state
        if (location.state && location.state.uploadedFiles) {
            setUploadedFiles(location.state.uploadedFiles);
        }
    }, [location]);

    // Available industries with adjusted colors
    const industries = [
        {
            id: 'finance',
            name: 'Finance',
            icon: <FiDollarSign className="w-8 h-8" />,
            description: 'Financial analytics, risk assessment, and investment insights',
            color: 'from-blue-400/40 to-blue-500/40 hover:from-blue-400/50 hover:to-blue-500/50',
            iconColor: 'from-blue-500 to-blue-600'
        },
        {
            id: 'education',
            name: 'Education',
            icon: <FiBook className="w-8 h-8" />,
            description: 'Student performance, enrollment analytics, and educational outcomes',
            color: 'from-green-400/40 to-green-500/40 hover:from-green-400/50 hover:to-green-500/50',
            iconColor: 'from-green-500 to-green-600'
        },
        {
            id: 'retail',
            name: 'Retail & E-commerce',
            icon: <FiShoppingBag className="w-8 h-8" />,
            description: 'Sales analytics, inventory management, and customer behavior',
            color: 'from-purple-400/40 to-purple-500/40 hover:from-purple-400/50 hover:to-purple-500/50',
            iconColor: 'from-purple-500 to-purple-600'
        },
        {
            id: 'manufacturing',
            name: 'Manufacturing',
            icon: <FiPackage className="w-8 h-8" />,
            description: 'Production efficiency, quality control, and supply chain analytics',
            color: 'from-orange-400/40 to-orange-500/40 hover:from-orange-400/50 hover:to-orange-500/50',
            iconColor: 'from-orange-500 to-orange-600'
        },
        {
            id: 'healthcare',
            name: 'Healthcare',
            icon: <FiActivity className="w-8 h-8" />,
            description: 'Patient analytics, operational efficiency, and healthcare outcomes',
            color: 'from-red-400/40 to-red-500/40 hover:from-red-400/50 hover:to-red-500/50',
            iconColor: 'from-red-500 to-red-600'
        }
    ];

    // Continue to dashboard
    const continueToDashboard = () => {
        if (!selectedIndustry) return;

        navigate('/dashbordss', {
            state: {
                selectedIndustry,
                uploadedFiles
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between w-full">
                    <div className="flex items-center">
                        <img
                            src="/assets/logos.png"
                            alt="PeekBI Logo"
                            className="h-12"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/logo.png";
                            }}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/user/data-upload')}
                            className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Back to Upload
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-[1200px] w-full mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] bg-clip-text text-transparent">Select Your Industry</h1>
                            <p className="text-lg text-gray-600">Choose your industry to get industry-specific analytics</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {industries.map((industry) => (
                                <motion.button
                                    key={industry.id}
                                    onClick={() => setSelectedIndustry(industry.id)}
                                    className={`relative p-8 rounded-xl text-left transition-all duration-300 bg-white/80 backdrop-blur-sm ${selectedIndustry === industry.id
                                            ? 'ring-2 ring-[#7400B8] ring-offset-2 shadow-lg'
                                            : 'hover:ring-2 hover:ring-[#7400B8]/50 hover:ring-offset-2 hover:shadow-md'
                                        } bg-gradient-to-br ${industry.color}`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-4 rounded-xl bg-gradient-to-br ${industry.iconColor} text-white shadow-sm`}>
                                            {industry.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">{industry.name}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{industry.description}</p>
                                        </div>
                                    </div>
                                    {selectedIndustry === industry.id && (
                                        <motion.div
                                            className="absolute top-4 right-4"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        >
                                            <FiCheckCircle className="w-6 h-6 text-[#7400B8]" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 mt-12">
                            <motion.button
                                onClick={() => navigate('/user/data-upload')}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Back to Upload
                            </motion.button>
                            <motion.button
                                onClick={continueToDashboard}
                                disabled={!selectedIndustry}
                                className={`px-6 py-3 rounded-lg text-white font-medium ${selectedIndustry
                                        ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] hover:shadow-lg'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    } transition-all duration-200 flex items-center space-x-2`}
                                whileHover={selectedIndustry ? { scale: 1.02 } : {}}
                                whileTap={selectedIndustry ? { scale: 0.98 } : {}}
                            >
                                <span>Continue to Dashboard</span>
                                <FiArrowRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default CategorySelection;