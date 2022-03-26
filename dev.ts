// debugModule.enable('*');
const keepApks = true;
const useExisting = true;

// ******************************
// todo: test getInnerApk
// const path = await getInnerApk('D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\com.ahleen.voice.apk');
// console.log('Paht == ', path);

// ******************************
// todo: test download
// // await downloadAPK('com.twitter.android.lite');

// ******************************
// todo: test analyze apks
// const d = await analyzeAPKs([
//   {
//     packageName: 'app.com.chefaa',
//     uploadDate: '20 Mar, 2022',
//     filePath: 'D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\app.com.chefaa.apk',
//   },
//   {
//     packageName: 'com.netflix.mediaclient',
//     uploadDate: '220 Mar, 2022',
//     filePath: 'D:\\__tasks__\\_analyze\\_toolss\\Bananalyzer\\downloads\\com.netflix.mediaclient.apk',
//   },
// ]);
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
