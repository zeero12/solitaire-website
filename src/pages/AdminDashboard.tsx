import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, CalendarDays, User, Phone, Info, Shield, Bell, FileText, Plus, Trash2, LogOut, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToBookings, confirmBooking, completeBooking, markNoShow, cancelBooking, rescheduleBooking, adminLogin, adminLogout, onAuthChange, fetchBlogs, addBlog, updateBlog, deleteBlog, getAvailabilitySettings, saveAvailabilitySettings, addBlockedDate, removeBlockedDate } from '../firebase';

const DEFAULT_AVAILABILITY = {
  blockedDates: [],
  workingHours: { start: "10:00", end: "18:00" },
  blockedWeekdays: [0]
};

const getBookingTimestamp = (booking: any) => {
  const dateStr = booking.date || booking.preferred_date || '';
  if (!dateStr) return 8640000000000000; // Max date timestamp
  const timeStr = booking.time || booking.preferred_time || '';
  
  let hrs = 0, mins = 0;
  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
    if (match) {
      hrs = parseInt(match[1], 10);
      mins = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();
      if (ampm === 'PM' && hrs < 12) hrs += 12;
      else if (ampm === 'AM' && hrs === 12) hrs = 0;
    }
  }
  
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, hrs, mins).getTime();
    }
  } catch (e) {
    // Fallback to native parser
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Fallback if Date parser fails: try to extract numbers
    const match = dateStr.match(/(\d+)/);
    if (match) return parseInt(match[1], 10) * 86400000 + hrs * 3600000 + mins * 60000;
    return 8640000000000000;
  }
  d.setHours(hrs, mins, 0, 0);
  return d.getTime();
};

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'bookings' | 'blogs' | 'availability'>('bookings');
  const [bookingTab, setBookingTab] = useState<'new' | 'confirmed' | 'history'>('new');
  const [confirmedSortMode, setConfirmedSortMode] = useState<'earliest' | 'recent'>('earliest');
  const [proposingFor, setProposingFor] = useState<string | null>(null);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [blogs, setBlogs] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, visible: boolean, type: 'success' | 'info' | 'warning' | 'error' | 'neutral', title: string } | null>(null);
  
  // Blog Form State
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [newBlog, setNewBlog] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });

  // Availability State
  const [availabilitySettings, setAvailabilitySettings] = useState(DEFAULT_AVAILABILITY);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [workingHours, setWorkingHours] = useState({ start: '10:00', end: '18:00' });
  const [blockedWeekdays, setBlockedWeekdays] = useState<number[]>([0]);

  const handleAddBlockedDate = async () => {
    if (!newBlockDate) {
      showNotification('Please select a date to block.', 'warning', 'Missing Date');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (newBlockDate < today) {
      showNotification('Past dates cannot be blocked.', 'error', 'Invalid Date');
      return;
    }
    
    const result = await addBlockedDate(newBlockDate, newBlockReason);
    if (result.success) {
      showNotification('Date has been blocked successfully.', 'success', 'Date Blocked');
      setNewBlockDate('');
      setNewBlockReason('');
      
      const refresh = await getAvailabilitySettings();
      if (refresh.success) {
        setAvailabilitySettings(refresh.data);
      }
    } else {
      showNotification(`Failed to block date: ${result.error}`, 'error', 'Action Failed');
    }
  };

  const handleRemoveBlockedDate = async (date: string) => {
    const result = await removeBlockedDate(date);
    if (result.success) {
      showNotification('Blocked date removed.', 'neutral', 'Date Unblocked');
      const refresh = await getAvailabilitySettings();
      if (refresh.success) setAvailabilitySettings(refresh.data);
    } else {
      showNotification(`Failed to remove date: ${result.error}`, 'error', 'Action Failed');
    }
  };

  const handleSaveWorkingHours = async () => {
    if (workingHours.start >= workingHours.end) {
      showNotification('Start time must be before end time.', 'error', 'Invalid Time Window');
      return;
    }
    const newSettings = { ...availabilitySettings, workingHours };
    const result = await saveAvailabilitySettings(newSettings);
    if (result.success) {
      setAvailabilitySettings(newSettings);
      showNotification('Working hours updated.', 'success', 'Settings Saved');
    } else {
      showNotification(`Failed to save working hours: ${result.error}`, 'error', 'Save Failed');
    }
  };

  const handleToggleWeekday = (dayIdx: number) => {
    setBlockedWeekdays(prev => {
      let next;
      if (prev.includes(dayIdx)) {
        next = prev.filter(d => d !== dayIdx);
      } else {
        next = [...prev, dayIdx];
      }
      return next;
    });
  };

  const handleSaveWeekdays = async () => {
    // 0=Sun, 1=Mon, ..., 6=Sat. 7 days total.
    if (blockedWeekdays.length === 7) {
      showNotification('At least one working day must remain.', 'error', 'Cannot Block All Days');
      return;
    }
    const newSettings = { ...availabilitySettings, blockedWeekdays };
    const result = await saveAvailabilitySettings(newSettings);
    if (result.success) {
      setAvailabilitySettings(newSettings);
      showNotification('Weekly off days updated.', 'success', 'Settings Saved');
    } else {
      showNotification(`Failed to save off days: ${result.error}`, 'error', 'Save Failed');
    }
  };

  const generateCalendarLink = (booking: any) => {
    const dateStr = booking.preferred_date || booking.date || '';
    const timeStr = booking.preferred_time || booking.time || '10:00 AM';

    // Build start datetime string in format: YYYYMMDDTHHmmss
    const [year, month, day] = dateStr.split('-');
    
    // Parse 12hr time format, e.g., "02:30 PM" or "10:00 AM"
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let hour = 10;
    let min = 0;
    if (timeParts) {
      hour = parseInt(timeParts[1], 10);
      min = parseInt(timeParts[2], 10);
      const ampm = timeParts[3]?.toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }

    // End time = start + 1 hour
    let endHour = hour + 1;
    
    const formattedStartHour = String(hour).padStart(2, '0');
    const formattedStartMin = String(min).padStart(2, '0');
    const formattedEndHour = String(endHour).padStart(2, '0');

    const start = `${year}${month}${day}T${formattedStartHour}${formattedStartMin}00`;
    const end = `${year}${month}${day}T${formattedEndHour}${formattedStartMin}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Consultation — ${booking.name}`,
      dates: `${start}/${end}`,
      details: `Purpose: ${booking.purpose || 'Not specified'}\nPhone: ${booking.phone}`,
      location: 'Phone / Video Call'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Content Loaders
  useEffect(() => {
    if (user) {
      getAvailabilitySettings()
        .then(result => {
          if (result.success) {
            setAvailabilitySettings(result.data);
            setWorkingHours(result.data.workingHours);
            setBlockedWeekdays(result.data.blockedWeekdays);
          }
          setAvailabilityLoading(false);
        })
        .catch(err => {
          console.warn('Failed to fetch availability. Using defaults.', err);
          setAvailabilityLoading(false);
        });
      fetchBlogs().then(fetchedBlogs => {
        setBlogs(fetchedBlogs);
      });
    } else {
      setBlogs([]);
      setAvailabilityLoading(true);
    }
  }, [user]);

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

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) {
      showNotification('Title and Content are required.', 'error', 'Validation Error');
      return;
    }
    
    if (editingBlogId) {
      const result = await updateBlog(editingBlogId, newBlog);
      if (result.success) {
        setBlogs(blogs.map(b => 
          b.id === editingBlogId ? { ...b, ...newBlog } : b
        ));
        showNotification('Your modifications have been saved.', 'success', 'Blog Updated');
      } else {
        showNotification(`Error: ${result.error}`, 'error', 'Update Failed');
      }
    } else {
      const blogData = {
        ...newBlog,
        date: new Date().toISOString().split('T')[0],
        author: 'Admin'
      };
      const result = await addBlog(blogData);
      if (result.success) {
        setBlogs([{ id: result.id, ...blogData }, ...blogs]);
        showNotification('The blog post is now live.', 'success', 'Blog Published');
      } else {
        showNotification(`Error: ${result.error}`, 'error', 'Publish Failed');
      }
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

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const result = await deleteBlog(id);
      if (result.success) {
        setBlogs(blogs.filter(b => b.id !== id));
        showNotification('The blog post was removed from the system.', 'neutral', 'Blog Deleted');
      } else {
        showNotification(`Error: ${result.error}`, 'error', 'Delete Failed');
      }
    }
  };

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const openWhatsapp = (booking: any, messageType: string) => {
    const phone = normalizePhone(booking.phone);
    const dateStr = booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
    const timeStr = booking.preferred_time || booking.time;
    const name = booking.name;
    let message = '';

    if (messageType === 'accept') {
      message = `Hi ${name}, your consultation with Vishal Dalal at Solitaire Financial Solutions is confirmed for ${dateStr} at ${timeStr}. We look forward to speaking with you.`;
    } else if (messageType === 'propose') {
      const newDateStr = newSlotDate ? new Date(newSlotDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');
      message = `Hi ${name}, thank you for reaching out to Solitaire Financial Solutions. We'd like to suggest an alternate slot for your consultation: ${newDateStr} at ${newSlotTime}. Please confirm if this works for you, or call us to discuss a suitable time.`;
    } else if (messageType === 'cancel') {
      message = `Hi ${name}, we regret to inform you that your consultation scheduled for ${dateStr} at ${timeStr} has been cancelled. Please reach out to reschedule at your convenience.`;
    } else {
      message = `Hi ${name}, this is Vishal Dalal from Solitaire Financial Solutions. I'm reaching out regarding your consultation request. Please let me know a convenient time to connect.`;
    }

    // Need to do this properly
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsapp = (booking: any) => {
    if (booking.status === 'confirmed') openWhatsapp(booking, 'accept');
    else if (booking.status === 'rescheduled') openWhatsapp(booking, 'propose');
    else openWhatsapp(booking, 'followup');
  };

  const handleAccept = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const result = await confirmBooking(bookingId);
    if (result.success) {
      openWhatsapp(booking, 'accept');
      showNotification(`Booking confirmed. WhatsApp message opened for ${booking.name}.`, 'success', 'Booking Confirmed');
    } else {
      showNotification(`Failed to update status: ${result.error}`, 'error', 'Action Failed');
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    await completeBooking(bookingId);
    showNotification('The consultation has been marked as complete.', 'neutral', 'Booking Completed');
  };

  const handleMarkNoShow = async (bookingId: string) => {
    await markNoShow(bookingId);
    showNotification('The client failed to attend the consultation.', 'warning', 'Booking No-Show');
  };

  const handleCancel = async (bookingId: string) => {
    await cancelBooking(bookingId);
    showNotification('The booking has been successfully cancelled.', 'warning', 'Booking Cancelled');
  };

  const handleSendProposal = async (bookingId: string) => {
    if (!newSlotDate || !newSlotTime) {
      showNotification('Please select a new date and time.', 'warning', 'Validation Error');
      return;
    }
    const result = await rescheduleBooking(bookingId, newSlotDate, newSlotTime);
    if (result.success) {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) openWhatsapp(booking, 'propose');
      
      showNotification(`New slot proposed. WhatsApp message opened for ${booking.name}.`, 'info', 'Booking Rescheduled');
      setProposingFor(null);
      setNewSlotDate('');
      setNewSlotTime('');
    } else {
      showNotification(`Failed to propose slot: ${result.error}`, 'error', 'Action Failed');
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' | 'neutral' = 'success', title?: string) => {
    let defaultTitle = 'Notification';
    if (!title) {
        switch(type) {
             case 'success': defaultTitle = 'Success'; break;
             case 'info': defaultTitle = 'Information'; break;
             case 'warning': defaultTitle = 'Warning'; break;
             case 'error': defaultTitle = 'Error'; break;
             case 'neutral': defaultTitle = 'Update'; break;
        }
    }

    setNotification({ message, visible: true, type, title: title || defaultTitle });
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
  const acceptedCount = bookings.filter(b => ['confirmed', 'Accepted', 'rescheduled'].includes(b.status)).length;
  
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const confirmedThisWeekCount = bookings.filter(b => ['confirmed', 'Accepted', 'rescheduled'].includes(b.status) && (b.updated_at?.toMillis ? b.updated_at.toMillis() > oneWeekAgo : true)).length;
  const completedTotalCount = bookings.filter(b => b.status === 'completed').length;

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
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-brand-blue">{pendingCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-green-600">{acceptedCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Accepted</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-brand-gold">{confirmedThisWeekCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium text-center">Confirmed<br/>This Week</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
                <span className="text-2xl font-bold text-gray-800">{completedTotalCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium text-center">Completed<br/>Total</span>
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
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            className={`whitespace-nowrap px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar className="w-4 h-4" /> Bookings
          </button>
          <button 
            className={`whitespace-nowrap px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'blogs' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('blogs')}
          >
            <FileText className="w-4 h-4" /> Blog Management
          </button>
          <button 
            className={`whitespace-nowrap px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'availability' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('availability')}
          >
            <CalendarDays className="w-4 h-4" /> Availability
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button 
                className={`flex-1 py-3 font-medium text-sm text-center ${bookingTab === 'new' ? 'bg-gray-50 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setBookingTab('new')}
              >
                New Requests
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-sm text-center ${bookingTab === 'confirmed' ? 'bg-gray-50 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setBookingTab('confirmed')}
              >
                Confirmed
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-sm text-center ${bookingTab === 'history' ? 'bg-gray-50 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setBookingTab('history')}
              >
                History
              </button>
            </div>
            {bookingTab === 'confirmed' && (
              <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-medium text-gray-500">Sort by:</span>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <button 
                    onClick={() => setConfirmedSortMode('earliest')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${confirmedSortMode === 'earliest' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Earliest Scheduled Meeting
                  </button>
                  <button 
                    onClick={() => setConfirmedSortMode('recent')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${confirmedSortMode === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Recently Approved
                  </button>
                </div>
              </div>
            )}
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
                {bookings
                  .filter(b => {
                    if (bookingTab === 'new') return ['new', 'Pending'].includes(b.status);
                    if (bookingTab === 'confirmed') return ['confirmed', 'Accepted', 'rescheduled'].includes(b.status);
                    return ['completed', 'no-show', 'cancelled'].includes(b.status);
                  })
                  .sort((a, b) => {
                    if (bookingTab === 'new') {
                      const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : new Date(a.date || a.preferred_date || 0).getTime();
                      const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : new Date(b.date || b.preferred_date || 0).getTime();
                      return timeB - timeA;
                    } else if (bookingTab === 'confirmed') {
                      if (confirmedSortMode === 'earliest') {
                        return getBookingTimestamp(a) - getBookingTimestamp(b);
                      } else {
                        const getUpdateMs = (obj: any) => {
                          if (!obj.updated_at) return 0;
                          if (obj.updated_at.toMillis) return obj.updated_at.toMillis();
                          if (typeof obj.updated_at === 'number') return obj.updated_at;
                          return new Date(obj.updated_at).getTime() || 0;
                        };
                        return getUpdateMs(b) - getUpdateMs(a);
                      }
                    } else {
                      const getUpdateMs = (obj: any) => {
                        if (!obj.updated_at) return 0;
                        if (obj.updated_at.toMillis) return obj.updated_at.toMillis();
                        if (typeof obj.updated_at === 'number') return obj.updated_at;
                        return new Date(obj.updated_at).getTime() || 0;
                      };
                      return getUpdateMs(b) - getUpdateMs(a);
                    }
                  })
                  .map((booking) => {
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
                      ) : (booking.status === 'Accepted' || booking.status === 'confirmed') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      ) : booking.status === 'rescheduled' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Calendar className="w-3.5 h-3.5" /> Rescheduled
                        </span>
                      ) : booking.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : booking.status === 'no-show' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <User className="w-3.5 h-3.5" /> No-Show
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Cancel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">

                        {/* STATUS: new or Pending */}
                        {(booking.status === 'new' || booking.status === 'Pending') && (
                          <>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAccept(booking.id)}
                                className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-[#152a45] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => setProposingFor(proposingFor === booking.id ? null : booking.id)}
                                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Propose Slot
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>

                            {/* Inline propose new slot form */}
                            {proposingFor === booking.id && (
                              <div className="flex items-center gap-2 mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <input
                                  type="date"
                                  value={newSlotDate}
                                  onChange={e => setNewSlotDate(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
                                />
                                <input
                                  type="time"
                                  value={newSlotTime}
                                  onChange={e => setNewSlotTime(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
                                />
                                <button
                                  onClick={() => handleSendProposal(booking.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setProposingFor(null)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* STATUS: confirmed or Accepted */}
                        {(booking.status === 'confirmed' || booking.status === 'Accepted') && (
                          <>
                            <div className="flex flex-wrap justify-end items-center gap-2">
                              <button
                                onClick={() => handleMarkComplete(booking.id)}
                                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                              </button>
                              <button
                                onClick={() => handleMarkNoShow(booking.id)}
                                className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                <User className="w-3.5 h-3.5" /> No-Show
                              </button>
                              <button
                                onClick={() => setProposingFor(proposingFor === booking.id ? null : booking.id)}
                                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Reschedule
                              </button>
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                              <a
                                href={generateCalendarLink(booking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                title="Add to Google Calendar"
                              >
                                <CalendarDays className="w-3.5 h-3.5" /> Calendar
                              </a>
                            </div>

                            {/* Inline propose new slot form for confirmed */}
                            {proposingFor === booking.id && (
                              <div className="flex justify-end items-center gap-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <input
                                  type="date"
                                  value={newSlotDate}
                                  onChange={e => setNewSlotDate(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
                                />
                                <input
                                  type="time"
                                  value={newSlotTime}
                                  onChange={e => setNewSlotTime(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
                                />
                                <button
                                  onClick={() => handleSendProposal(booking.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setProposingFor(null)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* STATUS: rescheduled */}
                        {booking.status === 'rescheduled' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAccept(booking.id)}
                              className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-[#152a45] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                            </button>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* STATUS: completed, no-show, cancelled — read only */}
                        {['completed', 'no-show', 'cancelled'].includes(booking.status) && (
                          <span className="text-xs text-gray-400 italic">No actions</span>
                        )}

                      </div>
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

        {activeTab === 'availability' && (
          <div className="space-y-8">
            {availabilityLoading ? (
              <div className="text-center py-12 text-gray-500">Loading availability settings...</div>
            ) : (
              <>
                {/* Section 1 - Blocked Dates */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-serif text-brand-blue mb-1">Blocked Dates</h3>
                  <p className="text-sm text-gray-500 mb-6">Mark specific dates as unavailable — holidays, travel, or personal leave.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={newBlockDate}
                      onChange={e => setNewBlockDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none flex-1 max-w-[200px]"
                    />
                    <input 
                      type="text" 
                      placeholder="e.g. Diwali, Travelling"
                      value={newBlockReason}
                      onChange={e => setNewBlockReason(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none flex-1"
                    />
                    <button 
                      onClick={handleAddBlockedDate}
                      className="bg-brand-blue hover:bg-[#152a45] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Block Date
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[...(availabilitySettings?.blockedDates || [])]
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((block) => {
                            const dateObj = new Date(block.date);
                            const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                            return (
                              <tr key={block.date} className={isPast ? 'bg-gray-50/50 opacity-60' : ''}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {dateObj.toLocaleDateString('en-GB', { weekday: 'long' })}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{block.reason || '-'}</td>
                                <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={() => handleRemoveBlockedDate(block.date)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                        })}
                        {(!availabilitySettings?.blockedDates || availabilitySettings.blockedDates.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                              No dates blocked. Add dates above to mark them as unavailable.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2 - Working Hours */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-serif text-brand-blue mb-1">Working Hours</h3>
                  <p className="text-sm text-gray-500 mb-6">Set the daily time window during which consultations can be booked.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-sm font-medium text-gray-700">From</label>
                      <input 
                        type="time" 
                        step="1800"
                        value={workingHours.start}
                        onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-sm font-medium text-gray-700">To</label>
                      <input 
                        type="time" 
                        step="1800"
                        value={workingHours.end}
                        onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleSaveWorkingHours}
                      className="bg-brand-gold hover:bg-[#b08d4f] text-white px-6 py-2 rounded-md font-medium transition-colors w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Save Working Hours
                    </button>
                  </div>
                </div>

                {/* Section 3 - Weekly Off Days */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-serif text-brand-blue mb-1">Weekly Off Days</h3>
                  <p className="text-sm text-gray-500 mb-6">Select days of the week when no bookings should be accepted.</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <button
                        key={day}
                        onClick={() => handleToggleWeekday(idx)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                          blockedWeekdays.includes(idx)
                            ? 'bg-brand-blue text-white shadow-sm'
                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleSaveWeekdays}
                    className="bg-brand-gold hover:bg-[#b08d4f] text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Save Off Days
                  </button>
                </div>
              </>
            )}
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
            <div className={`p-2 rounded-full flex-shrink-0 ${
              notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
              notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
              notification.type === 'warning' ? 'bg-orange-500/20 text-orange-400' :
              notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               notification.type === 'info' ? <Info className="w-5 h-5" /> :
               notification.type === 'error' ? <Shield className="w-5 h-5" /> :
               <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
