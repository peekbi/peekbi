import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const AdminTestimonials = () => {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [form, setForm] = useState({});
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchTestimonials = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/testimonials?userId=${user.id}`);
            setTestimonials(Array.isArray(res.data) ? res.data : (res.data.Data || res.data.testimonials || []));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch testimonials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTestimonials(); /* eslint-disable-next-line */ }, []);

    const openEdit = (t) => {
        setSelected(t);
        setForm({ ...t });
        setModalMode('edit');
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        setForm({});
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };
    const handleRating = (r) => setForm(f => ({ ...f, ratings: r }));
    const handleUpdate = async () => {
        if (!selected) return;
        try {
            await axios.put(`${API_BASE_URL}/admin/testimonials/${selected._id}/?userId=${user.id}`, form);
            toast.success('Testimonial updated');
            closeModal();
            fetchTestimonials();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update testimonial');
        }
    };
    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/admin/testimonials/${deleteId}/?userId=${user.id}`);
            toast.success('Testimonial deleted');
            setDeleteId(null);
            fetchTestimonials();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete testimonial');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto bg-white/80 rounded-3xl shadow-xl border border-white/20 p-2 sm:p-6 mt-10">
            <h1 className="text-3xl font-bold mb-6 text-[#7400B8]">Manage Testimonials</h1>
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
                                <th className="py-2 px-3 text-left font-semibold">Designation</th>
                                <th className="py-2 px-3 text-left font-semibold">Company</th>
                                <th className="py-2 px-3 text-left font-semibold">Text</th>
                                <th className="py-2 px-3 text-left font-semibold">Image</th>
                                <th className="py-2 px-3 text-left font-semibold">Ratings</th>
                                <th className="py-2 px-3 text-left font-semibold">Created</th>
                                <th className="py-2 px-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map(t => (
                                <tr key={t._id} className="border-b last:border-b-0 hover:bg-[#F9F4FF] transition-all">
                                    <td className="py-2 px-3 whitespace-nowrap">{t.name}</td>
                                    <td className="py-2 px-3 whitespace-nowrap">{t.designation}</td>
                                    <td className="py-2 px-3 whitespace-nowrap">{t.company}</td>
                                    <td className="py-2 px-3 max-w-xs truncate">{t.testimonialText}</td>
                                    <td className="py-2 px-3">
                                        {t.imageUrl && <img src={t.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />}
                                    </td>
                                    <td className="py-2 px-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className={i < t.ratings ? 'text-yellow-400' : 'text-gray-300'} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</td>
                                    <td className="py-2 px-3 flex gap-2">
                                        <button onClick={() => openEdit(t)} className="px-2 py-1 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl flex items-center gap-1 text-xs"><FiEdit /> Edit</button>
                                        <button onClick={() => confirmDelete(t._id)} className="px-2 py-1 bg-red-500 text-white rounded-xl flex items-center gap-1 text-xs"><FiTrash2 /> Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {success && null}
            {/* Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full relative border border-[#7400B8]/10 mx-2">
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-[#7400B8] transition-all" onClick={closeModal}><FiX className="w-6 h-6" /></button>
                            <h2 className="text-xl font-bold mb-4 text-[#7400B8]">Edit Testimonial</h2>
                            <div className="flex flex-col gap-3">
                                <input className="border rounded-xl px-3 py-2" name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" />
                                <input className="border rounded-xl px-3 py-2" name="designation" value={form.designation || ''} onChange={handleChange} placeholder="Designation" />
                                <input className="border rounded-xl px-3 py-2" name="company" value={form.company || ''} onChange={handleChange} placeholder="Company" />
                                <textarea className="border rounded-xl px-3 py-2" name="testimonialText" value={form.testimonialText || ''} onChange={handleChange} placeholder="Testimonial" rows={3} />
                                <input className="border rounded-xl px-3 py-2" name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} placeholder="Image URL" />
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Ratings:</span>
                                    {[1,2,3,4,5].map(r => (
                                        <button key={r} type="button" onClick={() => handleRating(r)} className={form.ratings >= r ? 'text-yellow-400' : 'text-gray-300'}><FiStar /></button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleUpdate} className="mt-6 w-full py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-semibold">Save Changes</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative border border-[#7400B8]/10 mx-2">
                            <h2 className="text-lg font-bold mb-4 text-[#7400B8]">Delete Testimonial?</h2>
                            <p className="mb-6">Are you sure you want to delete this testimonial? This action cannot be undone.</p>
                            <div className="flex gap-4 justify-end">
                                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white" disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTestimonials; 