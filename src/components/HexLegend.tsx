"use client";

import { HexLayerType } from "@shared/types";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const Bar = ({ gradient }: { gradient: string }) => (
  <div className="mb-1 h-3 w-full rounded-full border border-gray-200">
    <div className="h-full w-full rounded-full" style={{ background: gradient }} />
  </div>
);

const DeltaLegend = () => (
  <>
    <div className="mb-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Delta</div>
      <div className="text-[10px] text-slate-500">Hour-over-hour change in vehicle count</div>
    </div>
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

const DensityLegend = () => (
  <>
    <div className="mb-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Density
      </div>
      <div className="text-[10px] text-slate-500">Total vehicle count</div>
    </div>
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

const ChurnLegend = () => (
  <>
    <div className="mb-1 flex items-start justify-between gap-2">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Churn
        </div>
        <div className="text-[10px] text-slate-500">
          Hour-over-hour vehicle entries + vehicle exits
        </div>
      </div>

      <div className="relative mt-[1px] group text-gray-700">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="cursor-pointer"
          size="lg"
          color="currentColor"
        />
        <div className="pointer-events-none absolute right-[-12px] bottom-full z-10 mb-3 w-64 rounded-md bg-slate-900 px-2 py-1.5 text-[10px] leading-snug text-slate-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <p className="mb-1 font-semibold text-[12px]">What is Churn?</p>
          <p>
            Churn counts how many vehicles entered <span className="font-semibold">plus</span> how
            many vehicles left a hex over the last hour.
          </p>
          <p className="mb-1 mt-1 font-semibold text-[12px]">How does it differ from Delta?</p>
          <p>
            Delta only shows the <span className="font-semibold">net change</span> in vehicle count.
            A hex can have a small delta but high churn if a lot of vehicles both arrive and leave;
            churn highlights these “hot” movement zones.
          </p>
        </div>
      </div>
    </div>

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
  const { activeHexLayer } = useView();

  if (!activeHexLayer) return null;

  return (
    <div className=" absolute bottom-0 right-1/2 translate-x-1/2 mb-8">
      <div className="flex h-[114px] flex-col justify-end">
        <div className="pointer-events-auto w-[350px] rounded-lg border border-gray-300 bg-white/85 px-3 pb-1 pt-2 text-xs text-gray-800 shadow-sm backdrop-blur-sm">
          {activeHexLayer === HexLayerType.DELTA && <DeltaLegend />}
          {activeHexLayer === HexLayerType.DENSITY && <DensityLegend />}
          {activeHexLayer === HexLayerType.CHURN && <ChurnLegend />}
        </div>
      </div>
    </div>
  );
};

export default HexLegend;
