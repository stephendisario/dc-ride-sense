type Snapshot = {
    [timestamp: string]: {
      [zoneId: string]: number;
    };
  };

type ActiveLayer =  {fc: any, source: 'grid-source' | 'road-block-source' | 'dc-h3', layer: any, zoneType: ZoneType}

type HexDelta = { h3: string; delta: number };

declare module "*.geojson";
declare module "*.json";