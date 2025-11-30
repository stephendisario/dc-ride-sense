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

const Bar = ({ gradient }: { gradient: string }) => (
  <div className="mb-1 h-3.5 w-full rounded-full border border-gray-200">
    <div className="h-full w-full rounded-full" style={{ background: gradient }} />
  </div>
);

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
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {DELTA_RANGE_MIN}
        </span>
      </div>
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {DELTA_RANGE_MAX}
        </span>
      </div>
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
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {DENSITY_RANGE_MIN}
        </span>
      </div>
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {DENSITY_RANGE_MAX}
        </span>
      </div>
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
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {CHURN_RANGE_MIN}
        </span>
      </div>
      <div className="flex items-start text-[10px] text-slate-600">
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
        >
          {CHURN_RANGE_MAX}
        </span>
      </div>
    </div>
  </>
);

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

  let titleText = "";
  let descriptionText = "";

  if (activeHexLayer === HexLayerType.DELTA) {
    titleText = "Delta";
    descriptionText = "Hour-over-hour change in vehicle count";
  } else if (activeHexLayer === HexLayerType.DENSITY) {
    titleText = "Density";
    descriptionText = "Total vehicle count";
  } else if (activeHexLayer === HexLayerType.CHURN) {
    titleText = "Churn";
    descriptionText = "Hour-over-hour vehicle entries + vehicle exits";
  }

  return (
    <div className="absolute bottom-4 right-1/2 translate-x-1/2">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {/* Hex layer segmented control, centered above legend */}
        <div className="flex flex-row items-center rounded-full border border-gray-300 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur-sm">
          {HEX_LAYERS.map((layer) => {
            const isActive = activeHexLayer === layer;
            const disabled =
              layer === HexLayerType.CHURN && date && isBefore(date, CHURN_AVAILABLE_FROM);

            const reason = "Churn is only available starting Nov 15, 2025.";

            return (
              <div key={layer} className="relative flex">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setHexLayer(layer)}
                  className={`peer justify-center px-3 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wide transition
                    ${
                      disabled
                        ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-default"
                        : isActive
                          ? "bg-slate-700 border-slate-900 text-slate-100 shadow-sm cursor-pointer"
                          : "bg-white/80 border-transparent text-slate-700 hover:bg-slate-50 cursor-pointer"
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

        {/* Legend card below */}
        <div className="relative flex h-[80px] w-[480px] flex-col justify-between rounded-lg border border-gray-300 bg-white/90 px-4 py-2 text-[13px] text-slate-700 shadow-sm backdrop-blur-sm">
          {/* Churn help icon - top right */}
          {activeHexLayer === HexLayerType.CHURN && (
            <div className="absolute right-2 top-1.5">
              <div className="relative">
                <button
                  type="button"
                  aria-label="What is churn?"
                  className="peer flex items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1 text-slate-700 transition hover:cursor-pointer hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
                </button>

                <div className="pointer-events-none absolute left-0 bottom-full z-10 mb-3 w-80 rounded-md bg-slate-700 px-3 py-2 text-[11px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                  <p className="mb-1 text-[13px] font-semibold">What is Churn?</p>
                  <p>
                    Churn counts how many vehicles entered{" "}
                    <span className="font-semibold">plus</span> how many vehicles left a hex over
                    the last hour.
                  </p>
                  <p className="mb-1 mt-2 text-[13px] font-semibold">
                    How does it differ from Delta?
                  </p>
                  <p>
                    Delta only shows the <span className="font-semibold">net change</span> in
                    vehicle count. A hex can have a small delta but high churn if a lot of vehicles
                    both arrive and leave; churn highlights these “hot” movement zones.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title + description inline */}
          <div className="pr-10">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-slate-700">
              {titleText}
            </span>
            <span className="ml-2 text-[12px] text-slate-600">{descriptionText}</span>
          </div>

          {/* Gradient + ticks */}
          <div className="mt-1">
            {activeHexLayer === HexLayerType.DELTA && <DeltaLegendBody />}
            {activeHexLayer === HexLayerType.DENSITY && <DensityLegendBody />}
            {activeHexLayer === HexLayerType.CHURN && <ChurnLegendBody />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexLegend;
