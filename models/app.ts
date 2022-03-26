export interface App {
  HMS: string[];
  GMS: string[];
  versionName: string;
  uploadDate: string;
  apkCreationTime: string;
  huaweiAppId: string;
  androidMarketMetaData: string;
  huaweiMetadata: string;
  permissions: string;
}

export interface AnalyzerResult {
  [packageName: string]: App;
}
