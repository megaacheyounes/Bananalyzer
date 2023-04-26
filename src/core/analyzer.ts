import debugModule from 'debug';
import { decompileApk } from './apktool/decompile';
('use strict');
/**
 * this script analyzed the apk using the tool appcheck.jar,
 * then parses the bad results generated by this tool into a human readable text thats easy to read does not hurt the eye lol
 *
 */
import fs from 'fs';

import { APP_DATA_FOLDER } from '../consts';
import { AnalyzedApk, AnalyzedApp } from '../models/analyzedApp';
import { APK } from '../models/apk';
import analyzeApkToolYml from './analyzer/AnalyzeApkToolYml';
import { analyzeGmsHmsSdks } from './analyzer/AnalyzeKits';
import analyzeManifest from './analyzer/AnalyzeManifest';

const debug = debugModule('bananalyzer:analyzer');

/**
 *
 * @param {array} apks: list of downloaded apps/apk to analyze, example = [
 * {packageName:"package.name":filePath:"path/to/file.apk", uploadDate:"may 27, 2021"}
 * ]
 * @return {AnalyzedApp[]} resolved when all apks in packageNamesObj are analyzed
 */
export const analyzeAPKs = (apks: APK[], keepApks: boolean = true): Promise<AnalyzedApp[]> =>
  new Promise<AnalyzedApp[]>(async (resolve, reject) => {
    debug('analyzer:analyzing ', apks);

    if (!fs.existsSync(APP_DATA_FOLDER)) fs.mkdirSync(APP_DATA_FOLDER);
    const results: AnalyzedApp[] = [];

    for (const apk of apks) {
      const decRes = await decompileApk(apk, true);
      debug('decompile res:', decRes);
      if (!!decRes.error) {
        console.log('error while decoding APK: ', decRes.error);
        continue;
      }

      // debug('decRes', decRes);
      const SDKs = await analyzeGmsHmsSdks(apk);

      const manifestResult = await analyzeManifest(decRes.manifestPath!);

      const apkToolYmlResult = analyzeApkToolYml(decRes.apkToolYmlPath!);

      const apkFileResult = analyzeApk(apk);
      // debug('apkfileresult', apkFileResult);
      results.push({
        ...SDKs,
        ...manifestResult,
        ...apkToolYmlResult,
        ...apkFileResult,
      });
    }
    resolve(results);
  });

const analyzeApk = (apk: APK): AnalyzedApk => {
  // get apk last modification  time
  let apkCreationTime = '';
  try {
    const stat = fs.statSync(apk.filePath);
    // console.log(stat);
    if (!!stat.mtime) apkCreationTime = stat.mtime.toLocaleString();
  } catch (e) {
    debug('failed to get stats', e);
  }
  return {
    storeUploadDate: apk.uploadDate || '',
    apkCreationTime,
  };
};
