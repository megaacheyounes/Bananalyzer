import { AnalyzedSDKs } from '../../utils/models/analyzedApp';
import { APK } from '../../utils/models/apk';
export declare const analyzeKits: (apk: APK) => Promise<AnalyzedSDKs>;
/**
 * delete all apks in data folder, to avoid re-analyzing them or just to save space
 * @return {nothing}
 */
export declare const cleanDataFolder: () => Promise<void>;
