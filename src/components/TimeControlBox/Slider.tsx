"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { chartsAxisHighlightClasses, lineElementClasses } from "@mui/x-charts";

import { useView } from "@/stores/views";
import { useInterestingHours } from "@/hooks/useInterestingHours";
import { useProviderStore } from "@/stores/provider";
import { useGetSnapshots } from "@/api/getSnapshot";
import { getMetricByZone } from "@/lib/helper";
import { HexLayerType, ZoneType } from "@shared/types";

import { faFire, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const formatHourLabel = (h: number) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${ampm}`;
};

export default function Slider() {
  const { date, hour, setHour, interestingHours } = useView();
  const { selectedProviders } = useProviderStore();

  useInterestingHours();

  const [isLocked, setIsLocked] = useState(false);

  // --- Interesting hours chips ---
  const presetHours = interestingHours.length ? interestingHours : [9, 18, 22];

  const presetButtons = presetHours
    .slice()
    .sort((a, b) => a - b)
    .map((h) => ({
      value: h,
      label: format(new Date(0, 0, 0, h), "h a"),
    }));

  // --- Sparkline data (trips by hour) ---
  const {
    data: bundle,
    isLoading,
    isFetching,
  } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);

  const isLoadingSnapshots = isLoading || isFetching;

  const activitySeries: number[] = useMemo(() => {
    if (!bundle || selectedProviders.length === 0) return [];

    const timestamps = Object.keys(bundle).sort(); // hourly
    return timestamps.map((ts) => {
      const snapshot = bundle[ts];
      const metricsByZone = getMetricByZone(snapshot, selectedProviders, HexLayerType.DELTA);

      const totalAbsDelta = Object.values(metricsByZone).reduce((sum, v) => sum + Math.abs(v), 0);

      // rough trip estimate
      return totalAbsDelta * 0.5;
    });
  }, [bundle, selectedProviders]);

  const hasActivity = activitySeries.length > 0;

  const maxVal = hasActivity && Math.max(...activitySeries) > 0 ? Math.max(...activitySeries) : 1;

  const minVal =
    hasActivity && Math.min(...activitySeries) < maxVal ? Math.min(...activitySeries) : 0;

  const yMin = hasActivity ? minVal : 0;
  const yMax = hasActivity ? maxVal : 1;

  const currentIndex = hour >= 0 && hour < activitySeries.length ? hour : 0;

  const currentValue =
    hasActivity && currentIndex < activitySeries.length ? activitySeries[currentIndex] : null;

  const dayTotal = hasActivity ? activitySeries.reduce((sum, v) => sum + v, 0) : 0;

  return (
    <div className="flex flex-col space-y-2.5">
      {/* Interesting hours row (always visible) */}
      <div className="px-1 text-xs text-gray-700">
        <div className="flex items-center justify-center gap-2">
          <div className="group absolute left-15 flex items-center">
            <FontAwesomeIcon
              icon={faFire}
              size="lg"
              className="cursor-pointer"
              color="oklch(75% 0.183 55.934)"
            />
            <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 w-60 rounded-md bg-slate-700 px-2 py-1 text-[10px] leading-snug text-slate-100 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <p className="mb-1 font-semibold text-[12px]">Interesting Hours</p>
              Calculated by scoring each hour based on how much movement happens and how
              concentrated that movement is. These are the hours with the strongest, most focused
              activity for this day.
            </div>
          </div>

          <div className="flex gap-2 w-[195px] justify-center">
            {presetButtons.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setHour(p.value)}
                className={`font-mono flex-1 px-2.5 py-0.5 rounded-full border transition text-xs hover:cursor-pointer
                  ${
                    hour === p.value
                      ? "bg-slate-700 border-slate-900 text-slate-100"
                      : "bg-white/70 border-gray-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sparkline box */}
      <div
        className={`relative rounded-md transition-all duration-500 overflow-hidden cursor-pointer ${"p-2 border-gray-300 border opacity-100 max-h-60"}`}
        onClick={() => setIsLocked((prev) => !prev)}
      >
        {/* Header: title + day total chip */}
        <div className="px-1 pb-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                Activity
              </div>
              <div className="text-[10px] text-slate-500">Estimated trips per hour</div>
            </div>

            {/* Day total chip (inline with title, top-right) */}
            <div
              className={`flex items-center rounded border px-2.5 py-[3px] font-mono text-[10px]
                border-slate-300 bg-white/90 text-slate-700 
                ${isLoadingSnapshots ? "opacity-70 blur-[0.5px] animate-pulse" : ""}`}
            >
              <span className="uppercase tracking-wide mr-1">Day total</span>
              <span className="tabular-nums">
                {hasActivity ? (
                  <>≈ {Math.round(dayTotal).toLocaleString()} trips</>
                ) : selectedProviders.length === 0 ? (
                  <>Select a provider</>
                ) : (
                  <>No trip data</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Current hour pill (below header, centered) */}
        <div className="flex justify-center pt-2">
          <div
            className={`inline-flex items-center justify-between rounded-md bg-slate-700 px-3 py-1.5 font-mono text-[11px] text-slate-50 shadow-sm
              ${isLoadingSnapshots ? "opacity-70 blur-[0.5px] animate-pulse" : ""}`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-100">
              {formatHourLabel(hour)}
            </span>
            <span className="text-[12px] leading-none ml-3">
              {hasActivity && currentValue != null
                ? `${Math.round(currentValue).toLocaleString()} trips`
                : "–"}
            </span>
          </div>
        </div>

        {/* Sparkline area */}
        <div className=" space-y-2 min-h-[110px]">
          <>
            {/* Y-axis max label */}
            <div className="mb-1 flex justify-start px-1 text-[10px] text-slate-600">
              <span
                className={`${isLoadingSnapshots ? "blur-[1px] opacity-80" : ""}inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
              >
                {Math.round(yMax)}
              </span>
            </div>

            <div
              className={`relative h-[70px] w-full flex justify-center ${
                isLoadingSnapshots ? "blur-[1px] opacity-80" : ""
              }`}
            >
              <SparkLineChart
                data={activitySeries}
                height={70}
                width={260}
                yAxis={{ min: yMin, max: yMax }}
                color={"oklch(44.6% 0.043 257.281)"}
                showHighlight
                clipAreaOffset={{ top: 6, bottom: 6 }}
                axisHighlight={{ x: "line" }}
                margin={{ left: 4, right: 4, top: 6, bottom: 6 }}
                onHighlightedAxisChange={(axisItems) => {
                  if (isLocked) return;

                  const idx =
                    axisItems.length === 0 ? null : (axisItems[0]?.dataIndex as number | null);
                  if (idx != null) setHour(idx);
                }}
                highlightedAxis={hour == null ? [] : [{ axisId: "hour-axis", dataIndex: hour }]}
                xAxis={{
                  id: "hour-axis",
                  data: Array.from({ length: activitySeries.length }, (_, i) => i),
                }}
                sx={{
                  [`& .${lineElementClasses.root}`]: {
                    strokeWidth: 3,
                    opacity: 1, // let blur handle the "loading" look
                  },
                  [`& .${chartsAxisHighlightClasses.root}`]: {
                    stroke: "oklch(44.6% 0.043 257.281)",
                    strokeDasharray: "none",
                    strokeWidth: 2,
                  },
                }}
                slotProps={{
                  lineHighlight: { r: 4 },
                }}
              />
            </div>
            {/* Y-axis min label */}
            <div className="mt-1 flex justify-start px-1 text-[10px] text-slate-600">
              <span
                className={`${isLoadingSnapshots ? "blur-[1px] opacity-80" : ""}inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
              >
                {Math.round(yMin)}
              </span>
            </div>
          </>
        </div>

        {/* Lock + helper text (bottom-left) */}
        <div className="mt-2 flex items-center justify-center gap-2 px-1 pb-1 text-[10px] text-slate-500">
          <p className="leading-snug">
            {isLocked
              ? "Click anywhere in this box to unlock the hour."
              : "Click anywhere in this box to lock the hour."}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // avoid double toggle with wrapper onClick
              setIsLocked((prev) => !prev);
            }}
            className="absolute right-4 items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-2 py-[2px] text-slate-700 shadow-sm"
          >
            <FontAwesomeIcon
              icon={isLocked ? faLock : faLockOpen}
              className="text-[10px] cursor-pointer"
            />
          </button>
        </div>
      </div>

      {/* Time + count pill (outside box, when sparkline hidden) */}
      {/* <div className={`flex justify-center transition-all ${"opacity-0 max-h-0"}`}>
        <div
          className={`inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-1.5 font-mono text-[11px] text-slate-50 shadow-sm
            ${isLoadingSnapshots ? "opacity-70 blur-[0.5px] animate-pulse" : ""}`}
        >
          <span className="text-[12px] font-medium uppercase tracking-wide text-slate-200">
            {formatHourLabel(hour)}
          </span>
          <span className="text-sm leading-none">
            {hasActivity && currentValue != null
              ? `${Math.round(currentValue).toLocaleString()} trips`
              : "–"}
          </span>
        </div>
      </div> */}

      {/* Slider (visible when sparkline hidden) */}
      {/* {!showSparkline && (
        <div className="w-full flex justify-center">
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value))}
            className="w-[260px] accent-slate-700 h-1.5 bg-gray-200/40 rounded-lg cursor-pointer"
          />
        </div>
      )} */}
    </div>
  );
}
