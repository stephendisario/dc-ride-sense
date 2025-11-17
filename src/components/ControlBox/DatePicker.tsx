"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import {
  addDays,
  subDays,
  startOfMonth,
  isSameMonth,
  isSameDay,
  startOfDay,
  getMonth,
  format,
} from "date-fns";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const START = new Date(2025, 4, 1);
const YESTERDAY = subDays(startOfDay(new Date()), 1);
const END = YESTERDAY;

const DISABLED_DAYS = [
  new Date(2025, 6, 26),
  new Date(2025, 9, 20),
  new Date(2025, 10, 13),
  new Date(2025, 10, 14),
];

export default function DatePicker() {
  const { date, setDate } = useView();
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

  const isDisabledDate = (d: Date) => DISABLED_DAYS.some((disabled) => isSameDay(disabled, d));

  const stepDay = (dir: "up" | "down") => {
    let next = dir === "up" ? addDays(date, 1) : subDays(date, 1);

    while (isDisabledDate(next)) {
      next = dir === "up" ? addDays(next, 1) : subDays(next, 1);
    }

    setDate(next);
    if (!isSameMonth(next, month)) {
      setMonth(startOfMonth(next));
    }
  };

  return (
    <>
      <DayPicker
        navLayout="around"
        fixedWeeks
        required
        mode="single"
        selected={date}
        onSelect={handleDayPickerSelect}
        month={month}
        onMonthChange={handleDayPickerMonth}
        disabled={[{ before: START }, { after: END }, ...DISABLED_DAYS]}
        modifiersClassNames={{
          disabled: "opacity-40 cursor-not-allowed gray",
        }}
        styles={{
          root: open
            ? {}
            : {
                visibility: "hidden",
                pointerEvents: "none",
                position: "absolute",
              },
        }}
        className="bg-white/30 backdrop-blur-md rounded-md transition"
      />

      <div
        className="flex items-center justify-between rounded border border-gray-300 px-3 py-1.5
                  bg-white/40 backdrop-blur-sm text-sm font-medium w-full"
      >
        <button
          onClick={() => stepDay("down")}
          disabled={date <= START}
          className="w-6 text-gray-700 hover:text-blue-600 disabled:opacity-40 hover:cursor-pointer flex justify-center"
          aria-label="Previous day"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <span className="flex-1 text-center tabular-nums text-gray-800 truncate">
          {format(date, "EEEE MMM d, yyyy")}
        </span>

        <button
          onClick={() => stepDay("up")}
          disabled={date >= END}
          className="w-6 text-gray-700 hover:text-blue-600 disabled:opacity-40 hover:cursor-pointer flex justify-center"
          aria-label="Next day"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <FontAwesomeIcon
          className="ml-3 text-gray-700 hover:text-blue-600 hover:cursor-pointer flex-shrink-0"
          icon={faCalendar}
          onClick={() => setOpen((p) => !p)}
        />
      </div>
    </>
  );
}
