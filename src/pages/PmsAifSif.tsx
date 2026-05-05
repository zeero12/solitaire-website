import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Briefcase, TrendingUp, Layers } from 'lucide-react';

export default function PmsAifSif({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="PMS / AIF / SIF"
      heroSubtitle="Beyond mutual funds — for investors ready for the next level."
      heroEyebrow="ADVANCED INVESTMENT STRATEGIES"
      heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80"
      
      introHeading="Beyond a certain level of wealth, diversification demands more than mutual funds can offer."
      introContent={
        <>
          <p className="mb-4">You want more transparency, more customisation, and access to strategies beyond the retail fund universe.</p>
          <p>PMS, AIF, and SIF are built for exactly this stage. We help you figure out which one fits — and get you there without the jargon.</p>
        </>
      }
      
      capabilitiesHeading="The Three Categories, Simply Explained"
      capabilitiesList={[
        {
          title: "Portfolio Management Services (PMS)",
          description: (
            <>
              <p className="mb-4">You own individual stocks directly — not through a pooled fund. Your portfolio is managed specifically to your goals.</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-gold mt-2">
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Minimum: ₹50 lakhs</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Full holding transparency</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">SEBI-registered managers</span>
              </div>
            </>
          ),
          icon: <Briefcase className="w-5 h-5" />
        },
        {
          title: "Alternative Investment Funds (AIFs)",
          description: (
            <>
              <p className="mb-4">Access to private equity, hedge strategies, structured debt, and real estate — assets beyond public markets.</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-gold mt-2">
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Minimum: ₹1 crore</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Lower correlation to stock markets</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Three SEBI categories</span>
              </div>
            </>
          ),
          icon: <Layers className="w-5 h-5" />
        },
        {
          title: "Specialised Investment Funds (SIFs)",
          description: (
            <>
              <p className="mb-4">Sophisticated strategies — long-short equity, structured debt, derivatives — at a lower entry point.</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-gold mt-2">
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Minimum: ₹10 lakhs</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">More flexible than mutual funds</span>
                <span className="bg-[#FAF9F6] px-2 py-1 rounded border border-brand-gold/20">Ideal stepping stone to PMS</span>
              </div>
            </>
          ),
          icon: <TrendingUp className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "OUR COMMITMENT",
        title: "We don't push a single provider.",
        description: "We find the right fit for you based on your specific needs and goals."
      }}
      promiseList={[
        {
          title: "Assessment",
          description: "Assess which category suits your capital, goals, and risk profile."
        },
        {
          title: "Comparison",
          description: "Compare providers on track record, fees, and strategy — not brand size."
        },
        {
          title: "Guidance",
          description: "Guide you through onboarding, documentation, and compliance."
        },
        {
          title: "Monitoring",
          description: "Monitor performance and flag issues proactively."
        },
        {
          title: "Allocation",
          description: "Advise on how much of your overall wealth belongs here."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Growing Wealth",
          description: "Investors with ₹10L+ exploring SIFs or ₹50L+ considering PMS or ₹1Cr+ can invest in AIF."
        },
        {
          title: "High Networth Individuals",
          description: "HNIs ready for the next level of portfolio sophistication."
        },
        {
          title: "Sophisticated Investors",
          description: "Those seeking customisation, transparency, and active management."
        }
      ]}
      
      ctaText="Speak to an Advisor"
      openModal={openModal}
    />
  );
}