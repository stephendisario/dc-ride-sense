import { useEffect, useMemo, useRef } from "react";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import { H3_9_LAYER_ID } from "@/lib/constants";
import { useView } from "@/stores/views";
import {
  HexLayerType,
  Providers,
  SparklinePoint,
  TimestampSnapshot,
  ZoneType,
} from "@shared/types";
import { createRoot } from "react-dom/client";
import Popup from "@/components/Popup";
import { useGetSnapshots } from "@/api/getSnapshot";
import { format } from "date-fns";
import { getMetricByZone } from "@/lib/helper";
import { useProviderStore } from "@/stores/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

//helper to build array for sparkline
const metricSeriesForHex = (
  bundle: TimestampSnapshot,
  selectedProviders: Providers[],
  activeHexLayer: HexLayerType,
  h3Id: string
): SparklinePoint[] | null => {
  const timestamps = Object.keys(bundle).sort();

  //array of hex layer metric values for given date
  const points: SparklinePoint[] = timestamps.map((ts) => {
    const snapshot = bundle[ts];
    const metricsByZone = getMetricByZone(snapshot, selectedProviders, activeHexLayer);
    const value = metricsByZone[h3Id] ?? 0;

    return {
      ts,
      value,
    };
  });

  const hasNonZero = points.some((p) => p.value !== 0);
  return hasNonZero ? points : null;
};

export const useHexHover = () => {
  const { map, activeHexLayer, date } = useView();
  const { selectedProviders } = useProviderStore();

  const { data: bundle } = useGetSnapshots(format(date, "yyyy-MM-dd"), ZoneType.ZoneH3_9);

  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  const lockedHexRef = useRef<string | null>(null);

  const getSeriesForHex = useMemo(
    () =>
      bundle
        ? (h3Id: string) => metricSeriesForHex(bundle, selectedProviders, activeHexLayer, h3Id)
        : null,
    [bundle, selectedProviders, activeHexLayer]
  );

  // initialize popup + root
  useEffect(() => {
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
    }

    if (!popupContainerRef.current) {
      popupContainerRef.current = document.createElement("div");
      popupRootRef.current = createRoot(popupContainerRef.current);
      popupRef.current.setDOMContent(popupContainerRef.current);
    }
  }, []);

  useEffect(() => {
    const popup = popupRef.current;
    const root = popupRootRef.current;

    if (!map || !popup || !root) return;

    // eslint-disable-next-line
    const showPopupForFeature = (e: MapMouseEvent, feature: any) => {
      const h3Id: string = feature.id;

      const series = getSeriesForHex ? getSeriesForHex(h3Id) : null;

      if (series == null) {
        popup.remove();
        map.getCanvas().style.cursor = "";
        return;
      }

      map.getCanvas().style.cursor = "pointer";

      root.render(
        <QueryClientProvider client={queryClient}>
          <Popup h3Id={h3Id} series={series} lockedHexRef={lockedHexRef} popup={popup} />
        </QueryClientProvider>
      );

      popup.setLngLat(e.lngLat);
      if (!popup.isOpen()) {
        popup.addTo(map);
      }
    };

    const handleMove = (e: MapMouseEvent) => {
      if (lockedHexRef.current) return; // don't move when locked

      const feature = e.features?.[0];
      if (!feature) {
        popup.remove();
        map.getCanvas().style.cursor = "";
        return;
      }

      showPopupForFeature(e, feature);
    };

    const handleClick = (e: MapMouseEvent) => {
      const feature = e.features?.[0];

      if (feature && !lockedHexRef.current) {
        showPopupForFeature(e, feature);
        lockedHexRef.current = feature.id as string;
      }
      //remove popup on same hex click
      else if (feature && lockedHexRef.current === feature.id) {
        lockedHexRef.current = null;
        popup.remove();
      }
      //switch popup when clicking new hex
      else if (feature && lockedHexRef.current && lockedHexRef.current !== feature.id) {
        showPopupForFeature(e, feature);
        lockedHexRef.current = feature.id as string;
      } else {
        lockedHexRef.current = null;
        map.getCanvas().style.cursor = "";
        popup.remove();
      }
    };

    const handleLeave = () => {
      if (lockedHexRef.current) return;
      map.getCanvas().style.cursor = "";
      popup.remove();
    };

    map.on("mousemove", H3_9_LAYER_ID, handleMove);
    map.on("mouseleave", H3_9_LAYER_ID, handleLeave);
    map.on("click", H3_9_LAYER_ID, handleClick);

    return () => {
      map.off("mousemove", H3_9_LAYER_ID, handleMove);
      map.off("mouseleave", H3_9_LAYER_ID, handleLeave);
      map.off("click", H3_9_LAYER_ID, handleClick);
      if (!lockedHexRef.current) {
        popup.remove();
      }
    };
  }, [map, getSeriesForHex]);

  useEffect(() => {
    const popup = popupRef.current;
    const root = popupRootRef.current;

    // nothing to do if no popup, no root, or nothing locked
    if (!popup || !root || !lockedHexRef.current) return;
    if (!getSeriesForHex) return;

    const h3Id = lockedHexRef.current;
    const series = getSeriesForHex(h3Id);

    if (!series) {
      // if this hex has no data for the new layer, close the popup
      popup.remove();
      lockedHexRef.current = null;
      return;
    }

    root.render(
      <QueryClientProvider client={queryClient}>
        <Popup h3Id={h3Id} series={series} lockedHexRef={lockedHexRef} popup={popup} />
      </QueryClientProvider>
    );
  }, [getSeriesForHex]);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    lockedHexRef.current = null;
    popup.remove();
  }, [date]);
};
