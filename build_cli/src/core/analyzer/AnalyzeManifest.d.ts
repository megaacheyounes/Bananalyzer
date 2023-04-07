export interface AndroidManifestResult {
    appName: string;
}
export declare const analyzeManifestFile: (manifestFilePath: string) => Promise<AndroidManifestResult>;
