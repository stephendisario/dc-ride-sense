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
    id: "2025-05-03",
    label: "AdMo PorchFest",
    date: new Date(2025, 4, 3),
    hour: 15,
  },
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
  const { date, setDate, setHour } = useView();

  const handleSelectEvent = (eventDate: Date, hour: number) => {
    setDate(eventDate);
    setHour(hour);
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-xs text-gray-800 shadow-sm backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        DC Events
      </p>

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
                      ? "bg-slate-200 text-gray-800"
                      : "bg-white/0 text-gray-800 hover:bg-slate-100"
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
