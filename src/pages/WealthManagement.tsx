import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Briefcase, FileText, Calendar, Shield, Activity, RefreshCw } from 'lucide-react';

export default function WealthManagement({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Wealth Management"
      heroSubtitle="A long-term, personal approach to your financial decisions — built around your life, not just a product."
      heroEyebrow="PERSONALIZED WEALTH MANAGEMENT"
      heroImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"
      
      introHeading="Most people invest. Few actually build wealth."
      introContent={
        <>
          <p className="mb-4">The difference is having a plan — one that connects your goals, your money, and your timeline into a disciplined, structured approach.</p>
          <p>At Solitaire, we build that plan with you. And we stay with you to see it through.</p>
        </>
      }
      
      capabilitiesHeading="What Wealth Management Covers"
      capabilitiesList={[
        {
          title: "Investment Planning",
          description: "Goal-aligned portfolios across equity, mutual funds, bonds, and alternative assets — calibrated to your risk and timeline.",
          icon: <Briefcase className="w-5 h-5" />
        },
        {
          title: "Tax Planning",
          description: "Year-round strategies to legally reduce what you pay, so more of your money stays invested.",
          icon: <FileText className="w-5 h-5" />
        },
        {
          title: "Retirement Planning",
          description: "We calculate what you need, and build a systematic plan to get there.",
          icon: <Calendar className="w-5 h-5" />
        },
        {
          title: "Insurance & Risk Coverage",
          description: "Identifying gaps in your protection layer before they become costly.",
          icon: <Activity className="w-5 h-5" />
        },
        {
          title: "Periodic Reviews",
          description: "We rebalance and adjust as markets move and life changes.",
          icon: <RefreshCw className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "DEDICATED ADVISORY ACCESS",
        title: "Every client at Solitaire works with a dedicated advisory team — not a call centre, not a ticketing system.",
        description: "When you reach out, a qualified professional who knows your financial goals will get back to you. Always."
      }}
      promiseList={[
        {
          title: "No product pitch",
          description: "We understand your goals before recommending anything."
        },
        {
          title: "No conflict of interest",
          description: "Every recommendation is made in your interest — not influenced by margins or targets."
        },
        {
          title: "Long-term thinking",
          description: "We measure success in decades, not quarters."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Private Families",
          description: "Individuals and families with ₹25L+ in investable assets seeking institutional quality management."
        },
        {
          title: "Business Owners",
          description: "Entrepreneurs wanting to separate personal and business finances with a strategic firewall."
        },
        {
          title: "Corporate Professionals",
          description: "Busy professionals planning for financial independence or aiming for early retirement."
        },
        {
          title: "High Networth Individuals",
          description: "HNIs looking for one trusted advisor to simplify a complex financial picture across geographies."
        }
      ]}
      
      ctaText="Book a Free Discovery Call"
      openModal={openModal}
    />
  );
}