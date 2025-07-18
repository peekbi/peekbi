import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiStar, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const AllTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <section className="py-24 bg-[#F9F4FF] min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-[35rem] h-[35rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
                <div className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
            </div>
            <div className="container mx-auto px-4 max-w-[1200px]">
                <div className="flex items-center mb-8">
                    <Link to="/" className="flex items-center gap-2 text-[#7400B8] font-semibold hover:underline">
                        <FiArrowLeft /> Back to Home
                    </Link>
                </div>
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">All Testimonials</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">See what everyone is saying about us</p>
                </motion.div>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#7400B8]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial._id || index}
                                className={`relative rounded-3xl p-8 shadow-xl overflow-hidden group bg-white/90 backdrop-blur-md border border-white/30 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#7400B8] to-[#9B4DCA] opacity-10 rounded-full z-0"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <img
                                        src={testimonial.imageUrl || '/assets/20945368.jpg'}
                                        alt={testimonial.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/20945368.jpg";
                                        }}
                                    />
                                    <h3 className="font-bold text-lg text-gray-800 mb-1">{testimonial.name}</h3>
                                    <div className="text-sm text-gray-500 mb-2">
                                        {testimonial.designation} {testimonial.company && <>@ {testimonial.company}</>}
                                    </div>
                                </div>
                                <div className="relative z-10 flex-1 flex flex-col justify-center">
                                    <p className="text-gray-700 italic text-base leading-relaxed mb-4 mt-2">
                                        <span className="text-2xl text-[#7400B8] font-serif mr-1">"</span>
                                        {testimonial.testimonialText}
                                        <span className="text-2xl text-[#7400B8] font-serif ml-1">"</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < testimonial.ratings ? 'text-yellow-400' : 'text-gray-300'} />
                                    ))}
                                </div>
                                {testimonial.createdAt && (
                                    <div className="text-xs text-gray-400 mt-2">{new Date(testimonial.createdAt).toLocaleDateString()}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllTestimonials; 