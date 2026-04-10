import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Target, TrendingDown, TrendingUp, ShieldAlert, FileText, Calendar, RefreshCw } from 'lucide-react';

export default function FinancialPlanning({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Financial Planning"
      heroSubtitle="Clarity on where you stand. Confidence in where you're headed."
      heroEyebrow="COMPREHENSIVE FINANCIAL PLANNING"
      heroImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80"
      
      introHeading="Most people don't have a financial plan."
      introContent={
        <>
          <p className="mb-4">They have financial activity — scattered SIPs, an old LIC policy, some FDs, a few forgotten stocks.</p>
          <p className="mb-4">That's not a plan. That's guesswork with good intentions.</p>
          <p>A real plan connects everything — your income, goals, investments, insurance, and taxes — into one clear picture. That's where we start with every client.</p>
        </>
      }
      
      capabilitiesHeading="What Financial Planning Involves"
      capabilitiesList={[
        {
          title: "Goal Mapping",
          description: "We put real numbers and timelines on what you're working towards.",
          icon: <Target className="w-5 h-5" />
        },
        {
          title: "Cash Flow Analysis",
          description: "We find where your money is leaking and how to redirect it.",
          icon: <TrendingDown className="w-5 h-5" />
        },
        {
          title: "Investment Strategy",
          description: "Every investment tied to a specific goal. Nothing recommended in isolation.",
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          title: "Insurance Review",
          description: "Identify gaps in your coverage before they matter.",
          icon: <ShieldAlert className="w-5 h-5" />
        },
        {
          title: "Tax Planning",
          description: "Keep more of what you earn through smart, legal strategies.",
          icon: <FileText className="w-5 h-5" />
        },
        {
          title: "Retirement Planning",
          description: "Know exactly what corpus you need and how to build it.",
          icon: <Calendar className="w-5 h-5" />
        },
        {
          title: "Periodic Reviews",
          description: "Your plan evolves as your life does.",
          icon: <RefreshCw className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How It Works"
      promiseHighlight={{
        eyebrow: "OUR PROCESS",
        title: "Clear next steps — never confusion.",
        description: "You leave every meeting knowing exactly where you stand and what needs to be done."
      }}
      promiseList={[
        {
          title: "1. Discovery Meeting",
          description: "We understand your situation, goals, and concerns."
        },
        {
          title: "2. Financial Assessment",
          description: "Full review of income, assets, liabilities, and coverage."
        },
        {
          title: "3. Plan Creation",
          description: "A written, tailored financial plan. Not a template."
        },
        {
          title: "4. Implementation",
          description: "Step-by-step guidance to execute it."
        },
        {
          title: "5. Ongoing Reviews",
          description: "We check in regularly and adjust when needed."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Young Professionals",
          description: "Starting their financial journey and wanting to build a strong foundation."
        },
        {
          title: "Families",
          description: "Juggling EMIs, children's education, and aging parents."
        },
        {
          title: "Mid-Career Individuals",
          description: "Whose income has grown but finances feel scattered."
        },
        {
          title: "Complex Portfolios",
          description: "Anyone with money in multiple places but no plan connecting it."
        }
      ]}
      
      ctaText="Start Your Financial Plan"
      openModal={openModal}
    />
  );
}