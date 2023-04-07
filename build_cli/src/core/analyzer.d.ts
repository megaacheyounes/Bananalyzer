import { AnalyzedApp } from '../utils/models/analyzedApp';
import { APK } from '../utils/models/apk';
/**
 *
 * @param {array} apks: list of downloaded apps/apk to analyze, example = [
 * {packageName:"package.name":filePath:"path/to/file.apk", uploadDate:"may 27, 2021"}
 * ]
 * @return {AnalyzedApp[]} resolved when all apks in packageNamesObj are analyzed
 * result example = {
 *    'com.landmarkgroup.splashfashions': {
 *     HMS: [ 'push' ],
 *      GMS: [ 'account', 'push', 'location', 'map', 'analytics', 'ads' ]
 *   }
 */
export declare const analyzeAPKs: (apks: APK[], keepApks?: boolean) => Promise<AnalyzedApp[]>;
