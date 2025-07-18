import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiShield, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PLAN_OPTIONS = [
    { name: 'free', label: 'Free' },
    { name: 'premium', label: 'Premium' },
    { name: 'enterprise', label: 'Enterprise' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [assignPlanUser, setAssignPlanUser] = useState(null);
    const [assignPlanModalOpen, setAssignPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [assigningPlan, setAssigningPlan] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/users?userId=${user.id}`);
            console.log('AdminDashboard user list data:', res.data);
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setActionLoading(id);
        setError('');
        setSuccess('');
        try {
            await axios.delete(`${API_BASE_URL}/admin/users/${id}/?userId=${user.id}`);
            toast.success('User deleted successfully');
            setUsers(users.filter(u => u._id !== id && u.id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        setActionLoading(id + '-role');
        setError('');
        setSuccess('');
        try {
            await axios.patch(`${API_BASE_URL}/admin/role/${id}/?userId=${user.id}`, { role: newRole });
            toast.success('Role updated successfully');
            setUsers(users.map(u => (u._id === id || u.id === id) ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdate = async (id, updatedFields) => {
        setActionLoading(id + '-update');
        setError('');
        setSuccess('');
        try {
            await axios.patch(`${API_BASE_URL}/admin/users/${id}/?userId=${user.id}`, updatedFields);
            toast.success('User updated successfully');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    // Modal open/close handlers
    const openModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const openAssignPlanModal = (user) => {
        setAssignPlanUser(user);
        setSelectedPlan('free');
        setAssignPlanModalOpen(true);
    };
    const closeAssignPlanModal = () => {
        setAssignPlanModalOpen(false);
        setAssignPlanUser(null);
    };
    const handleAssignPlan = async () => {
        if (!assignPlanUser || !selectedPlan) return;
        setAssigningPlan(true);
        try {
            await axios.post(
                `${API_BASE_URL}/admin/assign-plan`,
                {
                    planName: selectedPlan,
                    userId: assignPlanUser._id || assignPlanUser.id
                }
            );
            toast.success('Plan assigned successfully!');
            closeAssignPlanModal();
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign plan');
        } finally {
            setAssigningPlan(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7400B8]/5 via-[#9B4DCA]/5 to-[#C77DFF]/5 p-4">
            <div className="w-full max-w-7xl mx-auto bg-white/80 rounded-3xl shadow-xl border border-white/20 p-2 sm:p-6 mt-10">
                <h1 className="text-3xl font-bold mb-6 text-[#7400B8]">Admin Dashboard</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        </div>
                    </div>
                ) : error ? null : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full bg-white rounded-xl overflow-hidden shadow text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white">
                                    <th className="py-2 px-3 text-left font-semibold">Name</th>
                                    <th className="py-2 px-3 text-left font-semibold">Email</th>
                                    <th className="py-2 px-3 text-left font-semibold">Role</th>
                                    <th className="py-2 px-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id || u.id} className="border-b last:border-b-0 hover:bg-[#F9F4FF] transition-all">
                                        <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="text-[#7400B8]" /> {u.name || u.email}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-gray-700 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FiMail className="text-[#9B4DCA]" /> {u.email}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${u.role === 'admin' ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white border-transparent' : 'bg-white text-[#7400B8] border-[#7400B8]'}`}
                                                    disabled={actionLoading === (u._id || u.id) + '-role'}
                                                    onClick={() => handleRoleChange(u._id || u.id, 'admin')}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${u.role === 'user' ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white border-transparent' : 'bg-white text-[#7400B8] border-[#7400B8]'}`}
                                                    disabled={actionLoading === (u._id || u.id) + '-role'}
                                                    onClick={() => handleRoleChange(u._id || u.id, 'user')}
                                                >
                                                    User
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 flex gap-2 flex-wrap whitespace-nowrap">
                                            <button
                                                className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-3 py-1 rounded-xl hover:shadow-lg transition-all duration-200 text-xs font-medium shadow"
                                                onClick={() => openModal(u)}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition-all duration-200 text-xs font-medium shadow disabled:opacity-50"
                                                disabled={actionLoading === (u._id || u.id)}
                                                onClick={() => handleDelete(u._id || u.id)}
                                            >
                                                {actionLoading === (u._id || u.id) ? 'Deleting...' : 'Delete'}
                                            </button>
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition-all duration-200 text-xs font-medium shadow flex items-center gap-1"
                                                onClick={() => openAssignPlanModal(u)}
                                            >
                                                <FiGift className="w-4 h-4" /> Assign Plan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {success && null}
            </div>

            {/* Assign Plan Modal */}
            <AnimatePresence>
                {assignPlanModalOpen && assignPlanUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-0 sm:p-0 max-w-md w-full relative border border-[#7400B8]/10 mx-2 flex flex-col items-center overflow-hidden"
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-[#7400B8] transition-all z-20"
                                onClick={closeAssignPlanModal}
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                            <div className="w-full flex flex-col items-center justify-center bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 pt-10 pb-6 px-6 relative">
                                <FiGift className="w-12 h-12 text-[#7400B8] mb-2" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight drop-shadow">Assign Plan</h2>
                                <div className="text-gray-600 mb-4">Assign a subscription plan to <span className="font-semibold">{assignPlanUser.name || assignPlanUser.email}</span></div>
                                <select
                                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200 text-base mb-4"
                                    value={selectedPlan}
                                    onChange={e => setSelectedPlan(e.target.value)}
                                >
                                    {PLAN_OPTIONS.map(opt => (
                                        <option key={opt.name} value={opt.name}>{opt.label}</option>
                                    ))}
                                </select>
                                <button
                                    className="w-full py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-semibold hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200 mt-2"
                                    onClick={handleAssignPlan}
                                    disabled={assigningPlan}
                                >
                                    {assigningPlan ? 'Assigning...' : 'Assign Plan'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Details Modal */}
            <AnimatePresence>
                {showModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-0 sm:p-0 max-w-4xl w-full relative border border-[#7400B8]/10 mx-2 flex flex-col items-center overflow-hidden"
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-[#7400B8] transition-all z-20"
                                onClick={closeModal}
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                            <div className="w-full flex flex-col items-center justify-center pt-6 sm:pt-10 pb-0 px-0 sm:px-0 relative">
                                {/* Empty: header is now just close button */}
                            </div>
                            <div className="w-full px-4 pb-6 overflow-y-auto max-h-[80vh] sm:px-10 sm:pb-10 mt-4">
                                <div className="bg-white/80 rounded-2xl shadow border border-[#7400B8]/10 p-6 mb-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-6">
                                    <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] shadow-lg border-4 border-white">
                                      <FiUser className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                                    </div>
                                    <div className="mt-4 sm:mt-0">
                                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">{selectedUser.name}</h2>
                                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                                        <FiMail className="w-5 h-5 text-[#9B4DCA]" />
                                        <span className="font-medium text-base sm:text-lg">{selectedUser.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><span className="font-medium text-gray-700">Username:</span> <span className="text-gray-800">{selectedUser.username}</span></div>
                                    <div><span className="font-medium text-gray-700">Role:</span> <span className={`px-2 py-1 rounded-xl text-xs font-semibold border ${selectedUser.role === 'admin' ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white border-transparent' : 'bg-white text-[#7400B8] border-[#7400B8]'}`}>{selectedUser.role}</span></div>
                                    <div><span className="font-medium text-gray-700">User Type:</span> <span className="text-gray-800">{selectedUser.userType}</span></div>
                                    <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-800">{selectedUser.status}</span></div>
                                    <div><span className="font-medium text-gray-700">User ID:</span> <span className="break-all text-gray-800">{selectedUser._id}</span></div>
                                    <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-800">{selectedUser.createdAt && new Date(selectedUser.createdAt).toLocaleString()}</span></div>
                                    <div><span className="font-medium text-gray-700">Updated:</span> <span className="text-gray-800">{selectedUser.updatedAt && new Date(selectedUser.updatedAt).toLocaleString()}</span></div>
                                  </div>
                                </div>
                                {/* Business Info */}
                                <div className="bg-white/80 rounded-2xl shadow border border-[#9B4DCA]/10 p-6 mb-6">
                                  <h3 className="text-lg font-bold text-[#9B4DCA] mb-4">Business Info</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><span className="font-medium text-gray-700">Business Type:</span> <span className="text-gray-800">{selectedUser.businessType}</span></div>
                                    <div><span className="font-medium text-gray-700">Category:</span> <span className="text-gray-800">{selectedUser.category}</span></div>
                                    <div><span className="font-medium text-gray-700">Company Name:</span> <span className="text-gray-800">{selectedUser.companyName}</span></div>
                                    <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-800">{selectedUser.phone}</span></div>
                                  </div>
                                </div>
                                {/* Login History */}
                                {selectedUser.lastLogin && Array.isArray(selectedUser.lastLogin) && (
                                  <div className="bg-white/80 rounded-2xl shadow border border-[#7400B8]/10 p-6 mb-6">
                                    <h3 className="text-lg font-bold text-[#7400B8] mb-4">Login History</h3>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs sm:text-sm">
                                        <thead className="bg-gray-50/80 text-gray-700">
                                          <tr>
                                            <th className="py-1 px-2 text-left">#</th>
                                            <th className="py-1 px-2 text-left">Date</th>
                                            <th className="py-1 px-2 text-left">Time</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {selectedUser.lastLogin.slice(0, 10).map((login, idx) => {
                                            const date = new Date(login);
                                            return (
                                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                <td className="py-1 px-2">{idx + 1}</td>
                                                <td className="py-1 px-2">{date.toLocaleDateString()}</td>
                                                <td className="py-1 px-2">{date.toLocaleTimeString()}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                      {selectedUser.lastLogin.length > 10 && (
                                        <div className="text-xs text-gray-500 mt-2">Showing 10 of {selectedUser.lastLogin.length} logins</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Subscription Info */}
                                <div className="bg-white/80 rounded-2xl shadow border border-[#9B4DCA]/10 p-6 mb-6">
                                  <h3 className="text-lg font-bold text-[#9B4DCA] mb-4">Subscription</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><span className="font-medium text-gray-700">Subscription Status:</span> <span className="text-gray-800">{selectedUser.subscriptionStatus}</span></div>
                                    <div><span className="font-medium text-gray-700">Current Period End:</span> <span className="text-gray-800">{selectedUser.currentPeriodEnd && new Date(selectedUser.currentPeriodEnd).toLocaleString()}</span></div>
                                    <div><span className="font-medium text-gray-700">Subscription IDs:</span> <span className="text-gray-800">{selectedUser.subscription && Array.isArray(selectedUser.subscription) ? selectedUser.subscription.join(', ') : ''}</span></div>
                                  </div>
                                </div>
                                {/* Plan Info */}
                                {selectedUser.plan && (
                                  <div className="bg-white/80 rounded-2xl shadow border border-[#7400B8]/10 p-6 mb-6">
                                    <h3 className="text-lg font-bold text-[#7400B8] mb-4">Plan Info</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div><span className="font-medium text-gray-700">Plan Name:</span> <span className="text-gray-800">{selectedUser.plan.name}</span></div>
                                      <div><span className="font-medium text-gray-700">Billing Interval:</span> <span className="text-gray-800">{selectedUser.plan.billingInterval}</span></div>
                                      <div><span className="font-medium text-gray-700">Price:</span> <span className="text-gray-800">₹{selectedUser.plan.price ? (selectedUser.plan.price / 100).toLocaleString('en-IN', {minimumFractionDigits: 0}) : '0'}</span></div>
                                      <div><span className="font-medium text-gray-700">Is Active:</span> <span className="text-gray-800">{selectedUser.plan.isActive ? 'Yes' : 'No'}</span></div>
                                      <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-800">{selectedUser.plan.createdAt && new Date(selectedUser.plan.createdAt).toLocaleString()}</span></div>
                                      <div><span className="font-medium text-gray-700">Updated:</span> <span className="text-gray-800">{selectedUser.plan.updatedAt && new Date(selectedUser.plan.updatedAt).toLocaleString()}</span></div>
                                    </div>
                                    {/* Plan Limits */}
                                    {selectedUser.plan.limits && (
                                      <div className="mb-4">
                                        <h4 className="font-semibold text-[#9B4DCA] mb-1">Limits</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(selectedUser.plan.limits).map(([key, value]) => (
                                            <span key={key} className="bg-[#E0C3FC]/60 text-[#7400B8] px-3 py-1 rounded-full text-xs font-semibold border border-[#9B4DCA]/10">{key}: {value}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {/* Plan Features */}
                                    {selectedUser.plan.features && (
                                      <div className="mb-2">
                                        <h4 className="font-semibold text-[#9B4DCA] mb-1">Features</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(selectedUser.plan.features).map(([key, value]) => (
                                            <span key={key} className={`px-3 py-1 rounded-full text-xs font-semibold border ${value ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{key}: {String(value)}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Other Info */}
                                <div className="bg-white/80 rounded-2xl shadow border border-[#7400B8]/10 p-6 mb-6">
                                  <h3 className="text-lg font-bold text-[#7400B8] mb-4">Other Info</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><span className="font-medium text-gray-700">Chart Count:</span> <span className="text-gray-800">{selectedUser.chartCount}</span></div>
                                    <div><span className="font-medium text-gray-700">Report Count:</span> <span className="text-gray-800">{selectedUser.reportCount}</span></div>
                                  </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard; 