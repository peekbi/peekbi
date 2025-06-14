import { motion } from 'framer-motion';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "CEO, TechCorp",
            image: "/assets/20945194.jpg",
            quote: "PeekBI has transformed how we handle our data. The insights we've gained have helped us increase revenue by 35% in just six months. The platform is intuitive and the support team is exceptional."
        },
        {
            name: "Michael Chen",
            role: "Data Analyst, DataFlow",
            image: "/assets/20945839.jpg",
            quote: "The real-time analytics feature is a game-changer for our business. We can now make informed decisions on the fly, which has significantly improved our operational efficiency and customer satisfaction."
        },
        {
            name: "Emily Rodriguez",
            role: "CTO, InnovateTech",
            image: "/assets/19197013.jpg",
            quote: "After trying several analytics platforms, PeekBI stands out for its powerful AI capabilities and ease of use. It's helped us identify patterns we never would have seen otherwise, leading to new product opportunities."
        }
    ];

    return (
        <section className="py-24 bg-[#F9F4FF] relative overflow-hidden"> {/* Light purple background */}
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
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">What Our Clients Say</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Trusted by businesses of all sizes around the world</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            className={`relative rounded-xl p-8 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white ${index === 1 ? 'md:mt-8' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Gradient Background - matching hero card design */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="mb-6">
                                    <svg className="w-10 h-10 text-[#7400B8] opacity-30" fill="currentColor" viewBox="0 0 32 32">
                                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/20945368.jpg";
                                        }}
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <button className="bg-white text-[#7400B8] border-2 border-[#7400B8] px-8 py-3 rounded-full text-lg font-medium hover:bg-[#7400B8] hover:text-white transition-all duration-300">
                        Read More Success Stories
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default TestimonialsSection;