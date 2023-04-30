import { APKTOOL_JAR } from './consts';
/**
 * No Copyright 2022 Younes Megaache
 * All right can be abused (respectfully)
 *
 * 💀💀💀 DANGER 💀💀💀
 * Reading this code can cause headaches, reduce your IQ level or give you a permanent brain damage
 *
 */

//todo: update all packages

('use strict');
import fs from 'fs';
import { APP_CHECK_JAR, APP_DATA_FOLDER, DOWNLOAD_FOLDER, EXPORT_DIR, IS_PROD, SRC_DIR } from './consts';
import { currentPlatform, pause } from './core/utils';

import cliHelper from './cliHelper';
import { CMD_APK, CMD_LIST, CMD_PACKAGE, CMD_VERSION, commitSuicide, MyFlags, CMD_APK_LIST } from './cliHelper';
import debugModule from 'debug';
import { PickFileCommand } from './commands/pickFileCommand';
import PackageCommand from './commands/packageCommand';
import ApkCommand from './commands/apkCommand';
import { PickFileApkCommand } from './commands/pickFileApk';

require('is-plain-object');

const debug = debugModule('main');

if (currentPlatform() == 'win32') {
  commitSuicide('(ಠ_ಠ) Seriously? 32bit windows machine!? sorry this program is designed for 64 bit machines!');
  process.exit(2);
  //program will stop here
}

const requiredTools = [APP_CHECK_JAR, APKTOOL_JAR];
for (const tool of requiredTools) {
  if (!fs.existsSync(tool)) {
    commitSuicide("(ಠ_ಠ) some parts of me are missing! I couldn't find " + tool);
    process.exit(3);
    //program will stop here
  }
}

if (
  !cliHelper.input ||
  typeof cliHelper.input != typeof [] ||
  cliHelper.input.length < 1 ||
  cliHelper.input.length > 2
) {
  // cliHelper.showHelp();
  console.log('run command `help` for instructions');
}

const cmd = cliHelper.input[0];
const flags = cliHelper.flags as MyFlags;

const useExisting = flags.reuse; // if true, will use existing apk in ./download, if false, will force download apks
let keepApks = flags.keep; // if set, the program will not delete the downloaded apks, apks can be found ./downloads folder
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

if (IS_PROD && !flags.debug) {
  // hide all nodejs warnings
  process.removeAllListeners('warning');
}

const cli = async () => {
  switch (cmd) {
    case CMD_LIST: {
      //dowlnoad and analyze list of apps
      await new PickFileCommand(flags).exec();
      pause();
      break;
    }
    case CMD_APK_LIST: {
      //dowlnoad and analyze list of apps
      await new PickFileApkCommand(flags).exec();
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
      flags.keep = true;
      //analyze apk
      await new ApkCommand(flags).exec();
      pause();
      break;
    }
    case CMD_VERSION: {
      // console.log('Banalyzer version=', info.version);
      cliHelper.showVersion();
      break;
    }
    default: {
      //show help
      cliHelper.showHelp();
    }
  }
};
debug(
  'DebugLogs =' + enableLogs,
  ', UseExisting =' + useExisting,
  ', BatchSize = ' + batchSize,
  ', KeepAPKs = ' + keepApks
);

cli();
