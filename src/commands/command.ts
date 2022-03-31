import path from 'path';
import { MyFlags, commitSuicide } from '../cliHelper';
import { cleanDataFolder, analyzeAPKs } from '../core/analyzer';
import { APK } from '../models/apk';
import { AnalyzedApk } from '../models/analyzedApk';
import { saveResult } from '../core/ExcelHelper';
import { EXPORT_DIR } from '../consts';

export abstract class Command {
  flags: MyFlags;
  constructor(flags: MyFlags) {
    this.flags = flags;
  }
  abstract exec(): Promise<boolean>;

  async clean(): Promise<boolean> {
    console.log();
    console.log('Releasing resources...');

    await cleanDataFolder();
    return true;
  }

  getResultFilePath(fileName: string): string {
    return `${path.join(EXPORT_DIR, fileName + '.xlsx')}`;
  }

  async analyzeAndSave(apks: APK[], resultPath: string): Promise<APK[]> {
    // 2- analyze the batch
    // delete previous batch (not original (downloaded) APKs) if exists
    await cleanDataFolder();

    const analyzerRes: AnalyzedApk[] = await analyzeAPKs(apks, this.flags.keep);
    console.log('anlyzer res: ', analyzerRes);

    const notAnalyzed: APK[] = apks.filter(
      (apk: APK) => !analyzerRes.map((app: AnalyzedApk) => app.packageName).includes(apk.packageName)
    );

    try {
      await saveResult(analyzerRes, resultPath);
    } catch (e) {
      commitSuicide(`(╯°□°)╯︵ ┻━┻ I couldn't write to excel file (close the file '${resultPath}' if its open)`);
    }
    return notAnalyzed;
  }

  finishSuccessMessage(resultPath: string) {
    console.log(`✔✔ DONE → ${resultPath}  ( ͡~ ͜ʖ ͡°) `);
  }
}
