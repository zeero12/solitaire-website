import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Menu, Phone, Mail, Instagram, Linkedin, Shield, MapPin, Target, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BookingModal from './components/BookingModal';
import ScrollToTop from './components/ScrollToTop';
import WealthManagement from './pages/WealthManagement';
import PmsAifSif from './pages/PmsAifSif';
import FinancialPlanning from './pages/FinancialPlanning';
import MutualFunds from './pages/MutualFunds';
import EquityDerivatives from './pages/EquityDerivatives';
import TaxSavingBonds from './pages/TaxSavingBonds';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import { getHeroNews } from './services/getHeroNews';

const NavItem = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link to={to} className="relative px-4 py-2 group transition-all duration-300 ease-in-out rounded-md">
    <span className="absolute inset-0 bg-white rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out shadow-sm"></span>
    <span className="relative z-10 text-white group-hover:text-brand-gold transition-colors duration-300 ease-in-out">
      {children}
    </span>
  </Link>
);

const Navbar = ({ openModal }: { openModal: () => void }) => (
  <nav className="absolute top-0 w-full z-50 bg-transparent text-white border-b border-white/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://drive.google.com/thumbnail?id=1CLmU5Po2DbqliZJ62tvKRlidQ2TouDDU&sz=w1000" 
              alt="Solitaire Financial Solutions Logo" 
              className="h-14 w-auto object-contain"
            />
            <span className="font-serif text-xl md:text-2xl font-bold tracking-wider group-hover:text-brand-gold transition-colors hidden sm:block">
              Solitaire Financial Solutions
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About Us</NavItem>
          <NavItem to="/#services">Services</NavItem>
          
          <div className="relative group/nav">
            <button className="relative px-4 py-2 transition-all duration-300 ease-in-out rounded-md flex items-center gap-1">
              <span className="absolute inset-0 bg-white rounded-md opacity-0 scale-95 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-300 ease-in-out shadow-sm"></span>
              <span className="relative z-10 text-white group-hover/nav:text-brand-gold transition-colors duration-300 ease-in-out flex items-center gap-1">
                Resources <ChevronDown className="w-4 h-4"/>
              </span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 border border-gray-100">
              <Link to="/#calculators" className="block px-4 py-2 text-gray-700 hover:bg-brand-light hover:text-brand-blue transition-colors">Calculators</Link>
              <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-brand-light hover:text-brand-blue transition-colors">Blog</Link>
            </div>
          </div>

          <NavItem to="/#contact">Contact</NavItem>
          
          <div className="pl-2">
            <button onClick={openModal} className="relative px-6 py-2 group transition-all duration-300 ease-in-out rounded-md border border-white/30 bg-white/10 hover:border-transparent">
              <span className="absolute inset-0 bg-white rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out shadow-md"></span>
              <span className="relative z-10 text-white group-hover:text-brand-gold transition-colors duration-300 ease-in-out font-medium">
                Book a Free Consultation
              </span>
            </button>
          </div>
        </div>
        <div className="md:hidden flex items-center">
          <Menu className="w-6 h-6" />
        </div>
      </div>
    </div>
  </nav>
);

