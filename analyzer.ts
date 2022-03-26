'use strict';
import debugModule from 'debug';
/**
 * this script analyzed the apk using the tool appcheck.jar,
 * then parses the bad results generated by this tool into a human readable text thats easy to read does not hurt the eye lol
 *
 */
import fs from 'fs';
import path from 'path';

import { AnalyzedApk } from './models/analyzedApk';
import { APK } from './models/apk';
import { Kits } from './models/kits';
import { Manifest } from './models/manifest';
import { moveFile } from './mv';
import { getApkInfo } from './utils';

const JavaCallerModule = require('java-caller');

const APP_DATA_XSJ = 'appdataxsj';
export const APP_CHECK_JAR = 'AppCheck.jar';

// eslint-disable-next-line no-unused-vars
const command = `java -jar ${APP_CHECK_JAR} -Dfalse -Gtrue -Cfalse`;
// eslint-disable-next-line no-unused-vars
const jarPath = path.join(process.cwd(), APP_CHECK_JAR);
const GMS_OUTPUT = path.join(process.cwd(), APP_DATA_XSJ, 'output_gms.txt');
const HMS_OUTPUT = path.join(process.cwd(), APP_DATA_XSJ, 'output_hms.txt');
const appDataFolder = path.join(process.cwd(), APP_DATA_XSJ);

const debug = debugModule('analyzer');

// includes hms sdk names
const headers = [
  'AppName',
  'account',
  'push',
  'iap',
  'location',
  'map',
  'analytics',
  'ads',
  'game',
  'drive',
  'scan',
  'safetydetect',
  'nearbyservice',
  'ml',
  'awareness',
  'fido',
  'health',
  'identity',
  'panorama',
  'site',
  'dtm',
  'wallet',
  'toolkit(G+H)',
];

// todo: use GMS sdk names
const GMS_HEADER_MAP: { [kit: string]: string } = {
  account: 'Sign in',
  push: 'FCM',
  // "location": "location",
  map: 'maps',
  // "analytics": "analytics",
  // "ads": "ads",
  game: 'games',
  // "drive": "drive",
  scan: 'Firebase vision',
  safetydetect: 'safetynet',
  nearbyservice: 'nearby',
  // "ml": "ml",
  // "awareness": "awarness",
  // "fido": "fido",
  health: 'fitness',
  // "identity": "identity",
  panorama: 'Street View',
  site: 'places',
  dtm: 'GTM',
  wallet: 'pay',
};

/**
 * map HMS sdk names to GMS
 *  @param {array} arr: array of hms kits, example:  ['push' , 'map','wallet','location']
 * @return {array} array of hms ktis with gms names, example: ['push (FCM)', 'map (maps)','wallet (pay)','location']
 *
 */
const mapSdkNames = (arr: string[]) => {
  const res: string[] = [];
  if (!arr) return res;
  const keys = Object.keys(GMS_HEADER_MAP);
  arr.forEach((sdk: string) => {
    res.push(keys.includes(sdk) ? `${sdk} (${GMS_HEADER_MAP[sdk]})` : sdk);
  });
  return res;
};

/**
 * delete all apks in data folder, to avoid re-analyzing them or just to save space
 * @return {nothing}
 */
export const cleanDataFolder = async () => {
  if (!fs.existsSync(appDataFolder)) return;
  const files = fs.readdirSync(appDataFolder);

  if (!files || files.length == 0) return;
  files.forEach((file) => {
    if (file.match('.*.apk')) {
      const filePath = path.join(appDataFolder, file);
      try {
        fs.unlinkSync(filePath);
        debug('analyzer:deleted ' + file + ' from analyzer folder');
      } catch (e) {
        debug(e);
        debug('analyzer:failed to delete apk: ' + filePath);
      }
    }
  });
};

/**
 *
 * @param {array} apks: list of downloaded apps/apk to analyze, example = [
 * {packageName:"package.name":filePath:"path/to/file.apk", uploadDate:"may 27, 2021"}
 * ]
 * @return {promise} resolved when all apks in packageNamesObj are analyzed
 * result example = {
 *    'com.landmarkgroup.splashfashions': {
 *     HMS: [ 'push' ],
 *      GMS: [ 'account', 'push', 'location', 'map', 'analytics', 'ads' ]
 *   }
 *
 */
