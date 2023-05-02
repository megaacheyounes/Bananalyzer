import Bananalyzer from 'bananalyzer';
// import Bananalyzer from '../build';

(async () => {
  const pkgName = 'com.ubercab.uberlite';
  const getAppDetailsResult = await Bananalyzer.getAppDetails(pkgName);
  console.log('getAppDetailsResult', getAppDetailsResult);

  const getDownloadLinkResult = await Bananalyzer.getDownloadLink(pkgName);
  console.log('getDownloadLinkResult', getDownloadLinkResult);

  const downloadAPKResult = await Bananalyzer.downloadAPK(pkgName, false);
  console.log('downloadAPKResult', downloadAPKResult);

  const analyzeAPKsResult = await Bananalyzer.analyzeAPKs(
    [
      {
        filePath: downloadAPKResult.filePath,
      },
    ],
    true
  );
  console.log('analyzeAPKsResult', analyzeAPKsResult);
  console.log('done');
  process.exit(0);
})();
