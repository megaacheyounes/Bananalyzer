import meow, { AnyFlag, AnyFlags } from 'meow';
import { DEFAULT_BATCH_SIZE } from './consts';
//@ts-ignore
import meowHelp from 'cli-meow-help';

export type MyFlags = {
  debug: boolean;
  keep: boolean;
  reuse: boolean;
  batch: number;
  path: string;
  name: string;
};

const flags: any = {
  path: {
    type: 'string',
    alias: 'p',
    default: '',
    desc: "Apk full path, required when using command 'apk'",
  },
  name: {
    type: 'string',
    alias: 'n',
    default: '',
    desc: "App package name, required when using Command 'package'",
  },
  debug: {
    type: 'boolean',
    default: false,
    alias: 'd',
    desc: 'Print debug logs',
  },
  keep: {
    type: 'boolean',
    alias: 'k',
    default: false,
    desc: 'Keep downloaded APKs (can be found in downloads/ folder)',
  },
  // reuse: {
  //   type: 'boolean',
  //   alias: 'r',
  //   default: false,
  //   desc: 'Re-use existing APKs that are found in download folder',
  // },
  batch: {
    type: 'number',
    alias: 'b',
    default: DEFAULT_BATCH_SIZE,
    desc: "Batch size, optional when using command 'file'",
  },
};

export const CMD_PACKAGE = 'package';
export const CMD_APK = 'apk';
export const CMD_LIST = 'list';
export const CMD_APK_LIST = 'apklist';
export const CMD_HELP = 'help';
export const CMD_VERSION = 'version';

const commands = {
  [CMD_PACKAGE]: {
    desc: 'Download and analyze an app by providing its package name',
  },
  [CMD_APK]: {
    desc: 'Analyze an Apk by providing its file path',
  },
  [CMD_LIST]: {
    desc: 'Download and analyze a list of apps by providing a file that contains their package names',
  },
  [CMD_APK_LIST]: {
    desc: 'Analyze a list of apps by providing a file that contains their apk file paths',
  },
  [CMD_HELP]: {
    desc: 'Print help information',
  },
};

const helpText = meowHelp({
  name: 'bananalyzer',
  flags,
  commands,
});

const options = {
  inferType: true,
  description: '',
  hardRejection: false,
  flags,
};

const cliHelper = meow(helpText, options);

export default cliHelper;

export const commitSuicide = (msg: string): boolean => {
  console.log(''); // empty line
  console.log(` ☹  ${cliHelper.pkg.name} has commit suicide  ☹ `);
  console.log(''); // empty line
  console.log('[last words]', msg);
  console.log(
    '(if you think this is an issue with the tool, re-run the command with the flag `--debug`, then submit an issue at:',
    cliHelper.pkg.homepage,
    ' and include the logs)'
  );
  return false;
};
