import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiCalendar, FiShield, FiDatabase, FiCreditCard, FiCheck, FiX, FiEdit, FiSave, FiLoader, FiPhone, FiBriefcase, FiArrowUpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import Header from './Header';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PLAN_OPTIONS = [
  { name: 'free', label: 'Free' },
  { name: 'premium', label: 'Premium' },
  { name: 'enterprise', label: 'Enterprise' },
];

const PLAN_DEFAULTS = {
    free: {
        price: 100,
        billingInterval: 'monthly',
        limits: {
            uploads: 15,
            download: 15,
            analyse: 8,
            aiPromts: 5,
            reports: 8,
            charts: 15,
            maxUsersPerAccount: 1,
            dataRetentionDays: 7,
        },
        features: {
            scheduleReports: false,
            exportAsPDF: false,
            shareableDashboards: false,
            emailSupport: true,
            prioritySupport: false,
        },
    },
    premium: {
        price: 29900,
        billingInterval: 'monthly',
        limits: {
            uploads: 100,
            download: 75,
            analyse: 60,
            aiPromts: 50,
            reports: 20,
            charts: 50,
            maxUsersPerAccount: 5,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: false,
        },
    },
    enterprise: {
        price: 69900,
        billingInterval: 'monthly',
        limits: {
            uploads: 500,
            download: 500,
            analyse: 500,
            aiPromts: 160,
            reports: 200,
            charts: 500,
            maxUsersPerAccount: 100,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: true,
        },
    }
};

// Helper to generate a unique payment ID
function generatePaymentId() {
    return 'test_' + Math.random().toString(36).substring(2, 15) + Date.now();
}

// Razorpay integration: use only the real/live key
const RAZORPAY_LIVE_KEY = 'rzp_live_vb2QqoCvfoLgQk';

