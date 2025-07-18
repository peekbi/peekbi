import React from 'react';
import { motion } from 'framer-motion';
import { FiTwitter, FiLinkedin, FiFacebook, FiInstagram, FiYoutube, FiGithub } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const FooterSection = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const handleLogoClick = () => {
        navigate('/');
    };

    const footerLinks = [
        {
            title: 'Product',
            links: [
                { name: 'Features', url: '#' },
                { name: 'Solutions', url: '#' },
                { name: 'Pricing', url: '#' },
                { name: 'Enterprise', url: '#' },
                { name: 'Demo', url: '#' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Documentation', url: '#' },
                { name: 'Blog', url: '#' },
                { name: 'Guides', url: '#' },
                { name: 'API Reference', url: '#' },
                { name: 'Security', url: '#' }
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', url: '#' },
                { name: 'Careers', url: '#' },
                { name: 'Press', url: '#' },
                { name: 'Contact Us', url: '/contact-us' },
                { name: 'Partners', url: '#' }
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', url: '/privacy-policy' },
                { name: 'Terms and Conditions', url: '/terms-and-conditions' },
                { name: 'Cancellation and Refund', url: '/cancellation-and-refund' },
                { name: 'Contact Us', url: '/contact-us' }
            ]
        }
    ];

    const socialLinks = [
        { name: 'Twitter', url: '#', icon: <FiTwitter className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { name: 'Facebook', url: '#', icon: <FiFacebook className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { name: 'Instagram', url: '#', icon: <FiInstagram className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { name: 'LinkedIn', url: '#', icon: <FiLinkedin className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { name: 'GitHub', url: '#', icon: <FiGithub className="w-4 h-4 sm:w-5 sm:h-5" /> },
    ];

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 max-w-[1200px] py-8 sm:py-12 md:py-16">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                        <div 
                            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden cursor-pointer"
                            onClick={handleLogoClick}
                        >
                            <img
                                src="/assets/logo.svg"
                                alt="PeekBI Logo"
                                style={{ width: '68px', height: '68px' }}
                                className="object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/assets/logo.png";
                                }}
                            />
                        </div>
                        <p className="text-gray-400 mb-4 md:mb-6 max-w-md text-sm sm:text-base">
                            Transform your data into actionable insights with our advanced analytics platform. Make smarter decisions and drive business growth with PeekBI.
                        </p>
                        <div className="flex space-x-3 sm:space-x-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    className="text-gray-400 hover:text-white transition-colors duration-300"
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-700 hover:border-[#7400B8] hover:bg-[#7400B8]/10 transition-all duration-300">
                                        {social.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((column, index) => (
                        <div key={index} className="col-span-1">
                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{column.title}</h3>
                            <ul className="space-y-1 sm:space-y-2">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        {link.url.startsWith('/') ? (
                                            <Link
                                                to={link.url}
                                                className="text-gray-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.url}
                                                className="text-gray-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 max-w-[1200px] py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-gray-500 text-xs sm:text-sm">&copy; {currentYear} PeekBI. All rights reserved.</p>
                        <div className="mt-3 sm:mt-0">
                            <select
                                className="bg-gray-800 text-gray-400 text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
                                defaultValue="en"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
