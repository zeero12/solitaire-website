import React from 'react';
import ServicePageLayout from '../components/ServicePageLayout';
import { Shield, PiggyBank, TrendingUp, Presentation, Baby, CheckSquare } from 'lucide-react';

export default function LifeInsurance({ openModal }: { openModal: () => void }) {
  return (
    <ServicePageLayout
      heroTitle="Life Insurance"
      heroSubtitle="The right cover, chosen for the right reasons — built around your life, not a sales target."
      heroEyebrow="LIFE INSURANCE PROTECTION"
      heroImage="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"
      
      introHeading="Most people have some form of insurance. Few actually have the right kind."
      introContent={
        <>
          <p className="mb-4">A policy bought in a hurry, under-insured, or mis-sold as an investment is not protection — it is a liability dressed up as one.</p>
          <p className="mb-4">Real insurance coverage starts with understanding what you actually need to protect — your income, your family's future, your liabilities — and then finding a policy that does exactly that. Nothing more, nothing less.</p>
          <p>At Solitaire, we help you cut through the noise and get covered correctly.</p>
        </>
      }
      
      capabilitiesHeading="What Life Insurance Planning Covers"
      capabilitiesList={[
        {
          title: "Term Insurance",
          description: "Pure life cover at the lowest possible cost. If something happens to you, your family receives a lump sum that replaces your income and clears your liabilities. No gimmicks. No maturity benefit. Just protection.",
          icon: <Shield className="w-5 h-5" />
        },
        {
          title: "Endowment & Savings Plans",
          description: "Policies that combine life cover with a long-term savings component — suited for clients who want a disciplined, contractual savings mechanism alongside protection.",
          icon: <PiggyBank className="w-5 h-5" />
        },
        {
          title: "ULIPs (Unit Linked Insurance Plans)",
          description: "Market-linked insurance products that allocate a portion of your premium toward investments. We help you evaluate whether a ULIP genuinely suits your goals — or whether separate term cover and mutual fund investments serve you better.",
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          title: "Retirement / Pension Plans",
          description: "Insurance-backed pension products that build a corpus over time and provide a steady income stream post-retirement. A structured complement to your broader retirement planning.",
          icon: <Presentation className="w-5 h-5" />
        },
        {
          title: "Child Plans",
          description: "Long-term plans designed to ensure your child's education and life milestones are funded — even in your absence.",
          icon: <Baby className="w-5 h-5" />
        },
        {
          title: "Coverage Review",
          description: "Already have policies? We review your existing coverage for adequacy, duplication, and whether premiums are delivering the protection your family actually needs.",
          icon: <CheckSquare className="w-5 h-5" />
        }
      ]}
      
      promiseHeading="How Solitaire Helps You"
      promiseHighlight={{
        eyebrow: "DIRECT PERSONAL ACCESS",
        title: "Every client at Solitaire works directly with our expert team — not a call centre, not a ticketing system, not a junior executive.",
        description: "When you reach out, the person who knows your complete financial picture will get back to you. Always."
      }}
      promiseList={[
        {
          title: "No policy push",
          description: "We understand your income, liabilities, and dependants before suggesting any product. Cover is sized to your actual need — not to a premium target."
        },
        {
          title: "Protection first",
          description: "We separate insurance from investment clearly. If a pure term plan serves you better than a bundled product, we will tell you so — plainly."
        }
      ]}
      
      audienceHeading="Who Is This For?"
      audienceList={[
        {
          title: "Young Earners",
          description: "Those who have recently started earning and have dependants relying on their income — where the cost of being uninsured is highest."
        },
        {
          title: "Families with Liabilities",
          description: "Individuals carrying a home loan, business loan, or other significant debt — where insurance ensures those obligations do not become a burden on the family."
        },
        {
          title: "Business Owners",
          description: "Entrepreneurs whose personal and business finances are intertwined — where key-person insurance and personal cover both require attention."
        },
        {
          title: "Existing Policyholders",
          description: "Anyone who has accumulated policies over the years and wants an honest review of whether current coverage is adequate, redundant, or mis-structured."
        }
      ]}
      
      ctaText="Book a Free Discovery Call"
      openModal={openModal}
    />
  );
}
