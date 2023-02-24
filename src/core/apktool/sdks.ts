export type MinVersion = {
  OAID: string;
  referrer?: string;
};
export type SdkVersionLocation = {
  filePathWildcard: string;
  fileContainsExact: string;
  versionRegex: RegExp;
};

export type TrackingSDK = {
  name: string;
  minVersion: MinVersion;
  versionSearchLocations: SdkVersionLocation[];
};
export const TRACKING_SDKS: TrackingSDK[] = [
  {
    name: 'appsflyer_oaid',
    minVersion: {
      OAID: '5.4.0',
    },
    versionSearchLocations: [
      {
        filePathWildcard: 'smali*/com/appsflyer/oaid/*.smali',
        fileContainsExact: '.class public final Lcom/appsflyer/oaid/BuildConfig;',
        versionRegex: new RegExp('field public static final VERSION_NAME:Ljava/lang/String; = "(.*)"'),
      },
    ],
  },
  //   {
  //     appsflyer: [
  //       {
  //         name: 'appsflyer',
  //         minVersion: {
  //           OAID: '5.4.0',
  //           referrer: '6.2.3',
  //         },
  //         versionLocation: [
  //           {
  //             filePath: '*/smali*/appsflyer/*.smali',
  //             contains: ['com/appsflyer/AFLogger'],
  //             versionRegex: 'const-string v2, "AppsFlyer_(.*)"',
  //           },
  //         ],
  //       },
  //     ],
  //   },
];
