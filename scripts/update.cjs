const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Update imports
content = content.replace(/import \{ subscribeToBookings, updateBookingStatus, adminLogin, adminLogout, onAuthChange, fetchBlogs, addBlog, updateBlog, deleteBlog \} from '\.\.\/firebase';/,
`import { subscribeToBookings, confirmBooking, completeBooking, markNoShow, cancelBooking, rescheduleBooking, adminLogin, adminLogout, onAuthChange, fetchBlogs, addBlog, updateBlog, deleteBlog } from '../firebase';`);

// 2. Add Booking Tabs state
content = content.replace(/const \[activeTab, setActiveTab\] = useState\<'bookings' | 'blogs'\>\('bookings'\);/,
`const [activeTab, setActiveTab] = useState<'bookings' | 'blogs'>('bookings');\n  const [bookingTab, setBookingTab] = useState<'active' | 'history'>('active');\n  const [proposingFor, setProposingFor] = useState<string | null>(null);\n  const [newSlotDate, setNewSlotDate] = useState('');\n  const [newSlotTime, setNewSlotTime] = useState('');`);

// 3. Update accept handler and add new handlers + whatsapp
content = content.replace(/  const handleAccept = async \(bookingId: string\) \=\> \{[\s\S]*?  \};\n/m,
`  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return \`91\${digits}\`;
    return digits;
  };

  const openWhatsapp = (booking: any, messageType: string) => {
    const phone = normalizePhone(booking.phone);
    const dateStr = booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
    const timeStr = booking.preferred_time || booking.time;
    const name = booking.name;
    let message = '';

    if (messageType === 'accept') {
      message = \`Hi \${name}, your consultation with Vishal Dalal at Solitaire Financial Solutions is confirmed for \${dateStr} at \${timeStr}. We look forward to speaking with you.\`;
    } else if (messageType === 'propose') {
      const newDateStr = newSlotDate ? new Date(newSlotDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');
      message = \`Hi \${name}, thank you for reaching out to Solitaire Financial Solutions. We'd like to suggest an alternate slot for your consultation: \${newDateStr} at \${newSlotTime}. Please confirm if this works for you, or call us to discuss a suitable time.\`;
    } else if (messageType === 'cancel') {
      message = \`Hi \${name}, we regret to inform you that your consultation scheduled for \${dateStr} at \${timeStr} has been cancelled. Please reach out to reschedule at your convenience.\`;
    } else {
      message = \`Hi \${name}, this is Vishal Dalal from Solitaire Financial Solutions. I'm reaching out regarding your consultation request. Please let me know a convenient time to connect.\`;
    }

    // Need to do this properly
    window.open(\`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`, '_blank');
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
      showNotification(\`Automated confirmation sent for \${booking.name}.\`);
    } else {
      showNotification(\`Failed to update status: \${result.error}\`);
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    await completeBooking(bookingId);
    showNotification('Booking marked as completed.');
  };

  const handleMarkNoShow = async (bookingId: string) => {
    await markNoShow(bookingId);
    showNotification('Booking marked as no-show.');
  };

  const handleCancel = async (bookingId: string) => {
    await cancelBooking(bookingId);
    showNotification('Booking cancelled.');
  };

  const handleSendProposal = async (bookingId: string) => {
    if (!newSlotDate || !newSlotTime) {
      showNotification('Please select a new date and time.');
      return;
    }
    const result = await rescheduleBooking(bookingId, newSlotDate, newSlotTime);
    if (result.success) {
      showNotification('New slot proposed successfully.');
      setProposingFor(null);
      setNewSlotDate('');
      setNewSlotTime('');
    } else {
      showNotification(\`Failed to propose slot: \${result.error}\`);
    }
  };
`);

// 4. Update Header counters
content = content.replace(/  const pendingCount = bookings\.filter\(b => b\.status === 'new' \|\| b\.status === 'Pending'\)\.length;\n  const acceptedCount = bookings\.filter\(b => b\.status === 'Accepted' \|\| b\.status === 'confirmed'\)\.length;/,
`  const pendingCount = bookings.filter(b => b.status === 'new' || b.status === 'Pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'Accepted' || b.status === 'confirmed').length;
  
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const confirmedThisWeekCount = bookings.filter(b => (b.status === 'Accepted' || b.status === 'confirmed') && (b.updated_at?.toMillis ? b.updated_at.toMillis() > oneWeekAgo : true)).length;
  const completedTotalCount = bookings.filter(b => b.status === 'completed').length;`);

content = content.replace(/            <div className="flex gap-4">\n              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-\[120px\]">\n                <span className="text-2xl font-bold text-brand-blue">\{pendingCount\}<\/span>\n                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending<\/span>\n              <\/div>\n              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-\[120px\]">\n                <span className="text-2xl font-bold text-green-600">\{acceptedCount\}<\/span>\n                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Accepted<\/span>\n              <\/div>\n            <\/div>/,
`            <div className="flex gap-4 overflow-x-auto pb-2">
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
            </div>`);

