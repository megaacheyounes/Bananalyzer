export enum ApkSource {
  APK_SUPPORT = 'apk.support',
  EVONZI = 'apps.evoni',
}

export interface StoreInfo {
  packageName: string;
  downloadLink?: string;
  uploadDate?: string;
  apkSize?: string;
  versionName?: string;
  source: ApkSource;
}
