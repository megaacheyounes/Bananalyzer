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
  Arguments (outdated)
    1.  `--enable-logs`: print debug logs, useful to debug this program, or if you want to submit an issue (caution: you may hurt your eyes )
    2.  `--keep-apks`: by default, the program will delete the apks that are downloaded to save space. if this flag is specified, the program will keep the apks which can be found in a folder named `downloads` (useful if you have a personal data center )
    3.  `--use-existing`: by default the program will always download latest apk from playstore. if you happend to analyze an apk, then decide that you have to re-analyze it without re-downloading it, then use this flag. (by using this flag, banana_analyzer will **NOT** check if a newer version is available)
    4.  `--batch-(num)`: to improve efficiancy, this program handles apks in batches, the default batch size is 3. means it downloads 3 APKs in parallel, analyze them, write the results into the excel sheet, then moves to the next 3 APKs. usage example: `--batch-1`, `--batch-5` (using a large batch size may break the program, your PC or the whole universe)

 */

'use strict';
// hide all nodejs warnings
// process.removeAllListeners('warning');

import fs from 'fs';
import path from 'path';

import { analyzeAPKs, cleanDataFolder } from './src/core/analyzer';
import {
  APP_CHECK_JAR,
  APP_DATA_FOLDER,
  DOWNLOAD_FOLDER,
  EXPORT_DIR,
  IS_PROD,
  SRC_DIR,
  DEFAULT_BATCH_SIZE,
} from './src/consts';
import { closeBrowser, downloadAPK, downoadChromiumIfMissing } from './src/core/downloader';
import { saveResult } from './src/core/ExcelHelper';
import { AnalyzedApk } from './src/models/analyzedApk';
import { APK } from './src/models/apk';
import { pickFile } from './src/core/psHelper';
import { currentPlatform, delay, pause, printLogs } from './src/core/utils';

import cliHelper from './src/cliHelper';
import { type } from 'os';
import { CMD_APK, CMD_FILE, CMD_HELP, CMD_PACKAGE, CMD_VERSION, commitSuicide, MyFlags } from './src/cliHelper';
import debugModule from 'debug';
import { PickFileCommand } from './src/commands/pickFileCommand';
import PackageCommand from './src/commands/packageCommand';

const debug = debugModule('index');

if (currentPlatform() == 'win32') {
  commitSuicide('(ಠ_ಠ) Seriously? 32bit windows machine!? sorry this program is designed for 64 bit machines!');
  //program will stop here
}
if (!fs.existsSync(APP_CHECK_JAR)) {
  commitSuicide("(ಠ_ಠ) some parts of me are missing! I coudn't find AppCheck.jar");
  //program will stop here
}

if (
  !cliHelper.input ||
  typeof cliHelper.input != typeof [] ||
  cliHelper.input.length < 1 ||
  cliHelper.input.length > 2
) {
  // cliHelper.showHelp();
  cliHelper.input[0] = CMD_FILE;
}

const cmd = cliHelper.input[0];
const flags = cliHelper.flags as MyFlags;

const useExisting = flags.reuse; // if true, will use existing apk in ./download, if false, will force download apks
const keepApks = flags.keep; // if set, the program will not delete the downloaded apks, apks can be found ./downloads folder
const enableLogs = flags.debug; // debug logs
let batchSize: number = +(flags.batch as any); // download and anlyze X apps at the same time, default value is 3

if (enableLogs) {
  debugModule.enable('*');
} else {
  debugModule.disable();
}

debug('platform: ' + currentPlatform());

debug('IS_PROD=', IS_PROD);
debug('SRC_DIR=', SRC_DIR);
debug('EXPORT_DIR=', EXPORT_DIR);
debug('APP_DATA_FOLDER =', APP_DATA_FOLDER);
debug('APP_DATA_FOLDER =', DOWNLOAD_FOLDER);

// set batch size
debug(
  'DebugLogs =' + enableLogs,
  ' UseExisting =' + useExisting,
  ', BatchSize = ' + batchSize,
  ', KeepAPKs = ' + keepApks
);

const main = async () => {
  switch (cmd) {
    case CMD_FILE: {
      //dowlnoad and analyze list of apps
      await new PickFileCommand(flags).exec();
      pause();
      break;
    }
    case CMD_PACKAGE: {
      //downlaod ana anlyze package
      await new PackageCommand(flags).exec();
      pause();
      break;
    }
    case CMD_APK: {
      //analyze apk

      break;
    }
    case CMD_HELP: {
      //show help
      cliHelper.showHelp();
      break;
    }
    case CMD_VERSION: {
      // console.log('Banalyzer version=', info.version);
      // process.exit(2)
      cliHelper.showVersion();
      break;
    }
  }
};

main();
