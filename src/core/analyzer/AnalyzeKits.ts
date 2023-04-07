import { AnalyzedSDKs } from '../../utils/models/analyzedApp';
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
import { AnalyzedApk } from '../../utils/models/analyzedApp';
import { APK } from '../../utils/models/apk';
import { Action, Activity, AndroidManifest, IntentFilter, Service, UsesPermission } from '../../utils/models/manifest';
import { moveFile } from '../mv';
import { getApkInfo } from '../utils';
import { HUAWEI_MESSAGING_EVENT } from '../../consts';

const JavaCallerModule = require('java-caller');

const debug = debugModule('analyzeKits');

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

  // eslint-disable-next-line no-unused-vars
  const { status, stdout, stderr } = await java.run(['-Gtrue -Dfalse -Cfalse']);
  //    debug("--- status ----")
  //    debug(status)
  //    debug("--- stdout ----")S
  //    debug(stdout)
  //    debug("--- stderr ----")
  if (stderr) debug(stderr);

  //todo: use csv parsing library
  // 4- parse bad AppCheck results
  const hmsOutput = fs.readFileSync(HMS_OUTPUT, 'utf-8');
  debug('-----------------------------');
  const gmsOutput = fs.readFileSync(GMS_OUTPUT, 'utf-8');

  const hmsEntries = getEntries(hmsOutput);
  const gmsEntries = getEntries(gmsOutput);

  const HMS: string[] = getServices(hmsEntries) || [];
  const GMS: string[] = getServices(gmsEntries) || [];

  return {
    HMS,
    GMS,
  };
};

//todo: test heavily
const getServices = (entries: string[][]): string[] => {
  const headers: string[] = entries[0];
  if (!entries || entries.length < 2) {
    debug('invalid entries', entries);
    return [];
  }
  const serviceEntries = entries[1]; //.filter((appEntries) => appEntries.length > 0);
  debug('headers', headers);
  debug('serviceEntries', serviceEntries);
  if (serviceEntries.length == 0) return [];

  const kits = serviceEntries
    .map((val, index) => (val == 'true' ? headers[index] : ''))
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
  );
  return entries.filter((arr) => arr.length > 0);
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
