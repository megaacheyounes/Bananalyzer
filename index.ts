/**
 * No Copyright 2022 Younes Megaache
 * All right can be abused (respectfully)
 *
 * 💀💀💀 DANGER 💀💀💀
 * Reading this code can cause headaches, and may reduce your IQ level or give you a permanent brain damage
 *
 */

'use strict';
import fs from 'fs';
import { APP_CHECK_JAR, APP_DATA_FOLDER, DOWNLOAD_FOLDER, EXPORT_DIR, IS_PROD, SRC_DIR } from './src/consts';
import { currentPlatform, pause } from './src/core/utils';

import cliHelper from './src/cliHelper';
import { CMD_APK, CMD_FILE, CMD_HELP, CMD_PACKAGE, CMD_VERSION, commitSuicide, MyFlags } from './src/cliHelper';
import debugModule from 'debug';
import { PickFileCommand } from './src/commands/pickFileCommand';
import PackageCommand from './src/commands/packageCommand';
import ApkCommand from './src/commands/apkCommand';

const debug = debugModule('index');

if (currentPlatform() == 'win32') {
  commitSuicide('(ಠ_ಠ) Seriously? 32bit windows machine!? sorry this program is designed for 64 bit machines!');
  process.exit(2);
  //program will stop here
}
if (!fs.existsSync(APP_CHECK_JAR)) {
  commitSuicide("(ಠ_ಠ) some parts of me are missing! I coudn't find AppCheck.jar");
  process.exit(2);
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

if (IS_PROD && !flags.debug) {
  // hide all nodejs warnings
  process.removeAllListeners('warning');
}

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
      await new ApkCommand(flags).exec();
      pause();
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
