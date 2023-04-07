export enum ApkSource {
  APK_SUPPORT = 'apk.support',
  APPS_EVOZI = 'apps.evozi',
}

export interface ApkDownloadInfo {
  packageName: string;
  downloadLink?: string;
  uploadDate?: string;
  apkSize?: string;
  versionName?: string;
  source: ApkSource;
}
