import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { SparklinePoint } from "@shared/types";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useEffect, useMemo, useState } from "react";
import { Popup as MapBoxPopup } from "mapbox-gl";
import { useView } from "@/stores/views";
import { format } from "date-fns";
import { chartsAxisHighlightClasses, lineElementClasses } from "@mui/x-charts";
import {
  updateHexColorsChurn,
  updateHexColorsDelta,
  updateHexColorsDensity,
} from "@/lib/layerStyles";
import { useHexMetrics } from "@/hooks/useHexMetrics";

type PopupProps = {
  lockedHexRef: RefObject<string | null>;
  popup: MapBoxPopup | null;
  series?: SparklinePoint[] | null;
  h3Id: string;
};

const formatHour = (hour: number): string => {
  const d = new Date(2000, 0, 1, hour, 0, 0);
  return format(d, "h:mm a");
};

const Popup = ({ popup, lockedHexRef, series, h3Id }: PopupProps) => {
  const { activeHexLayer: metricLabel } = useView();
  const { metricObj } = useHexMetrics();
  const hasSeries = !!series && series.length > 0;
  const data = hasSeries ? series!.map((s) => s.value) : [];
  const { hour, map } = useView();
  const [hourIndex, setHourIndex] = useState<null | number>(hour);

  const displayValue = data[hourIndex ?? hour];

  // Metric kind: 'delta' | 'density' | 'churn' | other
  const metricKind = (metricLabel ?? "DELTA").toLowerCase();
  const isDelta = metricKind === "delta";
  const isDensity = metricKind === "density";
  const isChurn = metricKind === "churn";

  const maxAbsDelta = useMemo(
    () => (data.length ? Math.max(...data.map((v) => Math.abs(v))) || 1 : 1),
    [data]
  );

  const maxValue = useMemo(() => (data.length ? Math.max(...data) || 1 : 1), [data]);

  const yBounds = isDelta ? { min: -maxAbsDelta, max: maxAbsDelta } : { min: 0, max: maxValue };

  //align the sparkline hour with the time controls hour
  useEffect(() => {
    setHourIndex(hour);
  }, [hour]);

  // Header title + subtitle based on metric kind
  let headerTitle = "Delta";
  let headerSubtitle = "Hour-over-hour change in vehicle count";

  if (isDensity) {
    headerTitle = "Density";
    headerSubtitle = "Total vehicle count";
  } else if (isChurn) {
    headerTitle = "Churn";
    headerSubtitle = "Hour-over-hour vehicle entries + vehicle exits";
  }

  // Value text + tone
  const signedDisplay =
    displayValue === undefined ? "–" : `${displayValue > 0 ? "+" : ""}${displayValue}`;

  const rawDisplay = displayValue == null ? "–" : displayValue.toString();

  const valueText = isDelta ? signedDisplay : rawDisplay;

  const valueTone = isDelta
    ? displayValue == null || displayValue === 0
      ? "bg-slate-100 text-slate-500"
      : displayValue > 0
        ? "bg-emerald-100 text-emerald-700"
        : "bg-sky-100 text-sky-700"
    : "bg-slate-100 text-slate-700"; // neutral for density & churn

  return (
    <div className="max-w-xs rounded-xl bg-white/80 shadow-lg p-3 text-xs text-slate-900">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {headerTitle}
          </div>
          <div className="text-[10px] text-slate-500">{headerSubtitle}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            popup?.remove();
            lockedHexRef.current = null;
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          {lockedHexRef.current && (
            <FontAwesomeIcon icon={faX} className="h-3 w-3 cursor-pointer" />
          )}
        </button>
      </div>

      {/* Current value */}
      <div className="pt-1 flex items-baseline justify-center">
        <div
          className={`inline-flex items-baseline rounded-md px-2 py-1 font-mono text-[11px] ${valueTone} w-[100px]`}
        >
          <span className=" text-[10px] font-medium uppercase tracking-wide text-slate-500 w-[52px]">
            {formatHour(hourIndex ?? hour)}
          </span>
          <span className="text-sm leading-none ml-auto mr-auto">{valueText}</span>
        </div>
        {/* <div className="font-mono text-[10px] tracking-wide text-slate-500">
          {formatHour(hourIndex ?? hour)}
        </div> */}
      </div>

      {hasSeries && (
        <>
          {/* Y-axis max label */}
          <div className="relative mb-1 flex justify-between text-[10px] text-slate-600">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums">
              {isDelta ? `+${maxAbsDelta}` : maxValue}
            </span>
          </div>

          {/* Sparkline */}
          <div className="relative h-[80px] w-[230px]">
            <SparkLineChart
              data={data}
              height={80}
              width={230}
              yAxis={yBounds}
              color="oklch(44.6% 0.043 257.281)"
              showHighlight
              clipAreaOffset={{ top: 2, bottom: 2 }}
              axisHighlight={{ x: "line" }}
              onHighlightedAxisChange={(axisItems) => {
                const newHour = axisItems.length === 0 ? hour : axisItems[0]?.dataIndex;
                const newMetricObj = { ...metricObj, [h3Id]: data[newHour] };
                setHourIndex(newHour);
                if (map) {
                  if (isDelta) updateHexColorsDelta(map, newMetricObj);
                  if (isDensity) updateHexColorsDensity(map, newMetricObj);
                  if (isChurn) updateHexColorsChurn(map, newMetricObj);
                }
              }}
              highlightedAxis={
                hourIndex === null ? [] : [{ axisId: "hour-axis", dataIndex: hourIndex }]
              }
              xAxis={{ id: "hour-axis", data: Array.from(Array(24).keys()) }}
              sx={{
                [`& .${lineElementClasses.root}`]: { strokeWidth: 3 },
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

            {/* Zero line only for delta */}
            {isDelta && (
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-slate-300" />
            )}
          </div>

          {/* Y-axis bottom label */}
          <div className="mt-1 flex justify-between text-[10px] text-slate-600">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums">
              {isDelta ? `-${maxAbsDelta}` : 0}
            </span>
          </div>

          {/* Footer context */}
          <div className="mt-2 text-[10px] text-slate-500 flex justify-center">
            Click a hex to interact with the popup.
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
