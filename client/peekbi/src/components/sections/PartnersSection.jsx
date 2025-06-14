import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const partners = [
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
    { name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
    { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg' },
    { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg' },
    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
];

const PartnersSection = () => {
    const { scrollYProgress } = useScroll();
    const logos = [...partners, ...partners, ...partners];

    return (
        <section className="py-24 bg-[#F7F7FF] overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[45rem] h-[45rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.05]"></div>
            </div>

            <div className="container mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "50px" }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">Our Partners</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Collaborating with industry leaders to bring you the best insights</p>
                </motion.div>

                {/* Infinite Scroll Container */}
                <div className="relative w-full overflow-hidden">
                    <motion.div
                        className="flex gap-16 items-center"
                        animate={{
                            x: [0, -2000],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30,
                                ease: "linear",
                            },
                        }}
                    >
                        {logos.map((partner, idx) => (
                            <motion.div
                                key={idx}
                                className="flex-shrink-0 flex flex-col items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="h-20 w-auto object-contain bg-white rounded-lg shadow-lg p-3 relative z-10"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 mt-3">{partner.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PartnersSection; 