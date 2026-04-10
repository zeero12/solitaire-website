import React from 'react';

export default function ServiceHero({ title, subtitle, subtitleClassName }: { title: string, subtitle: string, subtitleClassName?: string }) {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-brand-blue overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">{title}</h1>
        <p className={`text-xl font-serif italic max-w-3xl mx-auto ${subtitleClassName || 'text-brand-gold'}`}>{subtitle}</p>
      </div>
    </div>
  );
}