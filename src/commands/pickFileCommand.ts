import debugModule from 'debug';
import { delay } from '../core/utils';
import { pickFile } from '../core/filePicker';
import { commitSuicide, MyFlags } from '../cliHelper';
import fs from 'fs';
import { MAX_PACKAGE_NAMES } from '../consts';
import path from 'path';
import { APK } from '../utils/models/apk';
import PackageCommand from './packageCommand';

const debug = debugModule('PickFile');

export class PickFileCommand extends PackageCommand {
  async exec(): Promise<boolean> {
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

    if (packageNames.length > MAX_PACKAGE_NAMES) {
      return commitSuicide(
        '(●_●) Downloading and Analyzing more than 200 apps at a time can have serious consquences on you, your gf, your crypto wallet and the future of humanity!'
      );
    }

    const resultFileName: string = path.basename(packageNamesFile).split('.')[0];
    const resultPath = this.getResultFilePath(resultFileName);

    let batchNum = 0;

    const batchCount: number = Math.ceil(packageNames.length / this.flags.batch);

    const failedToDownload: string[] = [];
    const failedToAnalyze: string[] = [];

    for (let i = 0; i < packageNames.length; i += this.flags.batch) {
      const promises: Promise<APK | null>[] = [];
      batchNum++;
      const nextBatch = packageNames.slice(i, i + this.flags.batch);
      console.log('Batch #' + batchNum + ' =', nextBatch);

      // 1- download a batch
      nextBatch.forEach((packageName) => promises.push(this.downloadOneAPK(packageName)));

      const prs = await Promise.allSettled(promises);
      // done downloading X apks, lets analyze them

      const batchDownloadedApks: APK[] = prs.map((pr: any) => pr.value).filter((result: APK | null) => result != null);
      debug(batchDownloadedApks);

      const downloadedApksCount = batchDownloadedApks.length;
      debug('downloaded apks: ' + downloadedApksCount);

      const batchFailed = nextBatch.filter((pn) => !batchDownloadedApks.map((c) => c.packageName).includes(pn));

      debug('batch #' + batchNum + ' failed ==>> ' + batchFailed);

      failedToDownload.push(...batchFailed);

      if (downloadedApksCount == 0) {
        continue; // all dowlnoads failed, proces to next batch
      }

      const batchNotAnalyzed = await this.analyzeAndSave(batchDownloadedApks, resultPath);

      failedToAnalyze.push(...batchNotAnalyzed.map((apk: APK) => apk.packageName!!));

      console.log(`✓ Batch #${batchNum} of ${batchCount} finished`);
    }
    const failedCount = failedToDownload.length + failedToAnalyze.length;

    const successCount = packageNames.length - failedCount;
    const showAll = successCount == 0 && failedToDownload.length > 2;

    console.log(
      `Analyzed ${successCount} of ${packageNames.length} apps  (${failedCount} failed${showAll ? ' (ALL) ' : ''})`
    );

    if (failedToDownload.length > 0) console.log('APKs not downloaded ==> ', failedToDownload);
    if (failedToAnalyze.length > 0) console.log('APKs not analyzed ==> ', failedToAnalyze);

    this.finishSuccessMessage(resultPath);
    return this.clean();
  } //exec
}
