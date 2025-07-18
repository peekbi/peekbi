import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FiArrowRight, FiMenu, FiX, FiDownload, FiBarChart2, FiTrendingUp, FiShield } from 'react-icons/fi';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from 'react-router-dom';

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
import FeatureCarousel from '../components/sections/FeatureCarousel';

// Import the new AboutUsSection
import AboutUsSection from './sections/AboutUsSection';

// Add this import at the top with the other section imports
import DashboardSection from './sections/DashboardSection';

// Add this import at the top with the other imports
import { useNavigate } from 'react-router-dom';

// Import the new PartnersSection
import PartnersSection from './sections/PartnersSection';

// Import new components
import Navigation from './Navigation';
import HeroSection from './HeroSection';

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

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .gradient-border {
    background: linear-gradient(45deg, #7400B8, #9B4DCA, #C77DFF, #7400B8);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsMounted(true);

    // Initialize AOS immediately
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
      offset: 50,
      easing: 'ease-in-out',
      delay: 0,
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
    <div ref={containerRef} className="min-h-screen bg-black">
      {/* Navigation Component */}
      <Navigation 
        isScrolled={isScrolled} 
        heroRef={heroRef}
        aboutRef={aboutRef}
        featuresRef={featuresRef}
      />

      {/* Hero Section Component */}
      <HeroSection />

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
        <div className="bg-white">
          <FAQSection />
        </div>
      )}
      {/* Blog Section */}
      <div className="bg-[#F9F4FF]">
        <BlogSection ref={blogRef} />
        <PartnersSection />
      </div>

      {/* CTA Section */}
      {typeof CTASection !== 'undefined' && (
        <div className="bg-white">
          <CTASection />
        </div>
      )}

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;
