import { motion } from 'framer-motion';
import { forwardRef, useEffect, useRef } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AboutUsSection = forwardRef((props, aboutRef) => {
    return (
        <section ref={aboutRef} className="py-24 bg-[#ffffff] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[45rem] h-[45rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "50px" }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">About PeekBI</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">Transforming data into actionable insights for businesses of all sizes</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <img
                        src="/assets/4936937.jpg"
                        alt="PeekBI Dashboard"
                        className="w-full h-full  object-cover"
                    />
                    {/* <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-[400px]">

                            <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-20"></div>
                        </div>
                    </motion.div> */}

                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "50px" }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">Our Story</h3>
                            <p className="text-gray-600 leading-relaxed">
                                PeekBI was founded with a clear mission: to democratize data analytics. <br />

                                We aim to make powerful business intelligence accessible to organizations of all sizes.

                                Data-driven decision-making shouldn't be a luxury reserved for enterprises with big budgets and full-time data teams.


                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Our platform blends advanced Al with an intuitive interface, helping businesses uncover hidden patterns, reveal insights, and unlock new growth opportunities.
                            </p>

                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">Who We Serve</h3>
                            <p className="text-gray-600 leading-relaxed">
                                PeekBI is designed specifically for SMEs, startups, and agency owners who need powerful analytics without the enterprise price tag or complexity. Our clients span across industries including e-commerce, marketing, finance, healthcare, and more.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">Startups</h4>
                                        <p className="text-sm text-gray-600">Make data-driven decisions from day one</p>
                                    </div>
                                </div>
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">SMEs</h4>
                                        <p className="text-sm text-gray-600">Compete with enterprise-level insights</p>
                                    </div>
                                </div>
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">Agencies</h4>
                                        <p className="text-sm text-gray-600">Deliver better results for your clients</p>
                                    </div>
                                </div>
                                <motion.button
                                    className=" px-6 py-2 bg-gradient-to-r from-[rgba(116,0,184,0.1)] to-[rgba(155,77,202,0.1)] text-[#7400B8] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>Read More</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>

                    </motion.div>

                </div>
            </div>
        </section>
    );
});

export default AboutUsSection;