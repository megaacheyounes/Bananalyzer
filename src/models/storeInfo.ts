export enum ApkSource {
  APK_SUPPORT = 'apk.support',
  APPS_EVOZI = 'apps.evozi',
}

export interface StoreInfo {
  packageName: string;
  downloadLink?: string;
  uploadDate?: string;
  apkSize?: string;
  versionName?: string;
  source: ApkSource;
}
