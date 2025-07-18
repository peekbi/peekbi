import React from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiCode, FiGitBranch, FiUser, FiCpu, FiShield, FiHeart, FiArrowRight, FiLock, FiCloud, FiBarChart2, FiZap, FiDatabase } from 'react-icons/fi';
import Header from './Header';

const Settings = () => {
    const appVersion = '1.0.0'; 

    return (
        <div className="h-full flex flex-col">
            <Header
                title="Settings"
                description="PeekBI: AI-powered, secure, and scalable analytics platform."
                icon={FiInfo}
            />

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-10">
                    {/* Product Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#7400B8]/10 to-[#C77DFF]/10 rounded-3xl shadow-xl border border-white/20 p-8"
                    >
                        <h2 className="text-2xl font-bold text-[#7400B8] mb-4 flex items-center gap-3">
                            <FiInfo className="w-6 h-6" />
                            About PeekBI
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed mb-2">
                            <strong>PeekBI</strong> is a next-generation SaaS analytics platform that empowers businesses to turn data into actionable insights. Built with <span className="text-[#7400B8] font-semibold">TensorFlow</span> and a modern JavaScript stack, PeekBI delivers AI-powered analytics, interactive dashboards, and real-time collaboration—all on a secure, scalable cloud infrastructure.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 text-base mt-3 space-y-1">
                            <li>AI-powered chat assistant (Google Gemini)</li>
                            <li>Drag-and-drop data uploads</li>
                            <li>Interactive charts & visualizations</li>
                            <li>Customizable dashboards</li>
                            <li>Real-time collaboration</li>
                            <li>Responsive design for all devices</li>
                        </ul>
                    </motion.div>

                    {/* Security & Scalability */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <FiShield className="w-6 h-6 text-[#7400B8]" />
                            Security & Scalability
                        </h3>
                        <ul className="list-disc pl-6 text-gray-700 text-base space-y-2">
                            <li><strong>End-to-end encryption</strong> for all data in transit and at rest</li>
                            <li><strong>Role-based access control</strong> and secure authentication</li>
                            <li><strong>Cloud-native, auto-scaling infrastructure</strong> for any business size</li>
                            <li><strong>Compliance-ready</strong> (GDPR, SOC2, etc.)</li>
                            <li>Regular security audits and monitoring</li>
                        </ul>
                    </motion.div>

                    {/* App Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <FiGitBranch className="w-6 h-6 text-[#7400B8]" />
                            Application Info
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                                <span className="font-medium text-gray-600 flex items-center gap-2"><FiGitBranch /> App Version</span>
                                <span className="font-semibold text-gray-800">{appVersion}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                                <span className="font-medium text-gray-600 flex items-center gap-2"><FiUser /> Developer</span>
                                <span className="font-semibold text-gray-800">ufdevs.me</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Legal & Privacy */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <FiShield className="w-6 h-6 text-[#7400B8]" />
                            Legal & Privacy
                        </h3>
                        <div className="space-y-4">
                            <a href="#" className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Privacy Policy</span>
                                <FiArrowRight className="w-5 h-5 text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Terms of Service</span>
                                <FiArrowRight className="w-5 h-5 text-gray-400" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Acknowledgments */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8 text-center"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 justify-center">
                            <FiHeart className="w-6 h-6 text-[#7400B8]" />
                            Acknowledgments
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Special thanks to the open-source community and all contributors who have made this project possible. 
                            This application is built with modern web technologies and powered by cutting-edge AI analytics.
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            © 2024 PeekBI. All rights reserved.<br />
                            Designed and Developed by{' '}
                            <a 
                                href="https://ufdevs.me" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#7400B8] hover:text-[#9B4DCA] transition-colors duration-200 font-medium"
                            >
                                ufdevs.me
                            </a>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 