import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', designation: '', company: '', testimonialText: '', imageUrl: '', ratings: 5 });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/testimonials/`);
            setTestimonials(Array.isArray(res.data) ? res.data : (res.data.Data || res.data.testimonials || []));
        } catch {
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchTestimonials(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };
    const handleRating = (r) => setForm(f => ({ ...f, ratings: r }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        console.log('Submitting testimonial:', form);
        try {
            const res = await axios.post(`${API_BASE_URL}/testimonials/`, form);
            setSuccess('Thank you for your feedback!');
            setForm({ name: '', designation: '', company: '', testimonialText: '', imageUrl: '', ratings: 5 });
            setShowModal(false);
            fetchTestimonials();
        } catch (err) {
            console.error('Testimonial submit error:', err);
            setError('Failed to submit testimonial.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-gradient-to-br from-[#2D1B69] to-[#4C2A85] relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-white">What Our Clients Say</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Trusted by businesses of all sizes around the world</p>
                </motion.div>

                <div className="flex justify-center mb-8">
                    <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-6 py-3 rounded-full font-semibold shadow hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all">Share Your Experience</button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#7400B8]" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.filter(t => t.ratings === 5).slice(0, 6).map((testimonial, index) => (
                                <motion.div
                                    key={testimonial._id || index}
                                    className={`relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col items-center text-center`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    {/* Gradient Accent */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] opacity-10 rounded-full z-0"></div>
                                    {/* User Image */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <img
                                            src={testimonial.imageUrl || '/assets/20945368.jpg'}
                                            alt={testimonial.name}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-lg mb-4"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/20945368.jpg";
                                            }}
                                        />
                                        <h3 className="font-bold text-lg text-white mb-1">{testimonial.name}</h3>
                                        <div className="text-sm text-gray-400 mb-2">
                                            {testimonial.designation} {testimonial.company && <>@ {testimonial.company}</>}
                                        </div>
                                    </div>
                                    {/* Testimonial Text */}
                                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                                        <p className="text-gray-300 italic text-base leading-relaxed mb-4 mt-2">
                                            <span className="text-2xl text-[#A78BFA] font-serif mr-1">"</span>
                                            {testimonial.testimonialText}
                                            <span className="text-2xl text-[#A78BFA] font-serif ml-1">"</span>
                                        </p>
                                    </div>
                                    {/* Ratings */}
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={i < testimonial.ratings ? 'text-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    {/* Date */}
                                    {testimonial.createdAt && (
                                        <div className="text-xs text-gray-400 mt-2">{new Date(testimonial.createdAt).toLocaleDateString()}</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-8">
                            <Link to="/testimonials" className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-6 py-3 rounded-full font-semibold shadow hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all">
                                View All Testimonials
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Modal for adding testimonial */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <motion.form onSubmit={handleSubmit} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full relative border border-[#7400B8]/10 mx-2 flex flex-col gap-4">
                            <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-[#7400B8] transition-all" onClick={() => setShowModal(false)}><FiX className="w-6 h-6" /></button>
                            <h2 className="text-xl font-bold mb-2 text-[#7400B8]">Share Your Experience</h2>
                            <input className="border rounded-xl px-3 py-2" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required />
                            <input className="border rounded-xl px-3 py-2" name="designation" value={form.designation} onChange={handleChange} placeholder="Your Designation" required />
                            <input className="border rounded-xl px-3 py-2" name="company" value={form.company} onChange={handleChange} placeholder="Your Company" required />
                            <textarea className="border rounded-xl px-3 py-2" name="testimonialText" value={form.testimonialText} onChange={handleChange} placeholder="Your Testimonial" rows={3} required />
                            <input className="border rounded-xl px-3 py-2" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL (optional)" />
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Ratings:</span>
                                {[1, 2, 3, 4, 5].map(r => (
                                    <button key={r} type="button" onClick={() => handleRating(r)} className={form.ratings >= r ? 'text-yellow-400' : 'text-gray-300'}><FiStar /></button>
                                ))}
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            {success && <div className="text-green-600 text-sm">{success}</div>}
                            <button type="submit" disabled={submitting} className="mt-2 w-full py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-semibold">{submitting ? 'Submitting...' : 'Submit Testimonial'}</button>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default TestimonialsSection;