import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Landmark, ShieldCheck, TrendingUp, Landmark as Bank, Building2, HelpCircle } from 'lucide-react';

export default function BondsAndFd({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Bonds & FD"
      heroSubtitle="Preserve capital, earn predictable income, and choose fixed-income products with greater clarity."
      heroEyebrow="BONDS & FIXED DEPOSITS"
      heroImage="https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80"
      
      introHeading="Fixed-income investing deserves the same rigor as equity investing."
      introContent={
        <>
          <p className="mb-4">Whether you're evaluating tax-saving bonds, RBI bonds, corporate bonds, company FDs, or NBFC FDs, Solitaire helps you select the right option based on safety, tenure, liquidity, and return expectations.</p>
          <p className="mb-4">Many investors choose bonds or fixed deposits based only on headline returns. In reality, the right decision depends on a deeper mix of factors — issuer quality, lock-in, liquidity, taxation, payout structure, and how the instrument fits into your broader financial plan.</p>
          <p>At Solitaire, the focus is not just on helping you invest. The focus is on helping you invest with context — so the product you choose matches your goals, not just the rate being advertised.</p>
        </>
      }
      
      capabilitiesHeading="What Falls Under Bonds & FD"
      capabilitiesList={[
        {
          title: "Bonds",
          description: (
            <div>
              <p className="mb-2">A range of fixed-income instruments designed for stability, income generation, and selective tax efficiency.</p>
              <div className="text-sm font-medium text-brand-gold uppercase tracking-wider">Categories</div>
              <p className="text-gray-900">Tax Saving Bonds (54EC), RBI Bonds, Corporate Bonds</p>
            </div>
          ),
          icon: <Landmark className="w-5 h-5" />
        },
        {
          title: "Fixed Deposits",
          description: (
            <div>
              <p className="mb-2">Structured deposit options for investors seeking predictable returns over defined tenures.</p>
              <div className="text-sm font-medium text-brand-gold uppercase tracking-wider">Categories</div>
              <p className="text-gray-900">Company FD, NBFC FD</p>
            </div>
          ),
          icon: <Bank className="w-5 h-5" />
        },
        {
          title: "What We Evaluate",
          description: "Safety, issuer strength, tenure, liquidity, taxation, payout options, and suitability within your portfolio.",
          icon: <ShieldCheck className="w-5 h-5" />
        },
        {
          title: "Who It Suits",
          description: "Investors prioritizing capital protection, regular income, tax planning, and lower volatility allocation.",
          icon: <TrendingUp className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You Choose Better"
      promiseList={[
        {
          title: "Suitability First",
          description: "Understand whether bonds, fixed deposits, or a combination of both best fits your return expectations, liquidity needs, and risk comfort."
        },
        {
          title: "Curated Product Selection",
          description: "Compare 54EC bonds, RBI bonds, corporate bonds, company FDs, and NBFC FDs through a practical lens — not just on yield, but on quality and fit."
        },
        {
          title: "Structured Guidance",
          description: "Get support with product evaluation, paperwork, application steps, and execution."
        },
        {
          title: "Portfolio-Level Thinking",
          description: "Position fixed-income products within a broader tax, cash-flow, and wealth strategy instead of treating them as isolated purchases."
        },
        {
          title: "Risk-Aware Filtering",
          description: "Avoid unsuitable products by assessing lock-in periods, credit profile, issuer credibility, and liquidity constraints before investing."
        }
      ]}
      
      audienceHeading="Who This Is Built For"
      audienceList={[
        {
          title: "Tax-Conscious Investors",
          description: "Those exploring 54EC bonds as part of a capital gains planning strategy."
        },
        {
          title: "Conservative Allocators",
          description: "Investors looking for fixed-income exposure with greater predictability than market-linked assets."
        },
        {
          title: "Income-Oriented Families",
          description: "Individuals and households seeking steady interest income and better visibility into returns."
        },
        {
          title: "Portfolio Builders",
          description: "Investors who want to diversify across debt products with a clearer understanding of safety, taxation, and liquidity."
        },
        {
          title: "Retirees and Near-Retirees",
          description: "Those prioritizing capital protection, dependable cash flows, and simplicity in financial decision-making."
        }
      ]}
      
      ctaTitle="Choose fixed-income products with more clarity — and fewer blind spots."
      ctaSubtitle="Book a no-obligation conversation with Solitaire to evaluate which bond or FD options make sense for your goals, liquidity needs, and risk profile."
      ctaText="Book a Free Call"
      openModal={openModal}
    >
      {/* Explanatory / Education Section */}
      <section className="py-20 lg:py-32 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-medium">EXPLANATORY / EDUCATION SECTION</p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">Fixed-Income Options, Clearly Explained</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-brand-light p-8 rounded-sm border border-brand-gold/10">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand-gold mb-6 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-4">Tax Saving Bonds (54EC)</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Useful for investors looking to claim eligible capital gains exemption after the sale of qualifying property, subject to timelines and legal conditions.</p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-sm border border-brand-gold/10">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand-gold mb-6 shadow-sm">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-4">RBI Bonds</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Government-backed instruments suited for investors who place a premium on safety, credibility, and predictable fixed-income allocation.</p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-sm border border-brand-gold/10">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand-gold mb-6 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-4">Corporate Bonds</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Potentially higher-yield debt instruments issued by companies, appropriate for investors willing to assess credit quality more carefully in exchange for better return potential.</p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-sm border border-brand-gold/10">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand-gold mb-6 shadow-sm">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-4">Company FD</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Fixed deposits offered by corporates, often appealing to investors seeking better rates than traditional deposits while remaining selective about issuer quality.</p>
            </div>
            
            <div className="bg-brand-light p-8 rounded-sm border border-brand-gold/10">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-brand-gold mb-6 shadow-sm">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-4">NBFC FD</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Deposit products issued by non-banking financial companies, suitable when evaluated carefully for credit strength, tenure, and payout structure.</p>
            </div>
          </div>
        </div>
      </section>
    </ServicePageLayout>
  );
}