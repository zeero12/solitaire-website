import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User } from 'lucide-react';
import ServiceHero from '../components/ServiceHero';
import { fetchBlogs } from '../firebase';

export default function Blog() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

  useEffect(() => {
    fetchBlogs().then(fetchedBlogs => {
      setBlogs(fetchedBlogs);
    });
  }, []);

  if (selectedBlog) {
    return (
      <div className="bg-white min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => setSelectedBlog(null)}
            className="text-brand-blue hover:text-brand-gold font-medium flex items-center gap-2 mb-8 transition-colors"
          >
            ← Back to all articles
          </button>
          
          <img 
            src={selectedBlog.imageUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop'} 
            alt={selectedBlog.title} 
            className="w-full h-[400px] object-cover rounded-xl mb-8 shadow-sm"
          />
          
          <h1 className="text-4xl md:text-5xl font-serif text-brand-blue mb-6 leading-tight">{selectedBlog.title}</h1>
          
          <div className="flex items-center gap-6 text-gray-500 text-sm mb-10 border-b border-gray-100 pb-6">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(selectedBlog.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-2"><User className="w-4 h-4" /> {selectedBlog.author}</span>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {selectedBlog.content.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ServiceHero 
        title="Insights & Resources" 
        subtitle="Expert perspectives on wealth management, market trends, and financial planning to help you make informed decisions." 
        subtitleClassName="text-white"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group cursor-pointer" onClick={() => setSelectedBlog(blog)}>
              <div className="h-48 overflow-hidden">
                <img 
                  src={blog.imageUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop'} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-blue mb-3 group-hover:text-brand-gold transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{blog.excerpt}</p>
                <div className="flex items-center text-brand-blue font-medium text-sm group-hover:text-brand-gold transition-colors mt-auto">
                  Read Article <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
          
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No articles published yet. Check back soon!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
