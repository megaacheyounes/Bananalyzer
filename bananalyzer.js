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

import * as fs from 'fs';
import * as path from 'path';
import * as analyzer from './analyzer.js';
import { saveResult } from './ExcelHelper.js';

// good ol' require

// import info from './package.json' assert { type: 'json' }; //eslint fucking hates this line
// ugly workaround to import package.json
import { readFileSync } from 'fs';
const info = JSON.parse(readFileSync('package.json'));
import { downoadChromiumIfMissing, downloadAPK, closeBrowser } from './downloader.js';
import { delay, pause, printLogs, currentPlatform } from './utils.js';
import { pickFile } from './psHelper.js';

import debugModule from 'debug';
const debug = debugModule('');

const MAX_PACKAGE_NAME = 200;
const DEFAULT_BATCH_SIZE = 3;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const args = process.argv.slice(2);

global.useExisting = args.includes('--use-existing'); // if true, will use existing apk in ./download, if false, will force download apks
global.keepApks = args.includes('--keep-apks'); // if set, the program will not delete the downloaded apks, apks can be found ./downloads folder
global.logs = args.includes('--enable-logs'); // debug logs

if (global.logs) {
  debugModule.enable('*');
} else {
  debugModule.disable('');
}

console.log(`${info.name} V${info.version} (${info.homepage})`);

debug('args: ' + args);

printLogs();

// set batch size
const batchArg = args.find((arg) => arg.indexOf('batch') != -1);
if (!!batchArg) {
  // download and anlyze X apps at the same time, default value is 3
  const sizeTemp = batchArg.replace('--batch-', '');
  if (isNaN(sizeTemp) || +sizeTemp < 1) {
    console.log(`the batch size you provided is not valid ("${sizeTemp}"), will fallback to deafult size ()`);
    global.batchSize = DEFAULT_BATCH_SIZE;
  } else {
    global.batchSize = +sizeTemp;
  }
} else {
  global.batchSize = DEFAULT_BATCH_SIZE;
}

console.log(
  'DebugLogs =' + global.logs,
  ' UseExisting =' + global.useExisting,
  ', BatchSize = ' + global.batchSize,
  ', KeepAPKs = ' + global.keepApks
);

const commitSuicide = (msg) => {
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

  if (!fs.existsSync(analyzer.APP_CHECK_JAR)) {
    return commitSuicide("(ಠ_ಠ) some parts of me are missing! I coudn't find AppCheck.jar");
  }

  debug('platform: ' + currentPlatform());

  try {
    await downoadChromiumIfMissing();
  } catch (e) {
    debug(e);
    return commitSuicide('failed to download chromium');
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
  let packageNames = '';
  try {
    const data = fs.readFileSync(packageNamesFile, 'utf8').toString();

    // convert data into array
    packageNames = data.split('\n');
    // remove empty lines and any spaces after or before package names
    packageNames = packageNames
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

  if (packageNames.length > MAX_PACKAGE_NAME) {
    return commitSuicide(
      '(●_●) Downloading and Analyzing more than 200 apps at a time can have serious consquences on you, your gf, your crypto wallet and the future of humanity!'
    );
  }

  const downloadOneAPK = async (packageName) => {
    try {
      const dlRes = await downloadAPK(packageName);

      console.log('✓ APK file is ready → ' + packageName);
      return dlRes;
    } catch (e) {
      debug(e);
      console.log('⤫ failed to download apk → ', packageName, ': The requested app is not found or invalid');
      return null;
    }
  };

  // 3- download, analyze and write result of 2 apps , to avoid loosing results

  let batchNum = 0;
  const batchSize = global.batchSize;
  const batchCount = Math.ceil(packageNames.length / batchSize);
  const resultFileName = path.basename(packageNamesFile).split('.')[0];
  const failedApks = [];
  for (let i = 0; i < packageNames.length; i += batchSize) {
    const promises = [];
    batchNum++;
    const nextBatch = packageNames.slice(i, i + batchSize);
    console.log('Batch #' + batchNum + ' =', nextBatch);

    // 1- download a batch
    nextBatch.forEach((packageName) => promises.push(downloadOneAPK(packageName)));

    const prs = await Promise.allSettled(promises);
    // done downloading X apks, lets analyze them

    const downloadedApks = prs.map((pr) => pr.value).filter((pr) => pr != null);
    const downloadedApksCount = downloadedApks.length;
    debug('downloaded apks: ' + downloadedApksCount);

    const batchFailed = nextBatch.filter((pn) => !downloadedApks.map((c) => c.packageName).includes(pn));
    debug('batch #' + batchNum + ' failed ==>> ' + batchFailed);
    failedApks.push(...batchFailed);

    if (downloadedApksCount == 0) {
      continue; // all dowlnoads failed, proces to next batch
    }
    // 2- analyze the batch
    // delete previous batch (not original (downloaded) APKs) if exists
    await analyzer.cleanDataFolder();
    const analyzerRes = await analyzer.analyzeAPKs(downloadedApks);

    try {
      await saveResult(analyzerRes, resultFileName);
    } catch (e) {
      return commitSuicide(
        `(╯°□°)╯︵ ┻━┻ I couldn't write to excel file (close the file '${resultFileName}.xlsx' if its open)`
      );
    }
    console.log(`✓ Batch #${batchNum} of ${batchCount} finished`);
  }

  const successCount = packageNames.length - failedApks.length;

  console.log(
    `Analyzed ${successCount} of ${packageNames.length} apps (${failedApks.length} failed${
      successCount == 0 && failedApks.length > 2 ? ' (ALL) ' : ''
    })`
  );
  if (failedApks.length > 0) console.log('APKs not analyzed ==> ', failedApks);

  console.log();
  if (successCount > 0) console.log(`✔✔ DONE → ${path.join(process.cwd(), resultFileName + '.xlsx')}  ( ͡~ ͜ʖ ͡°) `);

  console.log('Releasing resources...');
  await analyzer.cleanDataFolder();
  await closeBrowser();

  pause();
};
main();
