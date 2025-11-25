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
      <div className="w-[600px] max-w-[92vw] rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-xs text-slate-900 shadow-lg backdrop-blur-md">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                Welcome to DC Ride Sense
              </div>
              <div className="text-[11px] text-slate-600">
                A micromobility map for seeing when and how dockless bikes and scooters move around
                DC.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="mt-[2px] cursor-pointer text-slate-400 hover:text-slate-600"
            aria-label="Close intro"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2 text-[11px] text-slate-700">
          {/* What / Why */}
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              What you can explore
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Are people actually using these vehicles?</li>
              <li>When and where do bikes and scooters cluster?</li>
              <li>
                Are there “hot spots” near Metro, nightlife, or offices? Is this commute traffic or
                something else?
              </li>
              <li>
                Are they acting as an alternate way to get around the city or just short-hop trips?
              </li>
            </ul>
          </div>

          {/* How it works */}
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              How the map is built
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>
                Every hour, the app takes a snapshot of all free Lime, Veo, and Hopp vehicles.
              </li>
              <li>Each vehicle is mapped into a 300m hex, covering the city in a grid of zones.</li>
              <li>
                From hour to hour, the app computes:
                <ul className="mt-0.5 ml-4 list-disc space-y-0.5">
                  <li>
                    <span className="font-semibold">Density</span> – how many vehicles are parked in
                    each hex.
                  </li>
                  <li>
                    <span className="font-semibold">Delta</span> – net change since the last hour
                    (arrivals minus departures).
                  </li>
                  <li>
                    <span className="font-semibold">Churn</span> – total movement in and out, even
                    when the net change is small.
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Why the layers matter */}
          <div>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Why the layers matter
            </div>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>
                Use <span className="font-semibold">Density</span> to see where vehicles are
                available.
              </li>
              <li>
                Use <span className="font-semibold">Delta</span> to spot where vehicles are flowing
                to or disappearing from each hour.
              </li>
              <li>
                Use <span className="font-semibold">Churn</span> to highlight “hot” movement zones,
                even when the totals stay balanced.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer note + button */}
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[10px] text-slate-500">
            Counts are estimates from hourly snapshots of free vehicles, not exact trip totals.
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded-full border border-gray-300 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
            >
              Got it, let me explore!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
