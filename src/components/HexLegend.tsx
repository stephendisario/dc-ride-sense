"use client";

import { useEffect, useState } from "react";
import { HexLayerType } from "@shared/types";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faGrip, faRightLeft } from "@fortawesome/free-solid-svg-icons";
import { isBefore } from "date-fns";
import { HEX_LAYERS } from "@shared/constants";
import {
  CHURN_LINEAR_GRADIENT_COL,
  CHURN_LINEAR_GRADIENT_ROW,
  CHURN_RANGE_MAX,
  CHURN_RANGE_MIN,
  DELTA_LINEAR_GRADIENT_COL,
  DELTA_LINEAR_GRADIENT_ROW,
  DELTA_RANGE_MAX,
  DELTA_RANGE_MIN,
  DENSITY_LINEAR_GRADIENT_COL,
  DENSITY_LINEAR_GRADIENT_ROW,
  DENSITY_RANGE_MAX,
  DENSITY_RANGE_MIN,
} from "@/lib/constants";

const CHURN_AVAILABLE_FROM = new Date(2025, 10, 15); // 2025-11-15

const legendBody = (
  gradientStringRow: string,
  gradientStringCol: string,
  min: string,
  max: string
) => (
  <div>
    <div className="hidden md:block">
      <div className="mb-1 h-3.5 w-full rounded-full border border-gray-200">
        <div className="h-full w-full rounded-full" style={{ background: gradientStringRow }} />
      </div>
      <div className="mt-0.5 mb-0.5 flex justify-between text-[11px] text-slate-600">
        <div className="flex items-start text-[10px] text-slate-600">
          <span
            className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
          >
            {min}
          </span>
        </div>
        <div className="flex items-start text-[10px] text-slate-600">
          <span
            className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
          >
            {max}
          </span>
        </div>
      </div>
    </div>

    <div className="inline-flex w-full md:hidden ml-2.75">
      <div className=" h-[100px] w-3.5 rounded-full border border-gray-200">
        <div className="h-full w-full rounded-full" style={{ background: gradientStringCol }} />
      </div>
      <div className=" flex flex-col justify-between text-[11px] text-slate-600">
        <div className="flex items-start text-[10px] text-slate-600">
          <span
            className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
          >
            {max === DELTA_RANGE_MAX ? "+" : max}
          </span>
        </div>
        <div className=" flex items-start text-[10px] text-slate-600">
          <span
            className={`inline-flex items-center rounded-full bg-slate-100 px-1.5 py-[1px] font-mono tabular-nums`}
          >
            {min === DELTA_RANGE_MIN ? "+" : min}
            </span>
        </div>
      </div>
    </div>
  </div>
);

const HexLegend = () => {
  const { activeHexLayer, setActiveHexLayer, date } = useView();
  const [showLayerButton, setShowLayerButton] = useState<boolean>(false);
  const [showMobileInfo, setShowMobileInfo] = useState<boolean>(false);

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

  const layerButton = () => (
    <div
      className={`${!showLayerButton ? "hidden" : "flex"} h-[36px] md:flex flex-row items-center rounded-full border border-gray-300 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur-sm`}
    >
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
  );

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
    <div className="z-10 pointer-events-auto flex md:flex-col items-center gap-2">
      {/* Hex layer segmented control, centered above legend */}
      <div className="hidden md:flex">{layerButton()}</div>

      {/* Legend card below */}
      <div className="relative md:w-full flex flex-col justify-between rounded-lg md:px-4 py-2 gap-1.75 md:gap-0 text-[13px] text-slate-700 md:shadow-sm md:backdrop-blur-sm md:border md:border-gray-300 md:bg-white/90">
        {/* Churn help icon - top right */}
        {activeHexLayer === HexLayerType.CHURN && (
          <div className="absolute right-2 top-1.5 hidden md:block">
            <div className="relative">
              <button
                type="button"
                aria-label="What is churn?"
                className="w-6 h-6 peer flex items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1 text-slate-700 transition hover:cursor-pointer hover:bg-slate-50"
              >
                <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
              </button>

              <div className="pointer-events-none absolute -left-15 bottom-full z-10 mb-3 w-80 rounded-md bg-slate-700 px-3 py-2 text-[11px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                <p className="mb-1 text-[13px] font-semibold">What is Churn?</p>
                <p>
                  Churn counts how many vehicles entered <span className="font-semibold">plus</span>{" "}
                  how many vehicles left a hex over the last hour.
                </p>
                <p className="mb-1 mt-2 text-[13px] font-semibold">
                  How does it differ from Delta?
                </p>
                <p>
                  Delta only shows the <span className="font-semibold">net change</span> in vehicle
                  count. A hex can have a small delta but high churn if a lot of vehicles both
                  arrive and leave; churn highlights these “hot” movement zones.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title + description inline */}
        <div className="md:pr-10">
          <span className="hidden md:inline text-[13px] font-semibold uppercase tracking-wide text-slate-700">
            {titleText}
          </span>
          <div className="inline-flex gap-2 items-center">
            <button
              onClick={() => setShowLayerButton((prev) => !prev)}
              className={`flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 shadow-sm focus:bg-slate-50`}
            >
              <span className="flex h-4 w-4 items-center justify-center">
                {activeHexLayer === HexLayerType.DELTA ? (
                  <span className="text-[18px] leading-none text-slate-700">▲</span>
                ) : (
                  <FontAwesomeIcon
                    icon={activeHexLayer === HexLayerType.DENSITY ? faGrip : faRightLeft}
                    className="h-4 w-4 text-slate-700"
                  />
                )}
              </span>
            </button>
            <div className="flex md:hidden">{layerButton()}</div>
          </div>
          <span className="hidden md:inline-flex ml-2 text-[12px] text-slate-600">
            {descriptionText}
          </span>
        </div>

        {/* Gradient + ticks */}
        <div className="mt-1">
          {activeHexLayer === HexLayerType.DELTA &&
            legendBody(
              DELTA_LINEAR_GRADIENT_ROW,
              DELTA_LINEAR_GRADIENT_COL,
              DELTA_RANGE_MIN,
              DELTA_RANGE_MAX
            )}
          {activeHexLayer === HexLayerType.DENSITY &&
            legendBody(
              DENSITY_LINEAR_GRADIENT_ROW,
              DENSITY_LINEAR_GRADIENT_COL,
              DENSITY_RANGE_MIN,
              DENSITY_RANGE_MAX
            )}
          {activeHexLayer === HexLayerType.CHURN &&
            legendBody(
              CHURN_LINEAR_GRADIENT_ROW,
              CHURN_LINEAR_GRADIENT_COL,
              CHURN_RANGE_MIN,
              CHURN_RANGE_MAX
            )}
        </div>

        {/* Mobile-only: info icon under vertical gradient, aligned + non-shifting */}
        <div className=" md:hidden flex flex-col items-start">
          <div className="relative">
            <button
              type="button"
              aria-label="Layer description"
              onClick={() => setShowMobileInfo((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/90 shadow-sm focus:bg-slate-50"
            >
              <span className="flex h-4 w-4 items-center justify-center">
                <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4 text-slate-700" />
              </span>
            </button>

            {showMobileInfo && (
              <div
                className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-2
                  w-60 rounded-md bg-slate-700 px-3 py-2
                  text-[11px] leading-snug text-slate-100 shadow-md
                "
              >
                <p>{descriptionText}</p>
                {activeHexLayer === HexLayerType.CHURN && (
                  <>
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
                      vehicle count. A hex can have a small delta but high churn if a lot of
                      vehicles both arrive and leave; churn highlights these “hot” movement zones.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexLegend;
