import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Import sections
import FeaturesSection from './sections/FeaturesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import BlogSection from './sections/BlogSection';
import FooterSection from './sections/FooterSection';

// Import other sections if you've created them
import HowItWorksSection from './sections/HowItWorksSection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';
import Carousel from './Carousel';
import FeatureCarousel from '../components/sections/FeatureCarousel';

// In your page component:

// Import the new AboutUsSection
import AboutUsSection from './sections/AboutUsSection';

// Add this import at the top with the other section imports
import DashboardSection from './sections/DashboardSection';

// Add this import at the top with the other imports
import { useNavigate } from 'react-router-dom';

// Import the new PartnersSection
import PartnersSection from './sections/PartnersSection';

const globalStyles = `
  @keyframes shine {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }

  .animate-shine {
    animation: shine 3s infinite;
  }

  .section-transition {
    transition: all 0.3s ease-out;
  }

  .fade-in {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .slide-in-left {
    opacity: 0;
    transform: translateX(-20px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  .slide-in-left.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .slide-in-right {
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  .slide-in-right.visible {
    opacity: 1;
    transform: translateX(0);
  }
`;

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const aboutRef = useRef(null); // Add ref for About section
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const blogRef = useRef(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const gradientRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroContentRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroCardsRef = useRef(null);
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    if (!isMounted) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Handle scroll animations
  useEffect(() => {
    if (!isMounted) return;

    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [isMounted]);

  // Set mounted state after initial render
  useEffect(() => {
    // Remove this delay which is causing the initial loading issue
    setIsMounted(true);

    // Initialize AOS immediately
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
      offset: 50,
      easing: 'ease-in-out',
      delay: 0, // Remove delay
    });
  }, []);

  // Add the global styles to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <motion.nav
        className="fixed w-full z-50 bg-black shadow-lg"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <img
                src="/assets/logos.png"
                alt="PeekBI Logo"
                className="h-14 mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/logo.png";
                }}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {['Home', 'About', 'Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
                <motion.div
                  key={item}
                  className="text-lg font-medium text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    let targetSection;
                    if (item === 'Home') {
                      targetSection = heroRef.current;
                    } else if (item === 'About') {
                      targetSection = aboutRef.current;
                    } else if (item === 'Features') {
                      targetSection = featuresRef.current;
                    } else if (item === 'How It Works') {
                      const sections = document.querySelectorAll('section');
                      sections.forEach(section => {
                        if (section.textContent.includes('How PeekBI Works')) {
                          targetSection = section;
                        }
                      });
                    } else if (item === 'Pricing') {
                      const sections = document.querySelectorAll('section');
                      sections.forEach(section => {
                        if (section.textContent.includes('Simple, Transparent Pricing')) {
                          targetSection = section;
                        }
                      });
                    } else if (item === 'Contact') {
                      const footerElement = document.querySelector('footer');
                      if (footerElement) targetSection = footerElement;
                    }

                    if (targetSection) {
                      const yOffset = -100;
                      const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  {item}
                </motion.div>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white px-6 py-2.5 rounded-lg text-lg font-medium border-2 border-[#7400B8] hover:bg-[#7400B8] transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#7400B8] text-white px-6 py-2.5 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl hover:bg-[#8B2CD9] transition-all duration-300"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className="md:hidden overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-black px-4 py-4 space-y-4">
            {['Home', 'About', 'Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
              <motion.div
                key={item}
                className="text-lg font-medium text-white px-4 py-3 rounded-lg transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  let targetSection;
                  if (item === 'Home') {
                    targetSection = heroRef.current;
                  } else if (item === 'About') {
                    targetSection = aboutRef.current;
                  } else if (item === 'Features') {
                    targetSection = featuresRef.current;
                  } else if (item === 'How It Works') {
                    const sections = document.querySelectorAll('section');
                    sections.forEach(section => {
                      if (section.textContent.includes('How PeekBI Works')) {
                        targetSection = section;
                      }
                    });
                  } else if (item === 'Pricing') {
                    const sections = document.querySelectorAll('section');
                    sections.forEach(section => {
                      if (section.textContent.includes('Simple, Transparent Pricing')) {
                        targetSection = section;
                      }
                    });
                  } else if (item === 'Contact') {
                    const footerElement = document.querySelector('footer');
                    if (footerElement) targetSection = footerElement;
                  }

                  if (targetSection) {
                    const yOffset = -100;
                    const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }
                }}
              >
                {item}
              </motion.div>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-800">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full text-white px-6 py-3 rounded-lg text-lg font-medium border-2 border-[#7400B8] hover:bg-[#7400B8] transition-all duration-300"
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#7400B8] text-white px-6 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl hover:bg-[#8B2CD9] transition-all duration-300"
                onClick={() => {
                  navigate('/register');
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign Up
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Carousel Section */}
      <FeatureCarousel />

      {/* Hero Section - Updated with target audience */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-[#F7F7FF] pt-32">
        {/* Hero section content */}
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 min-h-[80vh]">
            {/* Left Content */}
            <motion.div
              className="hero-content flex flex-col justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-8">
                {/* Brand Name */}
                <div className="brand-name mb-8">
                  <h2 className="text-6xl font-bold text-[#7400B8] tracking-wider align-center font-Bodoni">AI Powered!</h2>
                  <p className="text-lg text-gray-600 mt-2 tracking-wide">Business Intelligence Platform</p>
                </div>

                {/* Main Heading */}
                <h1 className="main-heading text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span
                    ref={gradientRef}
                    className="gradient-text block bg-gradient-to-r from-[#7400B8] via-[#9B4DCA] to-[#7400B8] bg-[length:200%_auto] bg-clip-text text-transparent"
                    style={{ backgroundPosition: '0% center' }}
                  >
                    Uncover Patterns.
                  </span>
                  <span
                    className="gradient-text block mt-4 bg-gradient-to-r from-[#9B4DCA] via-[#7400B8] to-[#9B4DCA] bg-[length:200%_auto] bg-clip-text text-transparent"
                    style={{ backgroundPosition: '100% center' }}
                  >
                    Unlock Growth.
                  </span>
                </h1>

                {/* Additional Text - Updated with target audience */}
                <div className="additional-text space-y-4 mt-6">
                  <p className="text-lg lg:text-xl text-gray-600 max-w-md">
                    Transform your data into actionable insights with our advanced analytics platform designed for SMEs, startups, and agency owners.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Real-time data analytics and visualization',
                      'Instant and accurate insights without data science expertise',
                      'Customizable dashboards and reports for your specific needs'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-[#7400B8] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button - This should be in the hero section, not in the nav */}
                <div className="cta-button pt-8">
                  <button
                    ref={buttonRef}
                    className="group relative text-white px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden transform hover:scale-[1.02] border-2 border-transparent hover:border-[#7400B8] hover:text-[#7400B8]"
                    onClick={() => navigate('/register')}
                  >
                    <span className="relative z-10 font-bold tracking-wide flex items-center gap-3 transition-colors duration-300">
                      Start Free Trial
                      <FiArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    {/* Permanent gradient background */}
                    <div className="button-gradient absolute inset-0 bg-gradient-to-r from-[#7400B8] via-[#9B4DCA] to-[#7400B8] bg-[length:200%_auto] opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                    {/* Permanent glow effect */}
                    <div className="button-glow absolute inset-0 bg-gradient-to-r from-[#7400B8] via-[#9B4DCA] to-[#7400B8] blur-xl opacity-30 group-hover:opacity-0 transition-opacity duration-300"></div>
                    {/* Permanent shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] animate-shine group-hover:opacity-0 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              className="hero-image relative h-full flex flex-col justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500 h-[500px] w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10"></div>
                  <img
                    src="/assets/20945368.jpg"
                    alt="Analytics Dashboard"
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    loading="eager"
                  />
                </div>

                {/* Feature Cards */}
                <div ref={heroCardsRef} className="grid grid-cols-2 gap-4 mt-6">
                  {/* Card 1 */}
                  <div className="feature-card relative rounded-xl p-5 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="ml-3 text-base font-semibold text-gray-800">Real-time Analytics</h3>
                      </div>
                      <p className="text-sm text-gray-600">Get instant insights with our powerful analytics engine.</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="feature-card relative rounded-xl p-5 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9B4DCA] to-[#7400B8] opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#9B4DCA] to-[#7400B8] rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="ml-3 text-base font-semibold text-gray-800">Smart Insights</h3>
                      </div>
                      <p className="text-sm text-gray-600">AI-powered insights to drive your business forward.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements - Subtle */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#7400B8] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[45rem] h-[45rem] bg-[#9B4DCA] rounded-full mix-blend-multiply filter blur-3xl opacity-[0.03]"></div>
        </div>
      </section>

      {/* About Us Section - New */}
      <div className="bg-[#F9F4FF]">
        <AboutUsSection ref={aboutRef} />
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <FeaturesSection ref={featuresRef} />
      </div>
      {/* How It Works Section */}
      {typeof HowItWorksSection !== 'undefined' && (
        <div className="bg-[#F9F4FF]">
          <HowItWorksSection />
        </div>
      )}
      {/* Testimonials Section */}
      <div className="bg-[#F9F4FF]">
        <TestimonialsSection ref={testimonialsRef} />
      </div>

      {/* Pricing Section */}
      {typeof PricingSection !== 'undefined' && (
        <div className="bg-white">
          <PricingSection />

        </div>
      )}

      {/* FAQ Section */}
      {typeof FAQSection !== 'undefined' && (
        <div className="bg-white"> {/* Changed to white background */}
          <FAQSection />
        </div>
      )}
      {/* Blog Section */}
      <div className="bg-[#F9F4FF]"> {/* Changed to light purple background */}
        <BlogSection ref={blogRef} />
        <PartnersSection />
      </div>

      {/* CTA Section */}
      {typeof CTASection !== 'undefined' && (
        <div className="bg-white"> {/* Changed to white background */}
          <CTASection />
        </div>
      )}

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;
