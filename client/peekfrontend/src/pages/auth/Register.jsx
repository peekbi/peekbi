import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiHome, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userType: 'individual',
        phone: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await register(formData);
            if (result.success) {
                toast.success('Account created!');
                navigate('/user/dashboard');
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-2 sm:p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden w-full max-w-2xl mx-auto"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] p-6 sm:p-8 text-white">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <FiUser className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">Create Your Account</h1>
                                    <p className="text-white/80 text-sm sm:text-base">Join PeekBI to start creating powerful data visualizations</p>
                                </div>
                            </div>
                            <Link
                                to="/"
                                className="mt-4 sm:mt-0 px-3 py-2 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30 text-sm sm:text-base"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-8">
                        <div className="w-full max-w-lg mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUser className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiPhone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>

                                    {/* User Type */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600">Account Type</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiBriefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="userType"
                                                value={formData.userType}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                                            >
                                                <option value="individual">Individual</option>
                                                <option value="business">Business</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
                                    <p className="text-sm text-gray-600 text-center sm:text-left">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-[#7400B8] hover:text-[#9B4DCA] transition-colors font-medium">
                                            Log in
                                        </Link>
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={loading}
                                        className={`px-8 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium w-full sm:w-auto ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                <span>Creating Account...</span>
                                            </div>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register; 