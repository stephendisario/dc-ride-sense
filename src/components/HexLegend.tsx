"use client";

import { useEffect } from "react";
import { HexLayerType } from "@shared/types";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { isBefore } from "date-fns";
import { HEX_LAYERS } from "@shared/constants";
import {
  CHURN_RANGE_MAX,
  CHURN_RANGE_MIN,
  DELTA_RANGE_MAX,
  DELTA_RANGE_MIN,
  DENSITY_RANGE_MAX,
  DENSITY_RANGE_MIN,
} from "@/lib/constants";

const CHURN_AVAILABLE_FROM = new Date(2025, 10, 15); // 2025-11-15

/* Shared bar components */

const Bar = ({ gradient }: { gradient: string }) => (
  <div className="mb-1 h-3.5 w-full rounded-full border border-gray-200">
    <div className="h-full w-full rounded-full" style={{ background: gradient }} />
  </div>
);

const VerticalBar = ({ gradient }: { gradient: string }) => (
  <div className="mr-2 flex h-24 w-4 items-stretch rounded-full border border-gray-200">
    <div className="h-full w-full rounded-full" style={{ background: gradient }} />
  </div>
);

/* DESKTOP legend bodies (horizontal) */

const DeltaLegendBody = () => (
  <>
    <Bar
      gradient="
        linear-gradient(
          to right,
          #0B3B8C,
          #1F65B7,
          #73A8D8,
          #f1f5f9,
          #A6DDA3,
          #4FB173,
          #0B7A3C
        )
      "
    />
    <div className="mt-0.5 flex justify-between text-[11px] text-slate-600">
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {DELTA_RANGE_MIN}
      </span>
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {DELTA_RANGE_MAX}
      </span>
    </div>
  </>
);

const DensityLegendBody = () => (
  <>
    <Bar
      gradient="
        linear-gradient(
          to right,
          #1D1B20,
          #1F1B98,
          #0741B8,
          #146D9D,
          #329453,
          #65B21A,
          #B1C805,
          #EEDF2F
        )
      "
    />
    <div className="mt-0.5 flex justify-between text-[11px] text-slate-600">
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {DENSITY_RANGE_MIN}
      </span>
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {DENSITY_RANGE_MAX}
      </span>
    </div>
  </>
);

const ChurnLegendBody = () => (
  <>
    <Bar
      gradient="
        linear-gradient(
          to right,
          #a6dda3,
          #4fb173,
          #0b7a3c
        )
      "
    />
    <div className="mt-0.5 flex justify-between text-[11px] text-slate-600">
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {CHURN_RANGE_MIN}
      </span>
      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono text-[10px] tabular-nums">
        {CHURN_RANGE_MAX}
      </span>
    </div>
  </>
);

/* MOBILE legend bodies (vertical, + / − labels) */

const DeltaLegendBodyVertical = () => (
  <div className="flex items-stretch">
    <VerticalBar
      gradient="
        linear-gradient(
          to top,
          #0B3B8C,
          #1F65B7,
          #73A8D8,
          #f1f5f9,
          #A6DDA3,
          #4FB173,
          #0B7A3C
        )
      "
    />
    <div className="flex flex-col justify-between py-0.5 text-[10px] text-slate-600">
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        +
      </span>
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        −
      </span>
    </div>
  </div>
);

const DensityLegendBodyVertical = () => (
  <div className="flex items-stretch">
    <VerticalBar
      gradient="
        linear-gradient(
          to top,
          #1D1B20,
          #1F1B98,
          #0741B8,
          #146D9D,
          #329453,
          #65B21A,
          #B1C805,
          #EEDF2F
        )
      "
    />
    <div className="flex flex-col justify-between py-0.5 text-[10px] text-slate-600">
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        +
      </span>
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        −
      </span>
    </div>
  </div>
);

const ChurnLegendBodyVertical = () => (
  <div className="flex items-stretch">
    <VerticalBar
      gradient="
        linear-gradient(
          to top,
          #a6dda3,
          #4fb173,
          #0b7a3c
        )
      "
    />
    <div className="flex flex-col justify-between py-0.5 text-[10px] text-slate-600">
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        +
      </span>
      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono">
        −
      </span>
    </div>
  </div>
);

/* Tooltip content per layer */

const getLayerTooltip = (layer: HexLayerType) => {
  if (layer === HexLayerType.DELTA) {
    return (
      <>
        <p className="mb-1 text-[13px] font-semibold">Delta</p>
        <p>
          Hour-over-hour change in the number of vehicles in each hex. Negative values mean fewer
          vehicles than the previous hour; positive values mean more vehicles.
        </p>
      </>
    );
  }

  if (layer === HexLayerType.DENSITY) {
    return (
      <>
        <p className="mb-1 text-[13px] font-semibold">Density</p>
        <p>Total number of parked micromobility vehicles in each hex during the selected hour.</p>
      </>
    );
  }

  // Churn
  return (
    <>
      <p className="mb-1 text-[13px] font-semibold">Churn</p>
      <p>
        Counts how many vehicles entered <span className="font-semibold">plus</span> how many left a
        hex over the last hour.
      </p>
      <p className="mt-1">
        A hex can have a small net change (delta) but high churn if many trips both start and end
        there; churn highlights these “hot movement” zones.
      </p>
    </>
  );
};

