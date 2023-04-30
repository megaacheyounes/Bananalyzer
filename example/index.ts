import Bananalyzer from '../build';

(async () => {
  const getAppDetailsResult = await Bananalyzer.getAppDetails('com.ubercab.uberlite');
  console.log('getAppDetailsResult', getAppDetailsResult);

  const getDownloadLinkResult = await Bananalyzer.getDownloadLink('com.aswat.carrefouruae');
  console.log('getDownloadLinkResult', getDownloadLinkResult);

  const downloadAPKResult = await Bananalyzer.downloadAPK('com.ubercab.uberlite', false);
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
