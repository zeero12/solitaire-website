import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, User, Phone, Info, Shield, Bell, FileText, Plus, Trash2, LogOut, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToBookings, updateBookingStatus, adminLogin, adminLogout, onAuthChange } from '../firebase';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'bookings' | 'blogs'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [blogs, setBlogs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, visible: boolean } | null>(null);
  
  // Blog Form State
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Bookings Listener
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }

    const unsubscribe = subscribeToBookings((updatedBookings) => {
      setBookings(prev => {
        if (prev.length > 0) {
          const prevIds = new Set(prev.map(b => b.id));
          const incoming = updatedBookings.filter(b => !prevIds.has(b.id));
          if (incoming.length > 0) {
            setNewIds(new Set(incoming.map(b => b.id)));
            setTimeout(() => setNewIds(new Set()), 3000);
          }
        }
        return updatedBookings;
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Blogs logic (local storage for now as per original)
  useEffect(() => {
    const storedBlogs = localStorage.getItem('solitaire_blogs');
    if (storedBlogs) {
      setBlogs(JSON.parse(storedBlogs));
    }
  }, []);

  const saveBlogs = (updatedBlogs: any[]) => {
    setBlogs(updatedBlogs);
    localStorage.setItem('solitaire_blogs', JSON.stringify(updatedBlogs));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const result = await adminLogin(email, password);
    if (!result.success) {
      setLoginError(result.error || 'Login failed');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await adminLogout();
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) {
      showNotification('Title and Content are required.');
      return;
    }
    
    if (editingBlogId) {
      const updatedBlogs = blogs.map(b => 
        b.id === editingBlogId ? { ...b, ...newBlog } : b
      );
      saveBlogs(updatedBlogs);
      showNotification('Blog post updated successfully.');
    } else {
      const blog = {
        id: Date.now().toString(),
        ...newBlog,
        date: new Date().toISOString().split('T')[0],
        author: 'Admin'
      };
      saveBlogs([blog, ...blogs]);
      showNotification('Blog post published successfully.');
    }
    
    setNewBlog({ title: '', excerpt: '', content: '', imageUrl: '' });
    setEditingBlogId(null);
    setShowBlogForm(false);
  };

  const handleEditBlog = (blog: any) => {
    setNewBlog({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      imageUrl: blog.imageUrl || ''
    });
    setEditingBlogId(blog.id);
    setShowBlogForm(true);
  };

  const handleCancelEdit = () => {
    setNewBlog({ title: '', excerpt: '', content: '', imageUrl: '' });
    setEditingBlogId(null);
    setShowBlogForm(false);
  };

  const handleDeleteBlog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      saveBlogs(blogs.filter(b => b.id !== id));
      showNotification('Blog post deleted.');
    }
  };

  const handleAccept = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const result = await updateBookingStatus(bookingId, 'Accepted');
    if (result.success) {
      showNotification(`Automated confirmation sent to ${booking.name} (${booking.phone}) for ${booking.preferred_date} at ${booking.preferred_time}.`);
    } else {
      showNotification(`Failed to update status: ${result.error}`);
    }
  };

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setNotification(null), 300); // Wait for exit animation
    }, 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div>
            <Shield className="mx-auto h-12 w-12 text-brand-gold" />
            <h2 className="mt-6 text-center text-3xl font-serif text-gray-900">Admin Login</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
                {loginError}
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-[#152a45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors disabled:opacity-70"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const pendingCount = bookings.filter(b => b.status === 'new' || b.status === 'Pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'Accepted' || b.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif text-brand-blue flex items-center gap-3">
              <Shield className="w-8 h-8 text-brand-gold" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage consultation bookings and website content.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-brand-blue">{pendingCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-green-600">{acceptedCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Accepted</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-4 p-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar className="w-4 h-4" /> Bookings
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'blogs' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('blogs')}
          >
            <FileText className="w-4 h-4" /> Blog Management
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Client Details</th>
                  <th className="px-6 py-4 font-medium">Requested Slot</th>
                  <th className="px-6 py-4 font-medium">Purpose</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const isNew = newIds.has(booking.id);
                  return (
                  <tr 
                    key={booking.id} 
                    className={`transition-all duration-1000 ${isNew ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50/50 border-l-4 border-transparent'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col relative">
                        {isNew && (
                          <span className="absolute -top-3 -left-2 bg-green-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">New</span>
                        )}
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" /> {booking.name}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" /> {booking.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-blue" /> {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : booking.date}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-brand-gold" /> {booking.preferred_time || booking.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm bg-gray-100 text-gray-700">
                        <Info className="w-3.5 h-3.5" />
                        {booking.purpose || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'new' || booking.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'new' || booking.status === 'Pending' ? (
                        <button
                          onClick={() => handleAccept(booking.id)}
                          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-[#152a45] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-gray-400 px-4 py-2 text-sm font-medium">
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                )})}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif text-brand-blue">Manage Blogs</h2>
              <button 
                onClick={showBlogForm ? handleCancelEdit : () => setShowBlogForm(true)}
                className="bg-brand-blue hover:bg-[#152a45] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                {showBlogForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New Blog</>}
              </button>
            </div>

            {showBlogForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSaveBlog} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input type="text" required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Blog Title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <textarea value={newBlog.excerpt} onChange={e => setNewBlog({...newBlog, excerpt: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Short summary" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <textarea required value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Full blog content (paragraphs separated by newlines)" rows={6} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input type="url" value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none" placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-brand-gold hover:bg-[#b08d4f] text-white px-6 py-2 rounded-md font-medium transition-colors">
                      {editingBlogId ? 'Update Blog' : 'Publish Blog'}
                    </button>
                    {editingBlogId && (
                      <button type="button" onClick={handleCancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {blogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{blog.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(blog.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEditBlog(blog)} className="text-brand-blue hover:text-[#152a45] p-2 mr-2" title="Edit Blog">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-500 hover:text-red-700 p-2" title="Delete Blog">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No blogs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-gray-900 text-white p-4 rounded-lg shadow-2xl flex items-start gap-3 border border-gray-800"
          >
            <div className="bg-green-500/20 p-2 rounded-full text-green-400 flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Notification Sent</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
