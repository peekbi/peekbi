import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const FeaturesSection = forwardRef((props, ref) => {
    const features = [
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Real-time Analytics',
            description: 'Monitor your business performance in real-time with interactive dashboards that update automatically as new data comes in.'
        },
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'AI-Powered Insights',
            description: 'Our machine learning algorithms analyze your data to provide actionable insights and predict future trends with high accuracy.'
        },
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            title: 'Customizable Dashboards',
            description: 'Create personalized dashboards tailored to your specific business needs with our intuitive drag-and-drop interface.'
        },
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            title: 'Enterprise-Grade Security',
            description: 'Your data is protected with end-to-end encryption, role-based access controls, and compliance with industry standards.'
        },
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            ),
            title: 'Advanced Data Integration',
            description: 'Seamlessly connect to multiple data sources including databases, cloud services, and third-party applications.'
        },
        {
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            ),
            title: '24/7 Expert Support',
            description: 'Our dedicated support team is available around the clock to help you make the most of your data analytics platform.'
        },
    ];

    // Define target audiences
    const audiences = [
        {
            title: 'Startups',
            description: 'Make data-driven decisions from day one without the need for a dedicated data team.',
            icon: (
                <svg className="w-8 h-8 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
        {
            title: 'Small & Medium Enterprises',
            description: 'Compete with enterprise-level insights at a fraction of the cost and complexity.',
            icon: (
                <svg className="w-8 h-8 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            title: 'Agency Owners',
            description: 'Deliver better results for your clients with data-backed strategies and reporting.',
            icon: (
                <svg className="w-8 h-8 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            title: 'Consultants',
            description: 'Back your expertise with solid data and provide clients with visual, easy-to-understand reports.',
            icon: (
                <svg className="w-8 h-8 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    return (
        <section ref={ref} className="bg-gradient-to-br from-[#2D1B69] to-[#4C2A85] min-h-screen flex items-center py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "50px" }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-white">Powerful Features</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Everything you need to transform your data into actionable insights</p>
                </motion.div>
                {/* Features grid - Existing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "50px" }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="relative z-10">
                                <div className="bg-white/20 rounded-lg p-3 inline-block mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-300">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

export default FeaturesSection;