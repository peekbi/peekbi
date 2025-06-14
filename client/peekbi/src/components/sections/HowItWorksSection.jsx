import { motion } from 'framer-motion';

const HowItWorksSection = () => {
    const steps = [
        {
            number: '01',
            title: 'Connect Your Data',
            description: 'Easily integrate with your existing data sources including databases, spreadsheets, and third-party applications.',
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'Analyze & Visualize',
            description: 'Our AI-powered platform automatically analyzes your data and creates insightful visualizations and reports.',
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Get Actionable Insights',
            description: 'Receive personalized recommendations and predictions to help you make data-driven decisions.',
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            number: '04',
            title: 'Drive Business Growth',
            description: 'Implement insights to optimize operations, increase revenue, and achieve sustainable business growth.',
            icon: (
                <svg className="w-10 h-10 text-[#7400B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden"> {/* Changed to light purple background */}
            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">How PeekBI Works</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our simple four-step process transforms your raw data into actionable business insights</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "50px" }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Connecting line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -z-10 transform -translate-x-8"></div>
                            )}

                            <div className="relative rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group bg-white">
                                {/* Gradient Background - matching hero card design */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-purple-50 rounded-lg p-3 mr-4">
                                            {step.icon}
                                        </div>
                                        <span className="text-4xl font-bold text-gray-200">{step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-800">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03]"></div>
            </div>
        </section>
    );
};

export default HowItWorksSection;