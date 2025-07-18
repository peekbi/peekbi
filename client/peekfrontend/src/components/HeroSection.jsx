import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import { forwardRef, useEffect, useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Area } from 'recharts';

const HeroSection = forwardRef((props, heroRef) => {
  // Sample data for the chart
  const [data, setData] = useState([
    { name: 'Jan', value: 400, growth: 240 },
    { name: 'Feb', value: 300, growth: 290 },
    { name: 'Mar', value: 200, growth: 320 },
    { name: 'Apr', value: 278, growth: 390 },
    { name: 'May', value: 189, growth: 480 },
    { name: 'Jun', value: 239, growth: 380 },
    { name: 'Jul', value: 349, growth: 430 },
    { name: 'Aug', value: 400, growth: 410 },
    { name: 'Sep', value: 300, growth: 350 },
    { name: 'Oct', value: 200, growth: 280 },
    { name: 'Nov', value: 278, growth: 320 },
    { name: 'Dec', value: 189, growth: 400 },
  ]);

  // Animation effect to update chart data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData =>
        prevData.map(item => ({
          ...item,
          value: Math.floor(Math.random() * 500) + 100,
          growth: Math.floor(Math.random() * 300) + 200
        }))
      );
    }, 3050); // Animation slowed by 10%

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={heroRef} className="h-screen flex items-center pt-24 sm:pt-24 pb-6 sm:pb-10 px-3 sm:px-6">
      <div className="max-w-[1200px] mx-auto w-full h-full">
        <div className="bg-gradient-to-br from-[#2D1B69] to-[#4C2A85] rounded-3xl px-4 sm:px-8 pt-6 sm:pt-8 pb-0 lg:pt-10 lg:px-10 shadow-2xl border border-[#7400B8]/20 h-full flex flex-col">
          {/* Text Content - Top */}
          <div className="text-center mb-4 sm:mb-8 flex-shrink-0">
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-[#9B4DCA] to-[#F8F4FF] bg-clip-text text-transparent">Uncover Patterns. Unlock Growth.</span>
            </motion.h1>

            <motion.p
              className="hidden sm:block text-base lg:text-lg text-gray-200 mb-6 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Advanced Analytics-Powerful insights with machine learning algorithms. <br />
              Real-time Monitoring-Track performance and trends in real-time. <br />
              Secure & Reliable-Enterprise-grade security for your data.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl hover:shadow-xl transition-all duration-200 text-base font-medium flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
              </Link>
              <Link
                to="#demo"
                className="w-full sm:w-auto px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 hover:shadow-xl transition-all duration-200 text-base font-medium flex items-center justify-center space-x-2"
              >
                <FiPlay className="w-4 h-4" />
                <span>Watch Demo</span>
              </Link>
            </motion.div>
          </div>

          {/* Interactive Chart - Takes remaining height */}
          <motion.div
            className="relative flex justify-center flex-1 min-h-0 overflow-hidden sm:mt-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F472B6" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F472B6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={false} axisLine={false} />
                  <YAxis tick={false} axisLine={false} />
                  <Tooltip cursor={false} content={() => null} />
                  <Area
                    type="natural"
                    dataKey="growth"
                    fill="url(#areaGradient)"
                    stroke="none"
                    animationDuration={2200}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="value"
                    name="Volume"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1650}
                    animationEasing="ease-in-out"
                    barSize={70}
                    style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }}
                  />
                  <Line
                    type="natural"
                    dataKey="growth"
                    name="Trend"
                    stroke="url(#lineGradient)"
                    strokeWidth={5}
                    dot={false}
                    activeDot={false}
                    animationDuration={2200}
                    animationEasing="ease-out"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(244, 114, 182, 0.7))' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;