// 5. Active/History filter and tabs
content = content.replace(/\{activeTab === 'bookings' && \(\n          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">\n          <div className="overflow-x-auto">/m,
`{activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button 
                className={\`flex-1 py-3 font-medium text-sm text-center \${bookingTab === 'active' ? 'bg-gray-50 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}\`}
                onClick={() => setBookingTab('active')}
              >
                Active
              </button>
              <button 
                className={\`flex-1 py-3 font-medium text-sm text-center \${bookingTab === 'history' ? 'bg-gray-50 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}\`}
                onClick={() => setBookingTab('history')}
              >
                History
              </button>
            </div>
          <div className="overflow-x-auto">`);

// Replace the loop logic to filter bookings based on bookingTab
content = content.replace(/\{bookings\.map\(\(booking\) \=> \{/,
`{bookings
                  .filter(b => bookingTab === 'active' 
                    ? ['new', 'Pending', 'confirmed', 'Accepted', 'rescheduled'].includes(b.status)
                    : ['completed', 'no-show', 'cancelled'].includes(b.status)
                  )
                  .sort((a, b) => {
                    if (bookingTab === 'active') {
                      return new Date(a.date || a.preferred_date || 0).getTime() - new Date(b.date || b.preferred_date || 0).getTime();
                    } else {
                      return (b.updated_at?.toMillis ? b.updated_at.toMillis() : 0) - (a.updated_at?.toMillis ? a.updated_at.toMillis() : 0);
                    }
                  })
                  .map((booking) => {`);

// Update td containing status
content = content.replace(/<td className="px-6 py-4">\n\s*\{booking\.status === 'new' \|\| booking\.status === 'Pending' \? \([\s\S]*?\) : \([\s\S]*?\)\}\n\s*<\/td>/,
`<td className="px-6 py-4">
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
                    </td>`);

// Replace Action column
content = content.replace(/<td className="px-6 py-4 text-right">\n\s*\{booking\.status === 'new' \|\| booking\.status === 'Pending' \? \([\s\S]*?\)\} \n\s*<\/td>/m, 
`<td className="px-6 py-4 text-right">
                      {bookingTab === 'active' && proposingFor !== booking.id && (
                        <div className="flex gap-2 justify-end items-center flex-wrap">
                          {booking.status === 'new' && (
                            <>
                              <button onClick={() => handleAccept(booking.id)} className="bg-brand-blue hover:bg-[#152a45] text-white px-3 py-1.5 rounded text-sm transition-colors">Accept</button>
                              <button onClick={() => setProposingFor(booking.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm transition-colors">Propose New Slot</button>
                            </>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'Accepted') && (
                            <>
                              <button onClick={() => handleMarkComplete(booking.id)} className="bg-brand-gold hover:bg-[#b08d4f] text-white px-3 py-1.5 rounded text-sm transition-colors">Complete</button>
                              <button onClick={() => handleMarkNoShow(booking.id)} className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1.5 rounded text-sm transition-colors">No-Show</button>
                              <button onClick={() => handleCancel(booking.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm transition-colors">Cancel</button>
                            </>
                          )}
                          {booking.status === 'rescheduled' && (
                            <>
                              <button onClick={() => handleAccept(booking.id)} className="bg-brand-blue hover:bg-[#152a45] text-white px-3 py-1.5 rounded text-sm transition-colors">Accept</button>
                              <button onClick={() => handleCancel(booking.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm transition-colors">Cancel</button>
                            </>
                          )}

                          <button onClick={() => handleWhatsapp(booking)} className="text-[#25D366] hover:text-[#128C7E] p-1 ml-1" title="WhatsApp">
                            <Phone className="w-5 h-5 fill-current"/>
                          </button>
                        </div>
                      )}

                      {proposingFor === booking.id && (
                        <div className="flex gap-2 items-center justify-end">
                            <input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
                            <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
                            <button onClick={() => handleSendProposal(booking.id)} className="bg-brand-blue hover:bg-[#152a45] text-white px-3 py-1 rounded text-sm">Send</button>
                            <button onClick={() => setProposingFor(null)} className="text-gray-500 hover:text-gray-700 text-sm px-2">Cancel</button>
                        </div>
                      )}
                      
                      {bookingTab === 'history' && (
                        <div className="flex justify-end pr-2">
                           <button onClick={() => handleWhatsapp(booking)} className="text-[#25D366] hover:text-[#128C7E] p-1" title="WhatsApp Follow-up">
                            <Phone className="w-5 h-5 fill-current"/>
                          </button>
                        </div>
                      )}
                    </td>`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
