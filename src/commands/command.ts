import path from 'path';
import { MyFlags, commitSuicide } from '../cliHelper';
import { cleanDataFolder, analyzeAPKs } from '../core/analyzer';
import { APK } from '../models/apk';
import { AnalyzedApk } from '../models/analyzedApp';
import { saveResult } from '../core/ExcelHelper';
import { EXPORT_DIR } from '../consts';
import debugModule from 'debug';
const debug = debugModule('command');

export abstract class Command {
  flags: MyFlags;
  constructor(flags: MyFlags) {
    this.flags = flags;
  }
  abstract exec(): Promise<boolean>;

  async die(): Promise<boolean> {
    this.clean();
    process.exit(2);
  }

  async clean(): Promise<boolean> {
    console.log();
    console.log('Releasing resources...');

    await cleanDataFolder();
    return true;
  }

  getResultFilePath(fileName: string): string {
    return `${path.join(EXPORT_DIR, fileName + '.xlsx')}`;
  }

  /**
   *
   * @param apks list of apks to analyze
   * @param resultPath path of excel file where the result will be saved
   * @returns list of APKs that were failed to analyze
   */
  async analyzeAndSave(apks: APK[], resultPath: string): Promise<APK[]> {
    // 2- analyze the batch
    // delete previous batch (not original (downloaded) APKs) if exists
    await cleanDataFolder();

    const analyzerRes: AnalyzedApk[] = await analyzeAPKs(apks, this.flags.keep);
    debug('anlyzer res: ', analyzerRes);

    const notAnalyzed: APK[] = apks.filter(
      (apk: APK) => !analyzerRes.map((app: AnalyzedApk) => app.packageName).includes(apk.packageName || '')
    );

    await saveResult(analyzerRes, resultPath).catch((e) => {
      return commitSuicide(`(╯°□°)╯︵ ┻━┻ I couldn't write to excel file (close the file '${resultPath}' if its open)`);
    });
    return notAnalyzed;
  }

  finishSuccessMessage(resultPath: string) {
    console.log(`✔✔ DONE → ${resultPath}  ( ͡~ ͜ʖ ͡°) `);
  }
}
