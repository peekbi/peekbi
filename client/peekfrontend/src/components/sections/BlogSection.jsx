import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import Modal from '../Modal';
import ReactMarkdown from 'react-markdown';

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const headingRef = useRef(null);
  const readmoreRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const blogPosts = [
    {
      title: "Why Small Businesses Need Business Intelligence (More Than Ever)",
      excerpt: "Because today, decisions can't wait — and neither can your growth.",
      image: "https://www.incworx.com/wp-content/uploads/2022/10/benefits-of-business-intelligence-dashboards-1080x675.jpg",
      date: "June 15, 2024",
      category: "Business Intelligence",
      content: `In an age where every click, sale, and conversation creates data, small businesses are sitting on a goldmine of insight. But here's the problem: many don't have the tools—or time—to dig into it. While large enterprises invest millions in business intelligence (BI) teams and software, small and medium businesses (SMBs) often rely on instinct, guesswork, or scattered spreadsheets.

But times have changed.
Business Intelligence is no longer a luxury. It's a necessity. And now, it's more accessible than ever.

**1. Small businesses generate more data than they think**
From customer interactions and sales transactions to social media engagement and website traffic — small businesses create vast amounts of data daily. The challenge isn't lack of data, but lack of visibility.
BI tools help make sense of this information, turning raw numbers into clear visuals and actionable insights. You shouldn't need a degree in data science to understand your business.

**2. Decisions need to be fast, not just good**
Markets shift, trends change, and competitors evolve—often faster than you can react manually. Small teams can't afford to wait for end-of-month reports or hire dedicated analysts.
With modern BI tools like PeekBI, insights are delivered in real time. Know what's selling, where you're losing money, and what's growing—as it happens.

**3. Compete smarter, not bigger**
You may not have the budget of a large corporation, but with smart analytics, you can compete on strategy.
Know which products drive the most profit (not just revenue)
Spot your best customers and regions
Understand where your marketing budget performs best
Intelligence levels the playing field. It's not about size—it's about clarity.

**4. Goodbye spreadsheets, hello simplicity**
Excel is great, but it wasn't built for rapid growth or scaling insights. Data across multiple sheets, files, or team members leads to version chaos and slow responses.
Modern BI platforms connect to multiple data sources, detect patterns automatically, and present it all in one beautiful dashboard. And the best part? No code. No complexity. No delay.

**5. Time is your most valuable resource**
For founders, agency owners, and small teams—every minute matters. You shouldn't spend hours manually creating reports, combining CSVs, or chasing down numbers.
A good BI platform automates the boring parts:
Auto-generates weekly reports
Flags unusual trends
Suggests actions based on insights
That's time you get back to actually grow your business.

**Conclusion:**
Business Intelligence is no longer reserved for the Fortune 500. It's the secret weapon of the smart, the scrappy, and the ambitious.
Tools like PeekBI are bringing enterprise-level insight to the hands of everyday decision-makers—without the cost, complexity, or learning curve.
You already have the data.
It's time to let it work for you.`
    },
    {
      title: "What Makes a Great Dashboard? A Non-Technical Guide",
      excerpt: "It's not about data overload — it's about clarity, focus, and action.",
      image: "https://images.klipfolio.com/website/public/fef9b3dd-f994-40ec-ba1c-c514e551a587/Business%20Dashboard.png",
      date: "June 10, 2024",
      category: "Dashboard Design",
      content: `You've probably heard the phrase, "Let's build a dashboard." But what does that really mean?
To many, a dashboard is just a bunch of charts on a screen. But in reality, a great dashboard is like the control panel of your business — showing you what's working, what's not, and what needs attention now.
Whether you're a founder, a marketing lead, or a small business owner, this guide breaks down what makes a dashboard actually useful — no jargon, no code, no confusion.

**1. A Great Dashboard Tells a Story**
Think of a dashboard as the "highlight reel" of your business.
Instead of drowning you in data, it should surface:
What's changed?
What needs action?
What's performing well or underperforming?
Good dashboards don't just show data — they answer questions.
For example: "Why are sales down this week?" or "Which region is growing fastest?"

**2. It's Focused on What Matters (Not Everything)**
One of the most common dashboard mistakes? Trying to show everything at once.
More isn't better. Better is better.
The best dashboards focus on:
Key Performance Indicators (KPIs)
Metrics tied directly to business goals
The 3–5 numbers that matter most to you daily
A good rule: If a metric doesn't drive a decision, it doesn't belong on the dashboard.

**3. It's Easy to Read — at a Glance**
You shouldn't have to squint or scroll forever.
Great dashboards use:
Clean layouts
Clear labels
Visual cues (like color highlights or up/down arrows)
If your dashboard looks like an Excel sheet exploded — it's not helping. In PeekBI, for instance, we use cards, charts, and auto-highlights to make insights stand out instantly.

**4. It's Real-Time (Or As Close As Possible)**
The world moves fast. Your dashboard should too.
When data is delayed, decisions are delayed. That's why modern tools like PeekBI show real-time or daily auto-refreshed data — so you're always working with the latest numbers.
Imagine spotting a dip in customer engagement today instead of finding out next week. That's the power of timely dashboards.

**5. It's Built for Action**
A great dashboard doesn't just report — it nudges you toward action.
It should:
Highlight unusual trends or outliers
Compare performance against benchmarks
Make it easy to share or export insights
Example: Instead of just showing "Revenue this week," it should show: "Revenue this week is 12% lower than last week" — and maybe suggest a deeper dive into sales by category.

**6. It Doesn't Require a Degree to Understand**
If your team needs a data analyst to explain what the dashboard means — it's not working.
Great dashboards are:
Visual (charts, not tables)
Intuitive (self-explanatory)
Accessible (no steep learning curve)
That's why platforms like PeekBI are designed for non-technical users — drag, drop, upload, and you're done.

**Conclusion:**
At the end of the day, your dashboard should feel like a daily business assistant — quietly working behind the scenes to keep you informed, focused, and in control.
Forget buzzwords. Forget complexity. A great dashboard simply shows you what matters, when it matters — and helps you move forward with confidence.`
    },
    {
      title: "No-Code Analytics: Empowering Founders, Not Just Analysts",
      excerpt: "Because your data should work for you — not the other way around.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      date: "June 5, 2024",
      category: "No-Code",
      content: `For years, data analytics felt like a space reserved for trained analysts and large enterprise teams. Complex software, steep learning curves, and the constant need for IT support made it feel out of reach for small businesses and founders.
But a quiet revolution is changing everything: no-code analytics.
Today, modern tools are putting the power of insights directly into the hands of founders, marketers, and decision-makers — without writing a single line of code. And that changes the game.

**1. What Is No-Code Analytics (And Why It Matters)?**
No-code analytics refers to tools that allow users to:
Upload or connect data
Generate charts, dashboards, and insights
Automate reports and alerts— all without needing programming or SQL knowledge.
This means anyone — not just analysts — can make smart, data-informed decisions in minutes, not hours.
🔍 It democratizes data.

**2. Founders Have Questions — No-Code Brings Answers**
Founders move fast. They're juggling sales, marketing, operations, and growth. They need answers like:
What's driving our revenue this week?
Which campaigns are converting best?
Why did customer retention drop?
No-code tools like PeekBI help founders:
Instantly visualize trends
Compare performance over time
Spot what's working (and what's not)
No waiting on reports. No emailing your tech team. Just clarity.

**3. Save Time. Gain Confidence.**
In the early stages, time is your most precious resource. Founders can't afford to:
Manually crunch spreadsheets
Depend on third-party analysts
Spend hours building reports
With no-code analytics, that time is reclaimed:
Drag, drop, done.
Upload your sales or marketing file, and PeekBI instantly detects patterns and builds dashboards.
🕒 What once took days now takes minutes.

**4. Make Every Team Member Data-Smart**
It's not just founders who benefit — your whole team does.
Marketing can see which channels work best
Sales can track lead conversions in real time
Operations can monitor performance KPIs instantly
No more data silos. Everyone works from the same truth. That's how lean teams scale like pros.

**5. Insights Without Intimidation**
Many business owners avoid analytics tools because they feel "too technical."
No-code platforms remove that fear. You don't need to understand formulas or write queries.
Everything is visual. Intuitive. Friendly. At PeekBI, we believe if it needs training, it's too complicated.

**6. From Founders to Fortune 500 — No-Code is the Future**
Big companies have started embracing no-code tools too. Why?
Because they're:
Faster to deploy
Easier to scale across teams
More cost-effective than building from scratch
The takeaway? No-code isn't just for beginners — it's efficient for everyone.

**Conclusion:**
You started your business to create, build, and lead — not to wrestle with spreadsheets.
No-code analytics gives you control without the complexity. It helps you trust your decisions, back your instincts, and move forward faster.
You don't need to be a data expert. You just need the right tool.`
    },
    {
      title: "From Excel to AI: How to Grow Your Data Practice Without Hiring a Team",
      excerpt: "You don't need a department — you need a smarter approach.",
      image: "https://loyverse.com/sites/all/themes/loyversecom/images/blog/7-google-data-studio.png",
      date: "June 2, 2024",
      category: "Data Strategy",
      content: `Most businesses start their data journey the same way: with Excel. And for a while, it works. You track sales, monitor campaigns, maybe even build some pivot tables.
But then your business grows. Your spreadsheets multiply. Your questions get deeper. And suddenly, Excel just isn't enough.
Does that mean you need to hire data analysts, engineers, or a full tech team? Not anymore.
Modern no-code and AI-powered tools are making it possible to scale your data practice — without building a team. Here's how.

**1. When Excel Becomes a Bottleneck**
Excel is powerful. But it has limits:
Manual data entry
File version chaos
No real-time collaboration
Difficult to scale or automate insights
As your business data grows, your need for speed, accuracy, and automation grows too.
If you've ever said, "There must be a better way" — there is.

**2. The Rise of No-Code Analytics Tools**
Enter platforms like PeekBI and other modern BI tools. These allow businesses to:
Upload spreadsheets or connect to sources like Google Sheets, Shopify, or CRMs
Automatically detect key metrics and patterns
Visualize everything in beautiful, interactive dashboards
No formulas. No macros. No hiring.
You upload your data, and AI does the rest.

**3. From Reactive to Proactive**
With Excel, you're often looking backwards:
What happened last week?
Why were profits down last month?
Modern BI tools help you look forward:
Real-time trends
Forecasts and growth projections
Anomaly detection (without needing to scan rows yourself)
The switch from reactive to proactive data is a turning point in your business maturity — and it's now possible without full-time analysts.

**4. AI + Automation = Growth at Scale**
What used to take days (or people) now takes seconds:
Smart recommendations: PeekBI automatically suggests insights, like "Sales dipped in the North region after 12 PM."
Scheduled reports: Get daily or weekly snapshots, auto-generated.
Anomaly detection: Get alerts when something's off — no digging required.
That's not just helpful. That's scalable growth intelligence.

**5. Democratizing Data Inside Your Team**
Even if you don't have a dedicated data team, your team still needs data.
With the right tool:
Marketing can track ROI on campaigns in real time
Sales can monitor top-performing products and leads
Operations can spot delays and bottlenecks quickly
And because these tools are visual and intuitive, no one has to be a data expert to make smart, informed decisions.

**6. Save Hiring for Where It Matters Most**
Hiring is expensive. Time-consuming. Risky.
By automating your data practice:
You delay the need to hire analysts or engineers
You empower your current team to do more
You allocate resources to product, growth, and customer success
This doesn't mean you'll never hire — but it means you don't have to yet.

**Conclusion:**
You don't need to ditch Excel completely. You just need to go beyond it.
Today's no-code, AI-powered analytics platforms help you:
Get better answers
Make faster decisions
Scale your data maturity without scaling your team
PeekBI was built for this — to give founders, SMEs, and agencies the power of enterprise-grade insights with the simplicity of a spreadsheet upload.`
    },
    {
      title: "Real-Time vs. Traditional Reporting — What's the Real Impact?",
      excerpt: "Because business decisions can't wait for the end of the month.",
      image: "https://www.zohowebstatic.com/sites/zweb/images/analytics/unified.png",
      date: "May 28, 2024",
      category: "Real-Time Analytics",
      content: `Data tells a story — but timing matters. In fast-paced industries, waiting until the end of the month to see what went wrong (or right) is often too late.
That's the difference between traditional reporting and real-time analytics.
Traditional reports show you the past. Real-time dashboards show you the present — and help you shape the future.
Let's explore the real impact of moving from static reports to live insights, and why more modern businesses are switching to real-time tools like PeekBI.

**1. Traditional Reporting: What You've Been Used To**
Traditional business reporting typically involves:
Pulling data manually at weekly or monthly intervals
Cleaning and combining spreadsheets
Building reports in Excel or PDFs
Emailing them across teams
🕐 It's slow, reactive, and disconnected. By the time decisions are made, the moment has passed.

**2. Real-Time Reporting: What Businesses Need Now**
Real-time reporting uses automation and live data connections to:
Pull data continuously or at set short intervals
Update dashboards instantly as new data comes in
Flag trends, spikes, or drops as they happen
With tools like PeekBI, all of this happens without any manual effort.
📊 You see your business performance unfolding in real time.

**3. Why It Matters: The Real Impact**
📉 You Catch Problems Earlier
Traditional reports often reveal issues after they've cost you money.
With real-time dashboards:
Spot a sales dip immediately
Detect inventory shortages early
See a campaign underperforming by the hour — not the week
🚀 You Move Faster
Need to change strategy mid-week? Real-time data lets you act without hesitation. You're no longer making guesses or waiting for someone to "run the numbers."
✅ You Build a Culture of Agility
Teams stop relying on stale PDFs or asking for "the latest version." Instead, they check the dashboard — and act.

**4. Use Case Examples (Impact You Can Feel)**
E-commerce: Spot abandoned cart spikes in real time and adjust offers instantly
Marketing: Track campaign clicks, engagement, and ROI as it unfolds
Healthcare: Monitor appointments, cancellations, and patient load on the go
Finance: Watch transactions and account balances update live
💡 Whether you're running ads, managing logistics, or tracking sales, real-time visibility = faster, smarter decisions.

**5. Does This Mean Traditional Reporting Is Dead?**
Not at all. Traditional reports still matter for:
Deep monthly reviews
Historical trend analysis
Sharing with stakeholders and investors
But for daily decisions, team alignment, and moment-to-moment awareness, traditional reporting is simply too slow.
Real-time and traditional reporting should work hand-in-hand.

**6. How PeekBI Bridges the Gap**
PeekBI was built to bring the best of both worlds:
Upload your spreadsheets, connect your tools — get live dashboards instantly
Data refreshes daily, hourly, or instantly based on your setup
Automatically detects trends, outliers, and performance shifts — no code, no setup needed
Whether you're running a startup, an agency, or an SME — PeekBI brings your data to life, in the moment it matters most.

**Conclusion:**
In business, timing is everything. Traditional reports will always have a place — but they're no longer enough.
If you're still relying on monthly spreadsheets to make weekly decisions, you're already behind.
Real-time reporting gives you speed, awareness, and a competitive edge.
It's not just a feature.
It's the future of smart business.`
    },
    {
      title: "5 KPIs Every Founder Should Track (And How PeekBI Finds Them Instantly)",
      excerpt: "Know what matters. Track it clearly. Act on it confidently.",
      image: "https://dashboardbuilder.net/images/kpi_dashboard_main.png",
      date: "May 25, 2024",
      category: "KPIs",
      content: `As a founder, your day is full of decisions. What to scale, where to invest, what to fix. But how do you know you're making the right calls?
That's where KPIs — Key Performance Indicators — come in.
Tracking the right KPIs gives you a clear pulse on your business. But identifying them, calculating them, and updating them constantly? That's where many small teams get stuck.
In this article, we'll cover 5 essential KPIs every founder should track, and how modern tools like PeekBI make them effortless — no formulas or analysts required.

**1. Revenue Growth Rate**
Why it matters: This is your core metric — how fast your business is growing over time.
How to track it: Compare revenue from this period (week, month, quarter) to the last.
PeekBI makes it easy: Just upload your data — PeekBI auto-calculates growth trends and visualizes them instantly with line charts, percentage change, and benchmarks.

**2. Customer Acquisition Cost (CAC)**
Why it matters: Are you spending more to get customers than they're worth? CAC tells you how efficient your marketing and sales are.
How to track it: Divide total marketing/sales spend by number of new customers acquired.
PeekBI makes it easy: It detects marketing spend vs. customer volume across your uploaded datasets — and shows CAC over time, by channel, or campaign.

**3. Gross Profit Margin**
Why it matters: Revenue is great, but profit is what keeps you alive. This KPI shows how much of each rupee you keep after covering direct costs.
How to track it: (Gross Profit ÷ Revenue) × 100
PeekBI makes it easy: It auto-calculates profit margins by product, region, or month — highlighting what's driving the most (or least) profit.

**4. Customer Retention or Repeat Purchase Rate**
Why it matters: It's cheaper to keep a customer than acquire a new one. Retention shows how loyal your users are.
How to track it: Divide returning customers by total customers over a period.
PeekBI makes it easy: PeekBI detects repeat customer patterns across your data, visualizing loyalty trends and helping you take timely action.

**5. Top Performing Products / Services**
Why it matters: You should always know what's driving your growth — and what's not.
How to track it: Rank products/services by revenue, volume, or profit.
PeekBI makes it easy: It automatically shows your top 5/10 products by performance, with filters for time range, category, or region.

**Why These KPIs?**
These five cover:
Growth (Revenue, CAC)
Profitability (Margins)
Loyalty (Retention)
Focus (Top performers)
They give you a 360° view of your business health, without needing dozens of metrics.
And with PeekBI, you're not just tracking them — you're seeing them come to life in real-time, without setup or code.

**Conclusion:**
Most founders know they should be "data-driven" — but feel overwhelmed by the complexity.
With tools like PeekBI, you don't need to build KPIs manually or spend hours updating spreadsheets. Just upload your file — and watch key metrics appear, cleanly and instantly.
Your business already holds the answers. Now it's time to see them, trust them, and act on them.`
    }
  ];

  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

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
          start: "top 30%",          // Changed from 17% to 30% for earlier pinning
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
                      e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop";
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
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <button 
                      onClick={() => handleOpenModal(post)}
                      className="text-gray-900 font-medium flex items-center group cursor-pointer"
                    >
                      Read more
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

          </div>

        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {selectedArticle && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#7400B8]/10 text-[#7400B8] text-sm font-semibold py-1 px-3 rounded-full">
                    {selectedArticle.category}
                  </span>
                  <span className="text-sm text-gray-500">{selectedArticle.date}</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h2>
              
              <img 
                src={selectedArticle.image} 
                alt={selectedArticle.title}
                className="w-full object-cover rounded-lg mb-6"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop";
                }}
              />
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </Modal>

      </div>


    </section>
  );
};

export default BlogSection;
