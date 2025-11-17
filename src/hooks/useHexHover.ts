import { useEffect } from "react";
import mapboxgl, { Map, MapMouseEvent } from "mapbox-gl";
import { H3_9_LAYER_ID } from "@/lib/constants";
import { useView } from "@/stores/views";

export const useHexHover = (map: Map | null, metricObj: Record<string, number> | null) => {
  const { activeHexLayer } = useView();

  useEffect(() => {
    if (!map || !metricObj) return;

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    const handleMove = (e: MapMouseEvent & { features?: any[] }) => {
      const feature = e.features?.[0];
      if (!feature) {
        popup.remove();
        map.getCanvas().style.cursor = "";
        return;
      }

      const h3Id: string = feature.id;
      const metric = metricObj[h3Id];

      if (!metric) {
        popup.remove();
        map.getCanvas().style.cursor = "";
        return;
      }

      map.getCanvas().style.cursor = "pointer";

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<div style="font-size:12px;">
            <div><strong>${h3Id}</strong></div>
            <div>${activeHexLayer}: ${metric}</div>
          </div>`
        )
        .addTo(map);
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    };

    map.on("mousemove", H3_9_LAYER_ID, handleMove);
    map.on("mouseleave", H3_9_LAYER_ID, handleLeave);

    // cleanup
    return () => {
      map.off("mousemove", H3_9_LAYER_ID, handleMove);
      map.off("mouseleave", H3_9_LAYER_ID, handleLeave);
      popup.remove();
    };
  }, [map, metricObj]);
};
