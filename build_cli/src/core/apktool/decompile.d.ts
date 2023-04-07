import { APK } from '../../utils/models/apk';
interface DecompileResult {
    isSuccessful: boolean;
    decompileFolderPath?: string;
    manifestPath?: string;
    error?: string;
}
export declare const decompileApk: (apk: APK, keepSources: boolean) => Promise<DecompileResult>;
export {};
