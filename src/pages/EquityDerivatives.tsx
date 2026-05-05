import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { LineChart, ShieldAlert, ArrowRightLeft } from 'lucide-react';

export default function EquityDerivatives({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Equity / SLBM"
      heroSubtitle="Active market participation — with strategy, discipline, and expert guidance."
      heroEyebrow="DIRECT MARKET PARTICIPATION"
      heroImage="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80"
      
      introHeading="Direct market participation offers control and return potential."
      introContent={
        <>
          <p className="mb-4">But without knowledge and discipline, it can erode capital just as fast.</p>
          <p>We guide you across three distinct areas — so you participate wisely, not impulsively.</p>
        </>
      }
      
      capabilitiesHeading="What We Cover"
      capabilitiesList={[
        {
          title: "Equity Investing",
          description: (
            <ul className="space-y-2 list-disc pl-4 mt-2">
              <li>Stock-level portfolios built on fundamentals — not tips or momentum.</li>
              <li>For long-term investors seeking returns beyond index benchmarks.</li>
              <li>Focus on quality businesses at reasonable valuations.</li>
            </ul>
          ),
          icon: <LineChart className="w-5 h-5" />
        },
        {
          title: "Derivatives (Futures & Options)",
          description: (
            <>
              <p className="mb-2">Legitimate uses in a structured portfolio:</p>
              <ul className="space-y-2 list-disc pl-4 mb-4">
                <li><strong>Hedging</strong> — Protect your holdings during uncertain markets.</li>
                <li><strong>Income generation</strong> — Earn premium income by writing covered calls.</li>
                <li><strong>Structured strategies</strong> — Defined risk-reward positions.</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm text-amber-800 mt-4">
                <strong>Note:</strong> Derivatives carry significant risk. We only recommend them to clients with adequate capital, understanding, and risk tolerance.
              </div>
            </>
          ),
          icon: <ShieldAlert className="w-5 h-5" />
        },
        {
          title: "Securities Lending & Borrowing (SLBM)",
          description: (
            <>
              <p className="mb-2">Own stocks you're not selling anytime soon? Earn income on them — without selling.</p>
              <ul className="space-y-2 list-disc pl-4 mb-4">
                <li>Lend your shares for up to 12 months via NSE's SLBM platform</li>
                <li>Borrower pays you a lending fee</li>
                <li>Full collateral protection via NSCCL</li>
                <li>Shares returned intact at end of tenure</li>
                <li>Dividends and corporate actions continue to accrue to you</li>
              </ul>
              <p className="font-medium text-brand-gold mt-4">Your idle holdings earn additional income — with structured protection.</p>
            </>
          ),
          icon: <ArrowRightLeft className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "OUR PHILOSOPHY",
        title: "Markets reward discipline. They punish impulse.",
        description: "Let's build your approach the right way."
      }}
      promiseList={[
        {
          title: "Profile Assessment",
          description: "Assess whether equity, derivatives, or SLBM suits your profile."
        },
        {
          title: "Portfolio Building",
          description: "Build portfolios with a fundamentals-first approach."
        },
        {
          title: "SLBM Setup",
          description: "Set up SLBM and identify which holdings are eligible for lending."
        },
        {
          title: "Plan Integration",
          description: "Ensure all market activity fits your broader financial plan."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Experienced Investors",
          description: "Seeking structured equity guidance."
        },
        {
          title: "Long-Term Holders",
          description: "Wanting to earn income on idle shares via SLBM."
        },
        {
          title: "Risk Managers",
          description: "Investors looking to hedge against market downside."
        },
        {
          title: "Active Participants",
          description: "Those seeking active, personalised equity exposure beyond mutual funds."
        }
      ]}
      
      ctaText="Speak to Us About Equity Strategies"
      openModal={openModal}
    />
  );
}