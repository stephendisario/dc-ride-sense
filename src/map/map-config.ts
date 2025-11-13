import { useEffect } from "react";
import { useGetSnapshots } from "@/api/getSnapshot";
import { ZoneType } from "@/lib/types";
import { HexLayerType, useView } from "@/stores/views";
import { format } from "date-fns";
import { deltaForHour, getSnapshotTimestamp } from "@/lib/helper";
import { ExpressionSpecification, Map } from "mapbox-gl";
import { H3_9_LAYER_ID } from "@/lib/constants";

export const useUpdateMapStyleOnChange = (map: Map | null) => {
  const { date, hour, setHourTripEstimate, isMapLoading, activeHexLayer } = useView();
  const { data: bundle, isLoading: isBundleLoading } = useGetSnapshots(
    format(date, "yyyy-MM-dd"),
    ZoneType.ZoneH3_9
  );

  useEffect(() => {
    if (!map || isMapLoading) return;

    if (isBundleLoading) {
      updateHexColorsLoading(map);
      return;
    }

    if (!bundle) return;

    if(activeHexLayer === HexLayerType.DELTA) updateHexColorsDelta(bundle, hour, map, setHourTripEstimate) 
    else updateHexColorsDensity(bundle, hour, map);

  }, [bundle, hour, map, isBundleLoading, isMapLoading, activeHexLayer]);

};

const updateHexColorsLoading = (map: Map) => {
    map.setPaintProperty(H3_9_LAYER_ID, "fill-color", "#f1f5f9");
  };

  const updateHexColorsDelta = (bundle: Snapshot, hour: number, map: Map, setHourTripEstimate: (t: number) => void) => {
    const delta = deltaForHour(bundle, hour);
    const hourTripEstimate = Object.values(delta).reduce(
      (acc, cur) => (cur > 0 ? cur + acc : acc),
      0
    );
    setHourTripEstimate(hourTripEstimate);

    //TODO: handle midnight
    if (Object.keys(delta).length === 0) {
      updateHexColorsLoading(map);
      return;
    }

    // 3 blues (down), neutral, 3 reds (up)
    const neg1 = "#9ecae1",
      neg2 = "#6baed6",
      neg3 = "#3182bd";
    const zero = "#f1f5f9";
    const pos1 = "#fcae91",
      pos2 = "#fb6a4a",
      pos3 = "#cb181d";

    const v = ["to-number", ["get", ["id"], ["literal", delta]], 0];

    map.setPaintProperty(H3_9_LAYER_ID, "fill-color", [
      "case",
      // not in delta map → neutral
      ["!", ["has", ["id"], ["literal", delta]]],
      zero,

      // negatives
      ["<=", v, -7],
      neg3,
      ["<=", v, -4],
      neg2,
      ["<=", v, -1],
      neg1,

      // positives
      [">=", v, 7],
      pos3,
      [">=", v, 4],
      pos2,
      [">=", v, 1],
      pos1,

      // |Δ| < 1 → neutral
      zero,
    ]);
  };

  const updateHexColorsDensity = (bundle: Snapshot, hour: number, map: Map) => {
    if (!bundle || !map) return;

    const obj = bundle[getSnapshotTimestamp(hour, bundle)];
    // If obj might be a Map or something else, normalize:
    // obj = obj instanceof Map ? Object.fromEntries(obj) : obj;

    const logMin = Math.log(1);
    const logMax = Math.log(101);
    const logRange = logMax - logMin;

    // Strictly strings
    const color0 = "#0b276d";
    const color1 = "#1b5d8a";
    const color2 = "#238a91";
    const color3 = "#2fab84";
    const color4 = "#64c06b";
    const color5 = "#9cd256";
    const color6 = "#d7e24b";
    const color7 = "#fff3a6";

    const expr: ExpressionSpecification = [
      "case",
      // missing id => transparent
      ["!", ["has", ["id"], ["literal", obj]]],
      "#0b276d",
      // below min => transparent
      ["<", ["get", ["id"], ["literal", obj]], 1],
      "#0b276d",
      // otherwise interpolate
      [
        "interpolate",
        ["linear"],
        ["ln", ["+", ["get", ["id"], ["literal", obj]], 1]],
        logMin,
        color0,
        logMin + logRange * 0.15,
        color1,
        logMin + logRange * 0.3,
        color2,
        logMin + logRange * 0.45,
        color3,
        logMin + logRange * 0.6,
        color4,
        logMin + logRange * 0.75,
        color5,
        logMin + logRange * 0.9,
        color6,
        logMax,
        color7,
      ],
    ];

    // Sanity check: no non-strings at color positions
    // (Optional) console.log(JSON.stringify(expr));

    map.setPaintProperty(H3_9_LAYER_ID, "fill-color", expr);
  };
