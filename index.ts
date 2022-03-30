/**
 * No Copyright 2022 Younes Megaache
 * All right can be abused (respectfully)
 *
 * 💀💀💀 DANGER 💀💀💀
 * Reading this code can cause headaches, and may reduce your IQ level or give you a permanent brain damage
 *
1.  create a txt file and write the package names into it, one package name per line, see `example/example_social.txt`
2.  open a terminal (cmd)
3.  navigate to the folder that contains this sofware, exmaple: `cd C://banana_analyzer`
4.  run the command `banana_analyzer.exe`
5.  the program will open a file picker, choose the txt file that you created in step 1 and click `Open`
6.  the program will start working, analyzing 3 apks at a time.
7.  when finished, the results can be found in an excel file, that has the same as name as the txt file (example: `example_social.xlsx`)
 */

/*
  Arguments:
    1.  `--enable-logs`: print debug logs, useful to debug this program, or if you want to submit an issue (caution: you may hurt your eyes )
    2.  `--keep-apks`: by default, the program will delete the apks that are downloaded to save space. if this flag is specified, the program will keep the apks which can be found in a folder named `downloads` (useful if you have a personal data center )
    3.  `--use-existing`: by default the program will always download latest apk from playstore. if you happend to analyze an apk, then decide that you have to re-analyze it without re-downloading it, then use this flag. (by using this flag, banana_analyzer will **NOT** check if a newer version is available)
    4.  `--batch-(num)`: to improve efficiancy, this program handles apks in batches, the default batch size is 3. means it downloads 3 APKs in parallel, analyze them, write the results into the excel sheet, then moves to the next 3 APKs. usage example: `--batch-1`, `--batch-5` (using a large batch size may break the program, your PC or the whole universe)

 */

'use strict';
// hide all nodejs warnings
// process.removeAllListeners('warning');

import debugModule from 'debug';
import fs from 'fs';
import path from 'path';

import {
  analyzeAPKs,
  cleanDataFolder,
} from './src/analyzer';
import {
  APP_CHECK_JAR,
  APP_DATA_FOLDER,
  DOWNLOAD_FOLDER,
  EXPORT_DIR,
  IS_PROD,
  SRC_DIR,
} from './src/consts';
import {
  closeBrowser,
  downloadAPK,
  downoadChromiumIfMissing,
} from './src/downloader';
import { saveResult } from './src/ExcelHelper';
import { AnalyzedApk } from './src/models/analyzedApk';
import { APK } from './src/models/apk';
import { pickFile } from './src/psHelper';
import {
  currentPlatform,
  delay,
  pause,
  printLogs,
} from './src/utils';

const info = JSON.parse(fs.readFileSync('package.json').toString());

const debug = debugModule('');

const MAX_PACKAGE_NAME = 200;
const DEFAULT_BATCH_SIZE = 3;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const args = process.argv.slice(2);

const useExisting = args.includes('--use-existing'); // if true, will use existing apk in ./download, if false, will force download apks
const keepApks = args.includes('--keep-apks'); // if set, the program will not delete the downloaded apks, apks can be found ./downloads folder
const enableLogs = args.includes('--enable-logs'); // debug logs

if (enableLogs) {
  debugModule.enable('*');
} else {
  debugModule.disable();
}

console.log(`${info.name} V${info.version} (${info.homepage})`);

debug('args: ' + args);

debug('IS_PROD=', IS_PROD);
debug('SRC_DIR=', SRC_DIR);
debug('EXPORT_DIR=', EXPORT_DIR);
debug('APP_DATA_FOLDER =', APP_DATA_FOLDER);
debug('APP_DATA_FOLDER =', DOWNLOAD_FOLDER);

printLogs();

let batchSize: number;
// set batch size
const batchArg: string = args.find((arg) => arg.indexOf('batch') != -1) || '';
if (!!batchArg) {
  // download and anlyze X apps at the same time, default value is 3
  const sizeTemp: string = batchArg.replace('--batch-', '');
  if (isNaN(Number(sizeTemp)) || +sizeTemp < 1) {
    console.log(`the batch size you provided is not valid ("${sizeTemp}"), will fallback to deafult size ()`);
    batchSize = DEFAULT_BATCH_SIZE;
  } else {
    batchSize = +sizeTemp;
  }
} else {
  batchSize = DEFAULT_BATCH_SIZE;
}

console.log(
  'DebugLogs =' + enableLogs,
  ' UseExisting =' + useExisting,
  ', BatchSize = ' + batchSize,
  ', KeepAPKs = ' + keepApks
);

