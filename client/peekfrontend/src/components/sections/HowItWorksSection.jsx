import { motion } from 'framer-motion';
import { FiUpload, FiBarChart2, FiZap, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

    const steps = [
        {
        title: 'Upload Your File',
        description: 'Choose your data file (Excel, CSV, etc.) and upload it in one click.',
        icon: <FiUpload className="w-12 h-12 text-[#7400B8]" />,
    },
    {
        title: 'PeekBI Analyzes It',
        description: 'Our AI instantly reviews your data and finds key insights for you.',
        icon: <FiBarChart2 className="w-12 h-12 text-[#9B4DCA]" />,
    },
    {
        title: 'Get Instant Insights',
        description: 'See easy-to-understand charts, summaries, and recommendations.',
        icon: <FiZap className="w-12 h-12 text-[#C77DFF]" />,
    },
    {
        title: 'Ask AI & Share',
        description: 'Chat with AI about your data or share results with your team.',
        icon: <FiMessageSquare className="w-12 h-12 text-[#7400B8]" />,
    },
];

const HowItWorksSection = () => {
    return (
        <section className="py-24 bg-[#F9F4FF] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-[35rem] h-[35rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
                <div className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">How PeekBI Works</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Transform your data into insights in just 4 simple steps</p>
                </motion.div>

                {/* Process Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group">
                                {/* Step Number */}
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {index + 1}
                                </div>
                                
                                {/* Icon */}
                                <div className="flex justify-center mb-6 mt-4">
                                    <div className="w-20 h-20 bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            {step.icon}
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                            
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] transform -translate-y-1/2 z-10"></div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Try It Instantly Section */}
                <motion.div
                    className="bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 rounded-3xl p-8 border border-[#7400B8]/20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-[#7400B8] mb-2">Try It Instantly</h3>
                        <p className="text-gray-700 max-w-2xl mx-auto">
                            Ask AI about sample files or download them to test PeekBI's analysis features. 
                            For best results, use our sample files!
                        </p>
            </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { name: 'Retail', color: 'from-[#7400B8] to-[#9B4DCA]' },
                            { name: 'Finance', color: 'from-[#9B4DCA] to-[#C77DFF]' },
                            { name: 'Education', color: 'from-[#C77DFF] to-[#7400B8]' },
                            { name: 'Healthcare', color: 'from-[#7400B8] to-[#9B4DCA]' },
                            { name: 'Manufacturing', color: 'from-[#9B4DCA] to-[#C77DFF]' }
                        ].map((industry, index) => (
                            <motion.button
                                key={industry.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-3 bg-gradient-to-r ${industry.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            >
                                <FiMessageSquare className="w-4 h-4" />
                                {industry.name}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Learn More Button */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Link
                        to="/how-it-works-details"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-full font-semibold shadow-lg hover:from-[#9B4DCA] hover:to-[#C77DFF] hover:shadow-xl transition-all duration-200"
                    >
                        <span>Learn More</span>
                        <FiChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorksSection;