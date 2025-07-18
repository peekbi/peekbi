import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login, error: authError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success('Login successful!');
                navigate('/user/data-upload');
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (err) {
            toast.error(err.message || 'Login failed');
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
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden w-full max-w-lg mx-auto"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] p-6 sm:p-8 text-white">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <FiUser className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
                                    <p className="text-white/80 text-sm sm:text-base">Sign in to your PeekBI account</p>
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
                        <div className="w-full max-w-md mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-all duration-200 shadow-lg ${
                                        loading
                                            ? 'bg-gradient-to-r from-[#9B4DCA] to-[#C77DFF] cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] hover:shadow-xl hover:from-[#9B4DCA] hover:to-[#C77DFF]'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-[#7400B8] hover:text-[#9B4DCA] font-semibold transition-colors duration-200">
                                        Create one
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login; 