export type AnalyzedApp = AnalyzedManifest & AnalyzedSDKs & AnalyzedApk;

export type AnalyzedManifest = {
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

export type AnalyzedSDKs = {
  GMS: string[];
  HMS: string[];
  others?: string[];
};

export type AnalyzedApk = {
  uploadDate: string;
  apkCreationTime: string;
};
