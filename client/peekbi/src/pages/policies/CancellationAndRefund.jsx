import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CancellationAndRefund = () => {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Cancellation and Refund Policy</h1>
                    
                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Subscription Cancellation</h2>
                            <p className="text-gray-600 mb-4">
                                You may cancel your subscription at any time through your account settings or by contacting our support team. The cancellation will take effect at the end of your current billing period.
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Monthly subscriptions can be cancelled anytime</li>
                                <li>Annual subscriptions can be cancelled with prorated refund</li>
                                <li>Enterprise plans require 30 days notice for cancellation</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Policy</h2>
                            <p className="text-gray-600 mb-4">
                                Our refund policy is designed to be fair and transparent:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Monthly plans: No refunds for partial months</li>
                                <li>Annual plans: Prorated refund for unused months</li>
                                <li>Enterprise plans: Custom refund terms as per agreement</li>
                                <li>Refunds are processed within 7-10 business days</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Eligibility</h2>
                            <p className="text-gray-600 mb-4">
                                Refunds may be granted under the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Service unavailability for extended periods</li>
                                <li>Technical issues preventing service usage</li>
                                <li>Billing errors or duplicate charges</li>
                                <li>Annual plan cancellations within 30 days</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
                            <p className="text-gray-600 mb-4">
                                To request a refund:
                            </p>
                            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                                <li>Contact our support team with your request</li>
                                <li>Provide your account details and reason for refund</li>
                                <li>Allow 2-3 business days for review</li>
                                <li>If approved, refund will be processed to original payment method</li>
                            </ol>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    For any questions regarding cancellations or refunds, please contact us at:<br />
                                    Email: support@peekbi.com<br />
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

export default CancellationAndRefund; 