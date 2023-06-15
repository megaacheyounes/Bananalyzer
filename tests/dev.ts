import Bananalyzer from '../src/index';

import { execa } from '@esm2cjs/execa';
import debugModule from 'debug';
import { APKTOOL_JAR } from '../src/consts';
import { decompileApk } from '../src/core/apktool/decompile';
import path from 'path';

const keepApks = true;
const useExisting = true;
debugModule.enable('*');

(async () => {

  //****************** */
  // const dPath = path.join(".", "decompile", "twitter")
  // console.log('dpath', dPath)
  // const args = [
  //   '-jar',
  //   APKTOOL_JAR,
  //   'd',
  //   //  '-v',
  //   '--no-assets',
  //   // '--no-res',
  //   '--only-main-classes',
  //   '-f',
  //   `-o ${dPath}`,
  //   path.join(__dirname, 'samples', 'com.twitter.android.lite.apk'),
  // ]
  // const { status, stdout, stderr, childJavaProcess } = await java.run(, {
  //   detached: true
  // });

  // const { stdout, stderr } = await execa('java', args)

  // console.log(stdout);
  // console.log(stderr);

  // non-cli usage example
  // const supportedSdksRes = Bananalyzer.getSupportedSdks();
  // console.log('getSupportedSdks', supportedSdksRes);
  // fs.writeFileSync('getSupportedSdks.json', JSON.stringify(supportedSdksRes), 'utf-8');

  //***************** get app details  */
  // const appDetails = await Bananalyzer.getAppDetails('com.facebook.lite');
  // console.log('appDetails', appDetails);

  // const dl = await Bananalyzer.getDownloadLink('com.asdfasdf.pricena');
  // console.log('dl', dl);

  // const downloadAPK = await Bananalyzer.downloadAPK('com.facebook.lite', true);
  // console.log('downloadAPK', downloadAPK);


  const decompileApk = await Bananalyzer.decompileApk({
    filePath: './tests/samples/com.twitter.android.lite.apk'
  });
  console.log('decompileApk', decompileApk);


  // // const start = Date.now();

  // const result = await Bananalyzer.analyzeAPKs(
  //   [
  //     {
  //       // filePath: downloadAPK.filePath,
  //       filePath: './tests/samples/com.twitter.android.lite.apk'
  //     },
  //   ],
  //   true
  // );
  // console.log('result', result);
  // fs.writeFileSync('test_dev_analyzer_res.json', JSON.stringify(result), 'utf-8');
  // await saveResult(result, 'com.ubercab.uberlite.xlsx');
  //*****   sdk analyzer  */

  // const decompilePath = 'D:\\CODE\\_huawei\\Bananalyzer\\decompile\\sample_2.apk';
  // if (!fs.existsSync(decompilePath)) {
  //   return console.warn('path does not exist, see test/dev.ts');
  // }
  // const sdksRes = await analyzeSdks(decompilePath);

  // console.log(JSON.stringify(sdksRes));

  // ******************************
  // todo: test getInnerApk (xapk)
  // const path = await getInnerApk('D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\com.ahleen.voice.apk');
  // console.log('Paht == ', path);
  // ******************************
  // decompile apk
  // const appDetails = await decompileApk(
  //   {
  //     packageName: 'com.twitter.android.lite',
  //     filePath: './tests/samples/com.twitter.android.lite.apk',
  //   }
  // );
  // console.log('appDetails', appDetails);
  //**************************
  // todo: test download
  // await downloadAPK('com.twitter.android.lite');
  // ******************************
  // todo: test analyze apks
  // const d = await analyzeAPKs([testApks[0]], true);
  // console.log(d);
  // ******************************
  // todo: test get apkinfo
  // const d = await getApkInfo('D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\com.ucare.we.apk');
  // writeFileSync('manifest.json', JSON.stringify(d));
  // await getApkInfo('D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\com.instagram.android.apk');
  // console.log('asdfljasl;fn done');
  // ******************************
  // todo: test analyzer
  // const analyzerRes = {
  //   'com.instagram.android': {
  //     version: '⚠',
  //     'upload date': '20 Mar, 2022',
  //     GMS: ['sdk (Sign in)', 'sdk (FCM)', 'location', 'sdk (fitness)', 'sdk (places)'],
  //     HMS: [],
  //     'huawei App Id': '⚠',
  //     'AndroidMarket metadata': '⚠',
  //   },
  // };
  // const finalHeaders = [
  //   'package name',
  //   'version',
  //   'upload date',
  //   'GMS kits',
  //   'HMS kits',
  //   'huawei App Id',
  //   'AndroidMarket metadata',
  // ];
  // const data = [];
  // Object.keys(analyzerRes).forEach((pn) => {
  //   const appAnalyzerRes = analyzerRes[pn];
  //   console.dir(appAnalyzerRes);
  //   data.push({
  //     'package name': pn,
  //     version: appAnalyzerRes.version,
  //     'upload date': appAnalyzerRes.uploadDate,
  //     'GMS kits': appAnalyzerRes['GMS'].join(' , '),
  //     'HMS kits': appAnalyzerRes['HMS'].join(' , '),
  //     'huawei App Id': appAnalyzerRes['huawei App Id'],
  //     'androidMarket metadata': appAnalyzerRes['androidMarket metadata'],
  //   });
  // });
  // ******************************
  // todo: test write excel
  // const resultFileName = 'fff';
  // const analyzerRes = {
  //   'com.a': {
  //     GMS: ['push', 'maps'],
  //     HMS: ['push', 'maps'],
  //     version: '1.0.0.0',
  //     'huawei App Id': 'NOT FOUND',
  //     'androidMarket metadata': 'NOT FOUND',
  //     'APK creation date': '2020',
  //     uploadDate: '2022',
  //     permissions: 'com.per1,com.perm2',
  //   },
  //   'com.b': {
  //     GMS: ['push', 'maps'],
  //     HMS: ['adf', 'asdf'],
  //     version: '30.0.0',
  //     'huawei App Id': 'NOT FOUND',
  //     'androidMarket metadata': 'NOT FOUND',
  //     'APK creation date': '2020',
  //     uploadDate: '2022',
  //     permissions: 'com.per1,com.perm2',
  //   },
  // };
  // saveResult(analyzerRes, resultFileName);
  // saveResult(analyzerRes, resultFileName);
  process.exit(0);
})();
