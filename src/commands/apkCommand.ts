import { Command } from './command';
import debugModule from 'debug';
import path from 'path';
import { APK } from '../models/apk';
import existsSync from 'node:fs';
const debug = debugModule('ApkCommand');

export default class ApkCommand extends Command {
  async exec(): Promise<boolean> {
    const apkPath = this.flags.path;

    if (!apkPath) {
      console.log(
        'You must spicify an APK\'s path using --path, Example: ` banalyzer apk --path "C:\\apks\\apk_name.apk" `'
      );
      this.clean();
      return false;
    }

    const resultFileName: string = path.basename(apkPath).replace('.apk', '');
    const resultPath = this.getResultFilePath(resultFileName);

    const apk: APK = {
      filePath: apkPath,
    };

    const notAnalyzed = await this.analyzeAndSave([apk], resultPath);

    // if (!!notAnalyzed && notAnalyzed.length > 0) {
    //   console.log('something went wrong while analyzing the apk!');
    //   this.clean();
    //   return false;
    // }

    this.finishSuccessMessage(resultPath);
    this.clean();
    return true;
  }
}
