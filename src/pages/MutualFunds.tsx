import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { TrendingUp, ShieldCheck, PieChart, Landmark, CalendarClock, IndianRupee } from 'lucide-react';

export default function MutualFunds({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Mutual Funds"
      heroSubtitle="The right fund, chosen for the right reason — matched to your goals, not ours."
      heroEyebrow="STRATEGIC MUTUAL FUND INVESTING"
      heroImage="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80"
      
      introHeading="Mutual funds work. But only when chosen correctly."
      introContent={
        <>
          <p className="mb-4">Not based on last year's rankings, a friend's tip, or what company it belongs to.</p>
          <p className="mb-4">With thousands of schemes available, the challenge isn't access. It's selection, structure, and discipline, suiting to your needs.</p>
          <p>We handle all three.</p>
        </>
      }
      
      capabilitiesHeading="Categories We Cover"
      capabilitiesList={[
        {
          title: "Equity Funds",
          description: "Long-term wealth creation. Large, mid, small, flexi-cap, and thematic — chosen on quality, not recent rankings.",
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          title: "Debt Funds",
          description: "Capital preservation or short-term goals. Liquid, short-duration, gilt, and corporate bond funds.",
          icon: <ShieldCheck className="w-5 h-5" />
        },
        {
          title: "Hybrid Funds",
          description: "Balanced equity-debt allocation for moderate-risk investors.",
          icon: <PieChart className="w-5 h-5" />
        },
        {
          title: "ELSS (Tax Saving)",
          description: "₹1.5L deduction under 80C. Shortest lock-in (3 years). Market-linked returns.",
          icon: <Landmark className="w-5 h-5" />
        },
        {
          title: "SIP-Based Investing",
          description: "Systematic monthly investments that harness compounding over time. We design SIPs around your goals and cash flows — not arbitrary numbers.",
          icon: <CalendarClock className="w-5 h-5" />
        },
        {
          title: "SWP-Based Investing",
          description: "Turn your corpus into a steady, tax-efficient income stream. Systematic withdrawals designed around your cash-flow needs, so your money keeps working even while you spend.",
          icon: <IndianRupee className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "OUR APPROACH",
        title: "Data-driven decisions. No emotional biases.",
        description: "We evaluate funds on what actually drives long-term wealth — risk-adjusted performance and the calibre of the fund manager."
      }}
      promiseList={[
        {
          title: "Fund Selection",
          description: "Risk-adjusted returns. Manager track record. Expense ratio. That is the entire criteria."
        },
        {
          title: "Portfolio Construction",
          description: "No duplication, no category overlap. Every fund has a purpose."
        },
        {
          title: "SIP Design",
          description: "Realistic, goal-linked, and sustainable for your income."
        },
        {
          title: "Review & Rebalancing",
          description: "Data-driven switches. No emotional decisions."
        },
        {
          title: "Goal Tracking",
          description: "We tell you honestly if you're on track — or need to adjust."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "First-Time Investors",
          description: "Starting a SIP and wanting to get it right from the beginning."
        },
        {
          title: "HNIs and Professionals",
          description: "Moving from scattered investments to a structured, goal-aligned portfolio."
        },
        {
          title: "Tax Savers",
          description: "Investors seeking 80C tax savings via ELSS."
        },
        {
          title: "Existing Investors",
          description: "Anyone with a scattered portfolio wanting goal-based clarity."
        }
      ]}
      
      ctaText="Get a Free Portfolio Review"
      openModal={openModal}
    />
  );
}