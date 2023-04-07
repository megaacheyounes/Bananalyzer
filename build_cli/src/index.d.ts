/**
 * No Copyright 2022 Younes Megaache
 * All right can be abused (respectfully)
 */
declare const _default: {
    getDownloadLink: (packageName: string, mergeSplitApk?: boolean) => Promise<import("./utils/models/storeInfo").ApkDownloadInfo | undefined>;
    analyzeAPKs: (apks: import("./utils/models/apk").APK[], keepApks?: boolean) => Promise<import("./utils/models/analyzedApp").AnalyzedApp[]>;
};
export default _default;
