import { MyFlags } from '../cliHelper';
import { APK } from '../utils/models/apk';
export declare abstract class Command {
    flags: MyFlags;
    constructor(flags: MyFlags);
    abstract exec(): Promise<boolean>;
    die(): Promise<boolean>;
    clean(): Promise<boolean>;
    getResultFilePath(fileName: string): string;
    /**
     *
     * @param apks list of apks to analyze
     * @param resultPath path of excel file where the result will be saved
     * @returns list of APKs that were failed to analyze
     */
    analyzeAndSave(apks: APK[], resultPath: string): Promise<APK[]>;
    finishSuccessMessage(resultPath: string): void;
}
