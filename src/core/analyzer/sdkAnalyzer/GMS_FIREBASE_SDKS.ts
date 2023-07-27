import { SdkSearchLocation, SdkVersionLocation } from './baseSdks';

const PROPERTIES_VERSION = new RegExp('version=(.*)');
const BUILD_CONFIG_SMALI_VERSION_NAME = new RegExp(
  'field public static final VERSION_NAME:Ljava/lang/String; = "(.+)"'
);

export const gmsFirebasePropVersion = (
  fileName: string,
  ifFileExist: string | undefined,
  accuracy: 'high' | 'medium' | 'low' = 'medium'
): SdkVersionLocation => ({
  filePathWildcard: `unknown/${fileName}`,
  versionRegex: PROPERTIES_VERSION,
  ifFileExist,
  accuracy,
});

export const GOOGLE_SMALI_ANNOTATION_VERSION = new RegExp('.source "com.google.android.gms:.*@@(.+)"');
export const FIREBASE_SMALI_ANNOTATION_VERSION = new RegExp('.source "com.google.firebase:.*@@(.+)"');

export const FIREBASE_SDKS: SdkSearchLocation[] = [

  {
    name: 'messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/messaging/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/android/gms/cloudmessaging/CloudMessage.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-messaging.properties', undefined),
      {
        filePathWildcard: 'smali*/com/google/firebase/components/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'analytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/analytics/FirebaseAnalytics.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-analytics.properties', undefined),
    ],
  },
  {
    name: 'crashlytics',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/crashlytics/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-crashlytics.properties', undefined),
    ],
  },
  {
    name: 'dynamic links',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/ktx/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      {
        filePathWildcard: 'smali*/com/google/firebase/dynamiclinks/DynamicLink.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('firebase-dynamic-links.properties', undefined),
      gmsFirebasePropVersion('firebase-dynamic-links-ktx.properties', undefined),
    ],
  },
  {
    name: 'in app messaging',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/inappmessaging/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'performance',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/perf/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-perf-ktx.properties', 'com/google/firebase/perf/FirebasePerformance'),
      gmsFirebasePropVersion('firebase-perf.properties', 'com/google/firebase/perf/FirebasePerformance'),
    ],
  },
  {
    name: 'remote config',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/remoteconfig/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion(
        'firebase-config.properties',
        'smali*/com/google/firebase/remoteconfig/FirebaseRemoteConfig.smali'
      ),
      gmsFirebasePropVersion(
        'firebase-config-ktx.properties',
        'smali*/com/google/firebase/remoteconfig/FirebaseRemoteConfig.smali'
      ),
    ],
  },
  {
    name: 'database',
    versionSearchLocations: [
      gmsFirebasePropVersion(
        'firebase-database.properties',
        'smali*/com/google/firebase/database/FirebaseDatabase.smali'
      ),
    ],
  },
  {
    name: 'installations',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/installations/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-installations.properties', undefined),
    ],
  },
  {
    name: 'play integrity',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/playintegrity/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion(
        'play-services-safetynet.properties',
        'smali*/com/google/android/gms/safetynet/HarmfulAppsData.smali',
        'low'
      ),
      gmsFirebasePropVersion(
        'play-services-safetynet.properties',
        'smali*/com/google/android/gms/safetynet/HarmfulAppsData.smali',
        'low'
      ),
    ],
  },
  {
    name: 'safetynet',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/safetynet/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'appcheck',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appcheck/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
    ],
  },
  {
    name: 'app indexing',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/appindexing/FirebaseAppIndex.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion(
        'firebase-appindexing.properties',
        'smali*/com/google/firebase/appindexing/FirebaseAppIndex.smali'
      ),
    ],
  },
  {
    name: 'ab testing',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/abt/BuildConfig.smali',
        versionRegex: BUILD_CONFIG_SMALI_VERSION_NAME,
      },
      gmsFirebasePropVersion('firebase-abt.properties', 'com/google/firebase/abt/FirebaseABTesting'),
    ],
  },
  {
    name: 'ml vision',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/firebase/ml/vision/FirebaseVision.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion(
        'play-services-vision.properties',
        'smali*/com/google/firebase/ml/vision/FirebaseVision.smali'
      ),
      gmsFirebasePropVersion(
        'play-services-vision.properties',
        'smali*/com/google/android/gms/vision/CameraSource.smali',
        'low'
      ),
    ],
  },
];
export const GOOGLE_SDKS: SdkSearchLocation[] = [
  {
    name: 'admob',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/ads/AdActivity.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      {
        filePathWildcard: 'smali*/com/google/android/gms/ads/AdView.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('play-services-ads.properties', 'smali*/com/google/android/gms/ads/AdView.smali'),
    ],
  },
  {
    name: 'sms retriever',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/auth/api/phone/SmsRetriever.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion('play-services-auth-api-phone.properties', undefined),
    ],
  },
  {
    name: 'fitness',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fitness/Fitness.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'cast',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/cast/Cast.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'youtube player',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/youtube/player/YouTubePlayer.smali',
      },
    ],
  },
  {
    name: 'ml barcode scanner',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/mlkit/vision/barcode/BarcodeScanner.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'billing',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/internal/play_billing/*.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
        accuracy: 'low',
      },
      {
        filePathWildcard: 'smali*/com/android/billingclient/api/BillingResult.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
        accuracy: 'low',
      },
      gmsFirebasePropVersion('billing.properties', '', 'low'),
    ],
  },
  {
    name: 'wallet',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/wallet/Wallet.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'tag manager',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/tagmanager/TagManagerService.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion(
        'play-services-tagmanager-v4-impl.properties',
        'smali*/com/google/android/gms/tagmanager/TagManager.smali'
      ),
      gmsFirebasePropVersion(
        'play-services-tagmanager.properties',
        'smali*/com/google/android/gms/tagmanager/TagManager.smali'
      ),
      {
        filePathWildcard: 'smali*/com/google/android/gms/tagmanager/TagManager.smali',
      },
    ],
  },
  // todo: move to gms services
  {
    name: 'fido',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fido/Fido.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'fido2',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/fido/fido2/Fido2ApiClient.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
    ],
  },
  {
    name: 'location',
    versionSearchLocations: [
      gmsFirebasePropVersion(
        'play-services-location.properties',
        'smali*/com/google/android/gms/location/FusedLocationProviderClient.smali'
      ),
      gmsFirebasePropVersion(
        'play-services-location.properties',
        'smali*/com/google/android/gms/location/LocationResult.smali',
        'low'
      ),
    ],
  },
  {
    name: 'maps',
    versionSearchLocations: [
      gmsFirebasePropVersion('play-services-maps.properties', 'smali*/com/google/android/gms/maps/GoogleMap.smali'),
      gmsFirebasePropVersion(
        'play-services-maps.properties',
        'smali*/com/google/android/gms/maps/MapView.smali',
        'low'
      ),
    ],
  },
  {
    name: 'places',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/libraries/places/widget/Autocomplete.smali',
        versionRegex: new RegExp('"com.google.android.libraries.places:places@@(.*)"'),
      },
      {
        filePathWildcard: 'smali*/com/google/android/libraries/places/api/net/PlacesClient.smali',
        versionRegex: new RegExp('"com.google.android.libraries.places:places@@(.*)"'),
      },
      gmsFirebasePropVersion(
        'places.properties',
        'smali*/com/google/android/libraries/places/widget/AutocompleteSupportFragment.smali',
        'high'
      ),
      gmsFirebasePropVersion(
        'places.properties',
        'smali*/com/google/android/libraries/places/api/net/PlacesClient.smali'
      ),
      gmsFirebasePropVersion(
        'play-services-places-placereport.properties',
        'smali*/com/google/android/libraries/places/widget/AutocompleteFragment.smali'
      ),
    ],
  },
  {
    name: 'signin',
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/google/android/gms/auth/api/signin/GoogleSignInAccount.smali',
        versionRegex: GOOGLE_SMALI_ANNOTATION_VERSION,
      },
      gmsFirebasePropVersion(
        'play-services-auth.properties',
        'smali*/com/google/android/gms/auth/api/signin/GoogleSignInAccount.smali',
        'low'
      ),
      gmsFirebasePropVersion(
        'play-services-auth-base.properties',
        'smali*/com/google/android/gms/auth/api/signin/GoogleSignInAccount.smali',
        'low'
      ),
    ],
  },
];
