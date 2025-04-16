import { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";

export const bikeLanesLayerStyle: LineLayerSpecification = {
  id: "bike-lanes-layer",
  type: "line",
  paint: {
    "line-color": "#00ff22",
    "line-width": 2,
  },
  source: "",
};

export const zonesLayerStyle: FillLayerSpecification = {
  id: "zones-layer",
  type: "fill",
  source: "",
  paint: {
    "fill-color": [
      "step",
      ["feature-state", "count"],
      "#f7fcf5", // 0
      1,
      "#e5f5e0", // 1–9
      10,
      "#c7e9c0", // 10–19
      20,
      "#a1d99b", // 20–49
      50,
      "#74c476", // 50–99
      100,
      "#238b45", // 100–149
      150,
      "#005a32", // 150+
    ],
    "fill-outline-color": "black",
    "fill-opacity": 0.7,
  },
};