const Profile = () => {
    const { user: authUser, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({});
    const [planData, setPlanData] = useState(null);
    const [usageData, setUsageData] = useState(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [upgradeError, setUpgradeError] = useState(null);
    const [upgradeSuccess, setUpgradeSuccess] = useState(null);
    const [selectedPlanFromQuery, setSelectedPlanFromQuery] = useState(null);
    const [showAllLogins, setShowAllLogins] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [profileFetched, setProfileFetched] = useState(false);

    const formatLastLogin = (lastLogin) => {
        if (!lastLogin) return 'Never';
        const date = new Date(lastLogin);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    useEffect(() => {
        if (!profileFetched && (authUser?.id || authUser?._id)) {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                    if (!token) throw new Error('No authentication token found');
                const userId = authUser?.id || authUser?._id;
                const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.status === 'success' && response.data.user) {
                    setUser(response.data.user);
                    setFormData(response.data.user);
                } else {
                    setUser(authUser);
                    setFormData(authUser);
                }
            } catch (err) {
                setUser(authUser);
                setFormData(authUser);
            } finally {
                setLoading(false);
                    setProfileFetched(true);
            }
        };
        fetchProfileData();
        }
    }, [authUser, profileFetched]);

    // Fetch usage data
    const fetchUsageData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const usageRes = await axios.get(`${API_BASE_URL}/subscribe/uses`, { headers: { 'Authorization': `Bearer ${token}` } });
            setUsageData(usageRes.data);
        } catch (err) {
            // Optionally handle error
        }
    };

    // Fetch plan data (top-level, not inside useEffect)
        const fetchPlanAndUsage = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const planRes = await axios.get(`${API_BASE_URL}/subscribe/`, { headers: { 'Authorization': `Bearer ${token}` } });
                setPlanData(planRes.data);
            } catch (err) {
                // Optionally handle error
            }
        };

    useEffect(() => {
        fetchPlanAndUsage();
        fetchUsageData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const plan = params.get('plan');
        if (plan && PLAN_DEFAULTS[plan]) {
            setSelectedPlan(plan);
            setShowUpgrade(true);
            setSelectedPlanFromQuery(plan);
        }
    }, [location.search]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(user || {});
    };

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
            setIsUpdating(true);
        try {
            const userId = authUser?.id || authUser?._id;
            if (!userId) throw new Error('User ID is required');
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                userType: formData.userType,
                category: formData.bussinessCategory,
                businessType: formData.bussinessType,
                phone: formData.phone,
                companyName: formData.companyName
            };
            const result = await updateProfile(userId, dataToSend);
            if (result && result.success && result.user) {
                    setUser(result.user);
                    setIsEditing(false);
                toast.success('Profile updated successfully!');
                setProfileFetched(false);
                } else {
                toast.error(result?.error || 'Failed to update profile');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    // Load Razorpay SDK dynamically
    const loadRazorpaySDK = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) {
                resolve(window.Razorpay);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(window.Razorpay);
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        });
    };

    // Create order with backend
    const createOrder = async (planName) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/subscribe/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ planName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
        }

        return await response.json();
    };

    // Subscribe to plan
    const subscribeToPlan = async (planName, paymentData, status = 'success', failReason = '') => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Always send all fields to backend, but use null for signature in failed/cancelled payments
        const requestBody = {
            planName,
            razorpayPaymentId: paymentData?.razorpay_payment_id || paymentData?.razorpayPaymentId || 'fallback_payment_id',
            razorpayOrderId: paymentData?.razorpay_order_id || paymentData?.razorpayOrderId || 'fallback_order_id',
            razorpaySignature: null, // Default to null for failed/cancelled payments
            status,
            failReason
        };

        // Only set real signature for successful payments
        if (status === 'success' && paymentData?.razorpay_signature) {
            requestBody.razorpaySignature = paymentData.razorpay_signature;
        }

        const response = await fetch(`${API_BASE_URL}/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Subscription failed');
        }

        return await response.json();
    };

    // Handle subscription process
    const handleSubscription = async (planName) => {
            setIsPaymentLoading(true);
        setUpgradeError(null);
        setUpgradeSuccess(null);

        // Variables to track payment data
        let paymentData = null;
        let orderData = null;
        let paymentInitiated = false;
        const backendCalledRef = { current: false };

        // Helper to call backend only once
        const callBackendOnce = async (status, paymentDataArg, failReason = '') => {
            if (backendCalledRef.current) return;
            backendCalledRef.current = true;
            try {
                await subscribeToPlan(planName, paymentDataArg, status, failReason);
            } catch (error) {
                toast.error(error.message || 'Subscription failed');
            } finally {
                refetchPlanAndUsage();
                setIsPaymentLoading(false);
                setShowUpgrade(false);
                setSelectedPlanFromQuery(null);
            }
        };

        try {
            // Step 1: Create order with backend
            orderData = await createOrder(planName);

            // Step 2: Load Razorpay SDK
            const Razorpay = await loadRazorpaySDK();

            // Step 3: Configure Razorpay options
            const options = {
                key: RAZORPAY_LIVE_KEY,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,
                name: 'PeekBI',
                description: `${planName} Plan Subscription`,
                image: '/logos.png',
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                notes: {
                    address: 'PeekBI Subscription'
                },
                theme: {
                    color: '#7400B8'
                },
                handler: async function (response) {
                    paymentData = response;
                    paymentInitiated = true;
                    await callBackendOnce('success', response);
                    toast.success('Plan subscribed successfully!');
                },
                modal: {
                    ondismiss: function () {
                        setIsPaymentLoading(false);
                        // Always call backend on dismiss if not already called
                        if (!backendCalledRef.current) {
                            let transactionData = {
                                razorpay_order_id: orderData.orderId,
                                razorpay_signature: null
                            };
                            if (paymentData && paymentData.razorpay_payment_id) {
                                transactionData.razorpay_payment_id = paymentData.razorpay_payment_id;
                            }
                            callBackendOnce('failed', transactionData, 'Payment dialog dismissed by user');
                        }
                    }
                }
            };

            // Step 6: Open Razorpay checkout
            const rzp = new Razorpay(options);

            // Add event listeners to capture all payment data
            rzp.on('modal.open', function () {
                paymentInitiated = true;
            });

            rzp.on('payment.init', function (response) {
                paymentInitiated = true;
                paymentData = {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: null
                };
            });

            rzp.on('payment.authorized', function (response) {
                paymentInitiated = true;
                paymentData = {
                    razorpay_payment_id: response.razorpay_payment_id || paymentData?.razorpay_payment_id || 'auth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15),
                    razorpay_order_id: response.razorpay_order_id || paymentData?.razorpay_order_id || orderData.orderId,
                    razorpay_signature: response.razorpay_signature || paymentData?.razorpay_signature || 'auth_sig_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
                };
            });

            rzp.on('payment.failed', function (response) {
                paymentInitiated = true;
                paymentData = {
                    razorpay_payment_id: response.error?.metadata?.payment_id || response.razorpay_payment_id,
                    razorpay_order_id: response.error?.metadata?.order_id || response.razorpay_order_id,
                    razorpay_signature: null
                };
                callBackendOnce('failed', paymentData, response.error.description || 'Payment failed');
                toast.error('Payment failed: ' + (response.error.description || 'Unknown error'));
            });

            rzp.on('payment.cancelled', function (response) {
                paymentInitiated = true;
                paymentData = {
                    razorpay_payment_id: response.error?.metadata?.payment_id || response.razorpay_payment_id,
                    razorpay_order_id: response.error?.metadata?.order_id || response.razorpay_order_id,
                    razorpay_signature: null
                };
                callBackendOnce('failed', paymentData, 'Payment cancelled by user');
                toast.error('Payment was cancelled');
            });

            rzp.open();

        } catch (error) {
            toast.error(error.message || 'Failed to start subscription process');
            setIsPaymentLoading(false);
        }
    };

    // Handle free plan subscription
    const handleSubscribeFree = async () => {
        await handleSubscription('free');
    };

    // Handle paid plan subscription
    const handleRazorpayPayment = async () => {
        await handleSubscription(selectedPlan);
    };

    // Refetch subscription and usage after every payment modal event
    const refetchPlanAndUsage = async () => {
        await fetchPlanAndUsage();
            await fetchUsageData();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-6 flex items-center justify-center">
                <div className="max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                </div>
                                <p className="text-gray-600 font-medium">Loading profile...</p>
                            </div>
                        </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-6 flex items-center justify-center">
                <div className="max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
                                <p className="text-gray-600">{error}</p>
                            </div>
                        </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-6 flex items-center justify-center">
                <div className="max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-center h-64">
                <div className="text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Profile Data</h3>
                                <p className="text-gray-600">Unable to load user profile data</p>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                                    className="mt-4 px-4 py-2 bg-[#7400B8] text-white rounded-xl"
                    >
                        Return to Dashboard
                    </button>
                            </div>
                        </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
                {/* Header */}
            <Header
                title="Profile"
                description="Manage your account information"
                icon={FiUser}
                actionButton={
                    !isEditing && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEdit}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                        >
                            <FiEdit className="w-5 h-5" />
                            <span>Edit Profile</span>
                        </motion.button>
                    )
                }
            />

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">User Type</label>
                                        <select
                                            name="userType"
                                            value={formData.userType || 'individual'}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="business">Business</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Business Category</label>
                                        <select
                                            name="bussinessCategory"
                                            value={formData.bussinessCategory}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="healthcare">Healthcare</option>
                                            <option value="technology">Technology</option>
                                            <option value="education">Education</option>
                                            <option value="retail">Retail</option>
                                            <option value="manufacturing">Manufacturing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Business Type</label>
                                        <select
                                            name="bussinessType"
                                            value={formData.bussinessType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="B2B">B2B</option>
                                            <option value="B2C">B2C</option>
                                            <option value="C2C">C2C</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Phone</label>
                                        <input
                                            type="number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 pt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <FiLoader className="w-5 h-5 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiSave className="w-5 h-5" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        ) : (
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div 
                                    className="flex items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Name</p>
                                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{user.name || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiMail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Email</p>
                                        <p className="font-semibold text-gray-800">{user.email || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiCalendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Created At</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Subscription Status</p>
                                        <p className="font-semibold text-gray-800 capitalize">
                                            {user.subscriptionStataus || 'N/A'}
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiDatabase className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Business Category</p>
                                        <p className="font-semibold text-gray-800 capitalize">{user.bussinessCategory || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Business Type</p>
                                        <p className="font-semibold text-gray-800">{user.bussinessType || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiPhone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Phone</p>
                                        <p className="font-semibold text-gray-800">{user.phone || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">User Type</p>
                                        <p className="font-semibold text-gray-800 capitalize">{user.userType || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="flex items-center space-x-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                        <FiBriefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Company Name</p>
                                        <p className="font-semibold text-gray-800">{user.companyName || 'N/A'}</p>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    className="md:col-span-2 p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 }}
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center">
                                            <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                            <p className="text-xs sm:text-sm text-gray-600 font-medium">Login History</p>
                                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                                Recent logins ({Array.isArray(user.lastLogin) ? user.lastLogin.length : 0})
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {Array.isArray(user.lastLogin) && user.lastLogin.length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs sm:text-sm">
                                                    <thead className="bg-gray-50/80 text-gray-700">
                                                        <tr>
                                                            <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">#</th>
                                                            <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Date</th>
                                                            <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {user.lastLogin.slice(0, 3).map((login, index) => {
                                                            const date = new Date(login);
                                                            return (
                                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                                    <td className="py-1 sm:py-2 px-2 sm:px-4">{index + 1}</td>
                                                                    <td className="py-1 sm:py-2 px-2 sm:px-4">{date.toLocaleDateString()}</td>
                                                                    <td className="py-1 sm:py-2 px-2 sm:px-4">{date.toLocaleTimeString()}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                {user.lastLogin.length > 3 && (
                                                    <button className="mt-2 text-xs text-[#7400B8] underline" onClick={() => setShowAllLogins(true)}>
                                                        View All Logins
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-xs sm:text-sm">No login history available</p>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    {/* Subscription Plan */}
                    <div className="border-t border-gray-200/50 p-4 sm:p-8 bg-gradient-to-r from-[#7400B8]/5 to-[#9B4DCA]/5 rounded-2xl">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-8 flex items-center space-x-3">
                            <FiCreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-[#7400B8]" />
                            <span>Subscription Plan</span>
                        </h3>
                        {(!planData || !planData.currentPlan) ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-gray-700 mb-4">You have no active plan. Get started with our Free Plan!</p>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-bold shadow-lg hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200"
                                    onClick={handleSubscribeFree}
                                    disabled={upgradeLoading}
                                >
                                    {upgradeLoading ? 'Subscribing...' : 'Subscribe to Free Plan'}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full mx-0">
                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl w-full p-4 sm:p-8 border border-white/30 shadow-lg mx-0 sm:mx-2"
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-2xl flex items-center justify-center">
                                            <FiCreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg sm:text-xl font-bold text-gray-800 capitalize">
                                                {planData.currentPlan.name} Plan
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600 capitalize">
                                                {planData.userMeta?.subscriptionStatus || 'inactive'}
                                            </p>
                                            {planData.currentPlan.startDate && (
                                                <p className="text-xs text-gray-500 mt-1">Start: {new Date(planData.currentPlan.startDate).toLocaleDateString()}</p>
                                            )}
                                            {planData.currentPlan.endDate && (
                                                <p className="text-xs text-gray-500 mt-1">End: {new Date(planData.currentPlan.endDate).toLocaleDateString()}</p>
                                            )}
                                            {planData.userMeta?.currentPeriodEnd && (
                                                <p className="text-xs text-gray-500 mt-1">Current Period Ends: {new Date(planData.userMeta.currentPeriodEnd).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    <dl className="space-y-4 text-sm">
                                        {planData.currentPlan.limits && Object.entries(planData.currentPlan.limits).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                                                <dt className="text-gray-600 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</dt>
                                                <dd className="font-bold text-gray-800">{value}</dd>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                                            <dt className="text-gray-600 font-medium">Billing Interval</dt>
                                            <dd className="font-bold text-gray-800 capitalize">{planData.currentPlan.billingInterval}</dd>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 rounded-xl">
                                            <dt className="text-gray-700 font-bold">Price</dt>
                                            <dd className="font-bold text-[#7400B8]">₹{(planData.currentPlan.price / 100).toLocaleString('en-IN', {minimumFractionDigits: 0})}/month</dd>
                                        </div>
                                    </dl>
                                    {/* Payment History */}
                                    {planData.paymentHistory && planData.paymentHistory.length > 0 && (
                                        <div className="mt-6">
                                            <h5 className="font-bold text-gray-800 mb-2">Payment History</h5>
                                            <ul className="space-y-2 text-xs">
                                                {planData.paymentHistory.slice(0, 3).map((p, idx) => (
                                                    <li key={p._id || idx} className="flex justify-between items-center bg-gray-50/80 rounded-lg px-3 py-2">
                                                        <span>{new Date(p.date).toLocaleString()}</span>
                                                        <span>₹{(p.amount / 100).toLocaleString('en-IN', {minimumFractionDigits: 0})}</span>
                                                        <span className={p.status === 'success' ? 'text-green-600' : 'text-red-600'}>{p.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {planData.paymentHistory.length > 3 && (
                                                <button className="mt-2 text-xs text-[#7400B8] underline" onClick={() => setShowAllTransactions(true)}>
                                                    View All Transactions
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl w-full p-4 sm:p-8 border border-white/30 shadow-lg mx-0 sm:mx-2"
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 mb-6">
                                        <h4 className="font-bold text-gray-800 text-lg">Plan Features</h4>
                                        <div className="relative w-full sm:w-auto">
                                            <select
                                                value={selectedPlan}
                                                onChange={(e) => setSelectedPlan(e.target.value)}
                                                className="w-full sm:w-auto px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200 font-medium shadow-lg appearance-none pr-10"
                                            >
                                                {PLAN_OPTIONS.map(opt => (
                                                    <option key={opt.name} value={opt.name}>
                                                        {opt.label} - ₹{PLAN_DEFAULTS[opt.name].price === 0 ? 'Free' : (PLAN_DEFAULTS[opt.name].price / 100).toLocaleString('en-IN', {minimumFractionDigits: 0})}/month
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Selected Plan Details */}
                                    <div className="mb-6 w-full mx-0 px-0 sm:p-6 bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 rounded-2xl border border-[#7400B8]/20">
                                      <div className="p-4 sm:p-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-xl font-bold text-[#7400B8] capitalize">{selectedPlan} Plan</h5>
                                            <span className="text-2xl font-bold text-gray-800">
                                                ₹{PLAN_DEFAULTS[selectedPlan].price === 0 ? 'Free' : (PLAN_DEFAULTS[selectedPlan].price / 100).toLocaleString('en-IN', {minimumFractionDigits: 0})}
                                                <span className="text-sm text-gray-600">/month</span>
                                            </span>
                                        </div>
                                        
                                        {/* Plan Limits */}
                                        <div className="mb-4">
                                            <h6 className="font-semibold text-gray-700 mb-2">Limits</h6>
                                            <div className="grid grid-cols-2 gap-2 text-sm w-full">
                                                {Object.entries(PLAN_DEFAULTS[selectedPlan].limits).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                                        <span className="font-bold text-[#7400B8]">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Plan Features */}
                                        <div>
                                            <h6 className="font-semibold text-gray-700 mb-2">Features</h6>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm w-full">
                                                {Object.entries(PLAN_DEFAULTS[selectedPlan].features).map(([feature, enabled], index) => (
                                                    <motion.li 
                                                        key={feature} 
                                                        className="flex items-center space-x-3 bg-white/60 rounded-lg p-2 w-full mx-0"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        {enabled ?
                                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                <FiCheck className="w-3 h-3 text-white" />
                                                            </div> :
                                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                                <FiX className="w-3 h-3 text-white" />
                                                            </div>
                                                        }
                                                        <span className={`font-medium ${enabled ? "text-gray-800" : "text-gray-500"}`}>
                                                            {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Upgrade Button */}
                                    <button
                                        className="w-full py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200 font-medium shadow-lg flex items-center justify-center space-x-2"
                                        onClick={() => {
                                            if (selectedPlan === 'free') {
                                                handleSubscribeFree();
                                            } else {
                                                handleRazorpayPayment();
                                            }
                                        }}
                                        disabled={upgradeLoading || isPaymentLoading}
                                    >
                                        {upgradeLoading ? (
                                            <>
                                                <FiLoader className="w-5 h-5 animate-spin" />
                                                <span>{selectedPlan === 'free' ? 'Subscribing...' : 'Processing...'}</span>
                                            </>
                                        ) : isPaymentLoading ? (
                                            <>
                                                <FiLoader className="w-5 h-5 animate-spin" />
                                                <span>Opening Payment Gateway...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiArrowUpCircle className="w-5 h-5" />
                                                <span>Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Usage Statistics */}
                                    {usageData && (
                                        <div className="mt-8">
                                            <h5 className="font-bold text-gray-800 mb-2">Usage Statistics</h5>
                                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-xs sm:text-sm">
                                                {Object.entries(usageData).filter(([k]) => k !== 'updatedAt').map(([key, value]) => (
                                                    <div key={key} className="p-3 sm:p-4 bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 rounded-xl">
                                                        <dt className="text-gray-600 font-medium mb-1 sm:mb-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</dt>
                                                        <dd className="font-bold text-xl sm:text-2xl text-[#7400B8]">{value}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                            {usageData.updatedAt && (
                                                <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(usageData.updatedAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #7400B8;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9B4DCA;
                }
            `}</style>
            {/* Modal for all logins */}
            {showAllLogins && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowAllLogins(false)}><FiX /></button>
                        <h3 className="text-lg font-bold mb-4">All Login History</h3>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50/80 text-gray-700">
                                    <tr>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">#</th>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Date</th>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {user.lastLogin.map((login, index) => {
                                        const date = new Date(login);
                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                <td className="py-1 sm:py-2 px-2 sm:px-4">{index + 1}</td>
                                                <td className="py-1 sm:py-2 px-2 sm:px-4">{date.toLocaleDateString()}</td>
                                                <td className="py-1 sm:py-2 px-2 sm:px-4">{date.toLocaleTimeString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal for all transactions */}
            {showAllTransactions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowAllTransactions(false)}><FiX /></button>
                        <h3 className="text-lg font-bold mb-4">All Transactions</h3>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-gray-50/80 text-gray-700">
                                    <tr>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">#</th>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Date</th>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Amount</th>
                                        <th className="py-1 sm:py-2 px-2 sm:px-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {planData.paymentHistory.map((p, idx) => (
                                        <tr key={p._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                            <td className="py-1 sm:py-2 px-2 sm:px-4">{idx + 1}</td>
                                            <td className="py-1 sm:py-2 px-2 sm:px-4">{new Date(p.date).toLocaleString()}</td>
                                            <td className="py-1 sm:py-2 px-2 sm:px-4">₹{(p.amount / 100).toLocaleString('en-IN', {minimumFractionDigits: 0})}</td>
                                            <td className={p.status === 'success' ? 'text-green-600' : 'text-red-600'}>{p.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 