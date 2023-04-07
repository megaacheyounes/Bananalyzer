export declare type MinVersion = {
    OAID: string;
    referrer?: string;
};
export declare type SdkVersionLocation = {
    filePathWildcard: string;
    fileContainsExact: string;
    versionRegex: RegExp;
};
export declare type TrackingSDK = {
    name: string;
    minVersion: MinVersion;
    versionSearchLocations: SdkVersionLocation[];
};
export declare const TRACKING_SDKS: TrackingSDK[];
