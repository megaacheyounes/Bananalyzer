import fs from 'fs';
import YAML from 'yaml';

const analyzeApkToolYml = (apkToolYmlPath: string) => {
  if (!fs.existsSync(apkToolYmlPath)) {
    return {
      versionName: '',
      versionCode: '',
    };
  }
  const result = YAML.parse(fs.readFileSync(apkToolYmlPath, 'utf-8'));

  const versionName = result['versionInfo']['versionName'];
  const versionCode = result['versionInfo']['versionCode'];

  return {
    versionName,
    versionCode,
  };
};

export default analyzeApkToolYml;
