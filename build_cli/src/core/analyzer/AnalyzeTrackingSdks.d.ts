export interface TrackingSdkResult {
    name: string;
    version: string;
    meetsRequirements: boolean;
}
export interface TrackingSdksResult {
    sdksNumber: number;
    sdks: TrackingSdkResult[];
}
export declare const analyzeTrackingSdks: (decompileFolderPath: string) => Promise<TrackingSdksResult>;
