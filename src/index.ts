import { getSupportedSdks } from './core/analyzer/sdkAnalyzer/baseSdks';
import { getAppDetails } from './core/appDetailsScrapper';
/**
 * No Copyright 2022 Younes Megaache
 * All right can be abused (respectfully)
 */

import { analyzeAPKs } from './core/analyzer';

import { getDownloadLink } from './core/downloader';

import { downloadAPK } from './core/downloader';
export default {
  getDownloadLink: (packageName: string) => getDownloadLink(packageName, true, true),
  downloadAPK: (packageName: string, useExistingApk = true) => downloadAPK(packageName, useExistingApk, true, true),
  analyzeAPKs,
  getAppDetails: (packageName: string) => getAppDetails(packageName, true),
  getSupportedSdks
};
