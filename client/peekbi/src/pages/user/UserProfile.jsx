import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiCreditCard, FiShield, FiLogOut, FiSave, FiAlertCircle, FiCheck } from 'react-icons/fi';

const UserProfile = () => {
    const { user, updateProfile, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        companyName: '',
        industry: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                companyName: user.companyName || '',
                industry: user.industry || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!user?.id) {
                throw new Error('User ID not found');
            }

            const result = await updateProfile(user.id, formData);
            if (result.success) {
                setSuccess('Profile updated successfully');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            setError('Error logging out. Please try again.');
        }
    };

    const SubscriptionCard = ({ plan, features, price, isCurrent }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative rounded-xl p-6 ${
                isCurrent 
                    ? 'bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] text-white' 
                    : 'bg-white border border-gray-200'
            }`}
        >
            {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                    Current Plan
                </div>
            )}
            <h3 className="text-xl font-bold mb-2">{plan}</h3>
            <p className="text-2xl font-bold mb-4">
                {price}
                <span className="text-sm font-normal">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <FiCheck className={`w-5 h-5 mr-2 ${isCurrent ? 'text-white' : 'text-green-500'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            {!isCurrent && (
                <button className="w-full py-2 px-4 bg-[#7400B8] text-white rounded-lg hover:bg-[#9B4DCA] transition-colors">
                    Upgrade
                </button>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                            
                            {(error || success) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                                        error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                                    }`}
                                >
                                    {error ? (
                                        <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                                        {error || success}
                                    </p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUser className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pl-10 block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                                            Industry
                                        </label>
                                        <select
                                            id="industry"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        >
                                            <option value="">Select Industry</option>
                                            <option value="finance">Finance</option>
                                            <option value="education">Education</option>
                                            <option value="retail">Retail</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="healthcare">Healthcare</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        <FiLogOut className="w-5 h-5 mr-2" />
                                        Logout
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-[#7400B8] text-white rounded-lg hover:bg-[#9B4DCA] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <FiSave className="w-5 h-5 mr-2" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Security Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <FiShield className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Change Password</h3>
                                            <p className="text-sm text-gray-500">Update your password regularly to keep your account secure</p>
                                        </div>
                                    </div>
                                    <span className="text-[#7400B8]">Change</span>
                                </button>

                                <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <span className="text-[#7400B8]">Enable</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Subscription Section */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription</h2>
                            <div className="space-y-4">
                                <SubscriptionCard
                                    plan="Free"
                                    price="$0"
                                    isCurrent={user?.subscription?.plan === 'free'}
                                    features={[
                                        'Basic analytics',
                                        'Up to 5 reports',
                                        'Standard support'
                                    ]}
                                />
                                <SubscriptionCard
                                    plan="Pro"
                                    price="$29"
                                    isCurrent={user?.subscription?.plan === 'pro'}
                                    features={[
                                        'Advanced analytics',
                                        'Unlimited reports',
                                        'Priority support',
                                        'Custom dashboards'
                                    ]}
                                />
                                <SubscriptionCard
                                    plan="Enterprise"
                                    price="$99"
                                    isCurrent={user?.subscription?.plan === 'enterprise'}
                                    features={[
                                        'All Pro features',
                                        'Dedicated support',
                                        'Custom integrations',
                                        'Team collaboration',
                                        'API access'
                                    ]}
                                />
                            </div>
                        </motion.div>

                        {/* Billing Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center">
                                        <FiCreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Payment Method</h3>
                                            <p className="text-sm text-gray-500">•••• •••• •••• 4242</p>
                                        </div>
                                    </div>
                                    <button className="text-[#7400B8] hover:text-[#9B4DCA]">Update</button>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2">Billing History</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Pro Plan - Monthly</span>
                                            <span className="text-gray-900">$29.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Pro Plan - Monthly</span>
                                            <span className="text-gray-900">$29.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile; 