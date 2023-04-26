export type AnalyzedApp = AnalyzedManifest & AnalyzedSDKs & AnalyzedApk;

export type SdkVersion = {
  name: string;
  version: string;
  accuracy: 'high' | 'medium' | 'low';
  requiredVersion?: string;
  meetsRequirement?: boolean;
};

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
  hmsVersions: SdkVersion[];
};

export type AnalyzedSDKs = {
  GMS: string[];
  HMS: string[];
  others?: string[];
};

export type AnalyzedApk = {
  storeUploadDate: string;
  apkCreationTime: string;
};
