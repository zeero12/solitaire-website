import React, { ReactNode } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface Capability {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
}

interface PromiseItem {
  title?: string;
  description: ReactNode;
}

interface AudienceItem {
  title: string;
  description: ReactNode;
}

interface ServicePageLayoutProps {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroEyebrow?: string;
  
  introEyebrow?: string;
  introHeading: ReactNode;
  introContent: ReactNode;
  
  capabilitiesEyebrow?: string;
  capabilitiesHeading: ReactNode;
  capabilitiesList: Capability[];
  
  promiseEyebrow?: string;
  promiseHeading: ReactNode;
  promiseHighlight?: {
    eyebrow?: string;
    title: ReactNode;
    description: ReactNode;
  };
  promiseList: PromiseItem[];
  
  audienceEyebrow?: string;
  audienceHeading: ReactNode;
  audienceList: AudienceItem[];
  
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaText: string;
  openModal: () => void;
  children?: ReactNode;
}

const SERVICES = [
  { path: '/services/wealth-management', title: 'Wealth Management' },
  { path: '/services/pms-aif-sif', title: 'PMS / AIF / SIF' },
  { path: '/services/financial-planning', title: 'Financial Planning' },
  { path: '/services/mutual-funds', title: 'Mutual Funds' },
  { path: '/services/equity-derivatives-slbm', title: 'Equity / SLBM' },
  { path: '/services/life-insurance', title: 'Life Insurance' },
  { path: '/services/tax-saving-bonds', title: 'Bonds & FD' },
];

export default function ServicePageLayout({
  heroTitle,
  heroSubtitle,
  heroImage = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80",
  heroEyebrow,
  
  introEyebrow = "THE INTRODUCTION",
  introHeading,
  introContent,
  
  capabilitiesEyebrow = "OUR CAPABILITIES",
  capabilitiesHeading,
  capabilitiesList,
  
  promiseEyebrow = "THE SOLITAIRE PROMISE",
  promiseHeading,
  promiseHighlight,
  promiseList,
  
  audienceEyebrow = "TARGET AUDIENCE",
  audienceHeading,
  audienceList,
  
  ctaTitle = "Ready to build a plan that works for your life?",
  ctaSubtitle = "Schedule a no-obligation call with our team.",
  ctaText,
  openModal,
  children
}: ServicePageLayoutProps) {
  const location = useLocation();
  const currentIndex = SERVICES.findIndex(s => s.path === location.pathname);
  
  const prevService = currentIndex > 0 ? SERVICES[currentIndex - 1] : SERVICES[SERVICES.length - 1];
  const nextService = currentIndex !== -1 && currentIndex < SERVICES.length - 1 ? SERVICES[currentIndex + 1] : SERVICES[0];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt={heroTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            {heroEyebrow && (
              <p className="text-brand-gold text-xs tracking-widest uppercase mb-4 font-medium">{heroEyebrow}</p>
            )}
            <div className="flex items-center gap-4 mb-6">
              {currentIndex !== -1 && (
                <Link 
                  to={prevService.path}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-gold flex items-center justify-center text-white transition-all duration-300 hover:scale-110 flex-shrink-0"
                  title={`Previous: ${prevService.title}`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Link>
              )}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">{heroTitle}</h1>
              {currentIndex !== -1 && (
                <Link 
                  to={nextService.path}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-gold flex items-center justify-center text-white transition-all duration-300 hover:scale-110 flex-shrink-0"
                  title={`Next: ${nextService.title}`}
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              )}
            </div>
            <p className="text-xl md:text-2xl font-serif italic text-gray-200">{heroSubtitle}</p>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">{introEyebrow}</p>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{introHeading}</h2>
            </div>
            <div className="prose prose-lg text-gray-600">
              {introContent}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 lg:py-32 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">{capabilitiesEyebrow}</p>
                <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{capabilitiesHeading}</h2>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {capabilitiesList.map((cap, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-sm shadow-sm flex gap-6 items-start hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-brand-light rounded flex items-center justify-center flex-shrink-0 text-brand-gold">
                      {cap.icon || <div className="w-4 h-4 bg-brand-gold rounded-sm opacity-50"></div>}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-gray-900 mb-2">{cap.title}</h3>
                      <div className="text-gray-600 leading-relaxed">{cap.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">{promiseEyebrow}</p>
                <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{promiseHeading}</h2>
              </div>
            </div>
            <div className="lg:col-span-8">
              {promiseHighlight && (
                <div className="bg-brand-light p-8 md:p-12 border-l-4 border-brand-gold mb-12">
                  {promiseHighlight.eyebrow && (
                    <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">{promiseHighlight.eyebrow}</p>
                  )}
                  <h3 className="text-3xl font-serif text-gray-900 mb-4 italic">{promiseHighlight.title}</h3>
                  <div className="text-gray-600">{promiseHighlight.description}</div>
                </div>
              )}
              
              <div className="space-y-8">
                {promiseList.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-brand-gold flex-shrink-0 mt-1" />
                    <div>
                      {item.title && <h4 className="text-lg font-serif text-gray-900 mb-1">{item.title}</h4>}
                      <div className="text-gray-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20 lg:py-32 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">{audienceEyebrow}</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">{audienceHeading}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {audienceList.map((item, idx) => (
              <div key={idx} className={`pb-8 ${idx < audienceList.length - 2 ? 'border-b border-gray-800' : ''} ${idx % 2 === 0 ? 'md:border-r md:border-gray-800 md:pr-12' : 'md:pl-12'}`}>
                <h3 className="text-xl font-serif text-white mb-3">{item.title}</h3>
                <div className="text-gray-400 leading-relaxed">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {children}

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-brand-light text-center relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">{ctaTitle}</h2>
          {ctaSubtitle && <p className="text-xl text-gray-600 mb-10">{ctaSubtitle}</p>}
          <button 
            onClick={openModal} 
            className="bg-brand-blue hover:bg-[#152a45] text-white px-8 py-4 text-sm tracking-widest uppercase font-medium transition-colors inline-flex items-center gap-2"
          >
            {ctaText}
          </button>
        </div>
        
        {/* Bottom Navigation Arrows */}
        {currentIndex !== -1 && (
          <div className="absolute bottom-8 left-0 w-full px-4 sm:px-8 flex justify-between items-center z-0">
            <Link 
              to={prevService.path}
              className="group flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-brand-gold flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium hidden sm:block tracking-wider uppercase">{prevService.title}</span>
            </Link>
            
            <Link 
              to={nextService.path}
              className="group flex items-center gap-2 text-gray-500 hover:text-brand-gold transition-colors"
            >
              <span className="text-sm font-medium hidden sm:block tracking-wider uppercase">{nextService.title}</span>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-brand-gold flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
