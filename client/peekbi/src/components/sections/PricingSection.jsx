import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
// Add this import at the top with the other imports
import { useNavigate } from 'react-router-dom';
gsap.registerPlugin(ScrollTrigger);

const PricingSection = () => {
    const navigate = useNavigate();
    const pricingPlans = [
        {
            name: 'Starter',
            price: '$49',
            period: '/month',
            description: 'Perfect for small businesses and startups',
            features: [
                'Up to 5 users',
                'Basic analytics dashboard',
                'Data visualization tools',
                'Email support',
                '5GB storage'
            ],
            highlighted: false,
            buttonText: 'Start Free Trial'
        },
        {
            name: 'Professional',
            price: '$99',
            period: '/month',
            description: 'Ideal for growing businesses',
            features: [
                'Up to 20 users',
                'Advanced analytics dashboard',
                'Custom data visualization',
                'Priority email & chat support',
                '50GB storage',
                'API access',
                'Custom reporting'
            ],
            highlighted: true,
            buttonText: 'Start Free Trial'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations with complex needs',
            features: [
                'Unlimited users',
                'Enterprise-grade analytics',
                'Advanced AI predictions',
                'Dedicated support team',
                'Unlimited storage',
                'Full API access',
                'Custom integrations',
                'On-premise deployment option'
            ],
            highlighted: false,
            buttonText: 'Contact Sales'
        }
    ];
    useEffect(()=>{
        gsap.utils.toArray('.pricingCard').forEach(pricingCard=>{
            gsap.to(pricingCard,{
                scale:0.7,
                opacity:0,
                scrollTrigger:{
                  trigger:pricingCard,
                  start:"top 15",
                  end:"bottom 15",
                //   markers:true,
                  scrub:true,
                }
            })
        })
    })

    return (
        <section className="py-24 bg-white"> {/* Changed to white background */}
            <div className="container flex flex-col items-center mx-auto px-4 max-w-[1200px]">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that's right for your business</p>
                </motion.div>

                <div className="flex card flex-col gap-[20vh] md:w-[30%] pb-[20vh] items-center">
                    {pricingPlans.map((plan, index) => (
                        <div 
                            key={index}
                            className={`pricingCard  sticky top-[15vh] rounded-2xl overflow-hidden shadow-lg relative ${plan.highlighted ? 'border-2 border-[#7400B8] transform scale-105' : 'border border-gray-200'}`}
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
                            <div className="p-8 bg-white content-center  sticky top-[15vh] items-center relative group overflow-hidden">
                                {/* Gradient Background - matching hero card design */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 mb-6">{plan.description}</p>
                                    <div className="mb-6">
                                        <span className="text-5xl font-bold text-gray-800">{plan.price}</span>
                                        <span className="text-gray-600">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <FiCheck className="text-[#7400B8] mt-1 mr-3 flex-shrink-0" />
                                                <span className="text-gray-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 ${plan.highlighted ? 'bg-[#7400B8] text-white hover:bg-[#8B2CD9]' : 'bg-white text-[#7400B8] border-2 border-[#7400B8] hover:bg-[#7400B8] hover:text-white'
                                            
                                        }` }     
                                          onClick={() => navigate('/register')}
                                    >
                                        {plan.buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;