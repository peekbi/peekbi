import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
                    
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600">
                                By accessing and using PeekBI's services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                            <p className="text-gray-600 mb-4">
                                PeekBI provides business intelligence and analytics services, including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Data visualization and reporting tools</li>
                                <li>Business analytics solutions</li>
                                <li>Custom dashboard creation</li>
                                <li>Data integration services</li>
                                <li>Technical support and maintenance</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                            <p className="text-gray-600 mb-4">
                                As a user of PeekBI services, you agree to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your account</li>
                                <li>Use the service in compliance with applicable laws</li>
                                <li>Not misuse or abuse the service</li>
                                <li>Pay all applicable fees on time</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
                            <p className="text-gray-600">
                                All content, features, and functionality of PeekBI's services are owned by PeekBI and are protected by international copyright, trademark, and other intellectual property laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
                            <p className="text-gray-600">
                                PeekBI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    For any questions regarding these Terms and Conditions, please contact us at:<br />
                                    Email: legal@peekbi.com<br />
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

export default TermsAndConditions; 