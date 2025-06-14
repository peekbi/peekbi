import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiCreditCard, FiShield, FiDatabase, FiCheck, FiX } from 'react-icons/fi';

const Profile = () => {
    const { user, loading, error, fetchUserProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Default features if not available
    const defaultFeatures = {
        scheduleReports: false,
        exportAsPDF: false,
        shareableDashboards: false,
        emailSupport: true,
        prioritySupport: false
    };

    // Get features with defaults
    const features = user?.plan?.features || defaultFeatures;

    useEffect(() => {
        const loadUserDetails = async () => {
            if (user?.id) {
                try {
                    await fetchUserProfile(user.id);
                } catch (err) {
                    console.error('Failed to load user details:', err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        loadUserDetails();
    }, [user?.id, fetchUserProfile, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (loading || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="text-red-500 text-center max-w-md">
                    <p className="font-medium mb-2">Error loading profile</p>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No user data available</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">Profile</h1>
                        <p className="mt-2 text-blue-100">Manage your account settings and subscription</p>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6 space-y-8">
                        {/* User Information */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <FiUser className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <FiMail className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <FiUser className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Username</p>
                                        <p className="font-medium">{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <FiCalendar className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Joined</p>
                                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Subscription Plan */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription Plan</h2>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <FiCreditCard className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                                {user.plan.name} Plan
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {user.subscriptionStatus === 'trialing' ? 'Trial Period' : 'Active Subscription'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                        user.subscriptionStatus === 'trialing' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.subscriptionStatus === 'trialing' ? 'Trial' : 'Active'}
                                    </span>
                                </div>

                                {/* Plan Details */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h4 className="font-medium text-gray-800 mb-3">Plan Limits</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Max Reports</dt>
                                                <dd className="font-medium text-gray-900">{user.plan.maxReports}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Max Saved Charts</dt>
                                                <dd className="font-medium text-gray-900">{user.plan.maxSavedCharts}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Max Users</dt>
                                                <dd className="font-medium text-gray-900">{user.plan.maxUsersPerAccount}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Data Retention</dt>
                                                <dd className="font-medium text-gray-900">{user.plan.dataRetentionDays} days</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Billing Interval</dt>
                                                <dd className="font-medium text-gray-900 capitalize">{user.plan.billingInterval}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Price</dt>
                                                <dd className="font-medium text-gray-900">${user.plan.price}/month</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <h4 className="font-medium text-gray-800 mb-3">Plan Features</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center space-x-2">
                                                {features?.scheduleReports ? 
                                                    <FiCheck className="w-5 h-5 text-green-500" /> : 
                                                    <FiX className="w-5 h-5 text-red-500" />
                                                }
                                                <span className={features?.scheduleReports ? "text-gray-900" : "text-gray-400"}>
                                                    Schedule Reports
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                {features?.exportAsPDF ? 
                                                    <FiCheck className="w-5 h-5 text-green-500" /> : 
                                                    <FiX className="w-5 h-5 text-red-500" />
                                                }
                                                <span className={features?.exportAsPDF ? "text-gray-900" : "text-gray-400"}>
                                                    Export as PDF
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                {features?.shareableDashboards ? 
                                                    <FiCheck className="w-5 h-5 text-green-500" /> : 
                                                    <FiX className="w-5 h-5 text-red-500" />
                                                }
                                                <span className={features?.shareableDashboards ? "text-gray-900" : "text-gray-400"}>
                                                    Shareable Dashboards
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                {features?.emailSupport ? 
                                                    <FiCheck className="w-5 h-5 text-green-500" /> : 
                                                    <FiX className="w-5 h-5 text-red-500" />
                                                }
                                                <span className={features?.emailSupport ? "text-gray-900" : "text-gray-400"}>
                                                    Email Support
                                                </span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                {features?.prioritySupport ? 
                                                    <FiCheck className="w-5 h-5 text-green-500" /> : 
                                                    <FiX className="w-5 h-5 text-red-500" />
                                                }
                                                <span className={features?.prioritySupport ? "text-gray-900" : "text-gray-400"}>
                                                    Priority Support
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Plan Dates */}
                                <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100">
                                    <h4 className="font-medium text-gray-800 mb-3">Plan Information</h4>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <dt className="text-gray-500">Created On</dt>
                                            <dd className="font-medium text-gray-900">{formatDate(user.plan.createdAt)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Last Updated</dt>
                                            <dd className="font-medium text-gray-900">{formatDate(user.plan.updatedAt)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile; 