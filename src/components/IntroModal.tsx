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
  const [autoOpen, setAutoOpen] = useState(false);

  // Auto-open once per browser (localStorage)
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setAutoOpen(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const isOpen = autoOpen || manualOpen;

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setAutoOpen(false);
    onCloseManual?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-[380px] max-w-[92vw] rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-xs text-slate-900 shadow-lg backdrop-blur-md">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                Welcome to DC Ride Sense
              </div>
              <div className="text-[11px] text-slate-600">
                Explore how dockless bikes and scooters move across DC throughout the day.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="mt-[2px] text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Close intro"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2 text-[11px] text-slate-700">
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Time controls (bottom left)
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Use the date picker to move between days.</li>
              <li>Drag the hour slider or tap interesting hours to jump to key times.</li>
              <li>All hex colors update to match the selected hour.</li>
            </ul>
          </div>

          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Map layers (bottom right)
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>
                Switch between <span className="font-semibold">Delta</span>,{" "}
                <span className="font-semibold">Density</span>, and{" "}
                <span className="font-semibold">Churn</span> views.
              </li>
              <li>Toggle DC layers (e.g., Metro, bike lanes) and providers in view.</li>
            </ul>
          </div>

          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Hex details
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Hover to preview a hex; click to lock the popup in place.</li>
              <li>The popup sparkline shows how that hex changes across the day.</li>
              <li>
                In churn view, high churn can highlight “hot” movement zones even when delta is
                small.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full cursor-pointer border border-gray-300 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
