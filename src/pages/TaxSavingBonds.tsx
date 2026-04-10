import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Landmark, IndianRupee, Lock, Percent, Building2, ShieldCheck, Clock } from 'lucide-react';

export default function TaxSavingBonds({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Tax Saving Bonds (54EC)"
      heroSubtitle="Just sold a property? Here's how to legally eliminate your capital gains tax."
      heroEyebrow="CAPITAL GAINS EXEMPTION"
      heroImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80"
      
      introHeading="Sold a property held for more than 2 years?"
      introContent={
        <>
          <p className="mb-4">You owe Long-Term Capital Gains tax — and depending on the sale value, that can be a significant amount.</p>
          <p>Most people find out too late. Section 54EC gives you a legal, government-approved route to avoid this tax entirely — but only if you act within 6 months of the sale.</p>
        </>
      }
      
      capabilitiesHeading="What Are 54EC Bonds?"
      capabilitiesList={[
        {
          title: "Eligible for",
          description: "LTCG from sale of land or building",
          icon: <Landmark className="w-5 h-5" />
        },
        {
          title: "Investment limit",
          description: "₹50 lakhs per financial year",
          icon: <IndianRupee className="w-5 h-5" />
        },
        {
          title: "Lock-in period",
          description: "5 years",
          icon: <Lock className="w-5 h-5" />
        },
        {
          title: "Interest rate",
          description: "~5% p.a. (taxable)",
          icon: <Percent className="w-5 h-5" />
        },
        {
          title: "Issuers",
          description: "REC, NHAI (Government-backed)",
          icon: <Building2 className="w-5 h-5" />
        },
        {
          title: "Safety",
          description: "No credit risk",
          icon: <ShieldCheck className="w-5 h-5" />
        },
        {
          title: "Deadline",
          description: <span className="font-semibold text-red-600">Within 6 months of sale — non-negotiable</span>,
          icon: <Clock className="w-5 h-5 text-red-600" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "TAX SAVING EXAMPLE",
        title: "How the Tax Saving Works",
        description: (
          <ul className="space-y-3 font-mono text-sm md:text-base mt-4">
            <li className="flex justify-between border-b border-brand-gold/20 pb-2"><span>Property sold for</span> <span>₹1.2 crore</span></li>
            <li className="flex justify-between border-b border-brand-gold/20 pb-2"><span>Indexed cost</span> <span>₹50 lakhs</span></li>
            <li className="flex justify-between border-b border-brand-gold/20 pb-2 font-semibold text-gray-900"><span>LTCG</span> <span>₹70 lakhs</span></li>
            <li className="flex justify-between border-b border-brand-gold/20 pb-2 text-red-600"><span>Tax due (approx)</span> <span>₹14 lakhs</span></li>
            <li className="flex justify-between border-b border-brand-gold/20 pb-2 text-green-600 font-semibold"><span>Invest in 54EC bonds</span> <span>₹70 lakhs</span></li>
            <li className="flex justify-between pt-2 font-bold text-xl text-brand-blue"><span>Tax liability</span> <span>₹0</span></li>
          </ul>
        )
      }}
      promiseList={[
        {
          title: "Eligibility check",
          description: "Confirm your sale qualifies and calculate your exact liability."
        },
        {
          title: "Deadline management",
          description: "Track your 6-month window and ensure timely action."
        },
        {
          title: "End-to-end application",
          description: "Issuer selection, paperwork, and documentation."
        },
        {
          title: "Tax plan integration",
          description: "Fit the 54EC investment into your broader tax strategy."
        },
        {
          title: "Multi-year structuring",
          description: "Where gains exceed ₹50L, plan across financial years where possible."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Property Sellers",
          description: "Anyone who has recently sold — or is about to sell — property held for 2+ years."
        },
        {
          title: "Tax Planners",
          description: "Those facing a large LTCG liability looking for a legal exemption route."
        },
        {
          title: "NRIs",
          description: "NRIs managing property sale tax obligations in India."
        },
        {
          title: "Inheritance",
          description: "Families selling inherited property."
        }
      ]}
      
      ctaText="Book a Free Call"
      openModal={openModal}
    />
  );
}