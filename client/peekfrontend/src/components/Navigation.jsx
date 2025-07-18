import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = ({ isScrolled, heroRef, aboutRef, featuresRef }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation function that uses React Router properly
  const navigateTo = (path) => {
    // Close mobile menu first
    setIsMobileMenuOpen(false);
    
    // Force navigation regardless of current path
    navigate(path);
  };
  
  // Direct navigation to home using window.location
  const goHome = () => {
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  // Function to scroll to section on the homepage
  const scrollToSection = (sectionRef) => {
    if (sectionRef && sectionRef.current) {
      const yOffset = -100;
      const y = sectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Handle section navigation or page navigation
  const handleNavigation = (item) => {
    // Close mobile menu first
    setIsMobileMenuOpen(false);
    
    // If not on home page, navigate home first
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }
    
    // Handle section scrolling on home page
    let scrollTarget = null;
    
    if (item === 'About' && aboutRef && aboutRef.current) {
      scrollTarget = aboutRef.current;
    } else if (item === 'Features' && featuresRef && featuresRef.current) {
      scrollTarget = featuresRef.current;
    } else if (item === 'How It Works' || item === 'Pricing' || item === 'Contact') {
      // For these items, try to find section by content
      const sections = document.querySelectorAll('section');
      
      if (item === 'How It Works') {
        sections.forEach(section => {
          if (section.textContent.includes('How PeekBI Works') || section.textContent.includes('Upload Your File')) {
            scrollTarget = section;
          }
        });
      } else if (item === 'Pricing') {
        sections.forEach(section => {
          if (section.textContent.includes('Simple, Transparent Pricing')) {
            scrollTarget = section;
          }
        });
      } else if (item === 'Contact') {
        const footerElement = document.querySelector('footer');
        if (footerElement) scrollTarget = footerElement;
      }
    }

    // Scroll to target if found
    if (scrollTarget) {
      const yOffset = -100;
      const y = scrollTarget.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed w-full z-50 bg-black shadow-lg"
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <div 
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden cursor-pointer"
              onClick={goHome}
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <motion.div
              key="home-link"
              className="text-lg font-medium text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goHome}
            >
              Home
            </motion.div>
            
            {['About', 'Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
              <motion.div
                key={item}
                className="text-lg font-medium text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item)}
              >
                {item}
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="text-white px-7 py-2 rounded-full text-base font-semibold border-2 border-[#9B4DCA] bg-transparent hover:bg-[#F8F4FF] hover:text-[#7400B8] hover:border-[#7400B8] transition-all duration-200 shadow-none focus:outline-none focus:ring-2 focus:ring-[#9B4DCA]"
              onClick={() => navigateTo('/login')}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-8 py-2 rounded-full text-base font-semibold shadow-lg hover:from-[#9B4DCA] hover:to-[#C77DFF] hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B4DCA]"
              onClick={() => navigateTo('/register')}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Button and Compact Auth Buttons */}
          <div className="flex items-center md:hidden">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="mr-2 text-white px-4 py-1.5 rounded-full text-sm font-semibold border-2 border-[#9B4DCA] bg-transparent transition-all duration-200"
              onClick={() => navigateTo('/login')}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="mr-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white px-4 py-1.5 rounded-full text-sm font-semibold"
              onClick={() => navigateTo('/register')}
            >
              Sign Up
            </motion.button>
            <button
              className="text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-black px-4 py-4 space-y-4">
          <div
            className="block text-lg font-medium text-white px-4 py-3 rounded-lg transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
            onClick={goHome}
          >
            Home
          </div>
          
          {['About', 'Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
            <div
              key={item}
              className="block text-lg font-medium text-white px-4 py-3 rounded-lg transition-all duration-300 hover:bg-[#7400B8] hover:text-white cursor-pointer"
              onClick={() => handleNavigation(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation; 