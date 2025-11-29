"use client";
import { DayPicker } from "react-day-picker";
import { subDays, startOfMonth, isSameMonth, startOfDay, getMonth } from "date-fns";
import { useView } from "@/stores/views";

const START = new Date(2025, 4, 1);
const YESTERDAY = subDays(startOfDay(new Date()), 1);
const END = YESTERDAY;

export const DISABLED_DAYS = [
  new Date(2025, 6, 26),
  new Date(2025, 9, 20),
  new Date(2025, 10, 13),
  new Date(2025, 10, 14),
  new Date(2025, 10, 18),
];

export default function Calendar() {
  const { date, setDate, month, setMonth } = useView();

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

  return (
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
      formatters={{
        formatWeekdayName: (weekday) => weekday.toLocaleDateString(undefined, { weekday: "short" }),
      }}
      styles={{
        months: {
          marginLeft: "auto",
          marginRight: "auto",
        },
      }}
      className="rounded-lg border border-gray-300 bg-white/80 flex"
    />
  );
}
