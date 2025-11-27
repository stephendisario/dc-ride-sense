"use client";
import { HexLayerType } from "@shared/types";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { isBefore } from "date-fns";
import { useEffect } from "react";
import { HEX_LAYERS } from "@shared/constants";

const CHURN_AVAILABLE_FROM = new Date(2025, 10, 15); // 2025-11-15

const Bar = ({ gradient }: { gradient: string }) => (
  <div className="mb-1 h-3 w-full rounded-full border border-gray-200">
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
    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
      <span>Fewer vehicles</span>
      <span>More vehicles</span>
    </div>
  </>
);

const DensityLegendBody = () => (
  <>
    <Bar
      gradient="
        linear-gradient(
          to right,
          #1b5d8a,
          #238a91,
          #2fab84,
          #64c06b,
          #9cd256,
          #d7e24b,
          #fff3a6
        )
      "
    />
    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
      <span>1</span>
      <span>5</span>
      <span>20</span>
      <span>100+</span>
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
    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
      <span>5</span>
      <span>10</span>
      <span>20+</span>
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
        {/* Hex layer segmented control in its own pill above the legend */}
        <div className="flex flex-row items-center rounded-full border border-gray-300 bg-white/85 px-1 py-0.5 shadow-sm backdrop-blur-sm">
          {HEX_LAYERS.map((layer) => {
            const isActive = activeHexLayer === layer;
            const disabled =
              layer === HexLayerType.CHURN && date && isBefore(date, CHURN_AVAILABLE_FROM);

            const reason = "Churn is only available starting Nov 15, 2025.";

            return (
              <div key={layer} className="flex">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setHexLayer(layer)}
                  className={`peer justify-center px-3 py-0.5 rounded-full border text-[10px] transition cursor-pointer
                    ${
                      disabled
                        ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50"
                        : isActive
                          ? "bg-slate-700 border-slate-900 text-slate-100 shadow-sm font-bold"
                          : "bg-white/80 border-transparent text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                >
                  {layer.toUpperCase()}
                </button>

                {disabled && (
                  <div className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition-opacity peer-hover:opacity-100">
                    {reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend card below */}
        <div className="w-[380px] h-[72px] rounded-lg border border-gray-300 bg-white/85 px-3 py-1 text-xs text-gray-800 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div className=" flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="text-[11px] font-medium uppercase text-slate-700">{titleText}</div>

              {activeHexLayer === HexLayerType.CHURN && (
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="cursor-pointer justify-center peer text-slate-700"
                  size="sm"
                />
              )}

              <div className="pointer-events-none absolute left-0 bottom-full z-10 mb-1 w-72 rounded-md bg-slate-700 px-2 py-1.5 text-[10px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity peer-hover:opacity-100">
                <p className="mb-1 text-[12px] font-semibold">What is Churn?</p>
                <p>
                  Churn counts how many vehicles entered <span className="font-semibold">plus</span>{" "}
                  how many vehicles left a hex over the last hour.
                </p>
                <p className="mb-1 mt-1 text-[12px] font-semibold">
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

          <div className="text-[10px] text-slate-500 relative top-[-4px]">{descriptionText}</div>

          <div className="">
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
