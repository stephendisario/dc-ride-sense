"use client";
import {
  addDays,
  subDays,
  startOfMonth,
  isSameMonth,
  isSameDay,
  isBefore,
  format,
  startOfDay,
} from "date-fns";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faCalendarDay } from "@fortawesome/free-solid-svg-icons";

const START = new Date(2025, 4, 1);
const YESTERDAY = startOfDay(subDays(new Date(), 1));
const END = YESTERDAY;

const DISABLED_DAYS = [
  new Date(2025, 6, 26),
  new Date(2025, 9, 20),
  new Date(2025, 10, 13),
  new Date(2025, 10, 14),
];

export default function DatePicker() {
  const { date, setDate, month, setMonth } = useView();

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
    <div
      className="flex items-center justify-between rounded border border-gray-300 px-3 py-1.5
                  bg-white/80 backdrop-blur-sm text-sm font-medium"
    >
      <button
        onClick={() => stepDay("down")}
        disabled={date <= START}
        className="w-6 text-gray-700 hover:text-blue-600 disabled:opacity-40 hover:cursor-pointer flex justify-center"
        aria-label="Previous day"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <span className="flex-1 text-center tabular-nums text-gray-800 truncate tracking-wide">
        {format(date, "EEEE MMM d, yyyy")}
      </span>

      {isBefore(date, YESTERDAY) && (
        <button
          onClick={() => setDate(subDays(new Date(), 1))}
          className="w-6 text-gray-700 hover:text-blue-600 disabled:opacity-40 hover:cursor-pointer flex justify-center"
        >
          <FontAwesomeIcon icon={faCalendarDay} />
        </button>
      )}

      <button
        onClick={() => stepDay("up")}
        disabled={date >= END}
        className="w-6 text-gray-700 hover:text-blue-600 disabled:opacity-40 hover:cursor-pointer flex justify-center"
        aria-label="Next day"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
