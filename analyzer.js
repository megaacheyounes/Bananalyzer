'use strict';
/**
 * this script analyzed the apk using the tool appcheck.jar,
 * then parses the bad results generated by this tool into a human readable text thats easy to read does not hurt the eye lol
 *
 */
import * as fs from 'fs';
import * as path from 'path';
import * as JavaCallerModule from 'java-caller';
import { getApkInfo } from './utils.js';
import { moveFile } from './mv.js';
const APP_DATA_XSJ = 'appdataxsj';
export const APP_CHECK_JAR = 'AppCheck.jar';

// eslint-disable-next-line no-unused-vars
const command = `java -jar ${APP_CHECK_JAR} -Dfalse -Gtrue -Cfalse`;
// eslint-disable-next-line no-unused-vars
const jarPath = path.join(process.cwd(), APP_CHECK_JAR);
const GMS_OUTPUT = path.join(process.cwd(), APP_DATA_XSJ, 'output_gms.txt');
const HMS_OUTPUT = path.join(process.cwd(), APP_DATA_XSJ, 'output_hms.txt');
const appDataFolder = path.join(process.cwd(), APP_DATA_XSJ);

import debugModule from 'debug';
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
const gmsHeadersMap = {
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
const mapSdkNames = (arr) => {
  const res = [];
  if (!arr) return res;
  const keys = Object.keys(gmsHeadersMap);
  arr.forEach((sdk) => {
    res.push(keys.includes(sdk) ? `sdk (${gmsHeadersMap[sdk]})` : sdk);
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
 * @param {array} apps: list of downloaded apps/apk to analyze, example = [{packageName:"package.name":filePath:"path/to/file.apk"}]
 * @return {promise} resolved when all apks in packageNamesObj are analyzed
 * result example = {
 *    'com.landmarkgroup.splashfashions': {
 *     HMS: [ 'push' ],
 *      GMS: [ 'account', 'push', 'location', 'map', 'analytics', 'ads' ]
 *   }
 *
 */
export const analyzeAPKs = (apps) =>
  new Promise(async (resolve, reject) => {
    debug('analyzer:analyzing ', apps);
    if (!fs.existsSync(appDataFolder)) fs.mkdirSync(appDataFolder);

    // 2- move apks from /downloads to /appdataxsj
    apps.forEach(async (app) => {
      const dest = path.join(appDataFolder, `${app.packageName}.apk`);
      try {
        if (global.keepApks) fs.copyFileSync(app.filePath, dest);
        else await moveFile(app.filePath, dest);
        app.filePath = dest;
      } catch (e) {
        debug('analyzer:failed to move apk ' + app.packageName + '.apk' + ' from /downloads to /appdataxsj');
        debug('analyzer:apk path= ' + app.filePath + ' ,dest = ' + dest);
        console.debug('⤫ failed to analyze apk of ' + app.packageName);
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

    const getEntries = (data) => {
      const entries = [];
      data.split('\n').map((line) => {
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
    const getKits = async (apps, headers) =>
      new Promise((ress, rej) => {
        try {
          const res = {};
          apps
            .filter((entries) => entries.length > 0)
            .forEach((appEntries) => {
              const kits = appEntries
                .slice(1, appEntries.length - 2)
                .map((val, index) => (val == 'true' ? headers[index + 1] : ''))
                .filter((v) => v && v.length > 0);
              const packageName = appEntries[0].replace('.apk', '');
              res[packageName] = kits;
            });

          ress(res);
        } catch (e) {
          rej(e);
        }
      });

    const allHms = await getKits(hmsEntries, headers);
    const allGms = await getKits(gmsEntries, headers);

    const result = {};
    for (const app of apps) {
      const packageName = app.packageName;

      let manifestData = { metaData: [] };
      let androidMarket = '⚠';
      let appId = '⚠';
      let versionName = '⚠';

      try {
        manifestData = await getApkInfo(app.filePath);

        // console.dir(manifestData)
        versionName = manifestData ? manifestData.versionName : 'NOT FOUND';

        debug('manifest of ' + app.packageName + ' is ' + typeof manifestData);
        const metaData = manifestData['application']['metaDatas'];

        const appIdObj = metaData.find((v) => v.name == 'com.huawei.hms.client.appid');
        appId = appIdObj ? appIdObj.value : 'NOT FOUND';

        const androidMarketObj = metaData.find((v) => v.name == 'com.huawei.hms.client.channel.androidMarket');
        androidMarket = androidMarketObj ? JSON.stringify(androidMarketObj) : 'NOT FOUND';
      } catch (e) {
        debug('analyzer:failed to parse apk ', packageName);
        // hmmms is an XAPK? a split APK?
        debug(e);
      }

      result[packageName] = {
        version: versionName,
        GMS: mapSdkNames(allGms[packageName]),
        HMS: allHms[packageName] || [],
        'huawei App Id': appId,
        'androidMarket metadata': androidMarket,
      };
    }
    resolve(result);
  });