const HexLegend = () => {
  const { activeHexLayer, setActiveHexLayer, date } = useView();

  // If user is on CHURN but the current date doesn't support it, bump them to DELTA
  useEffect(() => {
    if (activeHexLayer === HexLayerType.CHURN && date && isBefore(date, CHURN_AVAILABLE_FROM)) {
      setActiveHexLayer(HexLayerType.DELTA);
    }
  }, [activeHexLayer, date, setActiveHexLayer]);

  if (!activeHexLayer) return null;

  const setHexLayer = (layer: HexLayerType) => {
    if (layer !== activeHexLayer) {
      setActiveHexLayer(layer);
    }
  };

  const titleText =
    activeHexLayer === HexLayerType.DELTA
      ? "Delta"
      : activeHexLayer === HexLayerType.DENSITY
      ? "Density"
      : "Churn";

  return (
    <div
    className="
      absolute z-20
      left-3 top-[20%]                    /* mobile: sit a bit above center */
      sm:left-1/2 sm:top-auto sm:bottom-4 /* desktop: bottom-centered */
      sm:-translate-x-1/2                 /* only center horizontally on sm+ */
    "
  >
      <div className="pointer-events-auto flex flex-col items-start gap-2 sm:items-center">
        {/* MOBILE: vertical layer selector + slim legend */}
        <div className="sm:hidden">
          <div className="flex w-[100px] flex-col gap-1 rounded-lg border border-gray-300 bg-white/90 px-3 py-2 text-[12px] text-slate-700 shadow-sm backdrop-blur-sm">
            {/* Vertical layer selector */}
            <div className="flex flex-col gap-1">
              {HEX_LAYERS.map((layer) => {
                const isActive = activeHexLayer === layer;
                const disabled =
                  layer === HexLayerType.CHURN &&
                  date &&
                  isBefore(date, CHURN_AVAILABLE_FROM);

                //const reason = "Churn is only available starting Nov 15, 2025.";

                return (
                  <div key={layer} className="relative">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setHexLayer(layer)}
                      className={`w-full rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition
                        ${
                          disabled
                            ? "cursor-default border-gray-200 bg-gray-100 text-gray-400 opacity-50"
                            : isActive
                              ? "cursor-pointer border-slate-900 bg-slate-700 text-slate-100 shadow-sm"
                              : "cursor-pointer border-transparent bg-white/80 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {layer}
                    </button>

                    {disabled && (
                      <div className="pointer-events-none absolute left-0 bottom-full mb-1 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition-opacity peer-hover:opacity-100" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Title + info icon */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                {titleText}
              </span>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Layer description"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white/90 text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 peer"
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="h-3 w-3" />
                </button>
                <div className="pointer-events-none absolute left-0 bottom-full z-10 mb-2 w-64 rounded-md bg-slate-700 px-3 py-2 text-[11px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                  {getLayerTooltip(activeHexLayer)}
                </div>
              </div>
            </div>

            {/* Vertical gradient */}
            <div className="mt-1">
              {activeHexLayer === HexLayerType.DELTA && <DeltaLegendBodyVertical />}
              {activeHexLayer === HexLayerType.DENSITY && <DensityLegendBodyVertical />}
              {activeHexLayer === HexLayerType.CHURN && <ChurnLegendBodyVertical />}
            </div>
          </div>
        </div>

        {/* DESKTOP: horizontal selector + legend */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          {/* Segmented control above legend */}
          <div className="flex flex-row items-center rounded-full border border-gray-300 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur-sm">
            {HEX_LAYERS.map((layer) => {
              const isActive = activeHexLayer === layer;
              const disabled =
                layer === HexLayerType.CHURN &&
                date &&
                isBefore(date, CHURN_AVAILABLE_FROM);

              const reason = "Churn is only available starting Nov 15, 2025.";

              return (
                <div key={layer} className="relative flex">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setHexLayer(layer)}
                    className={`peer justify-center rounded-full border px-3 py-0.5 text-[11px] font-medium uppercase tracking-wide transition
                      ${
                        disabled
                          ? "cursor-default border-gray-200 bg-gray-100 text-gray-400 opacity-50"
                          : isActive
                            ? "cursor-pointer border-slate-900 bg-slate-700 text-slate-100 shadow-sm"
                            : "cursor-pointer border-transparent bg-white/80 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {layer}
                  </button>

                  {disabled && (
                    <div className="pointer-events-none absolute left-0 bottom-full mb-2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[11px] text-white opacity-0 shadow-md transition-opacity peer-hover:opacity-100">
                      {reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend card */}
          <div className="relative flex h-[80px] w-[480px] flex-col justify-between rounded-lg border border-gray-300 bg-white/90 px-4 py-2 text-[13px] text-slate-700 shadow-sm backdrop-blur-sm">
            {/* Info icon for all layers */}
            <div className="absolute right-2 top-1.5">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Layer description"
                  className="peer flex items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1 text-slate-700 transition hover:cursor-pointer hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
                </button>
                <div className="pointer-events-none absolute left-0 bottom-full z-10 mb-3 w-80 rounded-md bg-slate-700 px-3 py-2 text-[11px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                  {getLayerTooltip(activeHexLayer)}
                </div>
              </div>
            </div>

            {/* Title only (description moved to tooltip) */}
            <div className="pr-10">
              <span className="text-[13px] font-semibold uppercase tracking-wide text-slate-700">
                {titleText}
              </span>
            </div>

            {/* Horizontal gradient + ticks */}
            <div className="mt-1">
              {activeHexLayer === HexLayerType.DELTA && <DeltaLegendBody />}
              {activeHexLayer === HexLayerType.DENSITY && <DensityLegendBody />}
              {activeHexLayer === HexLayerType.CHURN && <ChurnLegendBody />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexLegend;
