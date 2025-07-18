import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <FiMail className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <p className="text-gray-600">support@peekbi.com</p>
                                        <p className="text-gray-600">sales@peekbi.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <FiPhone className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Phone</h3>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                        <p className="text-gray-600">Mon-Fri, 9am-6pm EST</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <FiMapPin className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Address</h3>
                                        <p className="text-gray-600">
                                            123 Business Street<br />
                                            Suite 456<br />
                                            New York, NY 10001<br />
                                            United States
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <FiSend className="mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                {submitStatus === 'success' && (
                                    <p className="text-green-600 text-sm mt-2">
                                        Thank you for your message. We'll get back to you soon!
                                    </p>
                                )}

                                {submitStatus === 'error' && (
                                    <p className="text-red-600 text-sm mt-2">
                                        There was an error sending your message. Please try again.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactUs; 