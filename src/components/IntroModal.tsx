"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const STORAGE_KEY = "dcrs_seen_intro_v1";

type IntroModalProps = {
  manualOpen?: boolean;
  onCloseManual?: () => void;
};

const IntroModal = ({ manualOpen = false, onCloseManual }: IntroModalProps) => {
  const [open, setOpen] = useState(false);

  // Auto-open once per browser (localStorage)
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setOpen(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // If header explicitly opens it, sync that into local state
  useEffect(() => {
    if (manualOpen) {
      setOpen(true);
    }
  }, [manualOpen]);

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setOpen(false);
    onCloseManual?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={handleClose} // click on backdrop closes
    >
      <div
        className="w-[660px] max-w-[94vw] rounded-2xl border border-gray-300 bg-white/95 px-6 py-4 text-[14px] text-slate-700 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="text-lg font-semibold tracking-tight text-slate-800">
              Welcome to DC Ride Sense
            </div>
            <div className=" text-[13px] text-slate-500">Explore micromobility patterns</div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="mt-[2px] cursor-pointer text-slate-400 hover:text-slate-600"
            aria-label="Close intro"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 text-[14px] text-slate-700">
          {/* How it works */}
          <div>
            <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              How it works
            </div>
            <p className="leading-snug text-slate-700">
              Every hour, DC Ride Sense captures a snapshot of parked micromobility (scooters and
              bikes) vehicles in DC. Their coordinates are then aggregated into hex-level metrics
              that power the Activity sparkline and the Delta, Density, and Churn map layers.
            </p>
          </div>

          {/* What you can explore */}
          <div>
            <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              What you can explore
            </div>
            <ul className="ml-4 list-disc space-y-1.5 leading-snug text-slate-700">
              <li>
                <span className="font-semibold">Activity</span> – When is micromobility most popular
                during the day?
              </li>
              <li>
                <span className="font-semibold">Delta</span> – Where are bikes and scooters moving
                to and from?
              </li>
              <li>
                <span className="font-semibold">Density</span> – How is vehicle supply spread across
                the city?
              </li>
              <li>
                <span className="font-semibold">Churn</span> – Which areas are hot spots for
                micromobility activity?
              </li>
            </ul>
          </div>
        </div>

        {/* Footer note + button */}
        <div className="mt-4 border-t border-slate-200 pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Data notes
            </div>
            <p className="text-[12px] leading-snug text-slate-500">
              Trip counts are approximate and should be treated as lower-bound estimates.
            </p>
            <p className="text-[12px] leading-snug text-slate-500">
              Some movement may reflect operator rebalancing rather than rider trips.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded-full border border-gray-300 bg-white/90 px-3 py-1.5 text-[13px] font-medium text-slate-800 hover:bg-slate-50"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
