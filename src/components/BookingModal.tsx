import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitBooking, getAvailabilitySettings } from '../firebase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getISTDate = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [availability, setAvailability] = useState<any>(null);

  useEffect(() => {
    getAvailabilitySettings()
      .then(result => {
        if (result.success) setAvailability(result.data);
      })
      .catch(error => {
        console.warn("Failed to load availability, using defaults.", error);
        // Fallback to defaults so the UI continues working even if rules aren't deployed
        setAvailability({
          blockedDates: [],
          workingHours: { start: "10:00", end: "18:00" },
          blockedWeekdays: [0]
        });
      });
  }, []);

  const generateTimeSlots = () => {
    if (!availability) {
      const slots = [];
      for (let h = 10; h <= 18; h++) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        slots.push(`${hour}:00 ${ampm}`);
        if (h < 18) slots.push(`${hour}:30 ${ampm}`);
      }
      return slots;
    }

    const slots = [];
    const [startHour, startMin] = availability.workingHours.start.split(':').map(Number);
    const [endHour, endMin] = availability.workingHours.end.split(':').map(Number);

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current < end) {
      const hours = Math.floor(current / 60);
      const mins = current % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      const displayMin = String(mins).padStart(2, '0');
      slots.push(`${displayHour}:${displayMin} ${ampm}`);
      current += 30;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isDateBlocked = (dateString: string) => {
    if (!availability) return false;

    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = date.getDay();

    if (availability.blockedWeekdays.includes(dayOfWeek)) return true;

    const isSpecificallyBlocked = availability.blockedDates.some(
      (d: any) => d.date === dateString
    );
    return isSpecificallyBlocked;
  };

  const getBlockedReason = (dateString: string) => {
    if (!availability) return null;
    const blocked = availability.blockedDates.find((d: any) => d.date === dateString);
    return blocked?.reason || null;
  };

  const [step, setStep] = useState<'form' | 'loading' | 'success' | 'error' | 'confirmClose'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateError, setDateError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: null as Date | null,
    time: '',
    purpose: '',
    quickBook: false
  });

  const istNow = getISTDate();
  const todayString = new Date(istNow.getTime() - (istNow.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const isBefore5PM = istNow.getHours() < 17 && !isDateBlocked(todayString);

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    date: '',
    time: ''
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setForm({ name: '', phone: '', date: null, time: '', purpose: '', quickBook: false });
      setErrors({ name: '', phone: '', date: '', time: '' });
      setShowCalendar(false);
      setShowTimePicker(false);
      const d = new Date();
      d.setDate(1);
      setCurrentMonth(d);
    }
  }, [isOpen]);

  const validateField = (name: string, value: any) => {
    if (name === 'name') return /^[a-zA-Z\s]{2,}$/.test(value) ? '' : 'Please enter your full name';
    if (name === 'phone') return /^\d{10}$/.test(value) ? '' : 'Please enter a valid 10-digit number';
    if (name === 'date') return value ? '' : 'Please select a preferred date';
    if (name === 'time') return value ? '' : 'Please select a preferred time';
    return '';
  };

  const handleBlur = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: validateField(field, form[field as keyof typeof form]) }));
  };

  const handleClose = () => {
    if (step === 'form' && (form.name || form.phone || form.date || form.time || form.purpose)) {
      setStep('confirmClose');
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, form]);

  const handleQuickBook = () => {
    const now = getISTDate();
    let nextHour = now.getHours() + 1;
    let nextMin = now.getMinutes() >= 30 ? 30 : 0;
    
    if (now.getMinutes() >= 30) {
      nextHour += 1;
      nextMin = 0;
    }
    
    if (nextHour < 10) { nextHour = 10; nextMin = 0; }
    if (nextHour > 18 || (nextHour === 18 && nextMin > 0)) {
      nextHour = 18; nextMin = 0;
    }
    
    const ampm = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour > 12 ? nextHour - 12 : (nextHour === 0 ? 12 : nextHour);
    const displayMin = nextMin === 0 ? '00' : '30';
    const timeString = `${displayHour}:${displayMin} ${ampm}`;

    const isQuickBookActive = !form.quickBook;
    
    setForm(prev => ({
      ...prev,
      date: isQuickBookActive ? now : null,
      time: isQuickBookActive ? timeString : '',
      quickBook: isQuickBookActive
    }));

    if (isQuickBookActive) {
      setErrors(prev => ({ ...prev, date: '', time: '' }));
      setShowCalendar(false);
      setShowTimePicker(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: validateField('name', form.name),
      phone: validateField('phone', form.phone),
      date: validateField('date', form.date),
      time: validateField('time', form.time),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(e => e)) {
      const firstError = Object.keys(newErrors).find(k => newErrors[k as keyof typeof newErrors]);
      if (firstError) {
        document.getElementById(`field-${firstError}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setStep('loading');
    
    const payload = {
      name: form.name,
      phone: `+91${form.phone}`,
      preferred_date: form.date ? `${form.date.getFullYear()}-${String(form.date.getMonth() + 1).padStart(2, '0')}-${String(form.date.getDate()).padStart(2, '0')}` : undefined,
      preferred_time: form.time,
      purpose: form.purpose || null,
      quick_book_today: form.quickBook,
      source_page: window.location.pathname,
      source_cta: "Popup"
    };

    const result = await submitBooking(payload);

    if (result.success) {
      setStep('success');
    } else {
      console.error("Booking failed:", result.error);
      if (result.error === 'duplicate') {
        setErrorMsg(result.message);
      } else {
        setErrorMsg('Your details are saved — please try again or reach us directly on WhatsApp.');
      }
      setStep('error');
    }
  };

  // Calendar Logic
  const today = new Date();
  today.setHours(0,0,0,0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} className="p-2"></div>);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const isPast = date < today;
    const isTooFar = date > maxDate;
    const blocked = isDateBlocked(dateString);
    const isDisabled = isPast || isTooFar || blocked;
    const isSelected = form.date && date.toDateString() === form.date.toDateString();
    
    return (
      <button 
        key={i} 
        type="button"
        disabled={isDisabled}
        onClick={() => {
          setForm({ ...form, date, quickBook: false });
          setShowCalendar(false);
          setErrors(prev => ({ ...prev, date: '' }));
          setDateError('');
        }}
        className={`relative p-2 text-center rounded-full w-8 h-8 flex items-center justify-center text-sm mx-auto transition-colors
          ${blocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed line-through decoration-gray-300' :
            isDisabled ? 'text-gray-300 cursor-not-allowed' : 
            isSelected ? 'bg-brand-blue text-white font-medium' : 
            'hover:bg-brand-light text-gray-700'}
        `}
        title={blocked ? getBlockedReason(dateString) || 'Not Available' : ''}
      >
        {i + 1}
      </button>
    );
  });

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  const generateClientCalendarLink = () => {
    let dateStr = '';
    if (form.date) {
      const year = form.date.getFullYear();
      const month = String(form.date.getMonth() + 1).padStart(2, '0');
      const day = String(form.date.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }
    let timeStr = form.time;
    if (!dateStr || !timeStr) return '#';

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

    const endHourNum = hour + 1;
    
    const formattedStartHour = String(hour).padStart(2, '0');
    const formattedStartMin = String(min).padStart(2, '0');
    const formattedEndHour = String(endHourNum).padStart(2, '0');

    const start = `${year}${month}${day}T${formattedStartHour}${formattedStartMin}00`;
    const end = `${year}${month}${day}T${formattedEndHour}${formattedStartMin}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Consultation with Vishal (Solitaire Financial)`,
      dates: `${start}/${end}`,
      details: `Purpose: ${form.purpose || 'Not specified'}\nMy Phone: ${form.phone}`,
      location: 'Phone / Video Call'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const waText = encodeURIComponent(`Hi Vishal, I just booked a consultation for ${form.date?.toLocaleDateString()} at ${form.time}. My name is ${form.name}.`);
  const waLink = `https://wa.me/919909481144?text=${waText}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[480px] bg-white md:rounded-xl shadow-2xl overflow-y-auto flex flex-col"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 z-10 bg-white/80 rounded-full backdrop-blur-sm transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              
              {step === 'form' && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif font-semibold text-brand-blue mb-2">Speak Directly With Our Experts</h2>
                    <p className="text-sm text-gray-600 mb-4">No forms. No waiting rooms. Just a focused conversation about your financial goals.</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-700 bg-brand-light py-2 px-3 rounded-md">
                      <span>🔒 Free</span>
                      <span className="text-gray-400">•</span>
                      <span>No obligation</span>
                      <span className="text-gray-400">•</span>
                      <span>Response within 24 hours</span>
                    </div>
                  </div>

                  {isBefore5PM && (
                    <button 
                      type="button"
                      onClick={handleQuickBook}
                      className={`w-full mb-6 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 ${form.quickBook ? 'border-brand-gold bg-brand-gold/10 text-brand-blue shadow-sm' : 'border-gray-100 hover:border-brand-gold/40 text-gray-600 bg-gray-50/50'}`}
                    >
                      <span className="text-lg">⚡</span>
                      <span className="font-semibold">Book a Call for Today</span>
                    </button>
                  )}

                  <div className="space-y-5 flex-1">
                    <div id="field-name">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rahul Mehta" 
                        className={`w-full border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                        onBlur={() => handleBlur('name')} 
                        disabled={form.quickBook && false} // Just to show it's active
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
                    </div>
                    
                    <div id="field-phone">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">+91</span>
                        <input 
                          type="tel" 
                          placeholder="10-digit mobile number" 
                          className={`w-full border rounded-md pl-11 pr-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          value={form.phone} 
                          onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} 
                          onBlur={() => handleBlur('phone')} 
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div id="field-date" className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                        <button 
                          type="button"
                          onClick={() => { setShowCalendar(!showCalendar); setShowTimePicker(false); }}
                          className={`w-full border rounded-md px-3 py-2.5 text-left flex items-center justify-between outline-none transition-shadow ${errors.date || dateError ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-brand-blue'} ${form.quickBook ? 'bg-brand-gold/5 border-brand-gold/30' : 'bg-white'}`}
                        >
                          <span className={form.date ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {form.date ? form.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                          </span>
                          <CalendarIcon className={`w-4 h-4 ${form.quickBook ? 'text-brand-gold' : 'text-gray-400'}`} />
                        </button>
                        {errors.date && <p className="text-xs text-red-500 mt-1.5">{errors.date}</p>}
                        {dateError && !errors.date && <p className="text-xs text-red-500 mt-1.5">{dateError}</p>}
                        
                        {showCalendar && (
                          <div className="absolute top-full left-0 mt-1 w-full sm:w-[280px] p-4 border border-gray-200 rounded-lg bg-white shadow-xl z-20">
                            <div className="flex justify-between items-center mb-4">
                              <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft className="w-4 h-4"/></button>
                              <span className="text-sm font-semibold text-gray-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                              <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight className="w-4 h-4"/></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-gray-400 font-medium">{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {blanks}
                              {days}
                            </div>
                          </div>
                        )}
                      </div>

                      <div id="field-time" className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                        <button 
                          type="button"
                          onClick={() => { setShowTimePicker(!showTimePicker); setShowCalendar(false); }}
                          className={`w-full border rounded-md px-3 py-2.5 text-left flex items-center justify-between outline-none transition-shadow ${errors.time ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-brand-blue'} ${form.quickBook ? 'bg-brand-gold/5 border-brand-gold/30' : 'bg-white'}`}
                        >
                          <span className={form.time ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {form.time || 'Select Time'}
                          </span>
                          <Clock className={`w-4 h-4 ${form.quickBook ? 'text-brand-gold' : 'text-gray-400'}`} />
                        </button>
                        {errors.time && <p className="text-xs text-red-500 mt-1.5">{errors.time}</p>}

                        {showTimePicker && (
                          <div className="absolute top-full left-0 mt-1 w-full border border-gray-200 rounded-lg bg-white shadow-xl z-20 h-48 overflow-y-auto snap-y snap-mandatory scrollbar-hide">
                            {timeSlots.map(slot => (
                              <div 
                                key={slot} 
                                onClick={() => { 
                                  setForm({...form, time: slot, quickBook: false}); 
                                  setShowTimePicker(false); 
                                  setErrors(prev => ({ ...prev, time: '' })); 
                                }}
                                className={`h-12 snap-center flex items-center justify-center cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0
                                  ${form.time === slot ? 'bg-brand-blue text-white font-medium sticky top-0 bottom-0 z-10' : 'hover:bg-brand-light text-gray-700'}`}
                              >
                                {slot}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">What would you like to discuss? <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <select 
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white text-gray-700"
                        value={form.purpose}
                        onChange={e => setForm({...form, purpose: e.target.value})}
                      >
                        <option value="">Select a topic</option>
                        <option value="Financial Planning">Financial Planning</option>
                        <option value="Mutual Fund Advisory">Mutual Fund Advisory</option>
                        <option value="Wealth Management">Wealth Management</option>
                        <option value="PMS / AIF / SIF">PMS / AIF / SIF</option>
                        <option value="Tax Saving — 54EC Bonds">Tax Saving — 54EC Bonds</option>
                        <option value="Equity / Derivatives / SLBM">Equity / Derivatives / SLBM</option>
                        <option value="Not sure yet">Not sure yet — I'd like guidance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handleSubmit}
                      className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Request My Consultation
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                      🔒 We don't share your details or send unsolicited messages
                    </p>
                  </div>
                </>
              )}

              {step === 'loading' && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-6" />
                  <h3 className="text-xl font-serif text-gray-900 mb-2">Sending your request...</h3>
                  <p className="text-gray-500 text-sm text-center">Please wait while we secure your slot.</p>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-serif text-gray-900 mb-3">You're all set, {form.name.split(' ')[0]}!</h3>
                  <p className="text-gray-600 mb-10 leading-relaxed max-w-sm">
                    Vishal will personally reach out to confirm your call before <strong className="text-gray-900">{form.date?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong> at <strong className="text-gray-900">{form.time}</strong>.
                    <br/><br/>We look forward to the conversation.
                  </p>
                  <div className="w-full space-y-3 mt-auto">
                    <a 
                      href={generateClientCalendarLink()}
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full bg-brand-light hover:bg-[#e6f1f9] text-brand-blue py-3.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2 shadow-sm border border-brand-blue/20"
                    >
                      📅 Add to Google Calendar
                    </a>
                    <button 
                      onClick={onClose} 
                      className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3.5 rounded-md font-medium transition-colors"
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-serif text-gray-900 mb-3">Something went wrong</h3>
                  <p className="text-gray-600 mb-10 leading-relaxed max-w-sm">
                    {errorMsg}
                  </p>
                  <div className="w-full space-y-3 mt-auto">
                    <button 
                      onClick={handleSubmit} 
                      className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      🔁 Try Again
                    </button>
                    <a 
                      href={waLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      📲 WhatsApp Us
                    </a>
                  </div>
                </div>
              )}

              {step === 'confirmClose' && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-16 h-16 bg-brand-light text-brand-gold rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif text-gray-900 mb-3">Leave without booking?</h3>
                  <p className="text-gray-600 mb-10">Your details won't be saved.</p>
                  <div className="flex w-full gap-3 mt-auto">
                    <button 
                      onClick={() => setStep('form')} 
                      className="flex-1 bg-brand-blue hover:bg-[#152a45] text-white py-3.5 rounded-md font-medium transition-colors"
                    >
                      Stay
                    </button>
                    <button 
                      onClick={onClose} 
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 rounded-md font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
