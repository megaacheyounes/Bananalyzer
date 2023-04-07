import { AndroidManifest } from '../../utils/models/manifest';
/**
 *
 * @param apk
 * @param options
 * @returns
 * @deprecated
 */
export declare const readManifest: (apk: string, options?: {
    debug: boolean;
}) => Promise<AndroidManifest>;
export default readManifest;
