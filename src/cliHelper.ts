import { readFileSync } from 'fs';
import meow, { AnyFlags, AnyFlag, Flag, FlagType } from 'meow';
import { pause } from './utils';
import { DEFAULT_BATCH_SIZE } from './consts';
const meowHelp = require('cli-meow-help');

export type MyFlags = {
  debug: boolean;
  keep: boolean;
  reuse: boolean;
  batch: number;
  path: string;
  name: string;
};

const flags: any = {
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
  reuse: {
    type: 'boolean',
    alias: 's',
    default: false,
    desc: 'Re-use existing APKs that are found in download folder',
  },
  batch: {
    type: 'number',
    alias: 'b',
    default: DEFAULT_BATCH_SIZE,
    desc: 'batch size',
  },
  path: {
    type: 'string',
    alias: 'p',
    desc: "APK full path, required when using command 'APK'",
  },
  name: {
    type: 'string',
    alias: 'n',
    desc: "APK package name, required when using Command 'package'",
  },
};

export const CMD_PACKAGE = 'package';
export const CMD_APK = 'apk';
export const CMD_FILE = 'file';
export const CMD_HELP = 'help';
export const CMD_VERSION = 'version';

const commands = {
  help: {
    desc: 'Print help info',
  },
  file: {
    alias: 'f',
    desc: 'choose a file that contains list of package names, to download and analyze their APKs',
  },
  apk: {
    alias: 'a',
    desc: 'specify an APK path to analyze it',
  },
  package: {
    alias: 'p',
    desc: 'specify a pacakge name to download its apk and analyze it',
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

export const commitSuicide = (msg: string) => {
  console.log(''); // empty line
  console.log(' ☹  Banana analyzer has commit suicide  ☹ ');
  console.log('[last words]', msg);
  console.log(
    '(if you think this is an issue with the tool, re-run it with the flag `--enable-logs`, then submit an issue at:',
    cliHelper.pkg.homepage,
    ' and include the logs)'
  );
  pause();
};
