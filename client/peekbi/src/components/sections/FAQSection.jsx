import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: 'How does PeekBI handle data security?',
            answer: 'PeekBI employs enterprise-grade security measures including end-to-end encryption, regular security audits, and compliance with industry standards like GDPR, HIPAA, and SOC 2. Your data is always protected with the highest level of security.'
        },
        {
            question: 'Can I integrate PeekBI with my existing tools?',
            answer: 'Yes, PeekBI offers seamless integration with a wide range of business tools and platforms including Salesforce, Google Analytics, Microsoft Power BI, and many more. Our API also allows for custom integrations with your proprietary systems.'
        },
        {
            question: 'How long does it take to set up PeekBI?',
            answer: 'Most customers are up and running within 24-48 hours. Our onboarding team will guide you through the process, helping you connect your data sources and configure your dashboards to meet your specific business needs.'
        },
        {
            question: 'Do you offer custom solutions for specific industries?',
            answer: 'Absolutely! We offer industry-specific solutions for healthcare, finance, e-commerce, manufacturing, and more. These solutions come with pre-built templates and dashboards tailored to your industry\'s unique requirements and KPIs.'
        },
        {
            question: 'What kind of support do you provide?',
            answer: 'We offer 24/7 customer support via email, chat, and phone. Our Professional and Enterprise plans include dedicated account managers and priority support. We also provide extensive documentation, video tutorials, and regular webinars.'
        },
        {
            question: 'Can I try PeekBI before purchasing?',
            answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required. You can also request a personalized demo where our team will show you how PeekBI can address your specific business challenges.'
        },
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-[#F7F7FF]"> {/* Changed to white background */}
            <div className="container mx-auto px-4 max-w-[900px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to know about PeekBI</p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            className="border border-gray-200 rounded-xl overflow-hidden"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "50px" }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                className={`w-full text-left p-6 flex justify-between items-center focus:outline-none ${activeIndex === index ? 'bg-purple-50' : 'bg-white'}`}
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                                <svg
                                    className={`w-5 h-5 text-[#7400B8] transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-gray-600 bg-white border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <p className="text-gray-600 mb-4">Still have questions?</p>
                    <button className="bg-[#7400B8] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-[#8B2CD9] transition-all duration-300">
                        Contact Support
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;