import React from 'react';
import ServiceHero from '../components/ServiceHero';
import ServiceCTA from '../components/ServiceCTA';

export default function AboutUs({ openModal }: { openModal: () => void }) {
  return (
    <div className="bg-white min-h-screen">
      <ServiceHero 
        title="About Us" 
        subtitle="Solitaire Financial Solutions is a client-focused financial services practice with 25+ years of experience — built on a single founding principle: that every individual and business deserves a disciplined, transparent, and long-term approach to managing their financial future." 
        subtitleClassName="text-brand-gold"
      />
      
      {/* Meet Vishal Dalal Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="lg:w-5/12 flex-shrink-0 flex">
            <img 
              src="https://drive.google.com/thumbnail?id=1Ug8Qn5FAbMS-SlbRp1zfoQfCJBvuRmtq&sz=w1000" 
              alt="Vishal Dalal" 
              className="w-full h-full rounded-md shadow-sm object-cover"
            />
          </div>
          
          <div className="lg:w-7/12 space-y-6 text-gray-700 text-lg leading-relaxed text-justify">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-blue mb-10 tracking-tight text-left">Meet Mr. Vishal Dalal</h2>
            <p>Vishal Dalal is the founder of Solitaire Financial Solutions, with years of hands-on experience guiding individuals, families, and businesses through the complexities of financial planning and wealth creation.</p>
            <p>His work spans mutual funds, capital markets, fixed income instruments, and insurance — always calibrated to each client's specific objectives, risk appetite, and long-term vision.</p>
            <p>What distinguishes Vishal's approach is not just technical expertise, but the quality of relationships he builds. He works closely with clients to understand their evolving financial priorities, provides clarity at every stage of the engagement, and ensures that every decision is well-informed and purposeful.</p>
            
            <blockquote className="mt-8 border-l-4 border-gray-900 pl-6 py-6 bg-gray-50 rounded-r-md">
              <p className="italic text-gray-800 mb-4">"Consistency, disciplined execution, and responsible financial participation are the cornerstones of long-term value creation."</p>
              <footer className="text-gray-900 font-bold">— Vishal Dalal</footer>
            </blockquote>
            
            <p className="mt-8">Over the years, Vishal has guided clients through multiple market cycles — remaining a steady, trusted presence when it matters most. His philosophy is grounded in three commitments: professionalism in every interaction, transparency in every recommendation, and trust as the foundation of every client relationship.</p>
          </div>
        </div>
      </main>

      {/* What We Stand For Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-blue mb-8">What We Stand For</h2>
          
          <div className="text-lg text-gray-700 leading-relaxed space-y-6 max-w-4xl mx-auto mb-12">
            <p>At Solitaire Financial Solutions, our objective is straightforward — to provide a dependable, transparent platform where clients can access the right financial products and make informed decisions with confidence.</p>
            <p>We are not driven by product-pushing or short-term metrics. We are driven by the financial stability and long-term prosperity of the individuals and families we serve.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-md py-6 px-4 shadow-sm flex items-center justify-center">
              <span className="text-brand-blue font-semibold text-lg">Client-first</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-md py-6 px-4 shadow-sm flex items-center justify-center">
              <span className="text-brand-blue font-semibold text-lg">Ethics-led</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-md py-6 px-4 shadow-sm flex items-center justify-center">
              <span className="text-brand-blue font-semibold text-lg">Built for the long term</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ServiceCTA 
          title="Ready to take a structured, long-term view of your financial future?"
          subtitle="Let's start a conversation."
          text="Book a Free Discovery Call" 
          openModal={openModal} 
        />
      </div>
    </div>
  );
}
