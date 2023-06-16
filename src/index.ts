import { decompileApk } from './core/apktool/decompile';
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
  getDownloadLink: (packageName: string, mergeSplitApk = true) => getDownloadLink(packageName, mergeSplitApk, true),
  downloadAPK: (packageName: string, useExistingApk = true, mergeSplitApk = true) => downloadAPK(packageName, useExistingApk, mergeSplitApk, true),
  analyzeAPKs,
  getAppDetails: (packageName: string) => getAppDetails(packageName, true),
  getSupportedSdks,
  decompileApk
};
