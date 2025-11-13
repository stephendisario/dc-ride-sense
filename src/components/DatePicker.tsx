"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, subDays, startOfMonth, isSameMonth, startOfDay, getMonth } from "date-fns";
import "react-day-picker/style.css";
import { useView } from "@/stores/views";

const START = new Date(2025, 4, 1);
const YESTERDAY = subDays(startOfDay(new Date()), 1);
const END = YESTERDAY;

export default function DatePicker() {
  const { date, hour, setDate, setHour } = useView();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(startOfMonth(date));

  const handleDayPickerSelect = (d?: Date) => {
    if (!d) return;
    setDate(d);
    if (!isSameMonth(d, month)) setMonth(startOfMonth(d));
  };

  const handleDayPickerMonth = (d?: Date) => {
    if (!d) return;
    if (getMonth(d) > getMonth(END) || getMonth(d) < getMonth(START)) return;
    setMonth(d);
  };

  const stepDay = (dir: "up" | "down") => {
    const next = dir === "up" ? addDays(date, 1) : subDays(date, 1);
    setDate(next);
    if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
  };

  return (
    <div className="absolute bottom-0 left-0 z-10 mb-8 ml-2">
      <DayPicker
        navLayout="around"
        fixedWeeks
        required
        mode="single"
        selected={date}
        onSelect={handleDayPickerSelect}
        month={month}
        onMonthChange={handleDayPickerMonth}
        disabled={[{ before: START }, { after: END }]}
        modifiersClassNames={{
          disabled: "opacity-40 cursor-not-allowed gray",
        }}
        styles={{
          root: open ? {} : { visibility: "hidden", pointerEvents: "none", position: "absolute" },
        }}
      />

      <div className="ml-2 rounded border px-2 py-1 flex w-[350px] items-center justify-center">
        <div className="flex flex-row w-3/4 ">
          <button
            onClick={() => stepDay("down")}
            disabled={date <= START}
            className="px-1 disabled:opacity-40 mr-auto"
            aria-label="Previous day"
          >
            {"<"}
          </button>

          <span className="tabular-nums">
            {date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <button
            onClick={() => stepDay("up")}
            disabled={date >= END}
            className="px-1 disabled:opacity-40 ml-auto"
            aria-label="Next day"
          >
            {">"}
          </button>
        </div>

        <button type="button" onClick={() => setOpen((v) => !v)} className="absolute right-0">
          {open ? "Hide" : "Show"}
        </button>
      </div>
      <input
        type="range"
        name="hour"
        min="0"
        max="23"
        value={hour.toString()}
        onChange={(e) => setHour(parseInt(e.target.value))}
      ></input>
      <p>{hour}</p>
    </div>
  );
}
