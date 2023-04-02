import { AnalyzedSDKs } from '../../models/analyzedApp';
('use strict');
import debugModule from 'debug';

import fs from 'fs';
import path from 'path';

import {
  APP_CHECK_JAR,
  APP_DATA_FOLDER,
  GMS_OUTPUT,
  HMS_OUTPUT,
  UNKNOWN_INFO,
  GOOGLE_MESSAGING_EVENT,
} from '../../consts';
import { AnalyzedApk } from '../../models/analyzedApp';
import { APK } from '../../models/apk';
import { Action, Activity, AndroidManifest, IntentFilter, Service, UsesPermission } from '../../models/manifest';
import { moveFile } from '../mv';
import { getApkInfo } from '../utils';
import { HUAWEI_MESSAGING_EVENT } from '../../consts';

const JavaCallerModule = require('java-caller');

const debug = debugModule('analyzeKits');

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

export const analyzeKits = async (apk: APK): Promise<AnalyzedSDKs> => {
  const apkName = path.basename(apk.filePath);
  //   move apks from /downloads to /appdataxsj

  const dest = path.join(APP_DATA_FOLDER, `${apkName}`);

  try {
    fs.copyFileSync(apk.filePath, dest);
    apk.filePath = dest;
  } catch (e) {
    debug('analyzer:failed to move apk ' + apkName + ' from /downloads to /appdataxsj');
    debug('analyzer:apk path= ' + apk.filePath + ' ,dest = ' + dest);
    // console.log(`⤫ failed to analyze apk → ${apkName} : ${e.message}`);
    debug(e);
  }

  //   analyze using AppCheck
  const java = new JavaCallerModule.JavaCaller({
    jar: APP_CHECK_JAR,
  });

  fs.writeFileSync(HMS_OUTPUT, '');
  fs.writeFileSync(GMS_OUTPUT, '');

  //todo:
  // eslint-disable-next-line no-unused-vars
  // const { status, stdout, stderr } = await java.run(['-Gtrue -Dfalse -Cfalse']);
  //    debug("--- status ----")
  //    debug(status)
  //    debug("--- stdout ----")
  //    debug(stdout)
  //    debug("--- stderr ----")
  //    debug(stderr)

  //todo: use csv parsing library
  // 4- parse bad AppCheck results
  const hmsOutput = fs.readFileSync(HMS_OUTPUT, 'utf-8');
  const gmsOutput = fs.readFileSync(GMS_OUTPUT, 'utf-8');

  const hmsEntries = getEntries(hmsOutput);
  const gmsEntries = getEntries(gmsOutput);
  debug('gms entries', gmsEntries);
  const HMS: string[] = [];
  const GMS: string[] = getServices(gmsEntries, headers) || [];

  return {
    HMS,
    GMS: mapSdkNames(GMS),
  };
};

//todo: test heavily
const getServices = (entries: string[][], headers: string[]): string[] => {
  const appEntries = entries.filter((appEntries) => appEntries.length > 0);
  debug('appEntries', entries, appEntries);
  debug('headers', headers);
  const kits = appEntries[0]
    .slice(1)
    .map((val, index) => (val == 'true' ? headers[index + 1] : ''))
    .filter((v) => v && v.length > 0);
  debug('kits', kits);
  return kits;
};

const getEntries = (data: string) => {
  const entries: string[][] = data.split('\n').map((line: string) =>
    line
      .split('\t')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .filter((entry) => !headers.includes(entry))
  );
  return entries.filter((arr) => arr.length > 0);
};

/**
 * map HMS sdk names to GMS
 *  @param {array} arr: array of hms kits, example:  ['push' , 'map','wallet','location']
 * @return {array} array of hms kits with gms names, example: ['push (FCM)', 'map (maps)','wallet (pay)','location']
 *
 */
const mapSdkNames = (arr: string[]) => {
  const res: string[] = [];
  if (!arr) return res;
  const keys = Object.keys(GMS_HEADER_MAP);
  arr.forEach((sdk: string) => {
    // res.push(keys.includes(sdk) ? `${GMS_HEADER_MAP[sdk]} (${sdk})` : sdk);
    res.push(keys.includes(sdk) ? GMS_HEADER_MAP[sdk] : sdk);
  });
  return res;
};

/**
 * delete all apks in data folder, to avoid re-analyzing them or just to save space
 * @return {nothing}
 */
export const cleanDataFolder = async () => {
  if (!fs.existsSync(APP_DATA_FOLDER)) return;
  const files = fs.readdirSync(APP_DATA_FOLDER);

  if (!files || files.length == 0) return;
  files.forEach((file) => {
    if (file.match('.*.apk')) {
      const filePath = path.join(APP_DATA_FOLDER, file);
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
