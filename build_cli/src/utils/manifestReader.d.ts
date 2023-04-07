import { Activity, AndroidManifest } from './models/manifest';
import { ParsedManifest } from './manifestParser';
export declare const INTENT_MAIN = "android.intent.action.MAIN";
export declare const CATEGORY_LAUNCHER = "android.intent.category.LAUNCHER";
export declare const getAndroidManifestData: (manifestPath: string) => Promise<AndroidManifest>;
export declare const transformToManifest: (parsedManifest: ParsedManifest) => AndroidManifest;
export declare const isLauncherActivity: (activity: Activity) => boolean | undefined;
