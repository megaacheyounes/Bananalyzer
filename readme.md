![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/megaacheyounes/bananalyzer)
![GitHub Release Date](https://img.shields.io/github/release-date/megaacheyounes/bananalyzer)
![Platform win64](https://img.shields.io/badge/platform-Win64-red)
![GitHub all releases](https://img.shields.io/github/downloads/megaacheyounes/bananalyzer/total)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/megaacheyounes/bananalyzer/issues)

## Bananalyzer

A simple tool for windows 10, that downloads APKs from Google playstore, analyzes them, and lists all the Google and Huawei SDKs (kits) that are integrated, along with other metadata

## Contents

- [Bananalyzer](#bananalyzer)
- [Contents](#contents)
- [How does it work?](#how-does-it-work)
- [Usage](#usage)
- [Demo](#demo)
- [Download](#download)
- [Instructions](#instructions)
  - [Downloading and analyzing a list of apps](#downloading-and-analyzing-a-list-of-apps)
  - [Downloading and analyzing one app](#downloading-and-analyzing-one-app)
  - [Analyzing a list of APKs](#analyzing-a-list-of-apks)
  - [Analyze one apk](#analyze-one-apk)
- [Use in code](#use-in-code)
  - [get apk direct download link](#get-apk-direct-download-link)
  - [download an APK](#download-an-apk)
  - [analyze an APK](#analyze-an-apk)
- [Notes](#notes)
- [Run locally](#run-locally)
- [Build](#build)
- [TODO](#todo)
- [License](#license)

## How does it work?

This is a simple nodejs script that has been packaged into an executable (exe) for ease of use. it uses chromium to download APKs from playstore using two sources (websites), then it uses a Java tool called "AppCheck" that looks inside the APK and determines what Google and Huawei SDKs are integrated, then it parses the AndroidManifest.xml file to get some metadata, finally the tool exports the results into an excel file (scroll down to see a demo)

## Usage

```

   USAGE

  $ bananalyzer <command> [option]

   COMMANDS

  package  Download and analyze an app by providing its package name
  apk      Analyze an Apk by providing its file path
  list     Download and analyze a list of apps by providing a file that contains their package names
  apklist  Analyze a list of apps by providing a file that contains their apk file paths
  help     Print help information

   OPTIONS

  -p, --path   Apk full path, required when using command 'apk'
  -n, --name   App package name, required when using Command 'package'
  -d, --debug  Print debug logs Default: false
  -k, --keep   Keep downloaded APKs (can be found in downloads/ folder) Default: false
  -b, --batch  Batch size, optional when using command 'file' Default: 3

```

## Demo

<img src="/screenshot/bananalyzer_demo.gif" width="800" height="474"/>

video: [https://github.com/megaacheyounes/Bananalyzer/blob/master/screenshot/bananalyzer_demo.mp4](https://github.com/megaacheyounes/Bananalyzer/blob/master/screenshot/bananalyzer_demo.mp4)

## Download

latest release (Bananalyzer_1.1.1_win64.zip):

[https://github.com/megaacheyounes/Bananalyzer/releases/tag/v1.1.1](https://github.com/megaacheyounes/Bananalyzer/releases/tag/v1.1.1)

## Instructions

### Downloading and analyzing a list of apps

1. Download latest release and extract it
2. create a txt file and write the package names into it, one package name per line, see `example_apps.txt`
3. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
4. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
5. run the command `bananalyzer.exe list -k`
6. Bananalyzer will open a file picker, choose the txt file that you created in **step 1** and click `Open`
7. Bananalyzer will start working, analyzing 3 APKs at a time ( change batch count using `--batch`).
8. when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apps.xlsx`)

### Downloading and analyzing one app

1. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
3. run the command `bananalyzer.exe package --name 'com.package.name' -k`
4. Bananalyzer will start downloading then analyzing the app
5. when finished, the results can be found in an excel file, that has the same name as the package name (example: `com.package.name.xlsx`)

### Analyzing a list of APKs

1. create a txt file and write the apk path into it, one APK path per line, see `example_apklist.txt`
2. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
3. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
4. run the command `bananalyzer.exe apklist -k`
5. Bananalyzer will open a file picker, choose the txt file that you created in **step 1** and click `Open`
6. Bananalyzer will start working, analyzing 3 APKs at a time ( change batch count using `--batch` ).
7. when finished, the results can be found in an excel file, that has the same name as the txt file (example: `example_apklist.xlsx`)

### Analyze one apk

1. open a terminal like PowerShell or cmd (if you use cmd, press enter from time to time)
2. navigate to the folder that contains this tool, example: `cd C://bananalyzer`
3. run the command `bananalyzer.exe apk --path 'C://apks/apk_name.apk'`
4. Bananalyzer will start analyzing the apk
5. when finished, the results can be found in an excel file, that has the same name as the apk file (example: `apk_name.xlsx`)

## Use in code

install

`npm install bananalyzer`

### get apk direct download link

Get direct download link to download APK from PlayStore, Split APKs will be automatically merged into one APK

```typescript
import Bananalyzer from 'bananalyzer';

await Bananalyzer.getDownloadLink('com.aswat.carrefouruae');
/*
result 
{
  packageName: 'com.aswat.carrefouruae',
  source: 'apk.support',
  downloadLink: 'https://cdn.playstoreapi.com/index.php?ecp=6661ba176d3029632f5798bcfcf5d1dc&action=download&type=mapk', 
  apkSize: '32.61 MB',
  versionName: '18.0.21',
  uploadDate: 'Mar 27, 2023'
}
*/
```

### download an APK

download latest apk from PlayStore, APKs will be saved in `/downloads` folder

```typescript
import Bananalyzer from 'bananalyzer';

await Bananalyzer.downloadAPK('com.ubercab.uberlite');
/*
result
 {    
      packageName: 'com.ubercab.uberlite',
      filePath: 'D:\\github\\bananalyzer\\downloads\\com.ubercab.uberlite.apk',
      uploadDate: '27 Jan 2023'
    }
*/
```

### analyze an APK

Analyze an APK, see CLI description above or result below for more details

```typescript
import Bananalyzer from 'bananalyzer';

await Bananalyzer.analyzeAPKs(
  [
    {
      filePath: './sample.apk',
    },
  ],
  true
);
/*
  result
result [
  {
    HMS: [ 'account', 'location', 'ads' ],
    GMS: [],
    packageName: 'com.megaache.trackingsdks',
    versionName: '0',
    huaweiAppId: '',
    googleMetadata: [],
    huaweiMetadata: [],
    googlePermissions: [
      'com.google.android.gms.permission.AD_ID',
      'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE'
    ],
    huaweiPermissions: [
      'com.huawei.permission.sec.MDM.v2',
      'com.huawei.permission.sec.ACCESS_UDID',
      'com.huawei.permission.app.DOWNLOAD'
    ],
    googleActivities: [
      'com.google.android.gms.common.api.GoogleApiActivity',
      'com.google.android.gms.ads.AdActivity',
      'com.google.android.gms.ads.OutOfContextTestingActivity'
    ],
    huaweiActivities: [
      'com.huawei.hms.hwid.internal.ui.activity.HwIdSignInHubActivity',
      'com.huawei.hms.account.internal.ui.activity.AccountSignInHubActivity',
      'com.huawei.opendevice.open.OAIDSettingActivity',
      'com.huawei.opendevice.open.SimplePrivacyActivity',
      'com.huawei.opendevice.open.PrivacyActivity',
      'com.huawei.opendevice.open.WhyThisAdStatementActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InstallActivity',
      'com.huawei.openalliance.ad.ppskit.activity.HMSSDKInstallActivity',
      'com.huawei.openalliance.ad.ppskit.activity.PPSActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InnerPPSActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InnerPPSArActivity',
      'com.huawei.openalliance.ad.ppskit.activity.PPSRewardActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InnerPPSRewardActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InnerPPSInterstitialAdActivity',
      'com.huawei.openalliance.ad.ppskit.activity.InterstitialAdActivity',
      'com.huawei.openalliance.ad.ppskit.activity.AgProtocolActivity',
      'com.huawei.openalliance.ad.ppskit.activity.PPSArActivity',
      'com.huawei.openalliance.ad.ppskit.activity.SplashFeedbackActivity',
      'com.huawei.openalliance.ad.ppskit.activity.AdComplainActivity',
      'com.huawei.openalliance.ad.ppskit.activity.PPSFullScreenNotifyActivity',
      'com.huawei.openalliance.ad.ppskit.activity.ComplianceActivity',
      'com.huawei.openalliance.ad.activity.FeedbackActivity',
      'com.huawei.hms.activity.BridgeActivity',
      'com.huawei.hms.activity.EnableServiceActivity',
      'com.huawei.openalliance.ad.activity.PPSLauncherActivity',
      'com.huawei.openalliance.ad.activity.PPSBridgeActivity',
      'com.huawei.openalliance.ad.activity.PPSNotificationActivity',
      'com.huawei.openalliance.ad.activity.AgProtocolActivity',
      'com.huawei.openalliance.ad.activity.TemplateStubActivity',
      'com.huawei.openalliance.ad.activity.ComplianceActivity'
    ],
    googleServices: [ 'com.google.android.gms.ads.AdService' ],
    huaweiServices: [
      'com.huawei.android.hms.ppskit.PpsCoreService',
      'com.huawei.agconnect.core.ServiceDiscovery'
    ],
    googleMessagingServices: [
      'com.google.android.gms.ads.AdService',
      'androidx.work.impl.background.systemalarm.SystemAlarmService',
      'androidx.work.impl.background.systemjob.SystemJobService',
      'androidx.work.impl.foreground.SystemForegroundService',
      'androidx.room.MultiInstanceInvalidationService',
      'com.huawei.agconnect.core.ServiceDiscovery'
    ],
    huaweiMessagingServices: [
      'com.google.android.gms.ads.AdService',
      'androidx.work.impl.background.systemalarm.SystemAlarmService',
      'androidx.work.impl.background.systemjob.SystemJobService',
      'androidx.work.impl.foreground.SystemForegroundService',
      'androidx.room.MultiInstanceInvalidationService',
      'com.huawei.agconnect.core.ServiceDiscovery'
    ],
    uploadDate: '',
    apkCreationTime: '4/1/2023, 7:49:19 AM'
  }
]

  */
```

## Notes

1. Do not open the Excel file generated, while Bananalyzer is still running
2. Bananalyzer will fail to download some apps that are avaialble in certain regions only
3. Bananalyzer has unlimited lives, and will commit suicide many times, but it's still being developed and will be made more stable :)

## Run locally

1. Install NodeJS and Java
2. Clone the repo `git clone https://github.com/megaacheyounes/Bananalyzer.git`
3. Run `npm install`
4. Run `ts-node index.ts`

## Build

1. clone repo
2. its recommended to install global packages: `npm install --global tsc typescript ts-node coyfiles rimraf @vercel/ncc `
3. install modules: `npm install`
4. run cli: `npm run start`
5. build CLI windows executable (.exe): `npm run build` => result in `dist/`
6. build library to publish to npm: `npm run build:npm` => result in `build/`

## TODO

- [x] Use a proper logging library for debugging instead of console.log
- [x] Migrate to TypeScript
- [x] Add unit tests
- [x] Publish npm module
- [ ] Detect Ads and Tracking SDKs
- [ ] Detect Firebase/AppGallery cloud services
- [ ] Add download options from apk repos (APKMirror, ApkPure, ApkMonk)
- [ ] Improve and add missing documentation

## License

```
No Copyright (!c) 2022 Younes Megaache
All rights can be abused (respectfully)
```
