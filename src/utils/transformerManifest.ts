import { parse } from 'path';
import { parseBooleans } from 'xml2js/lib/processors';
import {
  Action,
  Activity,
  AndroidManifest,
  Application,
  Category,
  IntentFilterData,
  Intent,
  IntentCategory,
  IntentData,
  IntentFilter,
  Package,
  Query,
  UsesFeature,
  UsesPermission,
  UsesSdk,
  MetaData,
  Service,
  Receiver,
  UsesLibrary,
  Provider,
} from '../models/manifest';
import { ManifestRoot } from './xml2json';

import {
  Application as XmlApplication,
  Service as XmlService,
  Receiver as XmlReceiver,
  Provider as XmlProvider,
  UsesLibrary as XmlUsesLibrary,
  IntentFilter as XmlIntentFilter,
  Metadata as XmlMetadata,
  Package as XmlPackage,
} from './xml2json';

const transformToManifestType = (parsedManifest: ManifestRoot): AndroidManifest => {
  return {
    versionCode: versionCode(parsedManifest),
    //   versionName: string,
    //   compileSdkVersion: number,
    //   compileSdkVersionCodename: string,
    //   package: string,
    //   platformBuildVersionCode: number,
    //   platformBuildVersionName: number,
    //   usesPermissions: UsesPermission[],
    //   permissions: any[],
    //   permissionTrees: any[],
    //   permissionGroups: any[],
    //   instrumentation?: any,
    //   usesSdk: UsesSdk,
    //   usesConfiguration?: any,
    //   usesFeatures: UsesFeature[],
    //   supportsScreens?: any,
    //   compatibleScreens: any[],
    //   supportsGlTextures: any[],
    //   application: Application,
  };
};

const versionCode = (parsedManifest: ManifestRoot) => {
  //todo:
  return '0';
};

const versionName = (xml: ManifestRoot): string => {
  //todo:
  return '0';
};
const compileSdkVersion = (xml: ManifestRoot): string => {
  return xml.manifest.$['android:compileSdkVersion'];
};
const compileSdkVersionCodename = (xml: ManifestRoot): string => {
  return xml.manifest.$['android:compileSdkVersionCodename'];
};
const pakage = (xml: ManifestRoot): string => {
  return xml.manifest.$.package;
};
const platformBuildVersionCode = (xml: ManifestRoot): string => {
  return xml.manifest.$.platformBuildVersionCode;
};
const platformBuildVersionName = (xml: ManifestRoot): string => {
  return xml.manifest.$.platformBuildVersionName;
};
const usesPermissions = (xml: ManifestRoot): UsesPermission[] => {
  const result: UsesPermission[] = [];
  xml.manifest['uses-permission'].forEach((permission) => {
    result.push({
      name: permission.$['android:name'],
      maxSdkVersion: permission.$['android:maxSdkVersion'],
    });
  });
  return result;
};
const permissions = (xml: ManifestRoot): any[] => {
  return undefined as any;
};
const permissionTrees = (xml: ManifestRoot): any[] => {
  return undefined as any;
};
const permissionGroups = (xml: ManifestRoot): any[] => {
  return undefined as any;
};
const instrumentation = (xml: ManifestRoot): any => {
  return undefined as any;
};
const usesSdk = (xml: ManifestRoot): UsesSdk => {
  return undefined as any;
};
const usesConfiguration = (xml: ManifestRoot): any => {
  return undefined as any;
};
const usesFeatures = (xml: ManifestRoot): UsesFeature[] => {
  const result: UsesFeature[] = [];
  xml.manifest['uses-feature'].forEach((feature) => {
    result.push({
      name: feature.$['android:name'],
      required: feature.$['android:required'] == 'true',
    });
  });
  return result;
};
const supportsScreens = (xml: ManifestRoot): any => {
  return undefined as any;
};
const compatibleScreens = (xml: ManifestRoot): any[] => {
  return undefined as any;
};
const supportsGlTextures = (xml: ManifestRoot): any[] => {
  return undefined as any;
};
const queries = (xml: ManifestRoot): Query[] => {
  const result: Query[] = [];
  xml.manifest.queries.forEach((query) => {
    const intent: Intent[] = query.intent.map((xmlQuery) => {
      const action: Action[] | undefined = xmlQuery.action.map((xmlQueryAction) => ({
        name: xmlQueryAction.$['android:name'],
      }));

      const category: IntentCategory[] | undefined = xmlQuery.category?.map((xmlQueryCategory) => ({
        name: xmlQueryCategory.$['android:name'],
      }));

      const data: IntentData[] | undefined = xmlQuery.data?.map((xmlQueryData) => ({
        mimeType: xmlQueryData.$['android:mimeType'],
        scheme: xmlQueryData.$['android:scheme'],
      }));

      return {
        action,
        category,
        data,
      };
    });

    const pakage: Package[] = query.package.map((pakage: XmlPackage) => ({ name: pakage.$['android:name'] }));

    result.push({
      intent,
      package: pakage,
    });
  });

  return result;
};

