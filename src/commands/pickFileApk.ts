import debugModule from 'debug';
import { delay } from '../core/utils';
import { pickFile } from '../core/filePicker';
import { commitSuicide, MyFlags } from '../cliHelper';
import fs from 'fs';
import { MAX_PACKAGE_NAMES } from '../consts';
import path from 'path';
import { APK } from '../models/apk';
import PackageCommand from './packageCommand';

const debug = debugModule('PickFile');

export class PickFileApkCommand extends PackageCommand {
  async exec(): Promise<boolean> {
    // 1 - get package names
    console.log('choose a txt file that contains the list of apk pathss');
    // give user some time to read the message above
    await delay(500);

    let apksFileName = null;
    try {
      apksFileName = await pickFile();
      debug('apk paths file', apksFileName);
    } catch (e) {
      debug(e);
      return commitSuicide("I couldn't read your txt file ¯\\_(ツ)_/¯");
    }

    debug('continue after file selections');
    let apkPaths: string[];
    try {
      const data = fs.readFileSync(apksFileName, 'utf8').toString();

      // convert data into array
      apkPaths = data
        .split('\n')
        // remove empty lines and any spaces after or before package names
        .map((pn) => pn.trim())
        .filter((pn) => pn.length > 0)
        // ignore commented package names (that starts with // )  :)
        .filter((pn) => pn.indexOf('//') == -1);

      debug(apkPaths);
    } catch (e) {
      debug(e);
      return commitSuicide(
        '(●_●) make sure the txt file exists and its format is UTF8, then throw some package names in it!'
      );
    }

    if (apkPaths.length > MAX_PACKAGE_NAMES) {
      return commitSuicide(
        '(●_●) Downloading and Analyzing more than 200 apks at a time can have serious consquences on you, your gf, your crypto wallet and the future of humanity!'
      );
    }

    const resultFileName: string = path.basename(apksFileName).split('.')[0];
    const resultPath = this.getResultFilePath(resultFileName);

    var failedToAnalyze: APK[] = [];

    for (let i = 0; i < apkPaths.length; i++) {
      const apkPath = apkPaths[i];
      const apk: APK = {
        filePath: apkPath,
      };

      await this.analyzeAndSave([apk], resultPath);
    }

    if (failedToAnalyze.length > 0) console.log('APKs not analyzed ==> ', failedToAnalyze);

    this.finishSuccessMessage(resultPath);
    return this.clean();
  } //exec
}
