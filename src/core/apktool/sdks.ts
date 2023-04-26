export type SdkVersionLocation = {
  filePathWildcard: string;
  fileContainsExact?: string;
  versionRegex: RegExp;
};

export type SdkSearchLocation = {
  name: string;
  minVersion?: string;
  maxVersion?: string;
  versionSearchLocations: SdkVersionLocation[];
};

export const STANDARD_SMALI_VERSION_NAME = new RegExp(
  'field public static final VERSION_NAME:Ljava/lang/String; = "(.*)"'
);

export const STANDARD_GMS_SDK_VERSION_REF = new RegExp('.source "com.google.android.gms:.*@@(.*)"');

export const TRACKING_SDKS: SdkSearchLocation[] = [
  {
    name: 'appsflyer_oaid',
    minVersion: '5.4.0',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/appsflyer/oaid/BuildConfig.smali',
        fileContainsExact: '.class public final Lcom/appsflyer/oaid/BuildConfig;',
        versionRegex: new RegExp('field public static final VERSION_NAME:Ljava/lang/String; = "(.*)"'),
      },
    ],
  },
];

export const GMS_SDKS: SdkSearchLocation[] = [
  {
    name: 'admob',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/ads/AdActivity.smali',
        versionRegex: STANDARD_GMS_SDK_VERSION_REF,
      },
    ],
  },
  {
    name: 'cloud messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/cloudmessaging/CloudMessage.smali',
        versionRegex: STANDARD_GMS_SDK_VERSION_REF,
      },
    ],
  },
];

export const AG_CLOUD_SERVICES: SdkSearchLocation[] = [
  {
    name: 'auth',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/auth/BuildConfig.smali',
        versionRegex: STANDARD_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'credential',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/credential/BuildConfig.smali',
        versionRegex: STANDARD_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'core',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/core/BuildConfig.smali',
        versionRegex: STANDARD_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'datastore',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/huawei/agconnect/datastore/BuildConfig.smali',
        versionRegex: STANDARD_SMALI_VERSION_NAME,
      },
    ],
  },
];
