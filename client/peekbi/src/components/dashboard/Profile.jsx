import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiCreditCard, FiShield, FiDatabase, FiCheck, FiX, FiEdit2, FiSave, FiLoader, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const { user: currentUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        userType: '',
        bussinessCategory: '',
        bussinessType: '',
        phone: '',
        companyName: ''
    });

    // Add lastLogin display helper
    const formatLastLogin = (lastLogin) => {
        if (!lastLogin || lastLogin.length === 0) return 'Never';
        const lastLoginDate = new Date(lastLogin[lastLogin.length - 1]);
        return lastLoginDate.toLocaleString();
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Wait for auth to finish loading
                if (authLoading) {
                    return;
                }

                // If no current user, we can't proceed
                if (!currentUser) {
                    throw new Error('Please log in to view your profile');
                }

                // Use currentUser._id for API calls
                const userId = currentUser._id;

                // Double check userId is available
                if (!userId) {
                    console.error('No user ID available:', {
                        currentUser,
                        currentUserId: currentUser?._id,
                        authLoading
                    });
                    throw new Error('User ID not found. Please log in again.');
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }

                console.log('Fetching user profile for ID:', userId, 'Current user:', currentUser);
                const response = await axios.get(`https://api.peekbi.com/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('API Response:', response.data);

                // Check if response has the expected structure
                if (!response.data) {
                    throw new Error('Empty response received from server');
                }

                // Check if response has status field
                if (response.data.status !== 'success') {
                    throw new Error(`API returned status: ${response.data.status}`);
                }

                // Check if response has user field
                if (!response.data.user) {
                    console.error('Response missing user field:', response.data);
                    throw new Error('Invalid response format: missing user field');
                }

                const userData = response.data.user;

                // Validate required user fields
                if (!userData.id && !userData._id) {
                    console.error('User data missing ID:', userData);
                    throw new Error('Invalid user data: missing ID');
                }

                // Set user data exactly as received from API
                setUser({
                    ...userData,
                    // Ensure we have all fields with correct types
                    id: userData.id,
                    name: userData.name || '',
                    email: userData.email || '',
                    username: userData.username || '',
                    userType: userData.userType || '',
                    bussinessCategory: userData.bussinessCategory || '',
                    bussinessType: userData.bussinessType || '',
                    phone: userData.phone || '',
                    createdAt: userData.createdAt,
                    lastLogin: userData.lastLogin || [],
                    plan: userData.plan || {
                        _id: '',
                        name: 'free',
                        price: 0,
                        billingInterval: 'monthly',
                        maxReports: 0,
                        maxSavedCharts: 0,
                        maxUsersPerAccount: 1,
                        dataRetentionDays: 30,
                        features: {}
                    },
                    subscriptionStataus: userData.subscriptionStataus || 'inactive',
                    currentPeriodEnd: userData.currentPeriodEnd,
                    repoerCount: userData.repoerCount || 0,
                    chartCount: userData.chartCount || 0
                });

                // Set form data with exact field names
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    username: userData.username || '',
                    userType: userData.userType || '',
                    bussinessCategory: userData.bussinessCategory || '',
                    bussinessType: userData.bussinessType || '',
                    phone: userData.phone || ''
                });

            } catch (err) {
                console.error('Error fetching user profile:', {
                    error: err,
                    response: err.response?.data,
                    status: err.response?.status,
                    message: err.message,
                    currentUser,
                    currentUserId: currentUser?._id,
                    authLoading
                });

                let errorMessage = 'Failed to fetch user profile';

                if (err.response?.status === 401) {
                    errorMessage = 'Session expired. Please log in again.';
                } else if (err.response?.status === 403) {
                    errorMessage = 'You do not have permission to view this profile.';
                } else if (err.response?.status === 404) {
                    errorMessage = 'User profile not found.';
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if auth is not loading and we have current user
        if (!authLoading && currentUser) {
            fetchUserProfile();
        } else if (!authLoading) {
            console.error('No user available:', {
                currentUser,
                currentUserId: currentUser?._id,
                authLoading
            });
            setError('User not found. Please log in again.');
            setLoading(false);
        }
    }, [currentUser, authLoading, navigate]);

    const handleEdit = () => {
        setIsEditing(true);
        setUpdateError(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setUpdateError(null);
        // Reset form data to original user data
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                username: user.username || '',
                userType: user.userType || '',
                bussinessCategory: user.bussinessCategory || '',
                bussinessType: user.bussinessType || '',
                phone: user.phone || '',
                companyName: user.companyName || ''
            });
        }
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
        setUpdateError(null);
        setIsUpdating(true);

        try {
            if (!currentUser) {
                throw new Error('User not found. Please log in again.');
            }

            const userId = currentUser._id;
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            // Send update data with exact field names as expected by the backend
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                userType: formData.userType,
                category: formData.bussinessCategory,
                username: formData.username,
                businessType: formData.bussinessType,
                companyName: formData.companyName
            };

            console.log('Sending update request with data:', updateData);

            const response = await axios.patch(`https://api.peekbi.com/users/${userId}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Update response:', response.data);

            if (response.data.status === 'success' && response.data.user) {
                // Set user data exactly as received from API
                const updatedUser = response.data.user;
                setUser({
                    ...updatedUser,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    userType: updatedUser.userType,
                    bussinessCategory: updatedUser.category,
                    username: updatedUser.username,
                    bussinessType: updatedUser.businessType,
                    companyName: updatedUser.companyName,
                    subscriptionStataus: updatedUser.subscriptionStatus,
                    currentPeriodEnd: updatedUser.currentPeriodEnd,
                    repoerCount: updatedUser.reportCount,
                    chartCount: updatedUser.chartCount
                });
                setIsEditing(false);
                setUpdateError(null);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Error updating profile:', {
                error: err,
                response: err.response?.data,
                status: err.response?.status,
                message: err.message,
                currentUser,
                currentUserId: currentUser?._id
            });

            let errorMessage = 'Failed to update profile';

            if (err.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to update this profile.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setUpdateError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
                    <p className="mt-4 text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="px-4 py-2 bg-[#7400B8] text-white rounded-lg hover:bg-[#9B4DCA] transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-gray-600 mb-4">No user data available</div>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="px-4 py-2 bg-[#7400B8] text-white rounded-lg hover:bg-[#9B4DCA] transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9F4FF] via-white to-[#F9F4FF]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-transparent bg-clip-text">Profile Information</h2>
                    {!isEditing && user && (
                        <button
                            onClick={handleEdit}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            <FiEdit2 className="w-5 h-5 mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* User Information */}
                    <div className="p-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {updateError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                        {updateError}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">User Type</label>
                                        <select
                                            name="userType"
                                            value={formData.userType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="business">Business</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Business Category</label>
                                        <select
                                            name="bussinessCategory"
                                            value={formData.bussinessCategory}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        >
                                            <option value="healthcare">Healthcare</option>
                                            <option value="technology">Technology</option>
                                            <option value="education">Education</option>
                                            <option value="retail">Retail</option>
                                            <option value="manufacturing">Manufacturing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Business Type</label>
                                        <select
                                            name="bussinessType"
                                            value={formData.bussinessType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        >
                                            <option value="B2B">B2B</option>
                                            <option value="B2C">B2C</option>
                                            <option value="C2C">C2C</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                                        <input
                                            type="number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#7400B8] text-white rounded-lg hover:bg-[#9B4DCA] transition-colors flex items-center space-x-2"
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
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiUser className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium text-gray-800">{user.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiMail className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-800">{user.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiUser className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Username</p>
                                        <p className="font-medium text-gray-800">{user.username || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiCalendar className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Created At</p>
                                        <p className="font-medium text-gray-800">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Subscription Status</p>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {user.subscriptionStataus || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Business Category</p>
                                        <p className="font-medium text-gray-800 capitalize">{user.bussinessCategory || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Business Type</p>
                                        <p className="font-medium text-gray-800">{user.bussinessType || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiShield className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium text-gray-800">{user.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiUser className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">User Type</p>
                                        <p className="font-medium text-gray-800 capitalize">{user.userType || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiCalendar className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Login</p>
                                        <p className="font-medium text-gray-800">
                                            {formatLastLogin(user.lastLogin)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiDatabase className="w-6 h-6 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Company Name</p>
                                        <p className="font-medium text-gray-800">{user.companyName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subscription Plan */}
                    <div className="border-t border-gray-200 p-8 bg-gradient-to-r from-[#7400B8]/5 to-[#9B4DCA]/5">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Subscription Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-[#7400B8]/10 rounded-lg flex items-center justify-center">
                                        <FiCreditCard className="w-8 h-8 text-[#7400B8]" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 capitalize">
                                            {user.plan?.name || 'free'} Plan
                                        </h4>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {user.subscriptionStataus || 'inactive'}
                                        </p>
                                    </div>
                                </div>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Max Reports</dt>
                                        <dd className="font-medium text-gray-800">{user.plan?.maxReports || 0}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Max Saved Charts</dt>
                                        <dd className="font-medium text-gray-800">{user.plan?.maxSavedCharts || 0}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Max Users</dt>
                                        <dd className="font-medium text-gray-800">{user.plan?.maxUsersPerAccount || 1}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Data Retention</dt>
                                        <dd className="font-medium text-gray-800">{user.plan?.dataRetentionDays || 30} days</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Billing Interval</dt>
                                        <dd className="font-medium text-gray-800 capitalize">{user.plan?.billingInterval || 'Monthly'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Price</dt>
                                        <dd className="font-medium text-gray-800">${user.plan?.price || 0}/month</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <h4 className="font-medium text-gray-800 mb-4">Plan Features</h4>
                                <ul className="space-y-2 text-sm">
                                    {user.plan?.features && Object.entries(user.plan.features).map(([feature, enabled]) => (
                                        <li key={feature} className="flex items-center space-x-2">
                                            {enabled ?
                                                <FiCheck className="w-5 h-5 text-green-500" /> :
                                                <FiX className="w-5 h-5 text-red-500" />
                                            }
                                            <span className={enabled ? "text-gray-800" : "text-gray-500"}>
                                                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            <h4 className="font-medium text-gray-800 mb-4">Usage Statistics</h4>
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-gray-600">Reports Created</dt>
                                    <dd className="font-medium text-gray-800">{user.repoerCount || 0}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-600">Charts Created</dt>
                                    <dd className="font-medium text-gray-800">{user.chartCount || 0}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile; 