const Hero = ({ openModal }: { openModal: () => void }) => {
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [cardsToShow, setCardsToShow] = useState(3);
  const touchStartX = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 768) setCardsToShow(1);
      else if (window.innerWidth < 1024) setCardsToShow(2);
      else setCardsToShow(3);
    };
    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);
    return () => window.removeEventListener('resize', updateCardsToShow);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const items = await getHeroNews();
      setNews(items);
    };
    fetchNews();
  }, []);

  const staticNews = [
    {
      source: "INSIGHTS",
      title: "Market Outlook 2024",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=100&auto=format&fit=crop",
      articleUrl: "#"
    },
    {
      source: "NEWS",
      title: "Understanding New Tax Regimes",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=100&auto=format&fit=crop",
      articleUrl: "#"
    },
    {
      source: "GUIDE",
      title: "Retirement Planning Basics",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=100&auto=format&fit=crop",
      articleUrl: "#"
    }
  ];

  const displayNews = news.length > 0 ? news : staticNews;

  const goToNext = useCallback(() => {
    if (displayNews.length <= cardsToShow) return;
    setDirection('next');
    setCurrentIndex((prev) => prev + 1);
  }, [displayNews.length, cardsToShow]);

  const goToPrev = useCallback(() => {
    if (displayNews.length <= cardsToShow) return;
    setDirection('prev');
    setCurrentIndex((prev) => prev - 1);
  }, [displayNews.length, cardsToShow]);

  const goToIndex = (targetIdx: number) => {
    const currentModuloIdx = ((currentIndex % displayNews.length) + displayNews.length) % displayNews.length;
    if (targetIdx === currentModuloIdx || displayNews.length <= cardsToShow) return;
    setDirection(targetIdx > currentModuloIdx ? 'next' : 'prev');
    setCurrentIndex(prev => prev + (targetIdx - currentModuloIdx));
  };

  useEffect(() => {
    if (isPaused || displayNews.length <= cardsToShow) return;
    intervalRef.current = setInterval(goToNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, isPaused, displayNews.length, cardsToShow, goToNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }
    touchStartX.current = null;
  };

  const visibleSequence = Array.from({ length: cardsToShow }, (_, i) => currentIndex + i);

  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Winding road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
        <h1 className="text-5xl md:text-6xl font-serif text-white font-medium mb-6 leading-tight">
          Your Trusted Partner in<br/>Wealth Management
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto font-light">
          With over <strong className="font-semibold text-white">25+ years of experience</strong>, we help <strong className="font-semibold text-white">400+ families</strong> achieve financial freedom through personalized investment strategies and expert guidance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={openModal} className="bg-brand-gold hover:bg-[#b08d4f] text-white px-8 py-3 rounded-sm font-medium transition-colors w-full sm:w-auto">
            Book a Free Discovery Call
          </button>
          <button className="text-white hover:text-brand-gold px-8 py-3 font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
            See How We Work <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* News Carousel */}
      <div 
        className="absolute bottom-0 left-0 w-full translate-y-1/2 z-20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative group">
            <div className="bg-brand-blue/90 backdrop-blur-sm p-4 rounded-sm border border-white/10 shadow-xl overflow-hidden relative min-h-[110px] flex items-center justify-center h-full">
              {/* Progress Bar */}
              {displayNews.length > cardsToShow && (
                <div 
                  key={currentIndex}
                  className="absolute bottom-0 left-0 h-[2px] bg-brand-gold animate-progress-timer"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                />
              )}

              {/* Navigation Arrows - Desktop Only */}
              <button 
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-0 group-hover:opacity-100 hidden lg:flex items-center justify-center"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div 
                className="w-full px-8 lg:px-12 h-full flex items-center justify-center touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex w-full overflow-hidden flex-nowrap" style={{ gap: '16px' }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {displayNews.length > 0 && visibleSequence.map((seqIdx) => {
                      const itemIndex = ((seqIdx % displayNews.length) + displayNews.length) % displayNews.length;
                      const item = displayNews[itemIndex];
                      
                      return (
                        <motion.a
                          layout
                          key={seqIdx}
                          href={item.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 bg-white/5 p-3 rounded cursor-pointer hover:bg-white/10 transition-colors w-full group/card flex-shrink-0"
                          style={{
                            width: `calc((100% - ${(cardsToShow - 1) * 16}px) / ${cardsToShow})`
                          }}
                          initial={{ opacity: 0, x: direction === 'next' ? 60 : -60 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: direction === 'next' ? -60 : 60 }}
                          transition={{ 
                            layout: { type: "tween", duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.45, ease: "linear" },
                            x: { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
                          }}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} className="w-14 h-14 object-cover rounded shadow-lg flex-shrink-0" alt=""/>
                          ) : (
                            <div className="w-14 h-14 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-white/50 text-[10px] uppercase font-bold">NEWS</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-1 overflow-hidden">
                              {item.badge && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/30 whitespace-nowrap">
                                  {item.badge}
                                </span>
                              )}
                              <p className="text-white/60 text-[10px] uppercase tracking-wider truncate">{item.source || item.category || 'NEWS'}</p>
                            </div>
                            <p className="text-white text-sm font-medium line-clamp-2 leading-snug group-hover/card:text-brand-gold transition-colors">{item.title}</p>
                          </div>
                        </motion.a>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <button 
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-0 group-hover:opacity-100 hidden lg:flex items-center justify-center"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Pagination Dots */}
            {displayNews.length > cardsToShow && (
              <div className="flex justify-center gap-2.5 mt-5">
                {displayNews.map((_, idx) => {
                  const isActive = idx === ((currentIndex % displayNews.length) + displayNews.length) % displayNews.length;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-brand-gold w-6' 
                          : 'bg-white/20 w-1.5 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WhoWeAre = () => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-3xl font-serif text-gray-900 mb-2">Our Philosophy</h2>
      <h3 className="text-xl text-brand-gold font-serif italic">25+ Years of Excellence</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Tile 1 */}
      <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-brand-gold flex flex-col items-center text-center cursor-pointer">
        <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-white/20 transition-colors duration-300">
          <Target className="w-8 h-8 text-brand-gold group-hover:text-white transition-colors duration-300" />
        </div>
        <h4 className="font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300 uppercase tracking-wide text-sm">Our Philosophy</h4>
        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors duration-300">Structured & disciplined investment approach.</p>
      </div>
      
      {/* Tile 2 */}
      <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-brand-gold flex flex-col items-center text-center cursor-pointer">
        <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-white/20 transition-colors duration-300">
          <ShieldCheck className="w-8 h-8 text-brand-gold group-hover:text-white transition-colors duration-300" />
        </div>
        <h4 className="font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300 uppercase tracking-wide text-sm">Our Commitment</h4>
        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors duration-300">Client oriented, ethical & transparent practices.</p>
      </div>
      
      {/* Tile 3 */}
      <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-brand-gold flex flex-col items-center text-center cursor-pointer">
        <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-white/20 transition-colors duration-300">
          <TrendingUp className="w-8 h-8 text-brand-gold group-hover:text-white transition-colors duration-300" />
        </div>
        <h4 className="font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-300 uppercase tracking-wide text-sm">Our Approach</h4>
        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors duration-300">Comprehensive investment solutions under one roof.</p>
      </div>
    </div>
  </div>
);

const Services = () => {
  const items = [
    { title: "Wealth Management", desc: "Grow, protect and transfer your wealth with a structured, long term strategy.", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop", link: "/services/wealth-management" },
    { title: "PMS / AIF / SIF", desc: "Sophisticated investment vehicles managed by experienced portfolio managers.", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop", link: "/services/pms-aif-sif" },
    { title: "Financial Planning", desc: "A roadmap to achieve your life goals through disciplined financial management.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop", link: "/services/financial-planning" },
    { title: "Mutual Funds", desc: "Curated fund portfolios across equity, debt, and hybrid categories to suit your goals.", img: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=400&auto=format&fit=crop", link: "/services/mutual-funds" },
    { title: "Equity / Derivatives / SLBM", desc: "Active market participation with access to equity, derivatives, and SLBM through a systematic approach", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=400&auto=format&fit=crop", link: "/services/equity-derivatives-slbm" },
    { title: "Tax Saving Bonds (54EC)", desc: "Save capital gains tax on property sale by investing in government backed 54EC bonds.", img: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=400&auto=format&fit=crop", link: "/services/tax-saving-bonds" },
  ];

  return (
    <div id="services" className="space-y-6 scroll-mt-24">
      <h2 className="text-3xl font-serif text-gray-900">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <Link to={item.link} key={i} className="relative flex flex-col justify-end rounded-xl overflow-hidden group cursor-pointer h-72 shadow-sm hover:shadow-xl transition-all duration-500">
            {/* Background Image with Zoom Effect */}
            <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Content Area (Bottom 55%) with Translucent Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-black/40 backdrop-blur-md border-t border-white/20 transition-all duration-500 group-hover:bg-black/50 flex flex-col justify-between p-5">
              <div>
                <h4 className="text-white font-semibold text-lg mb-1">{item.title}</h4>
                <p className="text-gray-200 text-sm line-clamp-2">{item.desc}</p>
              </div>
              <span className="text-white text-sm font-medium flex items-center gap-2 mt-3 group-hover:text-brand-gold transition-colors">
                Learn More <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

import CalculatorsSection from './components/CalculatorsSection';

const Insights = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-serif text-gray-900">Your access to<br/>rich insights</h2>
    <p className="text-sm text-gray-600">
      From expert market perspectives to deep dives into specific asset classes, our insights are designed to keep you informed and ahead of the curve.
    </p>
    <div className="grid grid-cols-2 gap-4">
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded mb-3">
          <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop" alt="Bridge" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-brand-blue transition-colors">Navigating Market Volatility</h4>
        <p className="text-xs text-gray-500">Strategies for uncertain times</p>
      </div>
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded mb-3">
          <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop" alt="Walking" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-brand-blue transition-colors">The Future of ESG Investing</h4>
        <p className="text-xs text-gray-500">Aligning wealth with values</p>
      </div>
    </div>
  </div>
);

const Quote = () => (
  <div className="bg-brand-light p-8 rounded-lg relative mt-12">
    <div className="absolute -top-6 left-8 text-6xl text-brand-gold opacity-50 font-serif">"</div>
    <p className="text-lg font-serif text-gray-800 italic relative z-10 mb-6">
      "The hallmark of our offering is professional advisory driven by service. Our clients rely on our ability to work with them and deeply personalize around their financial journey."
    </p>
    <div className="flex items-center gap-4">
      <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&auto=format&fit=crop" alt="Saumya Rajan" className="w-12 h-12 rounded-full object-cover" />
      <div>
        <div className="font-serif italic text-xl text-brand-blue">Saumya Rajan</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">Senior Partner</div>
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-serif text-gray-900">What Our Customers Say</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-100 p-5 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <p className="text-sm text-gray-600 mb-4 italic flex-grow">"Solitaire Financial Solutions has always provided me high quality service and brokerage relatively low cost. I would like to thank Vishal and the Solitaire team for consistently high-quality service and support."</p>
        <div>
          <div className="font-semibold text-gray-900 text-sm">Mr. Dipesh</div>
          <div className="text-xs text-gray-500">CEO</div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 p-5 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <p className="text-sm text-gray-600 mb-4 italic flex-grow">"Their structured and disciplined approach has helped me achieve my financial goals much faster than I expected. Highly recommended."</p>
        <div>
          <div className="font-semibold text-gray-900 text-sm">Priya Sharma</div>
          <div className="text-xs text-gray-500">Entrepreneur</div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 p-5 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <p className="text-sm text-gray-600 mb-4 italic flex-grow">"The team's commitment to ethical and transparent practices gives me peace of mind. I trust them completely with my family's financial future."</p>
        <div>
          <div className="font-semibold text-gray-900 text-sm">Rahul Verma</div>
          <div className="text-xs text-gray-500">IT Professional</div>
        </div>
      </div>
    </div>
  </div>
);

const CallToAction = ({ openModal }: { openModal: () => void }) => (
  <div className="bg-brand-light rounded-lg overflow-hidden flex flex-col sm:flex-row items-center">
    <div className="p-8 sm:w-1/2">
      <h2 className="text-3xl font-serif text-gray-900 mb-4">Not Sure Where to Start?</h2>
      <p className="text-sm text-gray-600 mb-6">
        Not sure where your financial journey should begin? Our team will understand your goals, assess your current situation and map out the right path — no obligation, no sales pitch.
      </p>
      <button onClick={openModal} className="bg-brand-blue hover:bg-[#152a45] text-white px-6 py-2.5 rounded font-medium transition-colors">
        Book a Free Call
      </button>
    </div>
    <div className="sm:w-1/2 h-full min-h-[250px]">
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" alt="Team meeting" className="w-full h-full object-cover" />
    </div>
  </div>
);

const Footer = () => (
  <footer id="contact" className="bg-brand-blue text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-serif font-bold mb-6">Solitaire Main Office</h3>
          <div className="flex items-start gap-3">
            <a href="https://maps.app.goo.gl/wvUdYFK4U7bQx2Kh7" target="_blank" rel="noopener noreferrer" className="mt-1 text-brand-gold hover:text-white transition-colors flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </a>
            <p className="text-sm text-gray-300 leading-relaxed">
              1306-1307, Rio Empire,<br/>
              Near Pal-RTO,<br/>
              Opp. Umra Bridge,<br/>
              Pal-Hazira Road,<br/>
              Surat - 394510
            </p>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/solitaire_financial_solution/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://www.linkedin.com/company/solitaire-financial-solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" /> 
              <span>+91 99094 51144, +91 261 2784278</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" /> 
              <a href="mailto:solitairequeries@gmail.com" className="hover:text-white transition-colors">solitairequeries@gmail.com</a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6">Download Our App</h3>
          <div className="flex flex-col gap-3">
            <a href="https://apps.apple.com/us/app/solitaire-financial-solutions/id1286413858" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 transition-colors w-fit">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-6 h-6 brightness-0 invert" alt="Apple logo" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-none text-gray-400 mb-1">Download on the</span>
                <span className="text-sm font-semibold leading-none text-white">App Store</span>
              </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.M2M.SolitaireFinancialSolution" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 transition-colors w-fit">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" className="w-6 h-6" alt="Google Play logo" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-none text-gray-400 mb-1">GET IT ON</span>
                <span className="text-sm font-semibold leading-none text-white">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-6 text-center">
        <div className="max-w-4xl">
          <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed uppercase tracking-wider">
            Solitaire Financial Solutions — AMFI Registered Mutual Fund Distributor | Registered with SEBI as Authorised Person of Phillip Capital India Pvt. Ltd. | Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 text-xs text-gray-400">
          <div className="flex gap-4">
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5" /> ADMIN DASHBOARD
            </Link>
          </div>
          <p>Copyright 2026 Solitaire Financial Solutions. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

const Home = ({ openModal }: { openModal: () => void }) => (
  <>
    <Hero openModal={openModal} />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="flex flex-col space-y-16 lg:space-y-24">
        <WhoWeAre />
        <Services />
        <CallToAction openModal={openModal} />
        <CalculatorsSection />
        <Testimonials />
      </div>
    </main>
  </>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar openModal={() => setIsModalOpen(true)} />
        
        <Routes>
          <Route path="/" element={<Home openModal={() => setIsModalOpen(true)} />} />
          <Route path="/about" element={<AboutUs openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/wealth-management" element={<WealthManagement openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/pms-aif-sif" element={<PmsAifSif openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/financial-planning" element={<FinancialPlanning openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/mutual-funds" element={<MutualFunds openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/equity-derivatives-slbm" element={<EquityDerivatives openModal={() => setIsModalOpen(true)} />} />
          <Route path="/services/tax-saving-bonds" element={<TaxSavingBonds openModal={() => setIsModalOpen(true)} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>

        <Footer />
        
        <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </Router>
  );
}
