import meow from 'meow';
export declare type MyFlags = {
    debug: boolean;
    keep: boolean;
    reuse: boolean;
    batch: number;
    path: string;
    name: string;
};
export declare const CMD_PACKAGE = "package";
export declare const CMD_APK = "apk";
export declare const CMD_LIST = "list";
export declare const CMD_APK_LIST = "apklist";
export declare const CMD_HELP = "help";
export declare const CMD_VERSION = "version";
declare const cliHelper: meow.Result<any>;
export default cliHelper;
export declare const commitSuicide: (msg: string) => boolean;
