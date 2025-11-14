export interface LimeVehicle {
    bike_id: string;
    lat: number;
    lon: number;
    is_reserved: 0 | 1;
    is_disabled: 0 | 1;
    vehicle_type: string;
}
export interface LimeApiResponse {
    last_updated: number;
    data: {
        bikes: LimeVehicle[];
    };
}

export interface ApiResponseWrapper {
    feed: LimeApiResponse;
    provider: Providers;
}

export type ZoneMetrics = {
    density: number;
    delta: number;
    churn: number;
};

export type Snapshot = {
    [P in Providers]?: { [zoneId: string]: ZoneMetrics };
};

export type TimestampSnapshot = {
    [timestamp: string]: Snapshot;
};

export enum Providers {
    LIME = 'LIME',
    VEO = 'VEO',
    HOPP = 'HOPP',
    TOTAL = 'TOTAL',
}

export enum ZoneType {
    Zone1000 = '1000m',
    Zone300 = '300m',
    ZoneRoadBlock = 'road-block',
    ZoneH3_9 = 'h3-9',
}
