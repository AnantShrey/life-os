"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar as CalendarIcon,
  AlignLeft,
  Check,
  MapPin,
  Video,
  Mail,
  RotateCcw,
  Bell,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

// Match the 8 colors specified in the design spec
const COLORS = [
  { id: "11", hex: "#ef4444", name: "Tomato" },
  { id: "4",  hex: "#f97316", name: "Flamingo" },
  { id: "6",  hex: "#f59e0b", name: "Tangerine" },
  { id: "5",  hex: "#eab308", name: "Banana" },
  { id: "2",  hex: "#84cc16", name: "Sage" },
  { id: "10", hex: "#22c55e", name: "Basil" },
  { id: "7",  hex: "#06b6d4", name: "Peacock" },
  { id: "9",  hex: "#3b82f6", name: "Blueberry" },
];

const inputCls =
  "w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-[12px] px-[14px] py-[10px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all duration-200";
const focusRingStyle = {
  boxShadow: "0 0 0 3px rgba(14,165,233,0.15)",
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FieldRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 text-muted-foreground">
      <div className="mt-[10px] flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
}: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [colorId, setColorId] = useState("9");
  const [location, setLocation] = useState("");
  const [meetLink, setMeetLink] = useState(false);
  const [guests, setGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [reminder, setReminder] = useState("30");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Parse a datetime-local string "yyyy-MM-ddTHH:mm" into date + time parts
  const parseDT = (dt: string) => {
    if (!dt) return { date: "", time: "" };
    const [date, time] = dt.split("T");
    return { date: date || "", time: time?.slice(0, 5) || "" };
  };

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || "");
      setDescription(initialEvent.extendedProps?.description || "");
      setAllDay(initialEvent.allDay || false);
      setLocation(initialEvent.extendedProps?.location || "");
      setMeetLink(false);
      setGuests([]);
      setGuestInput("");
      setRecurrence("none");
      setReminder("30");

      const foundColor = COLORS.find(
        (c) => c.hex === initialEvent.backgroundColor
      );
      setColorId(foundColor?.id || "9");

      const isAD = initialEvent.allDay || false;
      if (initialEvent.start) {
        const s = isAD
          ? format(initialEvent.start, "yyyy-MM-dd")
          : format(new Date(initialEvent.start), "yyyy-MM-dd'T'HH:mm");
        const { date, time } = parseDT(s);
        setStartDate(date);
        setStartTime(time);
      }
      const endSrc = initialEvent.end || initialEvent.start;
      if (endSrc) {
        const e = isAD
          ? format(new Date(endSrc), "yyyy-MM-dd")
          : format(new Date(endSrc), "yyyy-MM-dd'T'HH:mm");
        const { date, time } = parseDT(e);
        setEndDate(date);
        setEndTime(time);
      }
    } else {
      setTitle("");
      setDescription("");
      setAllDay(false);
      setColorId("9");
      setLocation("");
      setMeetLink(false);
      setGuests([]);
      setGuestInput("");
      setRecurrence("none");
      setReminder("30");
      const now = new Date();
      setStartDate(format(now, "yyyy-MM-dd"));
      setStartTime(format(now, "HH:00"));
      now.setHours(now.getHours() + 1);
      setEndDate(format(now, "yyyy-MM-dd"));
      setEndTime(format(now, "HH:00"));
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const buildDateTime = (date: string, time: string) =>
    allDay ? date : `${date}T${time || "00:00"}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialEvent?.id,
      title,
      description,
      allDay,
      start: buildDateTime(startDate, startTime),
      end: buildDateTime(endDate, endTime),
      colorId,
      location,
    });
  };

  const addGuest = () => {
    const email = guestInput.trim();
    if (email && !guests.includes(email)) {
      setGuests([...guests, email]);
      setGuestInput("");
    }
  };

  const removeGuest = (email: string) => {
    setGuests(guests.filter((g) => g !== email));
  };

  const getFocusStyle = (name: string) =>
    focusedInput === name ? focusRingStyle : {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="bg-card w-full rounded-[24px] flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          maxWidth: 520,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
          animation: "modalIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both",
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.96) translateY(4px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 flex-shrink-0">
          <h3 className="font-semibold text-xl">
            {initialEvent?.id ? "Edit Event" : "New Event"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="px-8 pb-8 overflow-y-auto flex-1 space-y-5"
        >
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full text-2xl font-semibold bg-transparent border-b-2 border-border/40 focus:border-primary focus:outline-none pb-2 transition-colors placeholder:text-muted-foreground/40"
            required
          />

          {/* Date & Time */}
          <FieldRow icon={<CalendarIcon className="w-5 h-5" />}>
            <div className="space-y-3">
              {/* All-day toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground cursor-pointer select-none">
                  All day
                </label>
                <Toggle checked={allDay} onChange={setAllDay} />
              </div>

              {/* Start row */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onFocus={() => setFocusedInput("startDate")}
                  onBlur={() => setFocusedInput(null)}
                  className={`${inputCls} flex-1`}
                  style={getFocusStyle("startDate")}
                  required
                />
                {!allDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onFocus={() => setFocusedInput("startTime")}
                    onBlur={() => setFocusedInput(null)}
                    className={`${inputCls} w-[120px]`}
                    style={getFocusStyle("startTime")}
                  />
                )}
              </div>

              {/* End row */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-7 flex-shrink-0">
                  to
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onFocus={() => setFocusedInput("endDate")}
                  onBlur={() => setFocusedInput(null)}
                  className={`${inputCls} flex-1`}
                  style={getFocusStyle("endDate")}
                  required
                />
                {!allDay && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onFocus={() => setFocusedInput("endTime")}
                    onBlur={() => setFocusedInput(null)}
                    className={`${inputCls} w-[120px]`}
                    style={getFocusStyle("endTime")}
                  />
                )}
              </div>
            </div>
          </FieldRow>

          {/* Repeat */}
          <FieldRow icon={<RotateCcw className="w-5 h-5" />}>
            <div className="relative">
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className={`${inputCls} appearance-none pr-9 cursor-pointer`}
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
                <option value="yearly">Every year</option>
                <option value="custom">Custom…</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </FieldRow>

          {/* Location */}
          <FieldRow icon={<MapPin className="w-5 h-5" />}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setFocusedInput("location")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Add location"
              className={inputCls}
              style={getFocusStyle("location")}
            />
          </FieldRow>

          {/* Google Meet */}
          <FieldRow icon={<Video className="w-5 h-5" />}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Add Google Meet
                </span>
                <Toggle checked={meetLink} onChange={setMeetLink} />
              </div>
              {meetLink && (
                <p className="text-xs text-muted-foreground bg-muted rounded-[10px] px-3 py-2">
                  Google Meet link will be generated on save
                </p>
              )}
            </div>
          </FieldRow>

          {/* Description */}
          <FieldRow icon={<AlignLeft className="w-5 h-5" />}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedInput("desc")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Add description"
              rows={3}
              className={`${inputCls} resize-none`}
              style={getFocusStyle("desc")}
            />
          </FieldRow>

          {/* Guests */}
          <FieldRow icon={<Mail className="w-5 h-5" />}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  onFocus={() => setFocusedInput("guest")}
                  onBlur={() => setFocusedInput(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGuest();
                    }
                  }}
                  placeholder="Add guests by email"
                  className={`${inputCls} flex-1`}
                  style={getFocusStyle("guest")}
                />
                <button
                  type="button"
                  onClick={addGuest}
                  className="px-3 py-2 rounded-[12px] bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {guests.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {g}
                      <button
                        type="button"
                        onClick={() => removeGuest(g)}
                        className="hover:text-primary/70 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FieldRow>

          {/* Reminder */}
          <FieldRow icon={<Bell className="w-5 h-5" />}>
            <div className="relative">
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className={`${inputCls} appearance-none pr-9 cursor-pointer`}
              >
                <option value="none">No notification</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </FieldRow>

          {/* Calendar selector */}
          <FieldRow icon={<CalendarIcon className="w-5 h-5" />}>
            <div className="relative">
              <select
                defaultValue="primary"
                className={`${inputCls} appearance-none pr-9 cursor-pointer`}
              >
                <option value="primary">My Calendar</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </FieldRow>

          {/* Color picker */}
          <div className="flex gap-2.5 flex-wrap pl-9 pt-1">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorId(c.id)}
                title={c.name}
                className="w-9 h-9 rounded-full flex items-center justify-center focus:outline-none transition-all duration-150"
                style={{
                  backgroundColor: c.hex,
                  transform: colorId === c.id ? "scale(1.18)" : "scale(1)",
                  boxShadow:
                    colorId === c.id ? `0 4px 14px ${c.hex}66` : "none",
                }}
              >
                {colorId === c.id && (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t border-border/40 mt-6">
            {initialEvent?.id ? (
              <button
                type="button"
                onClick={() => onDelete(initialEvent.id)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2 rounded-[12px] font-medium text-sm transition-colors"
              >
                Delete event
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-border bg-transparent hover:bg-muted rounded-[12px] font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-[12px] font-medium text-sm text-white shadow-md transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px]"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                }}
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
