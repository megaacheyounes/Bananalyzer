import { Command } from './command';
import { APK } from '../models/apk';
import { downloadAPK, downoadChromiumIfMissing, closeBrowser } from '../core/downloader';
import debugModule from 'debug';

const debug = debugModule('PackageCommand');

export default class PackageCommand extends Command {
  async downloadChromium() {
    try {
      await downoadChromiumIfMissing();
    } catch (e) {
      debug(e);
    }
  }

  async exec(): Promise<boolean> {
    const packageName = this.flags.name;
    debug('packagename= ' + packageName);

    const resultFileName: string = packageName;
    const resultPath = this.getResultFilePath(resultFileName);

    this.downloadChromium();

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

    this.clean();
    return true;
  }

  async downloadOneAPK(packageName: string): Promise<APK | null> {
    try {
      return downloadAPK(packageName, this.flags.reuse);
    } catch (e) {
      debug(e);
      console.log('⤫ failed to download apk → ', packageName, ': The requested app is not found or invalid');
      return null;
    }
  }

  async clean(): Promise<boolean> {
    super.clean();
    await closeBrowser();
    return true;
  }
}
