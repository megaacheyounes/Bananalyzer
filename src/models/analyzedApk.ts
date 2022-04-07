export interface AnalyzedApk {
  packageName: string;
  versionName: string;
  uploadDate: string;
  apkCreationTime: string;
  huaweiAppId: string;
  GMS: string[];
  HMS: string[];
  googleMetadatas: string[];
  huaweiMetadatas: string[];
  googlePermissions: string[];
  huaweiPermissions: string[];
  googleActivities: string[];
  huaweiActivities: string[];
  googleServices: string[];
  huaweiServices: string[];
  googleMessagingServices: string[];
  huaweiMessagingServices: string[];
}
