import { debug } from 'console';
import fs from 'fs';
import YAML from 'yaml';

const analyzeApkToolYml = (apkToolYmlPath: string) => {
  try {
    const content = fs.readFileSync(apkToolYmlPath, 'utf-8');
    const lineToRemove = '!!brut.androlib.meta.MetaInfo';

    const result = YAML.parse(content.replace(lineToRemove, ''));

    return {
      versionName: result['versionInfo']['versionName'],
      versionCode: result['versionInfo']['versionCode'],
    };
  } catch (e) {
    debug(e);
    return {
      versionName: '',
      versionCode: '',
    };
  }
};

export default analyzeApkToolYml;
