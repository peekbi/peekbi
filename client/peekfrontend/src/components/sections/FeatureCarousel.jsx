import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';

const slides = [
  {
    id: 1,
    title: "Transform Your Data",
    description: "Turn complex data into actionable insights with our AI-powered analytics platform",
    image: "/ui_image/carolas1.png",
    gradient: "from-[#7400B8] to-[#9B4DCA]",
    features: [
      "AI-Powered Analytics",
      "Real-time Processing",
      "Custom Dashboards",
      "Advanced Visualizations"
    ]
  },
  {
    id: 2,
    title: "Real-time Analytics",
    description: "Get instant insights and make data-driven decisions with confidence",
    image: "/ui_image/carosal2.png",
    gradient: "from-[#9B4DCA] to-[#7400B8]",
    features: [
      "Live Data Monitoring",
      "Instant Reports",
      "Smart Alerts",
      "Performance Tracking"
    ]
  },
  {
    id: 3,
    title: "Smart Insights",
    description: "Leverage AI to uncover patterns and opportunities in your business data",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070",
    gradient: "from-[#7400B8] to-[#9B4DCA]",
    features: [
      "Pattern Recognition",
      "Predictive Analytics",
      "Trend Analysis",
      "Business Intelligence"
    ]
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = slides.map(slide => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = slide.image;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isLoading || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isLoading, isHovered]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient} opacity-80`} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl text-center"
              >
                <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xl md:text-2xl mb-8 text-gray-100">
                  {slides[currentSlide].description}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {slides[currentSlide].features.map((feature, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium"
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#7400B8] px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Auto-play Toggle */}
      <button
        onClick={toggleAutoPlay}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
        aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isAutoPlaying ? (
          <FiPause className="w-6 h-6 text-white" />
        ) : (
          <FiPlay className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentSlide(index);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <motion.div
          className="h-full bg-white"
          initial={{ width: "0%" }}
          animate={{ width: isAutoPlaying ? "100%" : "0%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </section>
  );
};

export default Carousel;