const application = (xml: ManifestRoot): Application => {
  const app = xml.manifest.application[0];
  //todo: test
  const application: Application = {
    theme: app.$['android:theme'],
    label: app.$['android:label'],
    icon: app.$['android:icon'],
    name: app.$['android:name'],
    allowBackup: parseBool(app.$['android:allowBackup']),
    hardwareAccelerated: undefined,
    supportsRtl: parseBool(app.$['android:supportsRtl']),
    networkSecurityConfig: app.$['android:networkSecurityConfig'],
    roundIcon: undefined,
    appComponentFactory: app.$['android:appComponentFactory'],
    requestLegacyExternalStorage: parseBool(app.$['android:requestLegacyExternalStorage']),
    activities: activities(app),

    //todo: implement
    activityAliases: activityAliases(app) as any,
    launcherActivities: launcherActivities(app),

    services: services(app),
    receivers: receiver(app),
    providers: provider(app),
    usesLibraries: usesLibrary(app),
    metaData: metaData(app['meta-data']),
  };

  return application;
};

const launcherActivities = (app: XmlApplication): Activity[] => {
  const result: Activity[] = [];

  app.activity;

  return result;
};
const activityAliases = (app: XmlApplication): Activity | undefined => {
  return undefined;
};

const services = (app: XmlApplication): Service[] => {
  const result: Service[] = [];

  app.service.forEach((xmlService: XmlService) => {
    result.push({
      name: xmlService.$['android:name'],
      exported: parseBool(xmlService.$['android:exported']),
      intentFilters: intentFilter(xmlService['intent-filter'] as any),
      metaData: metaData(xmlService['meta-data']),
      permission: xmlService.$['android:permission'],
      enabled: parseBool(xmlService.$['android:enabled']),
    });
  });

  return result;
};

const metaData = (xmlMetadata: XmlMetadata[] | undefined): MetaData[] => {
  const result: MetaData[] = [];

  xmlMetadata?.forEach((xmlMetaData: XmlMetadata) => {
    return {
      name: xmlMetaData.$['android:name'],
      value: xmlMetaData.$['android:value'],
      resource: xmlMetaData.$['android:value'],
      //todo:
      screenOrientation: '',
    };
  });
  return result;
};

const receiver = (app: XmlApplication): Receiver[] => {
  const result: Receiver[] = [];

  app.receiver.forEach((xmlReceiver: XmlReceiver) => {
    result.push({
      name: xmlReceiver.$['android:name'],
      intentFilters: intentFilter(xmlReceiver['intent-filter'] as any),
      //todo:
      metaData: undefined,
      exported: parseBool(xmlReceiver.$['android:exported']),
      permission: xmlReceiver.$['android:permission'],
      enabled: parseBool(xmlReceiver.$['android:enabled']),
    });
  });

  return result;
};

const usesLibrary = (app: XmlApplication): UsesLibrary[] => {
  const result: UsesLibrary[] = [];

  app['uses-library'].forEach((xmlLib: XmlUsesLibrary) => {
    return { name: xmlLib.$['android:name'], required: parseBool(xmlLib.$['android:required']) };
  });

  return result;
};

const provider = (app: XmlApplication): Provider[] => {
  const result: Provider[] = [];

  app['uses-library'].forEach((xmlLib: XmlUsesLibrary) => {});

  return result;
};

const activities = (app: XmlApplication): Activity[] => {
  const result: Activity[] = [];

  app.activity.map((act) => {
    //todo:
    const metaData: MetaData[] | undefined = undefined;

    //todo: add missing field
    result.push({
      name: act.$['android:name'],
      exported: parseBool(act.$['android:exported']),
      screenOrientation: act.$['android:screenOrientation'],
      intentFilters: intentFilter(act['intent-filter']),
      metaData,
      launchMode: act.$['android:launchMode'],
      theme: act.$['android:theme'],
      label: act.$['android:label'],
      configChanges: act.$['android:configChanges'],
      windowSoftInputMode: act.$['android:windowSoftInputMode'],
      hardwareAccelerated: parseBool(act.$['android:hardwareAccelerated']),
      process: act.$['android:process'],
      excludeFromRecents: parseBool(act.$['android:excludeFromRecents']),
      permission: '',
    });
  });

  return result;
};

const intentFilter = (xmlIntentFilter: XmlIntentFilter[] | undefined): IntentFilter[] | undefined =>
  xmlIntentFilter?.map((intent) => {
    const action: Action[] = intent.action.map((xmlAction) => ({
      name: xmlAction.$['android:name'],
    }));

    const category: Category[] = intent.category.map((xmlCategory) => ({
      name: xmlCategory.$['android:name'],
    }));

    const data: IntentFilterData[] | undefined = intent.data?.map((xmlIntentData) => ({
      host: xmlIntentData.$['android:host'],
      scheme: xmlIntentData.$['android:scheme'],
      pathPattern: xmlIntentData.$['android:pathPattern'],
    }));

    return {
      action,
      category,
      data,
    };
  });

const parseBool = (value: string | undefined) => (value == undefined ? undefined : value == 'true');
