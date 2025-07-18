import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const headingRef = useRef(null);
  const readmoreRef = useRef(null);

  const blogPosts = [
    {
      title: "The Future of Business Intelligence in 2024",
      excerpt: "Discover how AI and machine learning are revolutionizing the way businesses analyze and interpret data.",
      image: "/assets/20945368.jpg",
      date: "June 15, 2024",
      readTime: "5 min read",
      category: "Trends"
    },
    {
      title: "5 Ways to Improve Your Data Visualization Strategy",
      excerpt: "Learn how to create compelling visualizations that effectively communicate your data insights.",
      image: "/assets/20945194.jpg",
      date: "June 10, 2024",
      readTime: "4 min read",
      category: "Best Practices"
    },
    {
      title: "How PeekBI Helped XYZ Corp Increase Revenue by 40%",
      excerpt: "A case study on how data-driven decision making transformed a struggling business into an industry leader.",
      image: "/assets/20945839.jpg",
      date: "June 5, 2024",
      readTime: "7 min read",
      category: "Case Study"
    },
    {
      title: "Exploring Real-Time Dashboards",
      excerpt: "Understand how real-time analytics can provide immediate insights and impact decision-making.",
      image: "/assets/20945368.jpg",
      date: "June 2, 2024",
      readTime: "6 min read",
      category: "Realtime"
    },
    {
      title: "Scaling BI Systems with the Cloud",
      excerpt: "Tips on leveraging cloud infrastructure to handle big data and analytics workloads.",
      image: "/assets/20945194.jpg",
      date: "May 28, 2024",
      readTime: "5 min read",
      category: "Cloud"
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;

    if (!container || !track) return;

    // Widths
    const containerWidth = container.offsetWidth;
    const trackWidth = track.scrollWidth;

    // Last card element
    const lastCard = track.lastElementChild;
    if (!lastCard) return;

    // Calculate last card's left offset relative to track and its center point
    const lastCardLeft = lastCard.offsetLeft;
    const lastCardWidth = lastCard.offsetWidth;
    const lastCardCenter = lastCardLeft + lastCardWidth / 2;

    // Calculate x translation to center last card within container center
    let xTranslate = -(lastCardCenter - containerWidth / 2);

    // Clamp xTranslate so no scroll beyond limits
    const paddingRight = containerWidth / 2 - lastCardWidth / 2;
    const maxScrollLeft = -(trackWidth + paddingRight - containerWidth);

    if (xTranslate < maxScrollLeft) {
      xTranslate = maxScrollLeft;
    }
    if (xTranslate > 0) {
      xTranslate = 0;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.killAll();

      gsap.to(track, {
        x: xTranslate,
        ease: "none",
        scrollTrigger: {
          trigger: container,         // Pin the whole container (heading + cards)
          start: "top 17%",
          end: () => `+=${Math.abs(xTranslate)}`, // scroll duration based on distance
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: false,
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-r from-[#f4e8fb] to-[#f8eefd] text-gray-900 min-h-screen flex flex-col justify-center">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Container includes heading + cards for pinning */}
        <div
          ref={containerRef}
          className="relative overflow-hidden w-full"
          style={{ height: '570px' }}
        >
          <motion.div
            ref={headingRef}
            className="main flex flex-row md:flex-row justify-between items-center mb-10"  // reduced bottom margin
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Latest Insights</h2>
              <p className="text-xl text-gray-600">
                Expert advice and thought leadership on data analytics
              </p>
            </div>
            <a href="#" className="mt-6 md:mt-0 flex items-center text-gray-900 font-semibold group">
              View all articles
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>

          <div
            ref={trackRef}
            className="flex gap-6 px-5  h-[420px] sm:h-[450px]"
            style={{ paddingRight: "calc(50vw - 175px)" }} // Adjusted padding for smaller cards
          >
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                className="w-[80vw] mb-8 sm:w-[350px] min-w-[80vw] sm:min-w-[350px] max-w-[350px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden snap-start group"

                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.3, ease: "circOut" } }}
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-[160px] sm:h-[180px] object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/20945368.jpg";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/20 text-gray-900 text-xs font-semibold py-1 px-3 rounded-full backdrop-blur-sm">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 relative h-full">
                  <div className="relative z-10">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <a href="#" className="text-gray-900 font-medium flex items-center group">
                      Read more
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}

          </div>

        </div>

      </div>


    </section>
  );
};

export default BlogSection;
