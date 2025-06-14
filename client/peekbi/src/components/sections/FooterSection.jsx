import { motion } from 'framer-motion';
import { FiTwitter, FiLinkedin, FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FooterSection = () => {
    const currentYear = new Date().getFullYear();

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
        { icon: <FiTwitter />, url: '#', name: 'Twitter' },
        { icon: <FiLinkedin />, url: '#', name: 'LinkedIn' },
        { icon: <FiFacebook />, url: '#', name: 'Facebook' },
        { icon: <FiInstagram />, url: '#', name: 'Instagram' },
        { icon: <FiYoutube />, url: '#', name: 'YouTube' }
    ];

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 max-w-[1200px] py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <img
                            src="/assets/logos.png"
                            alt="PeekBI Logo"
                            className="h-12 mb-6"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/logo.png";
                            }}
                        />
                        <p className="text-gray-400 mb-6 max-w-md">
                            Transform your data into actionable insights with our advanced analytics platform. Make smarter decisions and drive business growth with PeekBI.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    className="text-gray-400 hover:text-white transition-colors duration-300"
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 hover:border-[#7400B8] hover:bg-[#7400B8]/10 transition-all duration-300">
                                        {social.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((column, index) => (
                        <div key={index} className="lg:col-span-1">
                            <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                            <ul className="space-y-2">
                                {column.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        {link.url.startsWith('/') ? (
                                            <Link
                                                to={link.url}
                                                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.url}
                                                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
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
                <div className="container mx-auto px-4 max-w-[1200px] py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">&copy; {currentYear} PeekBI. All rights reserved.</p>
                        <div className="mt-4 md:mt-0">
                            <select
                                className="bg-gray-800 text-gray-400 text-sm py-1 px-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent"
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
