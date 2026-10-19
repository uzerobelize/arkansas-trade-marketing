import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Calendar,
} from "lucide-react";

export interface BookingData {
  contractorName: string;
  companyName: string;
  tradeFocus: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  timezone: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
  onBookingComplete?: (bookingData: BookingData) => void;
}

// Pre-populates realistic "Booked" slots so the calendar isn't empty
const MOCK_BOOKED_SLOTS = new Set([
  "2026-10-20-09:00",
  "2026-10-20-11:00",
  "2026-10-20-14:00",
  "2026-10-21-10:00",
  "2026-10-21-13:30",
  "2026-10-22-09:30",
  "2026-10-22-15:00",
  "2026-10-23-10:30",
  "2026-10-26-08:30",
  "2026-10-26-14:30",
]);

const TIME_SLOTS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
  onBookingComplete,
}) => {
  // Booking Flow State (1: Intake, 2: Calendar, 3: Confirmation)
  const [bookingStep, setBookingStep] = useState<number>(initialStep);

  // Intake Form State
  const [formData, setFormData] = useState({
    contractorName: "",
    companyName: "",
    tradeFocus: "Siding & Trim",
    phone: "",
    email: "",
  });

  // Calendar State
  const [selectedDate, setSelectedDate] = useState("2026-10-21");
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [selectedTimezone, setSelectedTimezone] = useState("CST");
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week">(
    "month",
  );
  const [viewDate, setViewDate] = useState(new Date(2026, 9, 1)); // Default to Oct 2026
  const [bookedSlots] = useState<Set<string>>(MOCK_BOOKED_SLOTS);

  // Reset or sync step when modal opens
  useEffect(() => {
    if (isOpen) {
      setBookingStep(initialStep);
    }
  }, [isOpen, initialStep]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Date String Formatting Helper YYYY-MM-DD
  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    const today = new Date(2026, 9, 20); // Baseline date matching original application
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate("2026-10-20");
  };

  // Month View Grid Calculation
  const monthCalendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];
    const todayStr = "2026-10-18";

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = formatDateStr(prevY, prevM, dayNum);
      grid.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isPast: true,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateStr(year, month, d);
      const dayOfWeek = new Date(year, month, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      grid.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isWeekend,
        isPast: dateStr < todayStr,
      });
    }

    // Next month padding to fill grid
    const totalCells = grid.length > 35 ? 42 : 35;
    const remainingCells = totalCells - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = formatDateStr(nextY, nextM, i);
      grid.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
        isPast: false,
      });
    }

    return grid;
  }, [viewDate]);

  // Week View Days Calculation
  const weekViewDays = useMemo(() => {
    const baseDate = selectedDate
      ? new Date(selectedDate + "T00:00:00")
      : new Date(2026, 9, 20);
    const dayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

    const days = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName,
        monthName: monthNames[d.getMonth()],
        isPast: dateStr < "2026-10-18",
      });
    }
    return days;
  }, [selectedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002D3C]/70 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-white border-2 border-[#0093B3]/30 rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden my-8 text-[#002D3C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#0093B3]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#002D3C] flex items-center justify-center text-[#F9C846] font-extrabold text-sm shadow-md">
              SDI
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#002D3C]">
                Little Rock Strategy Call Reservation
              </h3>
              <p className="text-[10px] text-[#0093B3] font-mono font-bold uppercase tracking-wider">
                Step {bookingStep} of 3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#002D3C]/60 hover:text-[#002D3C] rounded-lg hover:bg-[#0093B3]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Flow Steps */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: CONTACT & BUSINESS INTAKE FORM */}
          {bookingStep === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBookingStep(2);
              }}
              className="space-y-5"
            >
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-xl font-black text-[#002D3C]">
                  Contractor Qualification Intake
                </h3>
                <p className="text-xs text-[#002D3C]/70 mt-1 font-medium">
                  Enter your business info to verify territory availability in
                  Pulaski County.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Contractor / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mark Tidd"
                    value={formData.contractorName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractorName: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tidd Siding & Remodeling"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Cell Phone (For SMS Webhook Test) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(501) 555-0199"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002D3C] mb-1">
                    Direct Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@tiddsiding.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002D3C] mb-1">
                  Primary Trade Focus
                </label>
                <select
                  value={formData.tradeFocus}
                  onChange={(e) =>
                    setFormData({ ...formData, tradeFocus: e.target.value })
                  }
                  className="w-full bg-[#F8FAFC] border border-[#0093B3]/30 rounded-xl px-4 py-3 text-xs text-[#002D3C] font-semibold focus:border-[#0093B3] focus:bg-white focus:outline-none"
                >
                  <option value="Siding & Trim">
                    Siding & Trim Specialist
                  </option>
                  <option value="Roofing & Gutters">
                    Roofing & Seamless Gutters
                  </option>
                  <option value="Full Exterior Remodel">
                    Full Exterior Remodeling
                  </option>
                  <option value="General Exterior Contractor">
                    General Exterior Contractor
                  </option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <span>Proceed to Calendar Slots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: FULL INTERACTIVE BOOKING CALENDAR */}
          {bookingStep === 2 && (
            <div className="space-y-6">
              {/* Calendar View Mode Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#0093B3]/30">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#0093B3]/20 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("month")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      calendarViewMode === "month"
                        ? "bg-[#002D3C] text-white shadow-sm"
                        : "text-[#002D3C]/70 hover:text-[#002D3C]"
                    }`}
                  >
                    Month View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarViewMode("week")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      calendarViewMode === "week"
                        ? "bg-[#002D3C] text-white shadow-sm"
                        : "text-[#002D3C]/70 hover:text-[#002D3C]"
                    }`}
                  >
                    Week View
                  </button>
                </div>

                {/* Month Navigation Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 text-[#002D3C]/70 hover:text-[#002D3C] hover:bg-[#0093B3]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm font-bold text-[#002D3C] font-mono">
                    {viewDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 text-[#002D3C]/70 hover:text-[#002D3C] hover:bg-[#0093B3]/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTodayMonth}
                    className="text-[11px] font-mono text-[#0093B3] bg-[#0093B3]/10 hover:bg-[#0093B3]/20 px-2.5 py-1 rounded-md border border-[#0093B3]/30 transition-colors cursor-pointer font-bold"
                  >
                    Today
                  </button>
                </div>

                {/* Timezone Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#002D3C]/70 font-mono font-bold">
                    TZ:
                  </span>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="bg-white border border-[#0093B3]/30 rounded-lg px-2.5 py-1 text-xs text-[#002D3C] font-mono font-bold focus:outline-none"
                  >
                    <option value="CST">CST (Central - Little Rock)</option>
                    <option value="EST">EST (Eastern)</option>
                    <option value="MST">MST (Mountain)</option>
                    <option value="PST">PST (Pacific)</option>
                  </select>
                </div>
              </div>

              {/* Calendar Grid Display */}
              {calendarViewMode === "month" ? (
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0093B3]/30">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono font-black text-[#0093B3] uppercase pb-2 border-b border-[#0093B3]/20">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mt-2 text-center text-xs font-mono">
                    {monthCalendarGrid.map((cell, idx) => {
                      const isSelected = selectedDate === cell.dateStr;

                      return (
                        <button
                          key={idx}
                          disabled={cell.isPast || !cell.isCurrentMonth}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`p-2.5 rounded-xl font-bold transition-all relative ${
                            isSelected
                              ? "bg-[#F96E46] text-white font-black shadow-md scale-105 z-10 cursor-pointer"
                              : !cell.isCurrentMonth
                                ? "text-gray-300 cursor-not-allowed"
                                : cell.isPast
                                  ? "text-gray-400/60 cursor-not-allowed line-through"
                                  : "text-[#002D3C] hover:bg-[#0093B3]/15 cursor-pointer"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {isSelected && (
                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Week View Display */
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0093B3]/30">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {weekViewDays.map((day, idx) => {
                      const isSelected = selectedDate === day.dateStr;

                      return (
                        <button
                          key={idx}
                          disabled={day.isPast}
                          onClick={() => setSelectedDate(day.dateStr)}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center ${
                            isSelected
                              ? "bg-[#F96E46] border-[#F96E46] text-white font-black shadow-md scale-105 cursor-pointer"
                              : day.isPast
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white border-[#0093B3]/30 text-[#002D3C] hover:border-[#0093B3] cursor-pointer font-bold"
                          }`}
                        >
                          <span className="text-[10px] font-mono uppercase text-[#0093B3]">
                            {day.dayName}
                          </span>
                          <span className="text-lg font-bold my-1">
                            {day.dayNum}
                          </span>
                          <span className="text-[9px] font-mono">
                            {day.monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 30-Minute Time Slot Picker Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#002D3C] uppercase tracking-wider flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#F96E46]" />
                    <span>
                      Available 30-Min Strategy Call Slots ({selectedDate})
                    </span>
                  </label>
                  <span className="text-[11px] text-[#0093B3] font-mono font-bold">
                    ● Cyan = Available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const timeKey = slot
                      .replace(":00 ", ":00")
                      .replace(":30 ", ":30")
                      .replace(" AM", "")
                      .replace(" PM", "");
                    const slotKey = `${selectedDate}-${timeKey}`;
                    const isBooked = bookedSlots.has(slotKey);
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isBooked
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed line-through"
                            : isSelected
                              ? "bg-[#F96E46] text-white border border-[#F96E46] shadow-md scale-105 z-10"
                              : "bg-white text-[#002D3C] border border-[#0093B3]/30 hover:border-[#0093B3] hover:bg-[#E8EBF7]/60"
                        }`}
                      >
                        <span>{slot}</span>
                        {isBooked ? (
                          <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-sans uppercase">
                            Booked
                          </span>
                        ) : isSelected ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#0093B3]"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 Navigation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#0093B3]/20">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2.5 text-xs text-[#002D3C]/70 hover:text-[#002D3C] font-bold cursor-pointer"
                >
                  ← Back to Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedDate || !selectedTime) {
                      alert(
                        "Please select both an available date and time slot.",
                      );
                      return;
                    }
                    const finalData: BookingData = {
                      ...formData,
                      date: selectedDate,
                      time: selectedTime,
                      timezone: selectedTimezone,
                    };
                    if (onBookingComplete) {
                      onBookingComplete(finalData);
                    }
                    setBookingStep(3);
                  }}
                  className="bg-[#F96E46] hover:bg-[#e25d36] text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  <span>Confirm Appointment</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: APPOINTMENT CONFIRMATION SCREEN */}
          {bookingStep === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-[#0093B3]/10 border-2 border-[#0093B3] rounded-full flex items-center justify-center text-[#0093B3] mx-auto shadow-sm">
                <Check className="w-8 h-8 text-[#0093B3]" />
              </div>

              <div>
                <span className="text-[#0093B3] text-xs font-mono font-bold uppercase tracking-widest bg-[#0093B3]/10 border border-[#0093B3]/30 px-3 py-1 rounded-md">
                  Territory Slot Reserved
                </span>
                <h3 className="text-2xl font-black text-[#002D3C] mt-3">
                  Strategy Call Confirmed!
                </h3>
                <p className="text-xs text-[#002D3C]/80 mt-1 max-w-md mx-auto font-medium">
                  We have locked in your 30-minute Little Rock territory
                  strategy call. An SMS calendar invite has been dispatched to
                  your cell.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#F8FAFC] border border-[#0093B3]/30 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3 font-mono text-xs shadow-sm">
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Date & Time:</span>
                  <span className="text-[#F96E46] font-bold">
                    {selectedDate} @ {selectedTime} ({selectedTimezone})
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Contractor:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.contractorName || "Mark Tidd"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#0093B3]/20 pb-2">
                  <span className="text-[#002D3C]/70">Company:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.companyName || "Tidd Siding"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#002D3C]/70">Direct Cell:</span>
                  <span className="text-[#002D3C] font-bold">
                    {formData.phone || "(501) 555-0199"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    alert("Calendar invite (.ics) downloaded to your device!")
                  }
                  className="w-full sm:w-auto bg-white hover:bg-[#E8EBF7] text-[#002D3C] px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border border-[#0093B3]/30 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-[#F96E46]" />
                  <span>Add To Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-[#F96E46] hover:bg-[#e25d36] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
