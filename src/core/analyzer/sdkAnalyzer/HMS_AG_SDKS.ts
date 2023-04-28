import { BUILD_CONFIG_SMALI_VERSION_NAME, SdkSearchLocation } from './baseSdks';

export const HMS_AG_CLOUD_SERVICES: SdkSearchLocation[] = [
  {
    name: 'auth',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/auth/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'app messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/appmessaging/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'crash service',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/crash/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'location core',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/hms/location/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'cloud storage',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/cloud/storage/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'cloud db',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/cloud/database/AGConnectCloudDB.smali',
        versionRegex: new RegExp('const-string p., "(\\d.+)"'),
      },
    ],
  },
  {
    name: 'cloud function',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/function/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
];
