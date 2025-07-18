import { motion } from 'framer-motion';
import { FiCheck, FiX, FiUsers, FiUpload, FiDownload, FiBarChart2, FiCpu, FiFileText, FiCalendar, FiShield } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
gsap.registerPlugin(ScrollTrigger);

const PLAN_DEFAULTS = {
    free: {
        price: 0,
        billingInterval: 'monthly',
        limits: {
            uploads: 15,
            download: 15,
            analyse: 8,
            aiPromts: 5,
        },
        features: {
            scheduleReports: false,
            exportAsPDF: false,
            shareableDashboards: false,
            emailSupport: true,
            prioritySupport: false,
        },
    },
    premium: {
        price: 299,
        billingInterval: 'monthly',
        limits: {
            uploads: 100,
            download: 75,
            analyse: 60,
            aiPromts: 50,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: false,
        },
    },
    enterprise: {
        price: 699,
        billingInterval: 'monthly',
        limits: {
            uploads: 500,
            download: 500,
            analyse: 500,
            aiPromts: 160,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: true,
        },
    }
};

const pricingPlans = [
    {
        name: 'Free',
        planKey: 'free',
        highlighted: false,
        buttonText: 'Start Free Trial',
        description: 'Perfect for small businesses and startups',
        icon: <FiUsers className="w-6 h-6" />
    },
    {
        name: 'Premium',
        planKey: 'premium',
        highlighted: true,
        buttonText: 'Start Free Trial',
        description: 'Ideal for growing businesses',
        icon: <FiBarChart2 className="w-6 h-6" />
    },
    {
        name: 'Enterprise',
        planKey: 'enterprise',
        highlighted: false,
        buttonText: 'Contact Sales',
        description: 'For large organizations with complex needs',
        icon: <FiCpu className="w-6 h-6" />
    },
];

const PricingSection = () => {
    const navigate = useNavigate();

    useEffect(() => {
        gsap.utils.toArray('.pricingCard').forEach(pricingCard => {
            gsap.to(pricingCard, {
                scale: 0.7,
                opacity: 0,
                scrollTrigger: {
                    trigger: pricingCard,
                    start: "top 15",
                    end: "bottom 15",
                    scrub: true,
                }
            })
        })
    }, []);

    const formatLimit = (key, value) => {
        switch (key) {
            case 'uploads':
                return `${value} File Uploads`;
            case 'download':
                return `${value} Downloads`;
            case 'analyse':
                return `${value} Analyses`;
            case 'aiPromts':
                return `${value} AI Prompts`;
            case 'reports':
                return `${value} Reports`;
            case 'charts':
                return `${value} Charts`;
            case 'maxUsersPerAccount':
                return `${value} User${value > 1 ? 's' : ''}`;
            case 'dataRetentionDays':
                return `${value} days Retention`;
            default:
                return `${value}`;
        }
    };

    const getLimitIcon = (key) => {
        switch (key) {
            case 'uploads':
                return <FiUpload className="w-4 h-4" />;
            case 'download':
                return <FiDownload className="w-4 h-4" />;
            case 'analyse':
                return <FiBarChart2 className="w-4 h-4" />;
            case 'aiPromts':
                return <FiCpu className="w-4 h-4" />;
            case 'reports':
                return <FiFileText className="w-4 h-4" />;
            case 'charts':
                return <FiBarChart2 className="w-4 h-4" />;
            case 'maxUsersPerAccount':
                return <FiUsers className="w-4 h-4" />;
            case 'dataRetentionDays':
                return <FiCalendar className="w-4 h-4 " />;
            default:
                return <FiCheck className="w-4 h-4" />;
        }
    };

    return (
        <section className="py-26 bg-gradient-to-r from-[#f4e8fb] to-[#f8eefd]">
            <div className="container flex flex-col items-center mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 mt-20 text-gray-800">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that's right for your business with clear usage limits</p>
                </motion.div>

                <div className="flex card flex-col gap-[20vh] md:w-[45%] pb-[20vh] items-center">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className={`pricingCard sticky top-[15vh] rounded-2xl overflow-hidden shadow-lg relative ${plan.highlighted ? 'border-2 border-[#7400B8] transform scale-105' : 'border border-gray-200'}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {plan.highlighted && (
                                <div className="bg-[#7400B8] text-white text-center py-2 font-medium">
                                    Most Popular
                                </div>
                            )}
                            <div className="p-8 bg-white content-center sticky top-[15vh] items-center relative group overflow-hidden">
                                {/* Gradient Background - matching hero card design */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    {/* Plan Header */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-xl flex items-center justify-center text-white">
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                                            <p className="text-gray-600 text-sm">{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline">
                                            <span className="text-5xl font-bold text-gray-800">
                                                {plan.planKey === 'free' ? '₹0' : `₹${PLAN_DEFAULTS[plan.planKey].price}`}
                                            </span>
                                            <span className="text-gray-600 ml-2">/month</span>
                                        </div>
                                        {plan.planKey !== 'free' && (
                                            <p className="text-sm text-gray-500 mt-1">14-day free trial included</p>
                                        )}
                                    </div>

                                    {/* Usage Limits */}
                                    <div className="mb-8">
                                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                            <FiBarChart2 className="w-4 h-4 mr-2 text-[#7400B8]" />
                                            Monthly Limits
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(PLAN_DEFAULTS[plan.planKey].limits).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        {getLimitIcon(key)}
                                                        <span className="text-sm text-gray-700 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-[#7400B8] text-sm">
                                                        {formatLimit(key, value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 ${plan.highlighted ? 'bg-[#7400B8] text-white hover:bg-[#8B2CD9]' : 'bg-white text-[#7400B8] border-2 border-[#7400B8] hover:bg-[#7400B8] hover:text-white'}`}
                                        onClick={() => navigate(`/user/profile?plan=${plan.planKey}`)}
                                    >
                                        {plan.buttonText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;