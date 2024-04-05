import Bananalyzer from 'bananalyzer';
// import Bananalyzer from '../build';
// debugModule.enable('bananalyzer:*');

(async () => {
  const pkgName = 'com.facebook.lite';
  // const getAppDetailsResult = await Bananalyzer.getPlayStoreDetails(pkgName);
  // console.log('getPlayStoreDetails', getAppDetailsResult);

  const getDownloadLinkResult = await Bananalyzer.getDownloadLink(pkgName);
  console.log('getDownloadLinkResult', getDownloadLinkResult);

  // const downloadAPKResult = await Bananalyzer.downloadAPK(pkgName, false);
  // console.log('downloadAPKResult', downloadAPKResult);

  // const analyzeAPKsResult = await Bananalyzer.analyzeAPKs(
  //   [
  //     {
  //       filePath: downloadAPKResult.filePath,
  //     },
  //   ],
  //   true
  // );
  // console.log('analyzeAPKsResult', analyzeAPKsResult);
  // console.log('done');
  process.exit(0);
})();
