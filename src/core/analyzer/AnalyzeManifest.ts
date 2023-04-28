import debugModule from 'debug';
import { AndroidManifest, Service, UsesPermission } from '../../models/manifest';
('use strict');
/**
 * this script analyzed the apk using the tool appcheck.jar,
 * then parses the bad results generated by this tool into a human readable text thats easy to read does not hurt the eye lol
 *
 */

import { GOOGLE_MESSAGING_EVENT, HUAWEI_MESSAGING_EVENT, UNKNOWN_INFO } from '../../consts';
import { AnalyzedManifest, SdkVersion } from '../../models/analyzedApp';
import { Action, Activity, IntentFilter } from '../../models/manifest';
import { getAndroidManifestData } from '../../utils/manifestReader';

const debug = debugModule('bananalyzer:ManifestAnalyzer');

export interface AndroidManifestResult {
  appName: string;
}
//to find messaging services
const MESSAGING_EVENT = 'MESSAGING_EVENT';

const analyzeManifest = async (manifestPath: string): Promise<AnalyzedManifest> => {
  let packageName: string = UNKNOWN_INFO;
  let huaweiAppId = UNKNOWN_INFO;
  let versionName = UNKNOWN_INFO;
  let googlePermissions: string[] = [UNKNOWN_INFO];
  let huaweiPermissions: string[] = [UNKNOWN_INFO];

  let googleMetadata: string[] = [UNKNOWN_INFO];
  let huaweiMetadata: string[] = [UNKNOWN_INFO];

  let googleActivities: string[] = [UNKNOWN_INFO];
  let huaweiActivities: string[] = [UNKNOWN_INFO];

  let googleServices: string[] = [UNKNOWN_INFO];
  let huaweiServices: string[] = [UNKNOWN_INFO];

  let googleMessagingServices: string[] = [UNKNOWN_INFO];
  let huaweiMessagingServices: string[] = [UNKNOWN_INFO];

  let hmsVersions: SdkVersion[] = [];

  try {
    const manifestData: AndroidManifest = await getAndroidManifestData(manifestPath);

    packageName = manifestData.package;

    // console.dir(manifestData)
    if (!versionName) versionName = manifestData.versionName || 'NOT FOUND';

    const metadata = manifestData['application']['metaData'];

    googlePermissions = getPermissions(manifestData, 'google');
    huaweiPermissions = getPermissions(manifestData, 'huawei');

    if (!!metadata) {
      const appIdObj = metadata?.find((v) => v.name == 'com.huawei.hms.client.appid');

      let huaweiAppId: string;
      if (!!appIdObj) {
        huaweiAppId = `C${appIdObj.value}`.replace('appid=', '');
      } else {
        huaweiAppId = '';
      }

      huaweiMetadata = getCompanyMetadata(manifestData, 'huawei');
      hmsVersions = getHmsSdkVersion(huaweiMetadata);
      googleMetadata = getCompanyMetadata(manifestData, 'google');
    }

    googleActivities = getActivities(manifestData, 'com.google');
    huaweiActivities = getActivities(manifestData, 'com.huawei');

    googleServices = getServices(manifestData, 'com.google');
    huaweiServices = getServices(manifestData, 'com.huawei');

    googleMessagingServices = getMessagingService(manifestData, GOOGLE_MESSAGING_EVENT);
    huaweiMessagingServices = getMessagingService(manifestData, HUAWEI_MESSAGING_EVENT);
  } catch (e: any) {
    debug('analyzer:failed to parse apk ', packageName);
    // hmmm is an XAPK? a split APK?
    console.log(`⤫ failed to parse AndroidManifest.xml → ${packageName} : ${e.message}`);
    debug(e);
  }

  return {
    packageName,
    versionName,
    huaweiAppId,
    googleMetadata,
    huaweiMetadata,
    googlePermissions,
    huaweiPermissions,
    googleActivities,
    huaweiActivities,
    googleServices,
    huaweiServices,
    googleMessagingServices,
    huaweiMessagingServices,
    hmsVersions,
  };
};

export default analyzeManifest;

/*** parse manifest */
const getHmsSdkVersion = (metadata: string[]): SdkVersion[] => {
  const res: SdkVersion[] = [];
  for (const item of metadata) {
    const regexVer = /(.*):(.*)=(.*):(.*)/;
    const matchRes = item.match(regexVer);
    if (!!matchRes && matchRes!.length > 4) {
      let name = matchRes[3];
      let version = matchRes[4];
      res.push({
        name,
        version,
        accuracy: 'high',
      });
      continue;
    }

    const regexN = /(.*):(.*)=(.*)/;
    const matchResN = item.match(regexN);
    if (!!matchResN && matchResN!.length > 3) {
      let name = matchResN[2];
      let version = matchResN[3];
      res.push({
        name,
        version,
        accuracy: 'medium',
      });
      continue;
    }

    // res.push({
    //   name: item,
    //   accuracy: 'low',
    //   version: '-1',
    // });
  }

  return res;
};

const getCompanyMetadata = (manifestData: AndroidManifest, company: string) =>
  manifestData.application.metaData
    ?.filter((m) => !!m.name && m.name.toLowerCase().indexOf(company) != -1)
    .map((m) => `${m.name}=${m.value}`) || [];

const getPermissions = (manifestData: AndroidManifest, company: string) =>
  manifestData.usesPermissions
    ?.map((obj: UsesPermission | any) => obj.name || obj[''])
    .filter((p: string) => !!p && p.length > 0)
    .filter((p: string) => p.toLowerCase().indexOf(company) != -1) || [];

const getServices = (manifestData: AndroidManifest, prefix: string) =>
  manifestData.application.services
    ?.map((a: Service) => a.name)
    .filter((a: string) => !!a && a.indexOf(prefix) != -1) || [];

const getMessagingService = (manifestData: AndroidManifest, actionName: string) =>
  manifestData.application.services
    ?.filter(
      (s: Service) =>
        (s.intentFilters || [])
          ?.map((i: IntentFilter) => i.action?.map((action: Action) => action.name) || '')
          .join(',')
          .indexOf(actionName) != -1
    )
    .map((s: Service) => s.name) || [];

const getActivities = (manifestData: AndroidManifest, prefix: string) =>
  manifestData.application.activities
    .map((a: Activity) => a.name)
    .filter((a: string) => !!a && a.indexOf(prefix) != -1) || [];
