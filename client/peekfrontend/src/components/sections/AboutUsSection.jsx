import { motion } from 'framer-motion';
import { forwardRef, useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Modal from '../Modal';

gsap.registerPlugin(ScrollTrigger);

const AboutUsSection = forwardRef((props, aboutRef) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    return (
        <section ref={aboutRef} className="py-24 bg-[#ffffff] relative overflow-hidden">
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-[#7400B8] mb-2">Who We Serve: Details</h3>
                    <div className="mb-2">
                        <h4 className="font-semibold text-[#7400B8]">Startups</h4>
                        <p className="text-gray-700 text-sm">Build smarter from day one. You’re making bold moves with limited resources. PeekBI gives you instant clarity from your business data — no analyst needed. Know what’s working, what’s not, and where to focus next, all in real time.</p>
                    </div>
                    <div className="mb-2">
                        <h4 className="font-semibold text-[#7400B8]">SMEs</h4>
                        <p className="text-gray-700 text-sm">Compete like the big players. You’ve grown beyond the basics — but hiring a data team still feels out of reach. PeekBI helps you uncover sales trends, spot inefficiencies, and scale smarter with enterprise-level insights made simple.</p>
                    </div>
                    <div className="mb-2">
                        <h4 className="font-semibold text-[#7400B8]">Agencies</h4>
                        <p className="text-gray-700 text-sm">Deliver insights, not just reports. You manage multiple clients and data chaos daily. With PeekBI, you can turn messy datasets into clear dashboards your clients will understand. Save hours. Impress faster.</p>
                    </div>
                    <div className="mb-2">
                        <h4 className="font-semibold text-[#7400B8]">And More...</h4>
                        <p className="text-gray-700 text-sm">We also serve professionals across finance, healthcare, education, and e-commerce — anyone who wants better answers from their data without writing a single line of code.</p>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-[#7400B8]">Why It Matters</h4>
                        <p className="text-gray-700 text-sm">Because when data makes sense, decisions get better. And when decisions get better, businesses grow — with clarity, confidence, and control.</p>
                    </div>
                </div>
            </Modal>
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
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">Turning data into clear insights - fast, simple and code-free.</p>
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
                                PeekBI was born from a simple frustration — why is powerful data insight always locked behind complexity, cost, or technical walls? We’ve seen small teams with big dreams struggle to make sense of their data, while large enterprises raced ahead with armies of analysts. <br />
                                <span className='font-bold'>So, we built something different. <br /> </span>
                                <span className='font-bold'>   Something honest.<br /></span>
                                <span className='font-bold'>Something anyone can use.</span>


                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                PeekBI brings together smart AI and an intuitive design to help you find clarity in chaos, spot what matters, and grow with confidence. No terminology. No bloated dashboards. Just insights that speak your language.
                            </p>

                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">Who We Serve</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We serve the dreamers, the doers, and the builders — the small businesses, the startup founders, the consultants and agency owners who wear too many hats and still show up every day to grow. <br />
                                Whether you’re running a fashion label, a finance firm, or a clinic, PeekBI helps you make better decisions without needing a data science degree. Your data has a story — we’re just here to help you hear it.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">Startups</h4>
                                        <p className="text-sm text-gray-600">Build smarter from day one.</p>
                                    </div>
                                </div>
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">SMEs</h4>
                                        <p className="text-sm text-gray-600">Compete like the big players.</p>
                                    </div>
                                </div>
                                <div className="relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <h4 className="font-semibold text-[#7400B8]">Agencies</h4>
                                        <p className="text-sm text-gray-600">Deliver insights, not just reports.</p>
                                    </div>
                                </div>
                                <motion.button
                                    className=" px-6 py-2 bg-gradient-to-r from-[rgba(116,0,184,0.1)] to-[rgba(155,77,202,0.1)] text-[#7400B8] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleOpenModal}
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