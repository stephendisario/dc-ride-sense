"use client";

import { format, isSameDay } from "date-fns";
import { useView } from "@/stores/views";

type DCEvent = {
  id: string;
  label: string;
  date: Date;
  hour: number;
};

const DC_EVENTS: DCEvent[] = [
  {
    id: "2025-06-07",
    label: "World Pride Parade",
    date: new Date(2025, 5, 7),
    hour: 15,
  },
  {
    id: "2025-09-14",
    label: "DC Half Marathon",
    date: new Date(2025, 8, 14),
    hour: 7,
  },
  {
    id: "2025-08-12",
    label: "Midweek Work Commute",
    date: new Date(2025, 7, 12),
    hour: 9,
  },
  {
    id: "2025-09-20",
    label: "H Street Festival",
    date: new Date(2025, 8, 20),
    hour: 17,
  },
  {
    id: "2025-11-01",
    label: "AdMo PorchFest",
    date: new Date(2025, 10, 1),
    hour: 15,
  },
];

const EventsPanel = () => {
  const { date, setDate, setHour, setMonth } = useView();

  const handleSelectEvent = (eventDate: Date, hour: number) => {
    setDate(eventDate);
    setHour(hour);
    setMonth(eventDate);
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur-sm">
      <div className="inline-flex justify-between w-full items-end">
        <p className="text-[10px] uppercase font-semibold tracking-wide text-slate-700">Events</p>
        <p className="text-[10px] text-slate-500">Jump to busy days</p>
      </div>

      <span className="w-full h-px bg-gray-300 mb-2 mt-1" />

      <div className="flex flex-col gap-1">
        {DC_EVENTS.map((ev) => {
          const selected = isSameDay(date, ev.date);
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => handleSelectEvent(ev.date, ev.hour)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition cursor-pointer
                  ${
                    selected
                      ? "bg-slate-200 text-slate-700"
                      : "bg-white/0 text-slate-700 hover:bg-slate-100"
                  }`}
            >
              <span className="truncate">{ev.label}</span>
              <span className="ml-2 shrink-0 text-[10px] text-gray-500">
                {format(ev.date, "MMM d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPanel;
