import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link 
                    to="/"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200"
                >
                    <FiArrowLeft className="mr-2" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                    
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-600 mb-4">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Name and contact information</li>
                                <li>Account credentials</li>
                                <li>Payment information</li>
                                <li>Business information</li>
                                <li>Usage data and analytics</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-4">
                                We use the collected information for various purposes:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>To provide and maintain our Service</li>
                                <li>To notify you about changes to our Service</li>
                                <li>To provide customer support</li>
                                <li>To gather analysis or valuable information</li>
                                <li>To monitor the usage of our Service</li>
                                <li>To detect, prevent and address technical issues</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
                            <p className="text-gray-600">
                                The security of your data is important to us. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Rights</h2>
                            <p className="text-gray-600 mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to processing of your data</li>
                                <li>Request data portability</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    Email: privacy@peekbi.com<br />
                                    Address: [Your Company Address]<br />
                                    Phone: [Your Contact Number]
                                </p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy; 