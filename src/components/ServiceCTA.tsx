import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ServiceCTA({ 
  text, 
  title = "Ready to take the next step?",
  subtitle,
  openModal 
}: { 
  text: string, 
  title?: string,
  subtitle?: string,
  openModal: () => void 
}) {
  return (
    <div className="mt-16 bg-brand-light p-8 md:p-12 rounded-lg text-center">
      <h3 className="text-2xl font-serif text-gray-900 mb-2">{title}</h3>
      {subtitle ? (
        <p className="text-gray-600 mb-6">{subtitle}</p>
      ) : (
        <div className="mb-6"></div>
      )}
      <button onClick={openModal} className="bg-brand-blue hover:bg-[#152a45] text-white px-8 py-3.5 rounded font-medium transition-colors inline-flex items-center gap-2 shadow-md hover:shadow-lg">
        {text} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}