export const analyzeAPKs = (apks: APK[], keepApks: boolean) =>
  new Promise<AnalyzedApk[]>(async (resolve, reject) => {
    debug('analyzer:analyzing ', apks);
    if (!fs.existsSync(appDataFolder)) fs.mkdirSync(appDataFolder);

    // 2- move apks from /downloads to /appdataxsj
    apks.forEach(async (app) => {
      const dest = path.join(appDataFolder, `${app.packageName}.apk`);
      try {
        if (keepApks) fs.copyFileSync(app.filePath, dest);
        else await moveFile(app.filePath, dest);
        app.filePath = dest;
      } catch (e) {
        debug('analyzer:failed to move apk ' + app.packageName + '.apk' + ' from /downloads to /appdataxsj');
        debug('analyzer:apk path= ' + app.filePath + ' ,dest = ' + dest);
        // console.log(`⤫ failed to analyze apk → ${app.packageName} : ${e.message}`);
        debug(e);
      }
    });

    // 3- analyze using AppCheck
    const java = new JavaCallerModule.JavaCaller({
      jar: APP_CHECK_JAR,
    });

    fs.writeFileSync(HMS_OUTPUT, '');
    fs.writeFileSync(GMS_OUTPUT, '');

    // eslint-disable-next-line no-unused-vars
    const { status, stdout, stderr } = await java.run(['-Gtrue -Dfalse -Cfalse']);
    //    debug("--- status ----")
    //    debug(status)
    //    debug("--- stdout ----")
    //    debug(stdout)
    //    debug("--- stderr ----")
    //    debug(stderr)

    // 4- parse bad AppCheck results

    const hmsOutput = fs.readFileSync(HMS_OUTPUT, 'utf-8');
    const gmsOutput = fs.readFileSync(GMS_OUTPUT, 'utf-8');

    const getEntries = (data: string) => {
      const entries: string[][] = [];
      data.split('\n').map((line: string) => {
        entries.push(
          line
            .split('\t')
            .map((l) => l.trim())
            .filter((l) => l.length > 0)
            .filter((entry) => !headers.includes(entry))
        );
      });
      return entries.filter((arr) => arr.length > 0);
    };

    const hmsEntries = getEntries(hmsOutput);
    const gmsEntries = getEntries(gmsOutput);

    // console.log("hms entries",hmsEntries)
    const getKits = async (entries: string[][], headers: string[]) =>
      new Promise<Kits>((resolve, reject) => {
        try {
          let res: { [packageName: string]: string[] } = {};
          entries
            .filter((appEntries) => appEntries.length > 0)
            .forEach((appEntries) => {
              const kits = appEntries
                .slice(1, appEntries.length - 2)
                .map((val, index) => (val == 'true' ? headers[index + 1] : ''))
                .filter((v) => v && v.length > 0);
              const packageName = appEntries[0].replace('.apk', '');
              res[packageName] = kits;
            });

          resolve(res);
        } catch (e) {
          reject(e);
        }
      });

    const allHms: Kits = await getKits(hmsEntries, headers);
    const allGms: Kits = await getKits(gmsEntries, headers);

    const results: AnalyzedApk[] = [];
    for (const app of apks) {
      const packageName = app.packageName;

      let manifestData: Manifest;
      let androidMarketMetaData = '⚠';
      let huaweiAppId = '⚠';
      let versionName = '⚠';
      let permissions = '⚠';
      let googleMetadatas = '⚠';
      let huaweiMetadatas = '⚠';
      try {
        manifestData = await getApkInfo(app.filePath);

        // console.dir(manifestData)
        versionName = manifestData ? manifestData.versionName : 'NOT FOUND';

        debug('manifest of ' + app.packageName + ' is ' + typeof manifestData);
        const metaData = manifestData['application']['metaDatas'];

        const appIdObj = metaData.find((v) => v.name == 'com.huawei.hms.client.appid');

        if (!!appIdObj) {
          huaweiAppId = `C${appIdObj.value}`.replace('appid=', '');
        } else {
          huaweiAppId = '';
        }

        const androidMarketObj = metaData.find((v) => !!v.name && v.name.toLowerCase().indexOf('androidmarket') != -1);
        androidMarketMetaData = androidMarketObj ? JSON.stringify(androidMarketObj) : '';

        huaweiMetadatas = metaData
          .filter((m) => !!m.name && m.name.indexOf('huawei') != -1)
          .map((m) => `${m.name}:${m.value}`)
          .join(', \n');
        googleMetadatas = metaData
          .filter((m) => !!m.name && m.name.indexOf('google') != -1)
          .map((m) => `${m.name}:${m.value}`)
          .join(', \n');

        try {
          permissions = manifestData.usesPermissions
            .map((obj) => obj.name)
            .filter((p) => !!p && p.length > 0)
            .filter((p) => p.toLowerCase().indexOf('huawei') != -1 || p.toLowerCase().indexOf('google') != -1)
            .join(', \n ');
        } catch (e) {
          debug(e);
        }
      } catch (e: any) {
        console.log(e);
        debug('analyzer:failed to parse apk ', packageName);
        // hmmms is an XAPK? a split APK?
        console.log(`⤫ failed to parse AndroidManifest.xml → ${app.packageName} : ${e.message}`);
        debug(e);
      }

      // get apk last modificationm time
      let apkCreationTime = '';
      try {
        const stat = fs.statSync(app.filePath);
        // console.log(stat);
        if (!!stat.mtime) apkCreationTime = stat.mtime.toLocaleString();
      } catch (e) {
        debug(e);
      }

      results.push({
        packageName,
        versionName,
        uploadDate: app.uploadDate || '',
        apkCreationTime,
        GMS: mapSdkNames(allGms[packageName]),
        HMS: allHms[packageName] || [],
        huaweiAppId,
        androidMarketMetaData,
        huaweiMetadatas,
        googleMetadatas,
        permissions,
      });
    }
    resolve(results);
  });