const commitSuicide = (msg: string) => {
  console.log(''); // empty line
  console.log(' ☹  Banana analyzer has commit suicide  ☹ ');
  console.log('[last words]', msg);
  console.log(
    '(if you think this is an issue with the tool, re-run it with the flag `--enable-logs`, then submit an issue at:',
    info.homepage,
    ' and include the logs)'
  );
  pause();
};
const main = async () => {
  if (currentPlatform() == 'win32') {
    return commitSuicide(
      '(ಠ_ಠ) Seriously? 32bit windows machine!? sorry this program is designed for 64 bit machines!'
    );
  }

  if (!fs.existsSync(APP_CHECK_JAR)) {
    return commitSuicide("(ಠ_ಠ) some parts of me are missing! I coudn't find AppCheck.jar");
  }

  debug('platform: ' + currentPlatform());

  try {
    await downoadChromiumIfMissing();
  } catch (e) {
    debug(e);
    return commitSuicide('failed to download Chromium');
  }

  // 1 - get package names
  console.log('choose a txt file that contains the list of package names');
  // give user some time to read the message above
  await delay(500);
  let packageNamesFile = null;
  try {
    packageNamesFile = await pickFile();
    debug('package names file', packageNamesFile);
  } catch (e) {
    debug(e);
    return commitSuicide("I couldn't read your txt file ¯\\_(ツ)_/¯");
  }

  debug('continue after file selections');
  let packageNames: string[];
  try {
    const data = fs.readFileSync(packageNamesFile, 'utf8').toString();

    // convert data into array
    packageNames = data
      .split('\n')
      // remove empty lines and any spaces after or before package names
      .map((pn) => pn.trim())
      .filter((pn) => pn.length > 0)
      // ignore commented package names (that starts with // )  :)
      .filter((pn) => pn.indexOf('//') == -1);

    debug(packageNames);
  } catch (e) {
    debug(e);
    return commitSuicide(
      '(●_●) make sure the txt file exists and its format is UTF8, then throw some package names in it!'
    );
  }

  const resultFileName: string = path.basename(packageNamesFile).split('.')[0];
  const RESULT_PATH = `${path.join(__dirname, resultFileName + '.xlsx')}`;

  if (packageNames.length > MAX_PACKAGE_NAME) {
    return commitSuicide(
      '(●_●) Downloading and Analyzing more than 200 apps at a time can have serious consquences on you, your gf, your crypto wallet and the future of humanity!'
    );
  }

  const downloadOneAPK = async (packageName: string): Promise<APK | null> => {
    try {
      return downloadAPK(packageName, useExisting);
    } catch (e) {
      debug(e);
      console.log('⤫ failed to download apk → ', packageName, ': The requested app is not found or invalid');
      return null;
    }
  };

  // 3- download, analyze and write result of 2 apps , to avoid loosing results

  let batchNum = 0;
  const batchCount: number = Math.ceil(packageNames.length / batchSize);
  const failedToDownload: string[] = [];
  const failedToAnalyze: string[] = [];
  for (let i = 0; i < packageNames.length; i += batchSize) {
    const promises: Promise<APK | null>[] = [];
    batchNum++;
    const nextBatch = packageNames.slice(i, i + batchSize);
    console.log('Batch #' + batchNum + ' =', nextBatch);

    // 1- download a batch
    nextBatch.forEach((packageName) => promises.push(downloadOneAPK(packageName)));

    const prs = await Promise.allSettled(promises);
    // done downloading X apks, lets analyze them

    const downloadedApks = prs.map((pr: any) => pr.value).filter((result: APK | null) => result != null);
    debug(downloadedApks);
    const downloadedApksCount = downloadedApks.length;
    debug('downloaded apks: ' + downloadedApksCount);

    const batchFailed = nextBatch.filter((pn) => !downloadedApks.map((c) => c.packageName).includes(pn));
    debug('batch #' + batchNum + ' failed ==>> ' + batchFailed);
    failedToDownload.push(...batchFailed);

    if (downloadedApksCount == 0) {
      continue; // all dowlnoads failed, proces to next batch
    }
    // 2- analyze the batch
    // delete previous batch (not original (downloaded) APKs) if exists
    await cleanDataFolder();
    const analyzerRes: AnalyzedApk[] = await analyzeAPKs(downloadedApks, keepApks);
    console.log('anlyzer res: ', analyzerRes);
    const batchNotAnalyzed = nextBatch.filter((pn) => !analyzerRes.map((app) => app.packageName).includes(pn));
    failedToAnalyze.push(...batchNotAnalyzed);

    try {
      await saveResult(analyzerRes, RESULT_PATH);
    } catch (e) {
      return commitSuicide(
        `(╯°□°)╯︵ ┻━┻ I couldn't write to excel file (close the file '${RESULT_PATH}' if its open)`
      );
    }
    console.log(`✓ Batch #${batchNum} of ${batchCount} finished`);
  }

  const successCount = packageNames.length - failedToDownload.length - failedToAnalyze.length;
  const showAll = successCount == 0 && failedToDownload.length > 2;

  console.log(
    `Analyzed ${successCount} of ${packageNames.length} apps  (${failedToDownload.length} failed${
      showAll ? ' (ALL) ' : ''
    })`
  );

  if (failedToDownload.length > 0) console.log('APKs not downloaded ==> ', failedToDownload);
  if (failedToAnalyze.length > 0) console.log('APKs not analyzed ==> ', failedToAnalyze);

  console.log();
  if (successCount > 0) console.log(`✔✔ DONE → ${RESULT_PATH}  ( ͡~ ͜ʖ ͡°) `);

  console.log('Releasing resources...');
  await cleanDataFolder();
  await closeBrowser();

  pause();
};
main();
