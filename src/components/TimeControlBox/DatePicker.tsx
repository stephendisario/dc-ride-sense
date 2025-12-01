"use client";
import {
  addDays,
  subDays,
  startOfMonth,
  isSameMonth,
  isSameDay,
  format,
  startOfDay,
  isBefore,
} from "date-fns";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faStar,
  faCalendarDay,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@shared/types";
import { DISABLED_DAYS } from "./Calendar";

const START = new Date(2025, 4, 1);
const YESTERDAY = startOfDay(subDays(new Date(), 1));
const END = YESTERDAY;

export default function DatePicker() {
  const { date, setDate, month, setMonth, activeIconButton, setActiveIconButton } = useView();

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

  const toggleIcon = (name: IconButton) => {
    setActiveIconButton(name === activeIconButton ? "" : name);
  };

  return (
    <div className="space-y-3">
      {/* Centered row */}
      <div className="flex justify-center">
        <div className="flex items-center justify-between w-full max-w-[360px] text-sm font-medium text-slate-700">
          {/* Left: sparkline icon, styled like Metro/Bike/Events pills */}
          <button
            type="button"
            onClick={() => toggleIcon("SPARKLINE")}
            className={`w-8 h-8 flex md:hidden items-center justify-center rounded-full border p-1.5 transition hover:cursor-pointer
              ${
                activeIconButton === "SPARKLINE"
                  ? "bg-slate-700 border-slate-700 text-white"
                  : "text-slate-700 border-gray-300 bg-white/90 hover:bg-slate-50"
              }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="h-4 w-4" />
          </button>

          <button
            onClick={() => setDate(subDays(new Date(), 1))}
            className={`w-8 h-8 hidden md:flex items-center justify-center rounded-full border p-1.5 transition hover:cursor-pointer
            ${
              isBefore(date, YESTERDAY)
                ? "text-slate-700 border-gray-300 bg-white/90 hover:bg-slate-50"
                : "bg-gray-100 border-gray-200 text-gray-400 opacity-50"
            }`}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
          </button>

          {/* Three-part date control */}
          <div className="inline-flex items-stretch rounded-full border border-gray-300 bg-white/85 shadow-sm overflow-hidden">
            {/* Left arrow */}
            <button
              onClick={() => stepDay("down")}
              disabled={date <= START}
              className="px-2 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 hover:cursor-pointer border-r border-gray-200"
              aria-label="Previous day"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
            </button>

            {/* Center: weekday + date (clickable to open calendar) */}
            <button
              type="button"
              onClick={() => toggleIcon("CALENDAR")}
              className="px-3 py-1 flex flex-col items-center min-w-[190px] max-w-[210px]
                         hover:bg-slate-50 cursor-pointer focus:outline-none"
              aria-label="Open calendar"
            >
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {format(date, "EEE")}
              </span>
              <span className="tabular-nums text-slate-700 font-semibold truncate">
                {format(date, "MMM d, yyyy")}
              </span>
            </button>

            {/* Right arrow */}
            <button
              onClick={() => stepDay("up")}
              disabled={date >= END}
              className="px-2 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 hover:cursor-pointer border-l border-gray-200"
              aria-label="Next day"
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </button>
          </div>

          {/* Right: Events icon, styled like Metro/Bike pills */}
          <button
            type="button"
            onClick={() => toggleIcon("EVENTS")}
            className={`w-8 h-8 flex items-center justify-center rounded-full border p-1.5 transition hover:cursor-pointer
              ${
                activeIconButton === "EVENTS"
                  ? "bg-slate-700 border-slate-700 text-white"
                  : "text-slate-700 border-gray-300 bg-white/90 hover:bg-slate-50"
              }`}
            aria-label="Show DC events"
          >
            <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
