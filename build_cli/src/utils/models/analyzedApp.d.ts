export declare type AnalyzedApp = AnalyzedManifest & AnalyzedSDKs & AnalyzedApk;
export declare type AnalyzedManifest = {
    packageName: string;
    versionName: string;
    huaweiAppId: string;
    googleMetadata: string[];
    huaweiMetadata: string[];
    googlePermissions: string[];
    huaweiPermissions: string[];
    googleActivities: string[];
    huaweiActivities: string[];
    googleServices: string[];
    huaweiServices: string[];
    googleMessagingServices: string[];
    huaweiMessagingServices: string[];
};
export declare type AnalyzedSDKs = {
    GMS: string[];
    HMS: string[];
    others?: string[];
};
export declare type AnalyzedApk = {
    storeUploadDate: string;
    apkCreationTime: string;
};
