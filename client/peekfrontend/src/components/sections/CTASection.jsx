import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
                <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px] relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-6 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Ready to Transform Your Business with Data?
                    </motion.h2>

                    <motion.p
                        className="text-xl text-white/90 mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Join thousands of businesses that use PeekBI to make data-driven decisions and achieve remarkable growth.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <button className="bg-white text-[#7400B8] px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
                          onClick={() => navigate('/register')}>
                            Start Free Trial
                            <FiArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </button>

                        <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                            Schedule Demo
                        </button>
                    </motion.div>

                    <motion.p
                        className="text-white/80 mt-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        No credit card required. 14-day free trial.
                    </motion.p>
                </div>
            </div>
        </section>
    );
};

export default CTASection;