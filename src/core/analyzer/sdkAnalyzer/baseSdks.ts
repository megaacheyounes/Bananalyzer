export type SdkVersionLocation = {
  filePathWildcard: string;
  fileContainsExact?: string;
  versionRegex?: RegExp;
  ifFileExist?: string;
  accuracy?: 'high' | 'medium' | 'low';
};

export type SdkSearchLocation = {
  name: string;
  minVersion?: string[];
  maxVersion?: string;
  versionSearchLocations: SdkVersionLocation[];
};

export const BUILD_CONFIG_SMALI_VERSION_NAME = new RegExp(
  'field public static final VERSION_NAME:Ljava/lang/String; = "(.+)"'
);

export const GOOGLE_SMALI_ANNOTATION_VERSION = new RegExp('.source "com.google.android.gms:.*@@(.+)"');
export const FIREBASE_SMALI_ANNOTATION_VERSION = new RegExp('.source "com.google.firebase:.*@@(.+)"');
export const PROPERTIES_VERSION = new RegExp('version=(.*)');

export const gmsFirebasePropVersion = (
  fileName: string,
  ifFileExist = '',
  accuracy: 'high' | 'medium' | 'low' = 'medium'
): SdkVersionLocation => ({
  filePathWildcard: `unknown/${fileName}`,
  versionRegex: PROPERTIES_VERSION,
  ifFileExist,
  accuracy,
});
