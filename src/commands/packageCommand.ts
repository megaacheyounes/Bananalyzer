import debugModule from 'debug';
import { downloadAPK } from '../core/downloader';
import { APK } from '../models/apk';
import BrowserManager from '../core/BrowserManager';
import { Command } from './command';

const debug = debugModule('bananalyzer:PackageCommand');

export default class PackageCommand extends Command {
  async exec(): Promise<boolean> {
    const packageName = this.flags.name;
    debug('packagename= ' + packageName);

    if (!packageName) {
      console.log(
        'You must spicify a package name using --name, Example: ` bananalyzer package --name "com.twitter.lite" `'
      );
      this.die();
    }

    const resultFileName: string = packageName;
    const resultPath = this.getResultFilePath(resultFileName);

    let result: APK | null;

    try {
      result = await this.downloadOneAPK(packageName);
    } catch (e) {
      this.clean();
      return false;
    }

    if (!result) {
      this.clean();
      return false; //failed to download
    }

    const notAnalyzed = await this.analyzeAndSave([result], resultPath);

    if (notAnalyzed.length > 0) {
      return false; //failed to analyze
    }

    this.finishSuccessMessage(resultPath);
    this.clean();
    return true;
  }

  async downloadOneAPK(packageName: string): Promise<APK | null> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await downloadAPK(packageName, true, true, false));
      } catch (e) {
        debug(e);
        var error = 'The requested app is not found or invalid';
        if (`${e}`.indexOf('ETIMEDOUT') != -1) {
          error = 'Internet connection is either unavailable or restricted';
        }
        console.log(`⤫ failed to download apk → ${packageName}: ${error} `);
        reject(e);
      }
    });
  }

  async clean(): Promise<boolean> {
    super.clean();
    await BrowserManager.closeBrowser();
    return true;
  }
}
