type Snapshot = {
    [timestamp: string]: {
      [zoneId: string]: number;
    };
  };

type ActiveLayer =  {fc: any, source: 'grid-source' | 'road-block-source' | 'dc-h3', layer: any, zoneType: ZoneType}

declare module "*.geojson";
declare module "*.json";